import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {
  constructor() {
    super();
  }

  getRequest(context: ExecutionContext): Request {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    
    // Extract refresh token from cookies or Authorization header
    const refreshToken = (request.cookies as { refresh_token?: string })?.refresh_token || 
                        (request.headers as { 'x-refresh-token'?: string | string[] })['x-refresh-token'] ||
                        (request.body as { refreshToken?: string })?.refreshToken;
    
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }
    
    // Set the refresh token in the request for the strategy to validate
    request.headers['authorization'] = `Bearer ${refreshToken}`;
    
    return request;
  }

  handleRequest(err: any, user: any) {
    // Handle the case where the refresh token is invalid or expired
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid or expired refresh token');
    }
    
    return user;
  }
}
