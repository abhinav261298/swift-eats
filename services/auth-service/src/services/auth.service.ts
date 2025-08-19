import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RedisService } from '@nestjs/redis';
import { User } from '../entities/user.entity';
import { UserRepository } from '../repositories/user.repository';
import {
  LoginDto,
  RegisterDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyEmailDto,
  ChangePasswordDto,
  AuthResponseDto,
  TokenResponseDto,
} from '../dto/auth.dto';
import {
  comparePassword,
  generateJWT,
  verifyJWT,
  generateUUID,
  createSuccessResponse,
  createErrorResponse,
} from '@shared/utils';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, CACHE_KEYS, CACHE_TTL } from '@shared/constants';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly userRepo: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
    private readonly redisService: RedisService,
  ) {}

  /**
   * Register a new user
   */
  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    // Check if user already exists
    const existingUser = await this.userRepo.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException(ERROR_MESSAGES.USER_ALREADY_EXISTS);
    }

    // Create new user
    const user = this.userRepository.create({
      ...registerDto,
      password: registerDto.password, // Will be hashed by entity hook
    });

    // Save user
    const savedUser = await this.userRepository.save(user);

    // Generate tokens
    const tokens = await this.generateTokens(savedUser);

    // Emit user registered event
    this.eventEmitter.emit('user.registered', {
      userId: savedUser.id,
      email: savedUser.email,
      timestamp: new Date(),
    });

    return {
      ...tokens,
      user: {
        id: savedUser.id,
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        isEmailVerified: savedUser.isEmailVerified,
      },
    };
  }

  /**
   * Authenticate user and return tokens
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    // Find user by email
    const user = await this.userRepo.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    // Verify password
    const isPasswordValid = await comparePassword(loginDto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Update last login
    user.updateLastLogin();
    await this.userRepository.save(user);

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Store refresh token in Redis
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    // Emit user logged in event
    this.eventEmitter.emit('user.logged_in', {
      userId: user.id,
      email: user.email,
      timestamp: new Date(),
    });

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isEmailVerified: user.isEmailVerified,
      },
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<TokenResponseDto> {
    try {
      // Verify refresh token
      const payload = verifyJWT(
        refreshTokenDto.refreshToken,
        this.configService.get('jwt.refreshSecret'),
      );

      // Check if refresh token exists in Redis
      const storedToken = await this.redisService.get(
        `${CACHE_KEYS.USER_SESSION}${payload.sub}`,
      );
      if (!storedToken || storedToken !== refreshTokenDto.refreshToken) {
        throw new UnauthorizedException(ERROR_MESSAGES.INVALID_TOKEN);
      }

      // Get user
      const user = await this.userRepo.findById(payload.sub);
      if (!user || !user.isActive) {
        throw new UnauthorizedException(ERROR_MESSAGES.USER_NOT_FOUND);
      }

      // Generate new tokens
      const tokens = await this.generateTokens(user);

      // Update refresh token in Redis
      await this.storeRefreshToken(user.id, tokens.refreshToken);

      return tokens;
    } catch (error) {
      throw new UnauthorizedException(ERROR_MESSAGES.INVALID_TOKEN);
    }
  }

  /**
   * Logout user and invalidate tokens
   */
  async logout(userId: string): Promise<void> {
    // Remove refresh token from Redis
    await this.redisService.del(`${CACHE_KEYS.USER_SESSION}${userId}`);

    // Emit user logged out event
    this.eventEmitter.emit('user.logged_out', {
      userId,
      timestamp: new Date(),
    });
  }

  /**
   * Forgot password - send reset email
   */
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    const user = await this.userRepo.findByEmail(forgotPasswordDto.email);
    if (!user) {
      // Don't reveal if user exists or not
      return;
    }

    // Generate reset token
    const resetToken = generateUUID();
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store reset token in Redis
    await this.redisService.set(
      `reset_token:${resetToken}`,
      user.id,
      'EX',
      3600, // 1 hour
    );

    // Emit forgot password event
    this.eventEmitter.emit('user.forgot_password', {
      userId: user.id,
      email: user.email,
      resetToken,
      timestamp: new Date(),
    });
  }

  /**
   * Reset password using reset token
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    // Get user ID from reset token
    const userId = await this.redisService.get(`reset_token:${resetPasswordDto.token}`);
    if (!userId) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    // Get user
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    // Update password
    user.password = resetPasswordDto.newPassword; // Will be hashed by entity hook
    await this.userRepository.save(user);

    // Remove reset token from Redis
    await this.redisService.del(`reset_token:${resetPasswordDto.token}`);

    // Invalidate all user sessions
    await this.redisService.del(`${CACHE_KEYS.USER_SESSION}${userId}`);

    // Emit password reset event
    this.eventEmitter.emit('user.password_reset', {
      userId: user.id,
      email: user.email,
      timestamp: new Date(),
    });
  }

  /**
   * Verify email using verification token
   */
  async verifyEmail(verifyEmailDto: VerifyEmailDto): Promise<void> {
    try {
      // Verify token
      const payload = verifyJWT(
        verifyEmailDto.token,
        this.configService.get('jwt.secret'),
      );

      // Get user
      const user = await this.userRepo.findById(payload.sub);
      if (!user) {
        throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
      }

      // Mark email as verified
      user.markEmailAsVerified();
      await this.userRepository.save(user);

      // Emit email verified event
      this.eventEmitter.emit('user.email_verified', {
        userId: user.id,
        email: user.email,
        timestamp: new Date(),
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired verification token');
    }
  }

  /**
   * Change password for authenticated user
   */
  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<void> {
    // Get user
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(
      changePasswordDto.currentPassword,
      user.passwordHash,
    );
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Update password
    user.password = changePasswordDto.newPassword; // Will be hashed by entity hook
    await this.userRepository.save(user);

    // Invalidate all user sessions
    await this.redisService.del(`${CACHE_KEYS.USER_SESSION}${userId}`);

    // Emit password changed event
    this.eventEmitter.emit('user.password_changed', {
      userId: user.id,
      email: user.email,
      timestamp: new Date(),
    });
  }

  /**
   * Validate user credentials
   */
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      return null;
    }

    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid || !user.isActive) {
      return null;
    }

    return {
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isEmailVerified: user.isEmailVerified,
    };
  }

  /**
   * Validate JWT token
   */
  async validateToken(token: string): Promise<any> {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.userRepo.findById(payload.sub);
      
      if (!user || !user.isActive) {
        return null;
      }

      return {
        userId: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isEmailVerified: user.isEmailVerified,
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Generate access and refresh tokens
   */
  private async generateTokens(user: User): Promise<TokenResponseDto> {
    const payload = {
      sub: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(
        { sub: user.id },
        {
          secret: this.configService.get('jwt.refreshSecret'),
          expiresIn: this.configService.get('jwt.refreshExpiresIn'),
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: 86400, // 24 hours
    };
  }

  /**
   * Store refresh token in Redis
   */
  private async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    await this.redisService.set(
      `${CACHE_KEYS.USER_SESSION}${userId}`,
      refreshToken,
      'EX',
      CACHE_TTL.USER_SESSION,
    );
  }
}
