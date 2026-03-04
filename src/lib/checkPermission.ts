import { prisma } from '@/lib/db';
import { Permission } from './permissions';
import { User } from '@prisma/client';

/**
 * Check if a user has a specific permission
 * ADMIN users always have ALL permissions
 * Staff members only have permissions assigned to their role
 *
 * @param userId - The ID of the user to check
 * @param permission - The permission to check for
 * @returns true if the user has the permission, false otherwise
 */
export async function hasPermission(
  userId: string,
  permission: Permission
): Promise<boolean> {
  try {
    // First check if user is ADMIN — admins have ALL permissions always
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return false;
    if (user.userType === 'ADMIN') return true;

    // Check if user is a staff member with this permission
    const staffMember = await prisma.staffMember.findFirst({
      where: {
        userId,
        isActive: true,
      },
      include: {
        role: true,
      },
    });

    if (!staffMember) return false;

    const permissions = staffMember.role.permissions as string[];
    return permissions.includes(permission);
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
}

/**
 * Check if a user has ANY of the specified permissions
 *
 * @param userId - The ID of the user to check
 * @param permissions - Array of permissions to check
 * @returns true if user has at least one of the permissions
 */
export async function hasAnyPermission(
  userId: string,
  permissions: Permission[]
): Promise<boolean> {
  for (const permission of permissions) {
    if (await hasPermission(userId, permission)) {
      return true;
    }
  }
  return false;
}

/**
 * Check if a user has ALL of the specified permissions
 *
 * @param userId - The ID of the user to check
 * @param permissions - Array of permissions to check
 * @returns true if user has all of the permissions
 */
export async function hasAllPermissions(
  userId: string,
  permissions: Permission[]
): Promise<boolean> {
  for (const permission of permissions) {
    if (!(await hasPermission(userId, permission))) {
      return false;
    }
  }
  return true;
}

/**
 * Get all permissions for a user
 * ADMIN users get all permissions
 * Staff members get their role's permissions
 *
 * @param userId - The ID of the user
 * @returns Array of permission strings
 */
export async function getUserPermissions(userId: string): Promise<string[]> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return [];

    // Admin has all permissions
    if (user.userType === 'ADMIN') {
      const { ALL_PERMISSIONS } = await import('./permissions');
      return Object.keys(ALL_PERMISSIONS);
    }

    // Get staff member permissions
    const staffMember = await prisma.staffMember.findFirst({
      where: {
        userId,
        isActive: true,
      },
      include: {
        role: true,
      },
    });

    if (!staffMember) return [];

    return staffMember.role.permissions as string[];
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return [];
  }
}

/**
 * Check if a user can access the admin panel at all
 *
 * @param userId - The ID of the user
 * @returns true if user is admin or active staff member
 */
export async function canAccessAdminPanel(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        staffMember: true,
      },
    });

    if (!user) return false;

    // Admins always have access
    if (user.userType === 'ADMIN') return true;

    // Check if user is an active staff member
    return user.staffMember?.isActive === true;
  } catch (error) {
    console.error('Error checking admin panel access:', error);
    return false;
  }
}

/**
 * Middleware helper to require a permission
 * Throws an error if user doesn't have the permission
 *
 * @param userId - The ID of the user
 * @param permission - The required permission
 * @throws Error if user doesn't have permission
 */
export async function requirePermission(
  userId: string,
  permission: Permission
): Promise<void> {
  const hasAccess = await hasPermission(userId, permission);
  if (!hasAccess) {
    throw new Error(`Permission denied: ${permission}`);
  }
}

/**
 * Check if a user is an admin
 *
 * @param user - User object or user ID
 * @returns true if user is ADMIN
 */
export async function isAdmin(user: User | string): Promise<boolean> {
  if (typeof user === 'string') {
    const userRecord = await prisma.user.findUnique({
      where: { id: user },
    });
    return userRecord?.userType === 'ADMIN';
  }
  return user.userType === 'ADMIN';
}
