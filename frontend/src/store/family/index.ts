import {
  atom, selector,
  selectorFamily, useRecoilState,
} from 'recoil';
import {
  AddressDto, AgeGroupEnum,
  FamilyUnitDto,
  GuestDto,
  InvitationResponseEnum,
  NotificationPreferenceEnum,
  SleepPreferenceEnum,
} from '@/types/api';
import { useCallback, useEffect, useMemo } from 'react';
import { UseQueryResult } from '@tanstack/react-query';
import { useAuth0 } from '@auth0/auth0-react';
import { useApiContext } from '@/context/ApiContext';
import { userState } from '@/store/user';

export const familyState = atom<FamilyUnitDto | null>({
  key: 'familyUnit',
  default: null,
  effects: [
    ({ setSelf }) => {
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
    },
  ],
});

export const guestSelector = selectorFamily<GuestDto | null, string>({
  key: 'guestSelector',
  get: (guestId) => ({ get }) => {
    const familyUnit = get(familyState);
    if (!familyUnit || !familyUnit.guests) {
      return null;
    }
    const matchingGuest = familyUnit.guests.find((g) => g.guestId === guestId) || null;
    console.log(`updating ${matchingGuest?.firstName} to ${matchingGuest?.rsvp.invitationResponse}`);
    return matchingGuest || null;
  },
  // set:
  //   (guestId) =>
  //     ({ get, set }, newValue) => {
  //       // newValue is whatever you pass to set(guestSelector('id'), newValue)
  //       // If it's null, you might decide to do nothing or remove the guest.
  //       // In this example, let's assume `newValue` is a partial or complete GuestDto.
  //       if (!newValue) return;
  //
  //       const familyUnit = get(familyState);
  //       if (!familyUnit?.guests) return;
  //
  //       // Overwrite only the changed fields (shallow merge) or do a full replace:
  //       console.log('unexpectedly setting guest stuff here');
  //       const updatedGuests = familyUnit.guests.map((guest) => {
  //         if (guest.guestId === guestId) {
  //           return {
  //             ...guest,
  //             ...newValue, // merges the updates onto the original guest
  //           };
  //         }
  //         return guest;
  //       });
  //
  //       set(familyState, {
  //         ...familyUnit,
  //         guests: updatedGuests,
  //       } as FamilyUnitDto);
  //     },
});

export const useFamily = () => {
  const [family, setFamily] = useRecoilState(familyState);
  const [user, setUser] = useRecoilState(userState);
  const { user: auth0User } = useAuth0();
  const { getFamilyUnitQuery, updateFamilyMutation, validateAddressMutation, patchFamilyGuestMutation } = useApiContext();

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

  const updateFamilyGuestSleepingPreference = useCallback((guestId: string, sleepingPreference: SleepPreferenceEnum) => {
    const updatedGuests = family?.guests?.map((prevGuest) => {
      if (prevGuest.guestId === guestId) {
        return {
          ...prevGuest,
          preferences: {
            ...prevGuest.preferences,
            sleepPreference: sleepingPreference, // merges the updates onto the original guest
          },
        };
      }
      return prevGuest;
    });
    updateFamilyMutation.mutate({ updatedFamily: { ...family, guests: updatedGuests } });
  }, []);

  const updateFamilyGuestCommunicationPreference = useCallback((guestId: string, notificationPreference: NotificationPreferenceEnum[]) => {
    const updatedGuests = family?.guests?.map((prevGuest) => {
      if (prevGuest.guestId === guestId) {
        return {
          ...prevGuest,
          preferences: {
            ...prevGuest.preferences,
            notificationPreference: notificationPreference, // merges the updates onto the original guest
          },
        };
      }
      return prevGuest;
    });
    updateFamilyMutation.mutate({ updatedFamily: { ...family, guests: updatedGuests } });
  }, []);

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
  }, []);

  const patchFamilyGuest = useCallback((guest: Partial<GuestDto>) => {
    patchFamilyGuestMutation.mutate({ updatedGuest: guest});
  }, []);

  const updateFamilyGuestFoodAllergies = useCallback((guestId: string, allergies: string[]) => {
    const updatedGuests = family?.guests?.map((prevGuest) => {
      if (prevGuest.guestId === guestId) {
        return {
          ...prevGuest,
          preferences: {
            ...prevGuest.preferences,
            foodAllergies: allergies, // merges the updates onto the original guest
          },
        };
      }
      return prevGuest;
    });
    updateFamilyMutation.mutate({ updatedFamily: { ...family, guests: updatedGuests } });
  }, []);

  const updateFamilyGuestAgeGroup = useCallback((guestId: string, ageGroup: AgeGroupEnum) => {
    if (!family || !family.guests) return;
    const updatedGuests: GuestDto[] = family.guests.map((prevGuest) => {
      if (prevGuest.guestId === guestId) {
        return {
          ...prevGuest,
          ageGroup, // merges the updates onto the original guest
        } as GuestDto;
      }
      return prevGuest as GuestDto;
    });
    updateFamilyMutation.mutate({ updatedFamily: { ...family, guests: updatedGuests } });
  }, []);

  const updateFamilyAddress = useCallback((mailingAddress: AddressDto) => {
    updateFamilyMutation.mutate({ updatedFamily: { ...family, mailingAddress } });
  }, []);

  const updateFamilyComment = useCallback((comment: string) => {
    updateFamilyMutation.mutate({ updatedFamily: { ...family, invitationResponseNotes: comment } });
  }, []);

  useEffect(() => {
    if (getFamilyUnitQuery.data) {
      console.log('setting family from getFamilyUnitQuery');
      setFamily(getFamilyUnitQuery.data as FamilyUnitDto);
    }
  }, [getFamilyUnitQuery.data]);

  useEffect(() => {
    if (auth0User && !family) {
      getFamily();
    }
  }, [family, auth0User, getFamily]);

  const familyActions = useMemo(() => ({
      getFamily,
      updateFamilyGuestSleepingPreference,
      getFamilyUnitQuery,
      setFamily,
      updateFamilyAddress,
      updateFamilyComment,
      updateFamilyGuestAgeGroup,
      updateFamilyGuestCommunicationPreference,
      updateFamilyGuestFoodAllergies,
      updateFamilyGuestInterest,
      updateFamilyMutation,
      validateFamilyAddress: validateAddressMutation,
      patchFamilyGuest,
      patchFamilyGuestMutation
    }),
    [patchFamilyGuestMutation, patchFamilyGuest, updateFamilyGuestFoodAllergies, updateFamilyGuestSleepingPreference, updateFamilyGuestCommunicationPreference, getFamilyUnitQuery, getFamily, updateFamilyGuestInterest, updateFamilyAddress, updateFamilyMutation, validateAddressMutation, updateFamilyComment, updateFamilyGuestAgeGroup, setFamily]);

  return [family, familyActions] as const;
};