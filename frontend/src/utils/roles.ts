import { RoleEnum, GuestDto } from '@/types/api';

/**
 * Checks if a user has the Admin role
 * @param user The user object to check
 * @returns boolean indicating if the user has admin role
 */
export const isAdmin = (user?: Partial<GuestDto> | null): boolean => {
  if (!user) {
    return false;
  }
  
  if (!user.roles) {
    return false;
  }
  
  if (!Array.isArray(user.roles)) {
    return false;
  }
  
  return user.roles.includes(RoleEnum.Admin);
};