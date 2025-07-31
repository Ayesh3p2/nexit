import { ApiProperty } from '@nestjs/swagger';

export class Tokens {
  @ApiProperty({ 
    description: 'JWT access token for authentication',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({ 
    description: 'Refresh token to get a new access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;

  @ApiProperty({ 
    description: 'Token type (always Bearer)',
    example: 'Bearer',
    default: 'Bearer',
  })
  tokenType: string = 'Bearer';

  @ApiProperty({ 
    description: 'Expiration time of the access token in seconds',
    example: 900, // 15 minutes
  })
  expiresIn: number;

  constructor(accessToken: string, refreshToken: string, expiresIn: number) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.expiresIn = expiresIn;
  }
}
