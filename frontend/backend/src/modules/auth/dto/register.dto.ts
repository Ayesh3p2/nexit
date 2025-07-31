import { ApiProperty } from '@nestjs/swagger';
import { 
  IsEmail, 
  IsNotEmpty, 
  IsString, 
  MinLength, 
  Matches, 
  IsOptional,
  IsEnum
} from 'class-validator';
import { UserRole } from '../../users/enums/user-role.enum';

export class RegisterDto {
  @ApiProperty({ 
    description: 'User email address', 
    example: 'user@example.com',
    required: true 
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ 
    description: 'User password (min 8 characters, at least 1 uppercase, 1 lowercase, 1 number, and 1 special character)', 
    example: 'Password123!',
    required: true 
  })
  @IsString()
  @MinLength(8)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![\n.])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password too weak. Must contain at least 1 uppercase, 1 lowercase, 1 number or special character',
  })
  password: string;

  @ApiProperty({ 
    description: 'User first name', 
    example: 'John',
    required: true 
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ 
    description: 'User last name', 
    example: 'Doe',
    required: true 
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ 
    description: 'User role', 
    enum: UserRole,
    enumName: 'UserRole',
    example: UserRole.USER,
    required: false,
    default: UserRole.USER
  })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiProperty({ 
    description: 'User phone number', 
    example: '+1234567890',
    required: false 
  })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({ 
    description: 'User job title', 
    example: 'Software Engineer',
    required: false 
  })
  @IsString()
  @IsOptional()
  jobTitle?: string;

  @ApiProperty({ 
    description: 'User department', 
    example: 'Engineering',
    required: false 
  })
  @IsString()
  @IsOptional()
  department?: string;
}
