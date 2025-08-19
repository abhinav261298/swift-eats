import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { IsEmail, IsNotEmpty, MinLength, IsOptional, IsBoolean } from 'class-validator';
import { Exclude } from 'class-transformer';
import { hashPassword } from '@shared/utils';

@Entity('users')
@Index(['email'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Column({ type: 'varchar', length: 255 })
  @Exclude()
  passwordHash: string;

  @Column({ type: 'varchar', length: 100 })
  @IsNotEmpty()
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  @IsNotEmpty()
  lastName: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  @IsOptional()
  phone?: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  address?: string;

  @Column({ type: 'boolean', default: true })
  @IsBoolean()
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isEmailVerified: boolean;

  @Column({ type: 'timestamp', nullable: true })
  emailVerifiedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt?: Date;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  // Virtual property for password (not stored in database)
  @Exclude()
  password?: string;

  // Methods
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      this.passwordHash = await hashPassword(this.password);
      delete this.password;
    }
  }

  // Business methods
  getFullName(): string {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  isVerified(): boolean {
    return this.isEmailVerified;
  }

  canLogin(): boolean {
    return this.isActive && this.isEmailVerified;
  }

  markEmailAsVerified(): void {
    this.isEmailVerified = true;
    this.emailVerifiedAt = new Date();
  }

  updateLastLogin(): void {
    this.lastLoginAt = new Date();
  }

  deactivate(): void {
    this.isActive = false;
  }

  activate(): void {
    this.isActive = true;
  }
}
