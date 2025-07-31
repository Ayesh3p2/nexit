/**
 * User roles in hierarchical order (from highest to lowest privilege):
 * - SUPER_ADMIN: Full system access, can manage all resources and settings
 * - ADMIN: Administrative access, can manage most resources
 * - MANAGER: Department/Team manager with elevated permissions
 * - AGENT: Support agent with ticket management capabilities
 * - USER: Regular authenticated user with basic permissions
 * - READ_ONLY: Read-only access to the system
 * - CUSTOM: Custom role with specific permissions (to be defined)
 */
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  AGENT = 'AGENT',
  USER = 'USER',
  READ_ONLY = 'READ_ONLY',
  CUSTOM = 'CUSTOM'
}

/**
 * Check if a user has at least the required role
 * @param userRole The user's role
 * @param requiredRole The minimum required role
 * @returns boolean indicating if the user has the required role or higher
 */
export const hasRole = (userRole: UserRole, requiredRole: UserRole): boolean => {
  const roleHierarchy = Object.values(UserRole);
  const userRoleIndex = roleHierarchy.indexOf(userRole);
  const requiredRoleIndex = roleHierarchy.indexOf(requiredRole);
  
  return userRoleIndex <= requiredRoleIndex;
};
