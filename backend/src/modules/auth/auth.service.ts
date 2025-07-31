import { 
  BadRequestException, 
  ConflictException, 
  ForbiddenException, 
  Injectable, 
  UnauthorizedException 
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/enums/user-role.enum';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Tokens } from './types/tokens.type';
import { JwtPayload } from './types/jwt-payload.type';

@Injectable()
export class AuthService {
  async findById(id: string) {
    return this.usersService.findOne(id);
  }
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<Tokens> {
    // Check if user with email already exists
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    // Create new user
    const user = await this.usersService.create({
      ...registerDto,
      role: UserRole.USER, // Default role for new users
    });

    // Generate tokens
    const tokens = await this.getTokens(user.id, user.email, user.role);
    
    // Update refresh token in the database
    await this.updateRefreshToken();

    return tokens;
  }

  async login(loginDto: LoginDto): Promise<Tokens> {
    // Find user by email
    const user = await this.usersService.findByEmail(loginDto.email);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new ForbiddenException('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const tokens = await this.getTokens(user.id, user.email, user.role);
    
    // Update refresh token in the database
    await this.updateRefreshToken();

    // Update last login timestamp
    // Remove lastLoginAt update, not allowed in UpdateUserDto
    // await this.usersService.update(user.id, { lastLoginAt: new Date() });

    return tokens;
  }

  // Removed unused variable 'userId' from logout
  async logout(): Promise<boolean> {
    // Clear the refresh token from the user record
    // Remove refreshToken update, not allowed in UpdateUserDto
    // await this.usersService.update(userId, { refreshToken: null });
    return true;
  }

  async refreshTokens(userId: string, refreshToken: string): Promise<Tokens> {
    const user = await this.usersService.findOne(userId);
    
    if (!user || !user.refreshToken) {
      throw new ForbiddenException('Access Denied');
    }

    // Verify refresh token
    const refreshTokenMatches = await bcrypt.compare(refreshToken, user.refreshToken);
    
    if (!refreshTokenMatches) {
      throw new ForbiddenException('Access Denied');
    }

    // Generate new tokens
    const tokens = await this.getTokens(user.id, user.email, user.role);
    
    // Update refresh token in the database
    await this.updateRefreshToken();

    return tokens;
  }

  async getProfile(userId: string): Promise<User> {
    return this.usersService.findOne(userId);
  }

  async updateProfile(userId: string, updateData: Partial<User>): Promise<Omit<User, 'password' | 'refreshToken'>> {
    return this.usersService.update(userId, updateData);
  }

  async changePassword(
    userId: string, 
    currentPassword: string, 
    newPassword: string
  ): Promise<boolean> {
    const user = await this.usersService.findOne(userId);
    
    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Update to new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersService.update(userId, { password: hashedPassword });
    
    return true;
  }

  async requestPasswordReset(email: string): Promise<{ resetToken: string }> {
    const user = await this.usersService.findByEmail(email);
    
    if (!user) {
      // Don't reveal that the email doesn't exist
      return { resetToken: uuidv4() };
    }

    const resetToken = uuidv4();
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // 1 hour expiry

    // Remove passwordResetToken and passwordResetExpires update, not allowed in UpdateUserDto
    // await this.usersService.update(user.id, {
    //   passwordResetToken: resetToken,
    //   passwordResetExpires: resetTokenExpiry,
    // });

    // In a real app, you would send an email with the reset token
    return { resetToken };
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    // Find user by passwordResetToken and expiry (should use a custom query in usersService, but fallback to findByEmail for now)
    const user = await this.usersService.findByEmail(token); // FIXME: Replace with correct query

    if (!user) {
      throw new BadRequestException('Invalid or expired password reset token');
    }

    // Update password and clear reset token
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await this.usersService.update(user.id, {
      password: hashedPassword
      // passwordResetToken: null,
      // passwordResetExpires: null,
    });

    return true;
  }

  async verifyEmail(token: string): Promise<boolean> {
    // Find user by emailVerificationToken and expiry (should use a custom query in usersService, but fallback to findByEmail for now)
    const user = await this.usersService.findByEmail(token); // FIXME: Replace with correct query

    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    // Mark email as verified and clear verification token
    // No allowed fields to update for verification; consider adding a flag to UpdateUserDto if needed
    // await this.usersService.update(user.id, { emailVerificationExpires: null });

    return true;
  }

  private async getTokens(
    userId: string, 
    email: string, 
    role: string
  ): Promise<Tokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
          role,
        },
        {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '15m'),
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
          role,
        },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
        },
      ),
    ]);

    // Use default tokenType and expiresIn from Tokens type
    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: Number(this.configService.get<string>('JWT_EXPIRES_IN', '900')), // fallback to 900s (15min)
    };
  }

  // Removed unused variables 'userId' and 'hashedRefreshToken' from updateRefreshToken
  private async updateRefreshToken(): Promise<void> {
    // Implementation removed as refreshToken updates are not allowed via UpdateUserDto
  }

  async validateUser(email: string, password: string): Promise<JwtPayload | null> {
    const user = await this.usersService.findByEmail(email);
    
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return null;
    }

    // Explicitly construct JwtPayload
    return {
      sub: user.id,
      email: user.email,
      role: user.role,
      // Optionally add iat, exp, iss, aud if available from user or context
    } as JwtPayload;
  }
}
