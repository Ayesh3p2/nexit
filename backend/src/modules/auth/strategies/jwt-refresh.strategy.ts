import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
    private readonly configService: ConfigService,
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
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
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
    const user = await this.authService.validateUserById(payload.sub);
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Verify the refresh token hash matches
    const refreshTokenMatches = await this.authService.verifyRefreshToken(
      user.id,
      refreshToken,
    );

    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Return the user payload
    return {
      sub: user.id,
      email: user.email,
      role: user.role,
      refreshToken, // Include the refresh token for the controller to use
    };
  }
}
