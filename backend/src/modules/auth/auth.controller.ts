import { 
  Body, 
  Controller, 
  Get, 
  HttpCode, 
  HttpStatus, 
  Post, 
  Req, 
  Res, 
  UseGuards, 
  UseInterceptors, 
  ClassSerializerInterceptor,
  BadRequestException,
  UnauthorizedException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Tokens } from './types/tokens.type';
import { User } from '../users/entities/user.entity';
import { GetCurrentUser } from '../common/decorators/get-current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('auth')
@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ 
    status: 201, 
    description: 'User registered successfully',
    type: Tokens,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<Tokens> {
    const tokens = await this.authService.register(registerDto);
    this.setAuthCookies(response, tokens);
    return tokens;
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in a user' })
  @ApiResponse({ 
    status: 200, 
    description: 'User logged in successfully',
    type: Tokens,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<Tokens> {
    const tokens = await this.authService.login(loginDto);
    this.setAuthCookies(response, tokens);
    return tokens;
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Log out the current user' })
  @ApiResponse({ status: 200, description: 'Successfully logged out' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(
    @GetCurrentUser('sub') userId: string,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ message: string }> {
    await this.authService.logout(userId);
    this.clearAuthCookies(response);
    return { message: 'Successfully logged out' };
  }

  @Public()
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ 
    status: 200, 
    description: 'Token refreshed successfully',
    type: Tokens,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async refreshTokens(
    @GetCurrentUser('sub') userId: string,
    @GetCurrentUser('refreshToken') refreshToken: string,
    @Res({ passthrough: true }) response: Response,
  ): Promise<Tokens> {
    const tokens = await this.authService.refreshTokens(userId, refreshToken);
    this.setAuthCookies(response, tokens);
    return tokens;
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ 
    status: 200, 
    description: 'Return current user profile',
    type: User,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProfile(@GetCurrentUser('sub') userId: string): Promise<User> {
    return this.authService.getProfile(userId);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change current user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async changePassword(
    @GetCurrentUser('sub') userId: string,
    @Body('currentPassword') currentPassword: string,
    @Body('newPassword') newPassword: string,
  ): Promise<{ message: string }> {
    if (!currentPassword || !newPassword) {
      throw new BadRequestException('Current password and new password are required');
    }
    
    await this.authService.changePassword(userId, currentPassword, newPassword);
    return { message: 'Password changed successfully' };
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'If the email exists, a reset link has been sent' })
  async forgotPassword(
    @Body('email') email: string,
  ): Promise<{ message: string }> {
    if (!email) {
      throw new BadRequestException('Email is required');
    }
    
    await this.authService.requestPasswordReset(email);
    return { 
      message: 'If an account with that email exists, a password reset link has been sent' 
    };
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with a valid token' })
  @ApiResponse({ status: 200, description: 'Password reset successful' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async resetPassword(
    @Body('token') token: string,
    @Body('newPassword') newPassword: string,
  ): Promise<{ message: string }> {
    if (!token || !newPassword) {
      throw new BadRequestException('Token and new password are required');
    }
    
    await this.authService.resetPassword(token, newPassword);
    return { message: 'Password reset successful' };
  }

  @Public()
  @Get('verify-email')
  @ApiOperation({ summary: 'Verify email with a valid token' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async verifyEmail(
    @Query('token') token: string,
    @Res() res: Response,
  ): Promise<void> {
    if (!token) {
      throw new BadRequestException('Token is required');
    }
    
    await this.authService.verifyEmail(token);
    
    // Redirect to success page or login page
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    res.redirect(`${frontendUrl}/login?verified=true`);
  }

  // Helper method to set auth cookies
  private setAuthCookies(response: Response, tokens: Tokens): void {
    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: this.configService.get<number>('JWT_REFRESH_EXPIRES_IN', 7 * 24 * 60 * 60 * 1000), // 7 days
      path: '/',
    };

    response.cookie('access_token', tokens.accessToken, {
      ...cookieOptions,
      maxAge: this.configService.get<number>('JWT_EXPIRES_IN', 15 * 60 * 1000), // 15 minutes
    });

    response.cookie('refresh_token', tokens.refreshToken, cookieOptions);
  }

  // Helper method to clear auth cookies
  private clearAuthCookies(response: Response): void {
    response.clearCookie('access_token');
    response.clearCookie('refresh_token');
  }
}
