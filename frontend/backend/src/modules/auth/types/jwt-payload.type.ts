import { UserRole } from '../../users/enums/user-role.enum';

export interface JwtPayload {
  /**
   * Subject (user ID)
   */
  sub: string;
  
  /**
   * User email
   */
  email: string;
  
  /**
   * User role
   */
  role: UserRole;
  
  /**
   * Issued at (timestamp in seconds)
   */
  iat?: number;
  
  /**
   * Expiration time (timestamp in seconds)
   */
  exp?: number;
  
  /**
   * Issuer (usually the application name)
   */
  iss?: string;
  
  /**
   * Audience (who the token is intended for)
   */
  aud?: string | string[];
}

export interface RequestWithUser extends Request {
  user: JwtPayload;
}

export interface TokenPayload extends JwtPayload {
  /**
   * Refresh token ID (jti claim)
   */
  jti?: string;
  
  /**
   * Token type (access or refresh)
   */
  type?: 'access' | 'refresh';
}
