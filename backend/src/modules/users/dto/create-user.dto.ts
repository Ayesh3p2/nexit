import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '../enums/user-role.enum';

export class CreateUserDto {
  @ApiProperty({ description: 'User email address', example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'User password (min 8 characters)', example: 'Password123!' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ description: 'User first name', example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ description: 'User last name', example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ 
    description: 'User role', 
    enum: UserRole, 
    enumName: 'UserRole',
    example: UserRole.USER,
    default: UserRole.USER
  })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiProperty({ description: 'User phone number', required: false })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({ description: 'User department', required: false })
  @IsString()
  @IsOptional()
  department?: string;

  @ApiProperty({ description: 'User job title', required: false })
  @IsString()
  @IsOptional()
  jobTitle?: string;

  @ApiProperty({ 
    description: 'Whether the user account is active', 
    required: false,
    default: true 
  })
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ 
    description: 'User timezone', 
    required: false,
    default: 'UTC' 
  })
  @IsString()
  @IsOptional()
  timezone?: string;

  @ApiProperty({ 
    description: 'User preferred language', 
    required: false,
    default: 'en' 
  })
  @IsString()
  @IsOptional()
  language?: string;
}
