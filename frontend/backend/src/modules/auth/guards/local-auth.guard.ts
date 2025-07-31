import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  async canActivate(context: ExecutionContext) {
    // Run the parent canActivate which will trigger the local strategy
    const result = (await super.canActivate(context)) as boolean;
    
    // Get the request object

    
    // If authentication was successful, the user will be attached to the request
    // by the local strategy
    return result;
  }
}
