import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserRepository } from '../repositories/user.repository';
import { User } from '../entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async updateProfile(userId: string, updateData: Partial<User>): Promise<User | null> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Remove sensitive fields from update data
    const { password, passwordHash, id, email, ...safeUpdateData } = updateData;

    const updatedUser = await this.userRepository.update(userId, safeUpdateData);

    // Emit profile updated event
    this.eventEmitter.emit('user.profile_updated', {
      userId,
      updateData: safeUpdateData,
      timestamp: new Date(),
    });

    return updatedUser;
  }

  async deleteAccount(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.delete(userId);

    // Emit account deleted event
    this.eventEmitter.emit('user.account_deleted', {
      userId,
      email: user.email,
      timestamp: new Date(),
    });
  }

  async deactivateAccount(userId: string): Promise<User | null> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.deactivate();
    const updatedUser = await this.userRepository.save(user);

    // Emit account deactivated event
    this.eventEmitter.emit('user.account_deactivated', {
      userId,
      email: user.email,
      timestamp: new Date(),
    });

    return updatedUser;
  }

  async activateAccount(userId: string): Promise<User | null> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.activate();
    const updatedUser = await this.userRepository.save(user);

    // Emit account activated event
    this.eventEmitter.emit('user.account_activated', {
      userId,
      email: user.email,
      timestamp: new Date(),
    });

    return updatedUser;
  }

  async getActiveUsers(): Promise<User[]> {
    return this.userRepository.findActiveUsers();
  }

  async getVerifiedUsers(): Promise<User[]> {
    return this.userRepository.findVerifiedUsers();
  }

  async getUsersByDateRange(startDate: Date, endDate: Date): Promise<User[]> {
    return this.userRepository.findUsersByDateRange(startDate, endDate);
  }

  async getUsersCount(): Promise<number> {
    return this.userRepository.countUsers();
  }

  async getActiveUsersCount(): Promise<number> {
    return this.userRepository.countActiveUsers();
  }

  async getVerifiedUsersCount(): Promise<number> {
    return this.userRepository.countVerifiedUsers();
  }
}
