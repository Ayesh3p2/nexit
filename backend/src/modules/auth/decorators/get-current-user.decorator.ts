import { createParamDecorator, ExecutionContext } from '@nestjs/common';

type JwtPayload = {
  sub: string; // user ID
  email: string;
  role: string;
  [key: string]: any;
};

export const GetCurrentUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    
    if (!request.user) {
      return null;
    }
    
    if (data) {
      return request.user[data];
    }
    
    return request.user as JwtPayload;
  },
);
