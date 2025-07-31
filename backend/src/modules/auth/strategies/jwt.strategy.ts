import { Injectable, UnauthorizedException } from '@nestjs/common';

import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

import { AuthService } from '../auth.service';
import { JwtPayload } from '../types/jwt-payload.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly authService: AuthService,
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
      secretOrKey: process.env.JWT_SECRET || '',
      passReqToCallback: true,
    });
  }

  async validate(
    _request: Request,
    payload: JwtPayload,
  ): Promise<JwtPayload> {
    // Accept either a string (user id) or a payload with sub property
    const userId = typeof payload === 'string' ? payload : payload.sub;
    // Use a dedicated method for user lookup by ID
    const user = await this.authService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return {
      sub: user.id,
      email: user.email,
      role: user.role,
    } as JwtPayload;
  }
}
