import { atom, selector, selectorFamily, useRecoilState, useRecoilValue } from 'recoil';
import {
  AddressDto,
  AgeGroupEnum,
  FamilyUnitViewModel,
  FoodPreferenceEnum,
  GuestViewModel,
  InvitationResponseEnum,
  NotificationPreferenceEnum,
  RsvpEnum,
  SleepPreferenceEnum,
} from '@/types/api';
import { FamilyGuestsStates, FamilyGuestsWeddingStates } from '@/store/family/types';
import { useCallback, useEffect, useMemo } from 'react';
import { UseQueryResult } from '@tanstack/react-query';
import { useAuth0 } from '@auth0/auth0-react';
import { useApiContext } from '@/context/ApiContext';
import { userState } from '@/store/user';
import { saveTheDateStepsState } from '@/store/steppers/saveTheDateStepper';
import { rsvpStepsState } from '@/store/steppers/rsvpStepper';

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

    const everyoneIsLame =
      familyUnit.guests?.every(
        (guest) =>
          guest.rsvp.invitationResponse === InvitationResponseEnum.Declined ||
          guest.rsvp.invitationResponse === InvitationResponseEnum.Pending,
      ) ?? true;
    const atLeastOneAttending = !everyoneIsLame;

    const attendingLastNames = guests
      .filter((user) => user.rsvp?.invitationResponse === InvitationResponseEnum.Interested)
      .map((user) => user.lastName);
    const allUsersAttendanceResponded = !guests.some(
      (user) => user.rsvp?.invitationResponse === InvitationResponseEnum.Pending,
    );
    const allAllergiesResponded = !guests.some((user) => !user.preferences?.foodAllergies?.length);

    const mailingAddressEntered = !!familyUnit.mailingAddress;
    const mailingAddressUspsVerified = familyUnit.mailingAddress?.uspsVerified;
    const callByLastNames = Array.from(
      new Set(
        guests
          .map((user) => user.lastName?.trim())
          .filter((lastName) => lastName)
      )
    )
      .map((lastName) => {
        // Apply proper English pluralization for last names
        const endsInS = lastName.toLowerCase().endsWith('s');
        return endsInS ? `${lastName}es` : `${lastName}s`;
      })
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
      atLeastOneAttending,
      saveTheDateComplete,
      allAllergiesResponded,
    } as FamilyGuestsStates;
  },
});

