import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'email', // Use email as the username field
      passwordField: 'password',
      passReqToCallback: false,
    });
  }

  async validate(email: string, password: string): Promise<any> {
    // Validate the user credentials
    const user = await this.authService.validateUser(email, password);
    
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    
    // Check if the user account is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }
    
    // Check if email is verified if required
    if (this.authService.configService.get<boolean>('REQUIRE_EMAIL_VERIFICATION') && !user.isEmailVerified) {
      throw new UnauthorizedException('Please verify your email address');
    }
    
    // Return the user object which will be attached to the request
    return user;
  }
}
