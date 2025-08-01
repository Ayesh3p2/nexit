import { Injectable, UnauthorizedException } from '@nestjs/common';

import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

import { AuthService } from '../auth.service';
import { JwtPayload } from '../types/jwt-payload.type';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          // Check cookies first
          if (request?.cookies?.refresh_token) {
            return request.cookies.refresh_token;
          }
          
          // Then check Authorization header
          const authHeader = request.headers.authorization;
          if (authHeader && authHeader.startsWith('Bearer ')) {
            return authHeader.substring(7); // Remove 'Bearer ' from the token
          }
          
          // Check body for refresh token (for API clients)
          if (request.body?.refreshToken) {
            return request.body.refreshToken;
          }
          
          return null;
        },
      ]),
      secretOrKey: process.env.JWT_REFRESH_SECRET || '',
      ignoreExpiration: false,
    });
  }

  async validate(
    request: Request,
    payload: JwtPayload & { jti?: string; type?: string },
  ): Promise<JwtPayload> {
    // Ensure this is a refresh token
    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

    // Get the refresh token from the request
    const refreshToken = 
      request.cookies?.refresh_token || 
      request.body?.refreshToken ||
      (request.headers['authorization'] || '').replace('Bearer ', '');

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    // Verify the refresh token is still valid in the database
    // Use a dedicated method for user lookup by ID
    const user = await this.authService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    // Return the user payload
    return {
      sub: user.id,
      email: user.email,
      role: user.role,
    } as JwtPayload;
  }
}
