import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { BaseEntity } from '../../../common/entities/base.entity';
import { UserRole } from '../enums/user-role.enum';
import { Column, Entity, Index } from 'typeorm';

@Entity('users')
export class User extends BaseEntity {
  @ApiProperty({ description: 'User email address (unique)', example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  @Column({ type: 'varchar', unique: true })
  @Index()
  email: string;

  @ApiProperty({ description: 'User password (hashed)' })
  @Exclude({ toPlainOnly: true })
  @Column({ type: 'varchar' })
  password: string;

  @ApiProperty({ description: 'User first name', example: 'John' })
  @IsString()
  @IsNotEmpty()
  @Column({ name: 'first_name', type: 'varchar' })
  firstName: string;

  @ApiProperty({ description: 'User last name', example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  @Column({ name: 'last_name', type: 'varchar' })
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
  @Column({ name: 'phone_number', type: 'varchar', nullable: true })
  phoneNumber: string | null;

  @ApiProperty({ description: 'User department', required: false, nullable: true })
  @Column({ type: 'varchar', nullable: true })
  department: string | null;

  @ApiProperty({ description: 'User job title', required: false, nullable: true })
  @Column({ name: 'job_title', type: 'varchar', nullable: true })
  jobTitle: string | null;

  @ApiProperty({ description: 'User timezone', required: false, default: 'UTC' })
  @Column({ type: 'varchar', default: 'UTC' })
  timezone: string;

  @ApiProperty({ description: 'User preferred language', required: false, default: 'en' })
  @Column({ type: 'varchar', default: 'en' })
  language: string;

  @ApiProperty({ description: 'Whether the user has verified their email', default: false })
  @Column({ name: 'is_email_verified', default: false })
  isEmailVerified: boolean;

  @ApiProperty({ description: 'Email verification token', required: false, nullable: true })
  @Column({ name: 'email_verification_token', type: 'varchar', nullable: true })
  @Exclude({ toPlainOnly: true })
  emailVerificationToken: string | null;

  @ApiProperty({ description: 'Email verification token expiry', required: false, nullable: true })
  @Column({ name: 'email_verification_expires', type: 'timestamp', nullable: true })
  emailVerificationExpires?: Date | null;

  @ApiProperty({ description: 'Password reset token', required: false, nullable: true })
  @Column({ name: 'password_reset_token', type: 'varchar', nullable: true })
  @Exclude({ toPlainOnly: true })
  passwordResetToken: string | null;

  @ApiProperty({ description: 'Password reset token expiry', required: false, nullable: true })
  @Column({ name: 'password_reset_expires', type: 'timestamp', nullable: true })
  passwordResetExpires?: Date | null;

  @ApiProperty({ description: 'Refresh token for JWT refresh', required: false, nullable: true })
  @Column({ name: 'refresh_token', type: 'varchar', nullable: true })
  @Exclude({ toPlainOnly: true })
  refreshToken: string | null;

  @ApiProperty({ description: 'Date when user was deactivated', required: false, nullable: true })
  @Column({ name: 'deactivated_at', type: 'timestamp', nullable: true })
  deactivatedAt?: Date | null;

  @ApiProperty({ description: 'ID of admin who deactivated the user', required: false, nullable: true })
  @Column({ name: 'deactivated_by', type: 'uuid', nullable: true })
  deactivatedBy?: string | null;

  @ApiProperty({ description: 'New email during email change process', required: false, nullable: true })
  @Column({ name: 'new_email', type: 'varchar', nullable: true })
  newEmail: string | null;

  @ApiProperty({ description: 'Token for email change verification', required: false, nullable: true })
  @Column({ name: 'email_change_token', type: 'varchar', nullable: true })
  @Exclude({ toPlainOnly: true })
  emailChangeToken: string | null;

  @ApiProperty({ description: 'Email change token expiry', required: false, nullable: true })
  @Column({ name: 'email_change_token_expires', type: 'timestamp', nullable: true })
  emailChangeTokenExpires?: Date | null;

  @ApiProperty({ description: 'User settings as JSON', required: false, nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  settings?: Record<string, any>;

  constructor(partial: Partial<User>) {
    super();
    Object.assign(this, partial);
  }
}