export const familyGuestsRsvpStates = selector<FamilyGuestsWeddingStates | null>({
  key: 'familyMembersWedding',
  //key: 'familyMembers',
  get: ({ get }) => {
    const familyUnit = get(familyState);
    if (!familyUnit) {
      return null;
    }

    const guests = familyUnit.guests || [];
    const nobodyComing = guests.every(
      (user) => user.rsvp?.invitationResponse === InvitationResponseEnum.Declined
        || user.rsvp?.wedding === RsvpEnum.Declined,
    );

    const everyoneIsLame =
      familyUnit.guests?.every(
        (guest) =>
          guest.rsvp?.wedding === RsvpEnum.Declined ||
          guest.rsvp?.wedding === RsvpEnum.Pending,
      ) ?? true;
    const atLeastOneAttending = !everyoneIsLame;

    const attendingLastNames = guests
      .filter((user) => user.rsvp?.wedding === RsvpEnum.Attending)
      .map((user) => user.lastName);
    const allUsersAttendanceResponded = !guests.some(
      (user) => user.rsvp?.wedding === RsvpEnum.Pending,
    );
    const allUsers4thAttendanceResponded = !guests.some(
      (user) => user.rsvp?.fourthOfJuly === RsvpEnum.Pending,
    );

    const callByLastNames = Array.from(new Set(guests.map((user) => user.lastName)))
      .map((lastName) => `${lastName}s`)
      .join(' & ');
    const rsvpComplete = allUsersAttendanceResponded && allUsers4thAttendanceResponded;

    return {
      allUsersResponded: allUsersAttendanceResponded,
      attendingLastNames,
      callByLastNames,
      guests,
      nobodyComing,
      atLeastOneAttending,
      rsvpComplete,
    } as FamilyGuestsWeddingStates;
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
      // console.log(
      //   `updating ${matchingGuest?.firstName} to ${matchingGuest?.rsvp.invitationResponse}`,
      // );
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
      const updatedGuests = [...familyUnit.guests].map((guest) => {
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

export const attendanceState = selector({
  key: 'attendanceState',
  get: ({ get }) => {
    const familyUnit = get(familyState);
    if (!familyUnit?.guests) return false;

    const everyoneIsLame = familyUnit.guests.every(
      (guest) =>
        guest.rsvp.invitationResponse === InvitationResponseEnum.Declined ||
        guest.rsvp.invitationResponse === InvitationResponseEnum.Pending,
    );
    const atLeastOneAttending = !everyoneIsLame;
    return { atLeastOneAttending };
  },
});

const somethingFamilySelector = selector({
  key: 'somethingFamilySelector',
  get: ({ get }) => {
    const family = get(familyState);
    const ageIsSelected = family?.guests?.every(
      (guest: GuestViewModel) => guest.ageGroup !== undefined,
    );
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
  },
});

export function reorderArrayByKey(array, key, matchValue) {
  // Create a copy of the array to avoid mutating the original
  const arrayCopy = [...array];

  // Find the index of the element where the property matches the provided value
  const index = arrayCopy.findIndex((item) => item[key] === matchValue);

  // If a matching element is found, remove it and place it at the beginning of the array
  if (index !== -1) {
    const [matchingElement] = arrayCopy.splice(index, 1);
    arrayCopy.unshift(matchingElement);
  }

  return arrayCopy;
}

export const useFamily = () => {
  const guestStates = useRecoilValue(familyGuestsStates);
  const guestRsvpStates = useRecoilValue(familyGuestsRsvpStates)
  const [family, setFamily] = useRecoilState(familyState);
  const [user, setUser] = useRecoilState(userState);
  const [saveTheDateSteps, setSaveTheDateSteps] = useRecoilState(saveTheDateStepsState);
  const [rsvpSteps, setRsvpSteps] = useRecoilState(rsvpStepsState);
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
          const sortedGuests = reorderArrayByKey([...res.data.guests], 'auth0Id', auth0User?.sub);
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

  const updateFamilyGuestEmail = useCallback((guestId: string, email: string) => {
    patchFamilyGuestMutation.mutate({ updatedGuest: { guestId, email } });
  }, []);

  const updateFamilyGuestPhone = useCallback((guestId: string, phone: string) => {
    patchFamilyGuestMutation.mutate({ updatedGuest: { guestId, phone } });
  }, []);

  const updateFamilyGuestBetaTestOptIn = useCallback(
    (guestId: string, allowBetaScreenRecordings: boolean) => {
      patchFamilyGuestMutation.mutate({ updatedGuest: { guestId, allowBetaScreenRecordings } });
    }, []);

  const updateFamilyGuestInterest = useCallback(
    (guestId: string, interested: InvitationResponseEnum) => {
      patchFamilyGuestMutation.mutate({
        updatedGuest: { guestId, invitationResponse: interested },
      });
    }, []);
  
  const updateFamilyGuestRsvp = useCallback(
    (guestId: string, attending: RsvpEnum) => {
      patchFamilyGuestMutation.mutate({
        updatedGuest: { guestId, wedding: attending },
      });
    }, []);

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
    const updatedAddress = mailingAddress;
    if (!mailingAddress.zipCode) {
      updatedAddress.zipPlus4 = null;
      updatedAddress.zipCode = null;
    }
    patchFamilyMutation.mutate({
      updatedFamily: { mailingAddress: { ...updatedAddress, uspsVerified: false } },
    });
  }, []);

  const updateFamilyComment = useCallback((comment: string) => {
    patchFamilyMutation.mutate({ updatedFamily: { invitationResponseNotes: comment } });
  }, []);

  useEffect(() => {
    if (getFamilyUnitQuery.data && !family) {
      let sortedGuests = [];
      if (getFamilyUnitQuery.data.guests && getFamilyUnitQuery.data.guests.length > 0) {
        sortedGuests = reorderArrayByKey(
          [...getFamilyUnitQuery.data.guests],
          'auth0Id',
          auth0User?.sub,
        );
      }
      //console.log('sorted guests by auth0Id', user.auth0Id, sortedGuests);
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
      (guest) => guest.rsvp?.invitationResponse === InvitationResponseEnum.Interested,
    );
    //console.log('are some guests pending?', attendingGuests.some((guest) => guest.rsvp?.invitationResponse === InvitationResponseEnum.Pending));
    setSaveTheDateSteps((prev) => ({
      // attendance
      attendance: {
        ...prev.attendance,
        display: true,
        label: `${guestStates.guests.length > 1 ? 'Is your family' : 'Are you'} interested in attending the wedding?`,
        completed: !family.guests.some(
          (guest) => guest.rsvp?.invitationResponse === InvitationResponseEnum.Pending,
        ),
      },
      ageGroup: {
        ...prev.ageGroup,
        display: attendingGuests.some(
          (guest) => guest.rsvp?.invitationResponse !== InvitationResponseEnum.Declined,
        ),
        label: `What kind of '${guestStates.guests.length > 1 ? 'people' : 'person'} are we catering to?`,
        completed: attendingGuests.every((guest) => guest.ageGroup !== undefined),
      },
      communicationPreference: {
        ...prev.communicationPreference,
        display: attendingGuests.some(
          (guest) => guest.rsvp?.invitationResponse !== InvitationResponseEnum.Declined,
        ),
        completed: attendingGuests.some(
          (value) => value?.phone?.verified || value?.email?.verified,
        ),
      },
      foodPreferences: {
        ...prev.foodPreferences,
        display: attendingGuests.some(
          (guest) => guest.rsvp?.invitationResponse !== InvitationResponseEnum.Declined,
        ),
        completed: attendingGuests.every((guest) => guest.preferences.foodPreference !== null),
      },
      foodAllergies: {
        ...prev.foodAllergies,
        display: attendingGuests.some(
          (guest) => guest.rsvp?.invitationResponse !== InvitationResponseEnum.Declined,
        ),
        completed: attendingGuests.every((guest) => !!guest.preferences.foodAllergies),
      },
      camping: {
        ...prev.camping,
        display: attendingGuests.some(
          (guest) => guest.rsvp?.invitationResponse !== InvitationResponseEnum.Declined,
        ),
        completed: attendingGuests.every(
          (guest) =>
            guest?.preferences?.sleepPreference !== undefined &&
            guest?.preferences?.sleepPreference !== SleepPreferenceEnum.Unknown,
        ),
      },
      mailingAddress: {
        ...prev.mailingAddress,
        display: true, // Always show mailing address step
        completed:
          family.mailingAddress?.uspsVerified === true || (
            !!family.mailingAddress?.streetAddress &&
            !!family.mailingAddress?.city &&
            !!family.mailingAddress?.state &&
            !!family.mailingAddress?.postalCode
          ),
      },
      comments: {
        ...prev.comments,
        display: true,
        completed: !!family.invitationResponseNotes,
      },
      summary: {
        ...prev.summary,
        display: true,
        completed: true,
      },
    }));
  }, [family]);

  useEffect(() => {
    if (!family || !family.guests || !rsvpSteps) return;
    
    // Get guests who are either attending or pending (i.e., not declined)
    const relevantGuests = family.guests.filter(
      (guest) => guest.rsvp?.wedding === RsvpEnum.Attending || guest.rsvp?.wedding === RsvpEnum.Pending,
    );
    
    // For completion tracking, we only care about guests who are explicitly attending
    const attendingGuests = family.guests.filter(
      (guest) => guest.rsvp?.wedding === RsvpEnum.Attending,
    );
    
    // For guests who need to complete steps (both attending and pending)
    const guestsToComplete = [...attendingGuests];
    
    setRsvpSteps((prev) => ({
      weddingAttendance: {
        ...prev.weddingAttendance,
        display: true,
        label: `${guestStates.guests.length > 1 ? 'Is your family' : 'Are you'} interested in attending the wedding?`,
        completed: !family.guests.some(
          (guest) => guest.rsvp?.wedding === RsvpEnum.Pending,
        ),
      },
      fourthOfJulyAttendance: {
        ...prev.fourthOfJulyAttendance,
        display: true,
        label: `${guestStates.guests.length > 1 ? 'Is your family' : 'Are you'} interested in attending the 4th of July BBQ potluck?`,
        completed: !family.guests.some(
          (guest) => guest.rsvp?.fourthOfJuly === RsvpEnum.Pending,
        ),
      },
      // ageGroup: {
      //   ...prev.ageGroup,
      //   display: relevantGuests.length > 0,
      //   label: `What kind of '${guestStates.guests.length > 1 ? 'people' : 'person'} are we catering to?`,
      //   completed: guestsToComplete.every((guest) => guest.ageGroup !== undefined),
      // },
      foodPreferences: {
        ...prev.foodPreferences,
        display: relevantGuests.length > 0,
        completed: guestsToComplete.length > 0 && guestsToComplete.every((guest) => 
          guest.preferences && guest.preferences.foodPreference !== null
        ),
      },
      foodAllergies: {
        ...prev.foodAllergies,
        display: relevantGuests.length > 0,
        completed: guestsToComplete.length > 0 && guestsToComplete.every((guest) => 
          guest.preferences && !!guest.preferences.foodAllergies
        ),
      },
      accommodation: {
        ...prev.accommodation,
        display: relevantGuests.length > 0,
        completed: guestsToComplete.length > 0 && guestsToComplete.every(
          (guest) =>
            guest.preferences && 
            guest.preferences.sleepPreference !== undefined &&
            guest.preferences.sleepPreference !== SleepPreferenceEnum.Unknown,
        ),
      },
      mailingAddress: {
        ...prev.mailingAddress,
        display: true, // Always show mailing address step
        completed:
          family.mailingAddress?.uspsVerified === true || (
            !!family.mailingAddress?.streetAddress &&
            !!family.mailingAddress?.city &&
            !!family.mailingAddress?.state &&
            !!family.mailingAddress?.postalCode
          ),
      },
      communicationPreferences: {
        ...prev.communicationPreferences,
        display: relevantGuests.length > 0,
        completed: guestsToComplete.length > 0 && guestsToComplete.some(
          (value) => value?.phone?.verified || value?.email?.verified,
        ),
      },
      comments: {
        ...prev.comments,
        display: true,
        completed: !!family.invitationResponseNotes,
      },
      summary: {
        ...prev.summary,
        display: true,
        completed: true,
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
      updateFamilyGuestEmail,
      updateFamilyGuestPhone,
      updateFamilyGuestFoodAllergies,
      updateFamilyGuestInterest,
      updateFamilyGuestRsvp,
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
      updateFamilyGuestEmail,
      updateFamilyGuestPhone,
      getFamilyUnitQuery,
      getFamily,
      updateFamilyGuestInterest,
      updateFamilyGuestRsvp,
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
