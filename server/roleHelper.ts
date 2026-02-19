/**
 * Role Helper Functions
 * Handles multi-role support for users (e.g., "admin,mentor")
 */

export type UserRole = 'student' | 'mentor' | 'admin';

/**
 * Check if a user has a specific role
 * Supports both single role ("admin") and multi-role ("admin,mentor")
 */
export function hasRole(userRole: string, targetRole: UserRole): boolean {
  if (!userRole) return false;
  
  // Split by comma and trim whitespace
  const roles = userRole.split(',').map(r => r.trim());
  
  return roles.includes(targetRole);
}

/**
 * Check if a user has any of the specified roles
 */
export function hasAnyRole(userRole: string, targetRoles: UserRole[]): boolean {
  if (!userRole) return false;
  
  const roles = userRole.split(',').map(r => r.trim());
  
  return targetRoles.some(targetRole => roles.includes(targetRole));
}

/**
 * Check if a user has all of the specified roles
 */
export function hasAllRoles(userRole: string, targetRoles: UserRole[]): boolean {
  if (!userRole) return false;
  
  const roles = userRole.split(',').map(r => r.trim());
  
  return targetRoles.every(targetRole => roles.includes(targetRole));
}

/**
 * Get all roles for a user as an array
 */
export function getRoles(userRole: string): UserRole[] {
  if (!userRole) return [];
  
  return userRole.split(',').map(r => r.trim()) as UserRole[];
}
