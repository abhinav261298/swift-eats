import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ where: { email } });
  }

  async findByEmailAndPassword(email: string, passwordHash: string): Promise<User | null> {
    return this.repository.findOne({ where: { email, passwordHash } });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.repository.create(userData);
    return this.repository.save(user);
  }

  async save(user: User): Promise<User> {
    return this.repository.save(user);
  }

  async update(id: string, updateData: Partial<User>): Promise<User | null> {
    await this.repository.update(id, updateData);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.repository.count({ where: { id } });
    return count > 0;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.repository.count({ where: { email } });
    return count > 0;
  }

  async findActiveUsers(): Promise<User[]> {
    return this.repository.find({ where: { isActive: true } });
  }

  async findVerifiedUsers(): Promise<User[]> {
    return this.repository.find({ where: { isEmailVerified: true } });
  }

  async findUsersByDateRange(startDate: Date, endDate: Date): Promise<User[]> {
    return this.repository
      .createQueryBuilder('user')
      .where('user.createdAt >= :startDate', { startDate })
      .andWhere('user.createdAt <= :endDate', { endDate })
      .getMany();
  }

  async countUsers(): Promise<number> {
    return this.repository.count();
  }

  async countActiveUsers(): Promise<number> {
    return this.repository.count({ where: { isActive: true } });
  }

  async countVerifiedUsers(): Promise<number> {
    return this.repository.count({ where: { isEmailVerified: true } });
  }
}
