import { RoleEnum, GuestDto } from '@/types/api';

/**
 * Checks if a user has the Admin role
 * @param user The user object to check
 * @returns boolean indicating if the user has admin role
 */
export const isAdmin = (user?: GuestDto | null): boolean => {
  console.log('isAdmin check - user:', user);
  
  if (!user) {
    console.log('isAdmin: user is null or undefined');
    return false;
  }
  
  if (!user.roles) {
    console.log('isAdmin: user.roles is null or undefined');
    return false;
  }
  
  if (!Array.isArray(user.roles)) {
    console.log('isAdmin: user.roles is not an array:', user.roles);
    return false;
  }
  
  const hasAdminRole = user.roles.includes(RoleEnum.Admin);
  console.log('isAdmin: roles:', user.roles, 'RoleEnum.Admin:', RoleEnum.Admin, 'hasAdminRole:', hasAdminRole);
  
  return hasAdminRole;
};