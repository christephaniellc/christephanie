import { atom, selector, selectorFamily, useRecoilState } from 'recoil';
import {
  AddressDto,
  AgeGroupEnum,
  FamilyUnitDto,
  FamilyUnitViewModel,
  FoodPreferenceEnum,
  GuestDto,
  GuestViewModel,
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
import { saveTheDateStepsState } from '@/store/steppers/steppers';

export const familyState = atom<FamilyUnitViewModel | null>({
  key: 'familyUnit',
  default: null,
});

export const familyQueryState = atom<UseQueryResult<FamilyUnitViewModel> | null>({
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
    const nobodyComing = guests.every(
      (user) => user.rsvp?.invitationResponse === InvitationResponseEnum.Declined,
    );
    const attendingLastNames = guests
      .filter((user) => user.rsvp?.invitationResponse === InvitationResponseEnum.Interested)
      .map((user) => user.lastName);
    const allUsersAttendanceResponded = !guests.some(
      (user) => user.rsvp?.invitationResponse === InvitationResponseEnum.Pending,
    );
    const allAllergiesResponded = !guests.some((user) => !user.preferences?.foodAllergies?.length);

    const mailingAddressEntered = !!familyUnit.mailingAddress;
    const mailingAddressUspsVerified = familyUnit.mailingAddress?.uspsVerified;
    const callByLastNames = Array.from(new Set(guests.map((user) => user.lastName)))
      .map((lastName) => `${lastName}s`)
      .join(' & ');
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

export const guestSelector = selectorFamily<GuestViewModel | null, string>({
  key: 'guestSelector',
  get:
    (guestId) =>
    ({ get }) => {
      const familyUnit = get(familyState);
      if (!familyUnit || !familyUnit.guests) {
        return null;
      }
      const matchingGuest = familyUnit.guests.find((g) => g.guestId === guestId) || null;
      console.log(
        `updating ${matchingGuest?.firstName} to ${matchingGuest?.rsvp.invitationResponse}`,
      );
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
      } as FamilyUnitViewModel);
    },
});

const somethingFamilySelector = selector({
  key: 'somethingFamilySelector',
  get: ({ get }) => {
    const family = get(familyState);
    const ageIsSelected = family?.guests?.every((guest: GuestViewModel) => guest.ageGroup !== undefined);
    const foodPreferencesAreSelected = family?.guests?.every(
      (guest: GuestViewModel) => guest.preferences.foodPreference !== null,
    );
    const foodAllergiesAreSelected = family?.guests?.every(
      (guest: GuestViewModel) => !!guest.preferences.foodAllergies,
    );
    const campingPreferencesAreSelected = family?.guests?.every(
      (guest: GuestViewModel) => guest.preferences.sleepPreference !== SleepPreferenceEnum.Unknown,
    );
    const addressIsSelected = family?.mailingAddress !== undefined;
    const commentsAreSelected = family?.invitationResponseNotes !== undefined;
    return {
      ageIsSelected,
      foodPreferencesAreSelected,
      foodAllergiesAreSelected,
      campingPreferencesAreSelected,
      addressIsSelected,
      commentsAreSelected,
    };
    //   updateSteps((prev) => ({
    //     ...prev,
    //     ageGroup: {
    //       ...prev.ageGroup,
    //       completed: ageIsSelected,
    //     },
    //     foodPreferences: {
    //       ...prev.foodPreferences,
    //       completed: foodPreferencesAreSelected,
    //     },
    //     foodAllergies: {
    //       ...prev.foodAllergies,
    //       completed: foodAllergiesAreSelected,
    //     },
    //     communicationPreference: {
    //       ...prev.communicationPreference,
    //       completed: true,
    //     },
    //     camping: {
    //       ...prev.camping,
    //       completed: campingPreferencesAreSelected,
    //     },
    //     mailingAddress: {
    //       ...prev.mailingAddress,
    //       completed: addressIsSelected,
    //     },
    //     comments: {
    //       ...prev.comments,
    //       completed: commentsAreSelected,
    //     },
    //   }));
  },
});

export function reorderArrayByKey(array, key, matchValue) {
  // Find the index of the element where the property matches the provided value
  const index = array.findIndex((item) => item[key] === matchValue);

  // If a matching element is found, remove it and place it at the beginning of the array
  if (index !== -1) {
    const [matchingElement] = array.splice(index, 1);
    array.unshift(matchingElement);
  }
  console.log('sorted array', array);

  return array;
}

export const useFamily = () => {
  const [family, setFamily] = useRecoilState(familyState);
  const [user, setUser] = useRecoilState(userState);
  const [saveTheDateSteps, setSaveTheDateSteps] = useRecoilState(saveTheDateStepsState);
  const { user: auth0User } = useAuth0();
  const {
    getFamilyUnitQuery,
    patchFamilyMutation,
    validateAddressMutation,
    patchFamilyGuestMutation,
  } = useApiContext();

  const getFamily = useCallback(
    () =>
      getFamilyUnitQuery.refetch().then((res) => {
        if (!res.data || !res.data.guests) return;

        const matchingUser = res.data.guests.find((value: GuestViewModel) => {
          return value.auth0Id === user.auth0Id;
        });
        if (matchingUser) {
          const sortedGuests = reorderArrayByKey(res.data.guests, 'guestId', auth0User.sub);
          setFamily({ ...res.data, guests: sortedGuests } as FamilyUnitViewModel);
        }
      }),
    [],
  );

  const updateFamilyGuestSleepingPreference = useCallback(
    (guestId: string, sleepPreference: SleepPreferenceEnum) => {
      patchFamilyGuestMutation.mutate({ updatedGuest: { guestId: guestId, sleepPreference } });
    },
    [],
  );

  const updateFamilyGuestCommunicationPreference = useCallback(
    (guestId: string, notificationPreference: NotificationPreferenceEnum[]) => {
      patchFamilyGuestMutation.mutate({ updatedGuest: { guestId, notificationPreference } });
    },
    [],
  );

  const updateFamilyGuestInterest = useCallback(
    (guestId: string, interested: InvitationResponseEnum) => {
      patchFamilyGuestMutation.mutate({
        updatedGuest: { guestId, invitationResponse: interested },
      });
    },
    [],
  );

  const updateFamilyGuestFoodPreferences = useCallback(
    (guestId: string, foodPreference: FoodPreferenceEnum) => {
      patchFamilyGuestMutation.mutate({ updatedGuest: { guestId, foodPreference } });
    },
    [],
  );

  const updateFamilyGuestFoodAllergies = useCallback(
    async (guestId: string, allergies: string[]) => {
      await patchFamilyGuestMutation.mutate({
        updatedGuest: { guestId, foodAllergies: allergies },
      });
    },
    [],
  );

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
    if (getFamilyUnitQuery.data && !family) {
      console.log('setting family from getFamilyUnitQuery');
      const sortedGuests =
        getFamilyUnitQuery.data.guests &&
        getFamilyUnitQuery.data.guests.length > 1 &&
        reorderArrayByKey(getFamilyUnitQuery.data.guests, 'guestId', auth0User.sub);
      console.log('sorted guests by auth0Id', user.auth0Id, sortedGuests);
      setFamily({
        ...getFamilyUnitQuery.data,
        guests: sortedGuests,
      });
    }
  }, [getFamilyUnitQuery.data, user]);

  useEffect(() => {
    if (auth0User && !family) {
      getFamily();
    }
  }, [family, auth0User, getFamily]);

  useEffect(() => {
    if (!family || !family.guests || !saveTheDateSteps) return;
    const attendingGuests = family.guests.filter(
      (guest) => guest.rsvp?.invitationResponse === InvitationResponseEnum.Interested
    );
    console.log('are some guests pending?', attendingGuests.some((guest) => guest.rsvp?.invitationResponse === InvitationResponseEnum.Pending));
    setSaveTheDateSteps((prev) => ({
      // attendance
      attendance: {
        ...prev.attendance,
        completed: !family.guests.some((guest) => guest.rsvp?.invitationResponse === InvitationResponseEnum.Pending),
      },
      ageGroup: {
        ...prev.ageGroup,
        completed: attendingGuests.every((guest) => guest.ageGroup !== undefined),
      },
      foodPreferences: {
        ...prev.foodPreferences,
        completed: attendingGuests.every(
          (guest) => guest.preferences.foodPreference !== null,
        ),
      },
      foodAllergies: {
        ...prev.foodAllergies,
        completed: attendingGuests.every((guest) => !!guest.preferences.foodAllergies),
      },
      communicationPreference: {
        ...prev.communicationPreference,
        completed: attendingGuests.some((value) => value.phone?.verified || value.email?.verified),
      },
      camping: {
        ...prev.camping,
        completed: attendingGuests.every(
          (guest) => guest.preferences.sleepPreference !== SleepPreferenceEnum.Unknown,
        ),
      },
      mailingAddress: {
        ...prev.mailingAddress,
        completed: !!family.mailingAddress,
      },
      comments: {
        ...prev.comments,
        completed: !!family.invitationResponseNotes,
      },
    }));
  }, [family]);

  const familyActions = useMemo(
    () => ({
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
      updateFamilyGuestFoodPreferences,
      patchFamilyMutation: patchFamilyMutation,
      validateFamilyAddress: validateAddressMutation,
      patchFamilyGuestMutation,
    }),
    [
      updateFamilyGuestFoodPreferences,
      patchFamilyGuestMutation,
      updateFamilyGuestFoodAllergies,
      updateFamilyGuestSleepingPreference,
      updateFamilyGuestCommunicationPreference,
      getFamilyUnitQuery,
      getFamily,
      updateFamilyGuestInterest,
      updateFamilyAddress,
      patchFamilyMutation,
      validateAddressMutation,
      updateFamilyComment,
      updateFamilyGuestAgeGroup,
      setFamily,
    ],
  );

  return [family, familyActions] as const;
};
