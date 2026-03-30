/**
 * Role Helper Functions
 * Handles multi-role support for users (e.g., "admin,mentor")
 * 
 * Rol Hiyerarşisi:
 * super_admin > admin > school_admin > mentor > student
 */
export type UserRole = 'super_admin' | 'admin' | 'school_admin' | 'mentor' | 'student';

// Rol hiyerarşisi - yüksek sayı = yüksek yetki
const ROLE_HIERARCHY: Record<UserRole, number> = {
  super_admin: 100,
  admin: 80,
  school_admin: 60,
  mentor: 40,
  student: 20,
};

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

/**
 * Get the highest role for a user
 */
export function getHighestRole(userRole: string): UserRole {
  const roles = getRoles(userRole);
  if (roles.length === 0) return 'student';
  return roles.reduce((highest, current) => 
    (ROLE_HIERARCHY[current] || 0) > (ROLE_HIERARCHY[highest] || 0) ? current : highest
  );
}

/**
 * Check if user has at least the given role level (hierarchical check)
 */
export function hasRoleLevel(userRole: string, minRole: UserRole): boolean {
  const highestRole = getHighestRole(userRole);
  return (ROLE_HIERARCHY[highestRole] || 0) >= (ROLE_HIERARCHY[minRole] || 0);
}

export function isSuperAdmin(userRole: string): boolean {
  return hasRole(userRole, 'super_admin');
}

export function isAdminLevel(userRole: string): boolean {
  return hasAnyRole(userRole, ['admin', 'super_admin']);
}

export function isSchoolAdminLevel(userRole: string): boolean {
  return hasAnyRole(userRole, ['school_admin', 'admin', 'super_admin']);
}

export function addRole(currentRoles: string, newRole: UserRole): string {
  const roles = getRoles(currentRoles);
  if (roles.includes(newRole)) return currentRoles;
  roles.push(newRole);
  return roles.join(',');
}

export function removeRole(currentRoles: string, roleToRemove: UserRole): string {
  const roles = getRoles(currentRoles).filter(r => r !== roleToRemove);
  return roles.length > 0 ? roles.join(',') : 'student';
}
