import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsDateString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole } from '../enums/user-role.enum';

export class UserFilterDto {
  @ApiPropertyOptional({ 
    description: 'Search term for user name or email',
    example: 'john@example.com',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ 
    description: 'Filter by user role',
    enum: UserRole,
    example: UserRole.ADMIN,
  })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiPropertyOptional({ 
    description: 'Filter by active status',
    type: Boolean,
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isActive?: boolean;

  @ApiPropertyOptional({ 
    description: 'Filter by email verification status',
    type: Boolean,
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isEmailVerified?: boolean;

  @ApiPropertyOptional({ 
    description: 'Filter users created after this date',
    type: Date,
    example: '2023-01-01',
  })
  @IsDateString()
  @IsOptional()
  createdAfter?: string;

  @ApiPropertyOptional({ 
    description: 'Filter users created before this date',
    type: Date,
    example: '2023-12-31',
  })
  @IsDateString()
  @IsOptional()
  createdBefore?: string;

  @ApiPropertyOptional({ 
    description: 'Filter users by department',
    example: 'Engineering',
  })
  @IsString()
  @IsOptional()
  department?: string;

  @ApiPropertyOptional({ 
    description: 'Include soft-deleted users',
    type: Boolean,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  includeDeleted?: boolean = false;
}
