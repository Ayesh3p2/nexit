import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ 
    description: 'User email address', 
    example: 'user@example.com',
    required: true 
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ 
    description: 'User password', 
    example: 'YourSecurePassword123!',
    required: true 
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
