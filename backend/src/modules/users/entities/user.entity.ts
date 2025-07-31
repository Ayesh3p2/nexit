import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { BaseEntity } from 'src/common/entities/base.entity';
import { UserRole } from '../enums/user-role.enum';
import { Column, Entity, Index } from 'typeorm';

@Entity('users')
export class User extends BaseEntity {
  @ApiProperty({ description: 'User email address (unique)', example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  @Column({ unique: true })
  @Index()
  email: string;

  @ApiProperty({ description: 'User password (hashed)' })
  @Exclude({ toPlainOnly: true })
  @Column()
  password: string;

  @ApiProperty({ description: 'User first name', example: 'John' })
  @IsString()
  @IsNotEmpty()
  @Column({ name: 'first_name' })
  firstName: string;

  @ApiProperty({ description: 'User last name', example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  @Column({ name: 'last_name' })
  lastName: string;

  @ApiProperty({ 
    description: 'User role', 
    enum: UserRole, 
    enumName: 'UserRole',
    example: UserRole.USER 
  })
  @IsEnum(UserRole)
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @ApiProperty({ description: 'Whether the user account is active', default: true })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Last login timestamp', required: false })
  @Column({ name: 'last_login_at', nullable: true })
  lastLoginAt?: Date;

  @ApiProperty({ description: 'User avatar URL', required: false, nullable: true })
  @Column({ nullable: true })
  avatar?: string;

  @ApiProperty({ description: 'User phone number', required: false, nullable: true })
  @Column({ name: 'phone_number', nullable: true })
  phoneNumber?: string;

  @ApiProperty({ description: 'User department', required: false, nullable: true })
  @Column({ nullable: true })
  department?: string;

  @ApiProperty({ description: 'User job title', required: false, nullable: true })
  @Column({ name: 'job_title', nullable: true })
  jobTitle?: string;

  @ApiProperty({ description: 'User timezone', required: false, default: 'UTC' })
  @Column({ default: 'UTC' })
  timezone: string;

  @ApiProperty({ description: 'User preferred language', required: false, default: 'en' })
  @Column({ default: 'en' })
  language: string;

  @ApiProperty({ description: 'Whether the user has verified their email', default: false })
  @Column({ name: 'is_email_verified', default: false })
  isEmailVerified: boolean;

  @ApiProperty({ description: 'Email verification token', required: false, nullable: true })
  @Column({ name: 'email_verification_token', nullable: true })
  @Exclude({ toPlainOnly: true })
  emailVerificationToken?: string;

  @ApiProperty({ description: 'Email verification token expiry', required: false, nullable: true })
  @Column({ name: 'email_verification_expires', type: 'timestamp', nullable: true })
  emailVerificationExpires?: Date;

  @ApiProperty({ description: 'Password reset token', required: false, nullable: true })
  @Column({ name: 'password_reset_token', nullable: true })
  @Exclude({ toPlainOnly: true })
  passwordResetToken?: string;

  @ApiProperty({ description: 'Password reset token expiry', required: false, nullable: true })
  @Column({ name: 'password_reset_expires', type: 'timestamp', nullable: true })
  passwordResetExpires?: Date;

  @ApiProperty({ description: 'User settings as JSON', required: false, nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  settings?: Record<string, any>;

  constructor(partial: Partial<User>) {
    super();
    Object.assign(this, partial);
  }
}
