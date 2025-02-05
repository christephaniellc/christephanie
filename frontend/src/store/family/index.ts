import {
  atom, selector,
  selectorFamily, useRecoilState, useRecoilValue,
  useSetRecoilState,
} from 'recoil';
import { AddressDto, FamilyUnitDto, GuestDto, InvitationResponseEnum } from '@/types/api';
import { FamilyGuestsStates } from '@/store/family/types';
import { useCallback, useEffect, useMemo } from 'react';
import { useMutation, useQuery, UseQueryResult } from '@tanstack/react-query';
import { useAuth0 } from '@auth0/auth0-react';
import { useApiContext } from '@/context/ApiContext';
import { userState } from '@/store/user';
import { addressState } from '@/store/address';

export const familyState = atom<FamilyUnitDto | null>({
  key: 'familyUnit',
  default: null,
  effects: [
    ({ setSelf, onSet }) => {
      // 1. On atom initialization, check localStorage
      const savedValue = localStorage.getItem('familyUnit');
      if (savedValue != null) {
        try {
          // Restore the atom's value from localStorage
          setSelf(JSON.parse(savedValue));
        } catch (error) {
          console.error('Error parsing localStorage value', error);
        }
      }

      // 2. Whenever the atom's state changes, save it to localStorage
      onSet((newValue) => {
        localStorage.setItem('familyUnit', JSON.stringify(newValue));
      });
    },
  ],
});

export const familyQueryState = atom<UseQueryResult<FamilyUnitDto> | null>({
  key: 'familyQuery',
  default: null,
});


export const familyGuestsStates = selector<FamilyGuestsStates | null>({
  key: 'familyMembers',
  get: ({ get }) => {
    const familyUnit = get(familyState);
    if (!familyUnit) {
      return null;
    }

    const guests = familyUnit.guests || [];
    const nobodyComing = guests.every((user) => user.rsvp?.invitationResponse === InvitationResponseEnum.Declined);
    const attendingLastNames = guests.filter((user) => user.rsvp?.invitationResponse === InvitationResponseEnum.Interested).map((user) => user.lastName);
    const allUsersResponded = !guests.some((user) => user.rsvp?.invitationResponse === InvitationResponseEnum.Pending);
    const mailingAddressEntered = !!familyUnit.mailingAddress;
    const mailingAddressUspsVerified = familyUnit.mailingAddress?.uspsVerified;
    const callByLastNames = Array.from(new Set(guests.map((user) => user.lastName))).map((lastName) => `${lastName}s`).join(' & ');
    const saveTheDateComplete = mailingAddressUspsVerified && allUsersResponded;

    return {
      allUsersResponded,
      attendingLastNames,
      callByLastNames,
      guests,
      mailingAddressEntered,
      mailingAddressUspsVerified,
      nobodyComing,
      saveTheDateComplete,
    } as FamilyGuestsStates;
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

export const useFamily = () => {
  const [family, setFamily] = useRecoilState(familyState);
  const [user, setUser] = useRecoilState(userState);
  const { auth0User } = useAuth0();
  const { getFamilyUnitQuery, updateFamilyMutation, validateAddressMutation } = useApiContext();

  const getFamily = useCallback(() => getFamilyUnitQuery.refetch()
    .then((res) => {
      if (!res.data || !res.data.guests) return;

      const matchingUser = res.data.guests.find((value: GuestDto) => {
        return value.guestId === user.guestId;
      });
      if (matchingUser) {
        setUser(matchingUser);
      }
    }), []);

  const updateFamilyGuestInterest = useCallback((guestId: string, interested?: InvitationResponseEnum) => {
    const updatedGuests = family?.guests?.map((prevGuest) => {
      if (prevGuest.guestId === guestId) {
        return {
          ...prevGuest,
          rsvp: { invitationResponse: interested }, // merges the updates onto the original guest
        };
      }
      return prevGuest;
    });
    updateFamilyMutation.mutate({ updatedFamily: { ...family, guests: updatedGuests } });
  }, [family]);

  const updateFamilyGuestFoodAllergies = useCallback((guestId: string, allergies?: string) => {
    const updatedGuests = family?.guests?.map((prevGuest) => {
      if (prevGuest.guestId === guestId) {
        return {
          ...prevGuest,
          foodAllergies: allergies, // merges the updates onto the original guest
        };
      }
      return prevGuest;
    });
    updateFamilyMutation.mutate({ updatedFamily: { ...family, guests: updatedGuests } });
  }, [family]);

  const updateFamilyGuestAgeGroup = useCallback((guestId: string, ageGroup?: string) => {
    const updatedGuests = family?.guests?.map((prevGuest) => {
      if (prevGuest.guestId === guestId) {
        return {
          ...prevGuest,
          ageGroup, // merges the updates onto the original guest
        };
      }
      return prevGuest;
    });
    updateFamilyMutation.mutate({ updatedFamily: { ...family, guests: updatedGuests } });
  }, [family]);

  const updateFamilyAddress = useCallback((mailingAddress: AddressDto) => {
    updateFamilyMutation.mutate({ updatedFamily: { ...family, mailingAddress } });
  }, [family]);

  const updateFamilyComment = useCallback((comment: string) => {
    updateFamilyMutation.mutate({ updatedFamily: { ...family, invitationResponseNotes: comment } });
  }, [family]);

  useEffect(() => {
    if (getFamilyUnitQuery.data) {
      setFamily(getFamilyUnitQuery.data as FamilyUnitDto);
    }
  }, [getFamilyUnitQuery.data, setFamily]);

  useEffect(() => {
    if (auth0User && !family) {
      getFamily();
    }
  }, [family, auth0User]);

  const familyActions = useMemo(() => ({
    getFamily,
    updateFamilyGuestInterest,
    updateFamilyGuestAgeGroup,
    updateFamilyAddress,
    updateFamilyMutation,
    validateFamilyAddress: validateAddressMutation,
    updateFamilyComment,
    getFamilyUnitQuery,
    setFamily,
  }), [getFamilyUnitQuery, getFamily, updateFamilyGuestInterest, updateFamilyAddress, updateFamilyMutation, validateAddressMutation, updateFamilyComment, updateFamilyGuestAgeGroup, setFamily]);

  return [family, familyActions] as const;
};