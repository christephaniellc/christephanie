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
import { FamilyGuestsStates } from '@/store/family/types';
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
    const allUsersAttendanceResponded = !guests.some((user) => user.rsvp?.invitationResponse === InvitationResponseEnum.Pending);
    const allAllergiesResponded = !guests.some((user) => !user.preferences?.foodAllergies?.length);

    const mailingAddressEntered = !!familyUnit.mailingAddress;
    const mailingAddressUspsVerified = familyUnit.mailingAddress?.uspsVerified;
    const callByLastNames = Array.from(new Set(guests.map((user) => user.lastName))).map((lastName) => `${lastName}s`).join(' & ');
    const saveTheDateComplete = mailingAddressUspsVerified && allUsersAttendanceResponded;

    return {
      allUsersResponded: allUsersAttendanceResponded,
      attendingLastNames,
      callByLastNames,
      guests,
      mailingAddressEntered,
      mailingAddressUspsVerified,
      nobodyComing,
      saveTheDateComplete,
      allAllergiesResponded,
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
    const matchingGuest = familyUnit.guests.find((g) => g.guestId === guestId) || null;
    console.log(`updating ${matchingGuest?.firstName} to ${matchingGuest?.rsvp.invitationResponse}`);
    return matchingGuest || null;
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
        console.log('unexpectedly setting guest stuff here');
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

export const useFamily = () => {
  const [family, setFamily] = useRecoilState(familyState);
  const [user, setUser] = useRecoilState(userState);
  const { user: auth0User } = useAuth0();
  const {
    getFamilyUnitQuery,
    patchFamilyMutation,
    validateAddressMutation,
    patchFamilyGuestMutation,
  } = useApiContext();

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

  const updateFamilyGuestSleepingPreference = useCallback((guestId: string, sleepPreference: SleepPreferenceEnum) => {
    patchFamilyGuestMutation.mutate({ updatedGuest: { guestId: guestId, preferences: { sleepPreference } } });
  }, []);

  const updateFamilyGuestCommunicationPreference = useCallback((guestId: string, notificationPreference: NotificationPreferenceEnum[]) => {
    patchFamilyGuestMutation.mutate({ updatedGuest: { guestId, preferences: { notificationPreference } } });
  }, []);

  const updateFamilyGuestInterest = useCallback((guestId: string, interested: InvitationResponseEnum) => {
    patchFamilyGuestMutation.mutate({ updatedGuest: { guestId, rsvp: { invitationResponse: interested } } });
  }, []);

  const updateFamilyGuestFoodAllergies = useCallback((guestId: string, allergies: string[]) => {
    patchFamilyGuestMutation.mutate({ updatedGuest: { guestId, preferences: { foodAllergies: allergies } } });
  }, []);

  const updateFamilyGuestAgeGroup = useCallback((guestId: string, ageGroup: AgeGroupEnum) => {
    patchFamilyGuestMutation.mutate({ updatedGuest: { guestId, ageGroup } });
  }, []);

  const updateFamilyAddress = useCallback((mailingAddress: AddressDto) => {
    patchFamilyMutation.mutate({ updatedFamily: { mailingAddress } });
  }, []);

  const updateFamilyComment = useCallback((comment: string) => {
    patchFamilyMutation.mutate({ updatedFamily: { invitationResponseNotes: comment } });
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
      patchFamilyMutation: patchFamilyMutation,
      validateFamilyAddress: validateAddressMutation,
      patchFamilyGuestMutation,
    }),
    [patchFamilyGuestMutation, updateFamilyGuestFoodAllergies, updateFamilyGuestSleepingPreference, updateFamilyGuestCommunicationPreference, getFamilyUnitQuery, getFamily, updateFamilyGuestInterest, updateFamilyAddress, patchFamilyMutation, validateAddressMutation, updateFamilyComment, updateFamilyGuestAgeGroup, setFamily]);

  return [family, familyActions] as const;
};