import { isAdmin } from './roles';
import { GuestDto, RoleEnum } from '@/types/api';

describe('roles utils.wip', () => {
  describe('isAdmin function.wip', () => {
    it('should return true when user has Admin role.wip', () => {
      // Arrange
      const user: GuestDto = {
        guestId: 'test-id',
        roles: [RoleEnum.Guest, RoleEnum.Admin],
      } as GuestDto;

      // Act
      const result = isAdmin(user);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when user does not have Admin role.wip', () => {
      // Arrange
      const user: GuestDto = {
        guestId: 'test-id',
        roles: [RoleEnum.Guest, RoleEnum.Party],
      } as GuestDto;

      // Act
      const result = isAdmin(user);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when user has empty roles array.wip', () => {
      // Arrange
      const user: GuestDto = {
        guestId: 'test-id',
        roles: [],
      } as GuestDto;

      // Act
      const result = isAdmin(user);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when user is undefined.wip', () => {
      // Act
      const result = isAdmin(undefined);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when user is null.wip', () => {
      // Act
      const result = isAdmin(null);

      // Assert
      expect(result).toBe(false);
    });
  });
});