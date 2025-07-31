import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
// Ensure LocalStrategy is only for user entity, not JwtPayload
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    super({
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: false,
    });
  }

  async validate(email: string, password: string): Promise<any> {
    // Validate the user credentials
    const user = await this.authService.validateUser(email, password);
    if (!user || typeof user !== 'object') {
      throw new UnauthorizedException('Invalid email or password');
    }
    // Check if the user account is active
    if ('isActive' in user && !user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }
    // Check if email is verified if required
    if (this.configService.get<boolean>('REQUIRE_EMAIL_VERIFICATION') && 'isEmailVerified' in user && !user.isEmailVerified) {
      throw new UnauthorizedException('Please verify your email address');
    }
    // Return the user object which will be attached to the request
    return user;
  }
}
