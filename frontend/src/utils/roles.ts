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

/**
 * Checks if a user has the BetaTester role
 * @param user The user object to check
 * @returns boolean indicating if the user has BetaTester role
 */
export const isBetaTester = (user?: Partial<GuestDto> | null): boolean => {
  if (!user) {
    return false;
  }
  
  if (!user.roles) {
    return false;
  }
  
  if (!Array.isArray(user.roles)) {
    return false;
  }
  
  return user.roles.includes(RoleEnum.BetaTester);
};

/**
 * Checks if a user has the Staff role
 * @param user The user object to check
 * @returns boolean indicating if the user has Staff role
 */
export const isStaff = (user?: Partial<GuestDto> | null): boolean => {
  if (!user) {
    return false;
  }
  
  if (!user.roles) {
    return false;
  }
  
  if (!Array.isArray(user.roles)) {
    return false;
  }
  
  return user.roles.includes(RoleEnum.Staff);
};

/**
 * Checks if a user has the Party role
 * @param user The user object to check
 * @returns boolean indicating if the user has Party role
 */
export const isParty = (user?: Partial<GuestDto> | null): boolean => {
  if (!user) {
    return false;
  }
  
  if (!user.roles) {
    return false;
  }
  
  if (!Array.isArray(user.roles)) {
    return false;
  }
  
  return user.roles.includes(RoleEnum.Party);
};

export const hasRole = (role: RoleEnum, user?: Partial<GuestDto> | null): boolean => {
  if (!user) {
    return false;
  }
  
  if (!user.roles) {
    return false;
  }
  
  if (!Array.isArray(user.roles)) {
    return false;
  }
  
  return user.roles.includes(role) || isAdmin(user);
};

/**
 * Checks if a user has either Staff or Party role
 * @param user The user object to check
 * @returns boolean indicating if the user has Staff or Party role
 */
export const isStaffOrParty = (user?: Partial<GuestDto> | null): boolean => {
  return isStaff(user) || isParty(user) || isAdmin(user);
};