import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

import { AuthService } from '../auth.service';
import { JwtPayload } from '../types/jwt-payload.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    super({
      // Extract JWT from the Authorization header or cookie
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          // Check cookies first
          if (request?.cookies?.access_token) {
            return request.cookies.access_token;
          }
          
          // Then check Authorization header
          const authHeader = request.headers.authorization;
          if (authHeader && authHeader.startsWith('Bearer ')) {
            return authHeader.substring(7); // Remove 'Bearer ' from the token
          }
          
          return null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(
    request: Request,
    payload: JwtPayload,
  ): Promise<JwtPayload> {
    // Check if token is blacklisted (optional, for logout functionality)
    const isBlacklisted = await this.authService.isTokenBlacklisted(payload.jti);
    if (isBlacklisted) {
      throw new UnauthorizedException('Token has been blacklisted');
    }

    // You could add additional validation here, like checking if the user still exists
    const user = await this.authService.validateUserById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Return the user payload to be attached to the request
    return {
      sub: user.id,
      email: user.email,
      role: user.role,
      // Add any other user properties you want to include in the JWT payload
    };
  }
}
