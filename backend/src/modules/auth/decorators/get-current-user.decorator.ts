import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../users/entities/user.entity';

export const GetCurrentUser = createParamDecorator(
  (data: keyof User | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    
    if (!request.user) {
      return null;
    }
    
    if (data) {
      return request.user[data];
    }
    
    return request.user;
  },
);
