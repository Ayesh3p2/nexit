import { 
  BadRequestException, 
  ForbiddenException, 
  HttpException, 
  HttpStatus, 
  Injectable, 
  NotFoundException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, Like, IsNull } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserRole } from './enums/user-role.enum';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { IPaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { UserFilterDto } from './dto/user-filter.dto';

type FindAllOptions = {
  pagination?: PaginationDto;
  filters?: UserFilterDto;
  currentUser?: User;
};

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto, currentUser?: User): Promise<User> {
    // Check permissions if creating admin user
    if (createUserDto.role === UserRole.ADMIN && 
        (!currentUser || currentUser.role !== UserRole.ADMIN)) {
      throw new ForbiddenException('Insufficient permissions to create admin user');
    }

    // Check if user with email already exists (including soft-deleted)
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email.toLowerCase() },
      withDeleted: true
    });

    if (existingUser) {
      if (existingUser.isDeleted) {
        // Reactivate soft-deleted user
        existingUser.isDeleted = false;
        existingUser.deletedAt = null;
        existingUser.isActive = true;
        existingUser.password = await this.hashPassword(createUserDto.password);
        Object.assign(existingUser, createUserDto);
    }

    // Hash the password
    const hashedPassword = await this.hashPassword(password);

    // Create and save the user
    const user = this.usersRepository.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role,
      isActive: true,
      isEmailVerified: false,
    });

    // Generate email verification token
    const verificationToken = uuidv4();
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24); // 24 hours
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = verificationExpires;

    // Save the user
    const savedUser = await this.usersRepository.save(user);
    
    // Remove sensitive data before returning
    const { password: _, refreshToken, ...userWithoutSensitiveData } = savedUser;
    return userWithoutSensitiveData as User;
  }

  async findAll(paginationDto?: PaginationDto): Promise<IPaginatedResult<User>> {
    const { page = 1, limit = 10 } = paginationDto || {};
    const skip = (page - 1) * limit;
    
    const [users, total] = await this.usersRepository.findAndCount({
      skip,
      take: limit,
      where: { isActive: true },
      relations: ['roles'],
    });

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;
    
    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasPreviousPage,
        hasNextPage,
      },
      links: {
        first: `?page=1&limit=${limit}`,
        last: `?page=${totalPages}&limit=${limit}`,
        previous: hasPreviousPage ? `?page=${page - 1}&limit=${limit}` : null,
        next: hasNextPage ? `?page=${page + 1}&limit=${limit}` : null,
      },
    };
  }

  async findOne(
    id: string, 
    options: { 
      withDeleted?: boolean; 
      withSensitiveData?: boolean 
    } = {}
  ): Promise<User> {
    const { withDeleted = false, withSensitiveData = false } = options;
    
    const user = await this.usersRepository.findOne({
      where: { 
        id, 
        ...(!withDeleted && { isDeleted: false }) 
      },
      relations: ['managedTeam', 'assignedTickets', 'reportedTickets'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    // Remove sensitive data if not requested
    if (!withSensitiveData) {
      const { password, refreshToken, ...result } = user;
      return result as User;
    }

    return user;
  }

  async findByEmail(email: string, includeInactive = false): Promise<User | undefined> {
    const where: any = { email };
    if (!includeInactive) {
      where.isActive = true;
    }
    return this.usersRepository.findOne({ where });
  }

  async updateUser(userId: string, updateUserDto: UpdateUserDto, currentUser?: User): Promise<Omit<User, 'password' | 'refreshToken'>> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check permissions
    this.checkUpdatePermissions(user, currentUser);

    // Update user fields
    Object.assign(user, updateUserDto);

    // If password is being updated, hash it and update lastPasswordChange
    if (updateUserDto.password) {
      user.password = await this.hashPassword(updateUserDto.password);
      user.passwordResetToken = null;
      user.passwordResetExpires = null;
    }

    const updatedUser = await this.usersRepository.save(user);
    
    // Remove sensitive data before returning
    const { password, refreshToken, ...result } = updatedUser;
    return result as User;
  }

  async remove(id: string): Promise<void> {
    // Soft delete
    await this.usersRepository.update(id, { 
      isDeleted: true,
      deletedAt: new Date() 
    });
  }

  async setUserRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const hashedRefreshToken = refreshToken 
      ? await bcrypt.hash(refreshToken, 10) 
      : null;
    
    await this.usersRepository.update(userId, {
      refreshToken: hashedRefreshToken,
    });
  }

  async getUserIfRefreshTokenMatches(refreshToken: string, userId: string): Promise<User> {
    const user = await this.findOne(userId);
    
    const isRefreshTokenMatching = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );

    if (isRefreshTokenMatching) {
      return user;
    }
  }

  async markEmailAsConfirmed(email: string): Promise<void> {
    await this.usersRepository.update(
      { email },
      { isEmailVerified: true },
    );
  }

  async createPasswordResetToken(email: string): Promise<string> {
    const user = await this.findByEmail(email);
    
    if (!user) {
      throw new NotFoundException('User with this email does not exist');
    }

    // Generate a reset token (in a real app, this would be a JWT or similar)
    const resetToken = Math.random().toString(36).substring(2, 15) + 
                      Math.random().toString(36).substring(2, 15);
    
    // Set expiry to 1 hour from now
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1);

    await this.usersRepository.update(user.id, {
      passwordResetToken: resetToken,
      passwordResetExpires: resetTokenExpiry,
    });

    return resetToken;
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: {
        passwordResetToken: token,
        passwordResetExpires: new Date(),
      },
    });

    if (!user) {
      throw new NotFoundException('Invalid or expired password reset token');
    }

    const hashedPassword = await this.hashPassword(newPassword);
    
    await this.usersRepository.update(user.id, {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
    });
  }

  // User Management Methods

  async deactivateUser(id: string, currentUser: User): Promise<User> {
    const user = await this.findOne(id);
    
    // Check permissions
    if (currentUser.role !== UserRole.ADMIN && 
        (currentUser.role !== UserRole.MANAGER || user.role === UserRole.ADMIN)) {
      throw new ForbiddenException('Insufficient permissions to deactivate this user');
    }

    user.isActive = false;
    user.deactivatedAt = new Date();
    user.deactivatedBy = currentUser.id;
    
    return this.usersRepository.save(user);
  }

  async reactivateUser(id: string): Promise<User> {
    const user = await this.findOne(id, { withDeleted: true });
    
    user.isActive = true;
    user.deactivatedAt = null;
    user.deactivatedBy = null;
    user.isDeleted = false;
    
    return this.usersRepository.save(user);
  }

  async requestEmailChange(userId: string, newEmail: string): Promise<{ token: string }> {
    const existingUser = await this.findByEmail(newEmail, { withDeleted: true });
    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    const token = uuidv4();
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 1); // 1 hour expiry

    await this.usersRepository.update(userId, {
      emailChangeToken: token,
      emailChangeTokenExpires: tokenExpiry,
      newEmail,
    });

    return { token };
  }

  async confirmEmailChange(token: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: {
        emailChangeToken: token,
        emailChangeTokenExpires: Not(IsNull()),
      },
    });

    if (!user || !user.emailChangeTokenExpires || user.emailChangeTokenExpires < new Date()) {
      throw new BadRequestException('Invalid or expired token');
    }

    user.email = user.newEmail;
    user.emailVerified = true;
    user.newEmail = null;
    user.emailChangeToken = null;
    user.emailChangeTokenExpires = null;

    return this.usersRepository.save(user);
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.usersRepository.update(userId, {
      lastLoginAt: new Date(),
    });
  }

  // Helper Methods
  
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  private checkUpdatePermissions(user: User, currentUser?: User): void {
    // Admins can update anyone
    if (currentUser?.role === UserRole.ADMIN) return;
    
    // Users can only update their own profile
    if (currentUser?.id !== user.id) {
      throw new ForbiddenException('You can only update your own profile');
    }
    
    // Prevent users from elevating their own privileges
    if (user.role !== currentUser.role) {
      throw new ForbiddenException('You cannot change your role');
    }
  }
}
