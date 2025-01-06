import { atom, selector } from 'recoil';
import { FamilyUnitDto, GuestDto } from '@/types/api';
import { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { firstNameState, invitationCodeState } from '@/store/invitationInputs';

export const userIdQueryState = atom<Partial<UseQueryResult<string | null>>> ({
  key: 'userIdQueryState',
  default: null,
});


const userState = atom<Partial<GuestDto>>({
  key: 'userState',
  default: {
    guestId: '',
    firstName: '',
    invitationCode: '',
  } as GuestDto,
});

export const userSelector = selector<GuestDto>({
  key: 'updatedUserState',
  get: ({ get }) => {
    const user = get(userState);
    const userId = get(userIdQueryState);
    const firstName = get(firstNameState);
    const invitationCode = get(invitationCodeState);
    return {
      ...user,
      guestId: userId?.data,
      firstName,
      invitationCode,
    }
  },
});

export const refetchUserState = atom<() => void>({
  key: 'refetchUserState',
  default: false,
});

export const userMutationState = atom<Partial<UseMutationResult<GuestDto | null>>> ({
  key: 'userMutationState',
  default: null
});
