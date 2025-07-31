import { 
  BadRequestException, 
  ForbiddenException, 
  Injectable, 
  NotFoundException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserRole } from './enums/user-role.enum';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { IPaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { UserFilterDto } from './dto/user-filter.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto, currentUser?: User): Promise<Omit<User, 'password' | 'refreshToken'>> {
    const { email, password, firstName, lastName, role = UserRole.USER } = createUserDto;

    // Check permissions if creating admin user
    if (role === UserRole.ADMIN && 
        (!currentUser || currentUser.role !== UserRole.ADMIN)) {
      throw new ForbiddenException('Insufficient permissions to create admin user');
    }

    // Check if user with email already exists (including soft-deleted)
    const existingUser = await this.usersRepository.findOne({
      where: { email: email.toLowerCase() },
      withDeleted: true
    });

    if (existingUser) {
      if (existingUser.deletedAt) {
        // Reactivate soft-deleted user
        existingUser.isDeleted = false;
        existingUser.deletedAt = undefined; // Use undefined for deletedAt
        existingUser.isActive = true;
        existingUser.password = await this.hashPassword(password);
        Object.assign(existingUser, createUserDto);
        
        const savedUser = await this.usersRepository.save(existingUser);
        const { password: _, refreshToken, ...userWithoutSensitiveData } = savedUser;
        return userWithoutSensitiveData as User;
      }
      throw new BadRequestException('User with this email already exists');
    }

    // Hash the password
    const hashedPassword = await this.hashPassword(password);

    // Create and save the user
    const user = this.usersRepository.create({
      email: email.toLowerCase(),
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
    return userWithoutSensitiveData;
  }

  async findAll(
    filters: UserFilterDto & PaginationDto & { 
      skip?: number; 
      take?: number;
      currentUser?: User;
    }
  ): Promise<IPaginatedResult<User>> {
    const { 
      page = 1, 
      limit = 10, 
      skip,
      take = limit,
      search,
      role,
      isActive,
      isEmailVerified,
      createdAfter,
      createdBefore,
      department,
      includeDeleted
    } = filters;

    // Build the query
    const query = this.usersRepository.createQueryBuilder('user');

    // Apply filters
    if (search) {
      query.andWhere(
        '(user.email ILIKE :search OR user.firstName ILIKE :search OR user.lastName ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (role) {
      query.andWhere('user.role = :role', { role });
    }

    if (isActive !== undefined) {
      query.andWhere('user.isActive = :isActive', { isActive });
    }

    if (isEmailVerified !== undefined) {
      query.andWhere('user.isEmailVerified = :isEmailVerified', { isEmailVerified });
    }

    if (createdAfter) {
      query.andWhere('user.createdAt >= :createdAfter', { createdAfter: new Date(createdAfter) });
    }

    if (createdBefore) {
      query.andWhere('user.createdAt <= :createdBefore', { createdBefore: new Date(createdBefore) });
    }

    if (department) {
      query.andWhere('user.department = :department', { department });
    }

    // Handle soft-deleted users
    if (!includeDeleted) {
      query.andWhere('user.isDeleted = :isDeleted', { isDeleted: false });
    }

    // Apply pagination
    const [users, total] = await query
      .skip(skip)
      .take(take)
      .getManyAndCount();

    const totalPages = Math.ceil(total / take);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;
    
    return {
      data: users,
      meta: {
        total,
        page,
        limit: take,
        totalPages,
        hasPreviousPage,
        hasNextPage,
      },
      links: {
        first: `?page=1&limit=${take}`,
        last: `?page=${totalPages}&limit=${take}`,
        previous: hasPreviousPage ? `?page=${page - 1}&limit=${take}` : null, // string | null allowed
        next: hasNextPage ? `?page=${page + 1}&limit=${take}` : null, // string | null allowed
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
    const user = await this.usersRepository.findOne({ where });
    return user === null ? undefined : user;
  }

  async update(id: string, updateUserDto: UpdateUserDto, currentUser?: User): Promise<Omit<User, 'password' | 'refreshToken'>> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check permissions if trying to update role or sensitive fields
    if (updateUserDto.role || updateUserDto.isActive !== undefined) {
      this.checkUpdatePermissions(user, currentUser);
    }

    // Update user fields
    const userUpdate: Partial<User> = { ...updateUserDto };

    // If password is being updated, hash it and clear reset tokens
    if (updateUserDto.password) {
      userUpdate.password = await this.hashPassword(updateUserDto.password);
      userUpdate.passwordResetToken = undefined;
      userUpdate.passwordResetExpires = undefined;
    }

    await this.usersRepository.update(id, userUpdate);
    let updatedUser = await this.usersRepository.findOne({ where: { id } });
if (!updatedUser) {
  throw new NotFoundException('User not found after update');
}
// Remove sensitive data before returning
const { password, refreshToken, ...result } = updatedUser;
return result as Omit<User, 'password' | 'refreshToken'>;
  }

  // Alias for update to maintain backward compatibility
  async updateUser(id: string, updateUserDto: UpdateUserDto, currentUser?: User): Promise<Omit<User, 'password' | 'refreshToken'>> {
    return this.update(id, updateUserDto, currentUser);
  }

  async remove(id: string): Promise<void> {
    const result = await this.usersRepository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  async setUserRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const hashedRefreshToken = refreshToken 
      ? await bcrypt.hash(refreshToken, 10) 
      : undefined;
    
    await this.usersRepository.update(userId, {
      refreshToken: hashedRefreshToken,
    });
  }

  async getUserIfRefreshTokenMatches(refreshToken: string, userId: string): Promise<User | undefined> {
    const user = await this.findOne(userId);
    if (!user || !user.refreshToken) return undefined;
    const isRefreshTokenMatching = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );
    if (isRefreshTokenMatching) {
      return user;
    }
    return undefined;
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
      passwordResetToken: null, // string | null allowed
      passwordResetExpires: null, // Date | null allowed
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
    user.deactivatedAt = null; // Date | null allowed
    user.deactivatedBy = null; // string | null allowed
    user.isDeleted = false;
    return this.usersRepository.save(user);
  }

  async requestEmailChange(userId: string, newEmail: string): Promise<{ token: string }> {
    const existingUser = await this.findByEmail(newEmail, true);
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

    user.email = user.newEmail || user.email;
user.isEmailVerified = true;
    user.newEmail = null; // string | null allowed
    user.emailChangeToken = null; // string | null allowed
    user.emailChangeTokenExpires = null; // Date | null allowed

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
    // If no currentUser, only allow system operations
    if (!currentUser) {
      throw new ForbiddenException('Authentication required');
    }

    // Users can update their own profile
    if (currentUser.id === user.id) {
      return;
    }

    // Only admins can update other users
    if (currentUser.role !== UserRole.ADMIN && currentUser.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Insufficient permissions to update this user');
    }

    // Only super admins can update admin users
    if (user.role === UserRole.ADMIN && currentUser.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Insufficient permissions to update admin user');
    }
  }
}
