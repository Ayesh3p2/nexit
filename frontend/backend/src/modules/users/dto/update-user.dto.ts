import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '../enums/user-role.enum';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({ 
    description: 'User email address', 
    example: 'updated@example.com',
    required: false 
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ 
    description: 'New password (min 8 characters)', 
    required: false 
  })
  @IsString()
  @MinLength(8)
  @IsOptional()
  password?: string;

  @ApiProperty({ 
    description: 'User role', 
    enum: UserRole, 
    enumName: 'UserRole',
    example: UserRole.USER,
    required: false
  })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiProperty({ 
    description: 'Whether the user account is active', 
    required: false 
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ 
    description: 'User settings as JSON', 
    required: false,
    example: { theme: 'dark', notifications: true }
  })
  @IsOptional()
  settings?: Record<string, any>;

  @ApiProperty({ 
    description: 'Current password (required for sensitive operations)',
    required: false
  })
  @IsString()
  @IsOptional()
  currentPassword?: string;

  @ApiProperty({ 
    description: 'URL to user\'s avatar image',
    required: false
  })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiProperty({ 
    description: 'Whether the user has two-factor authentication enabled',
    required: false,
    default: false
  })
  @IsBoolean()
  @IsOptional()
  isTwoFactorEnabled?: boolean;

  @ApiProperty({
    description: 'Two-factor authentication secret (for setup)',
    required: false
  })
  @IsString()
  @IsOptional()
  twoFactorSecret?: string;

  @ApiProperty({
    description: 'Backup codes for two-factor authentication',
    required: false,
    type: [String],
    example: ['code1', 'code2']
  })
  @IsString({ each: true })
  @IsOptional()
  twoFactorBackupCodes?: string[];
}
