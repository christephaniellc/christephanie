import {
  atom, selector,
  selectorFamily,
  useSetRecoilState,
} from 'recoil';
import { FamilyUnitDto, GuestDto, InvitationResponseEnum } from '@/types/api';
import { FamilyGuestsStates } from '@/store/family/types';
import { useMemo } from 'react';

export const familyState = atom<FamilyUnitDto | null>({
  key: 'familyUnit',
  default: null,
});

export const familyGuestsStates = selector<FamilyGuestsStates>({
  key: 'familyMembers',
  get: ({ get }) => {
    const familyUnit = get(familyState);
    const guests = familyUnit?.guests || [];
    const nobodyComing = guests.every((user) => user.rsvp?.invitationResponse === InvitationResponseEnum.Declined);
    const attendingLastNames = guests.filter((user) => user.rsvp?.invitationResponse === InvitationResponseEnum.Interested).map((user) => user.lastName);
    const callByLastNames = Array.from(new Set(guests.map((user) => user.lastName))).map((lastName) => `${lastName}s`).join(' & ');

    return { callByLastNames, attendingLastNames, guests, nobodyComing };
  },
});

export const guestSelector = selectorFamily<GuestDto | null, string>({
  key: 'guestSelector',
  get: (guestId) => ({ get }) => {
    const familyUnit = get(familyState);
    if (!familyUnit || !familyUnit.guests) {
      return null;
    }
    return familyUnit.guests.find((g) => g.guestId === guestId) || null;
  },
  set:
    (guestId) =>
      ({ get, set }, newValue) => {
        // newValue is whatever you pass to set(guestSelector('id'), newValue)
        // If it's null, you might decide to do nothing or remove the guest.
        // In this example, let's assume `newValue` is a partial or complete GuestDto.
        if (!newValue) return;

        const familyUnit = get(familyState);
        if (!familyUnit?.guests) return;

        // Overwrite only the changed fields (shallow merge) or do a full replace:
        const updatedGuests = familyUnit.guests.map((guest) => {
          if (guest.guestId === guestId) {
            return {
              ...guest,
              ...newValue, // merges the updates onto the original guest
            };
          }
          return guest;
        });

        set(familyState, {
          ...familyUnit,
          guests: updatedGuests,
        } as FamilyUnitDto);
      },
});

export const useUpdateFamilyGuest = (guestId: string) => {
  const updateGuest = useSetRecoilState(guestSelector(guestId));

  const updateInvitation = (invitationResponse: InvitationResponseEnum) => {
    updateGuest({ rsvp: { invitationResponse } });
  };

  return useMemo(() => ({ updateInvitation }), [updateGuest]);
};