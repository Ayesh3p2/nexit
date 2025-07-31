import { 
  ExecutionContext, 
  Injectable, 
  UnauthorizedException 
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Check if the route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    // If route is public, allow access
    if (isPublic) {
      return true;
    }

    // Otherwise, proceed with the default JWT auth guard
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, context: ExecutionContext) {
    // Handle the case where the token is invalid or expired
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid or expired token');
    }
    
    // Attach the user to the request object
    const request = context.switchToHttp().getRequest();
    request.user = user;
    
    return user;
  }
}
