import { createContext, ReactNode, useContext, useState } from 'react';
import { components } from '../../types/api';
import { FamilyUnitDto, GuestDto } from '../../types/types';

interface FauxServerContextProps {
  getFamilyUnit: (rsvpCode: string) => Promise<FamilyUnitDto>;
  updateUserRsvp: ({ guest, guestInterested }: { guest: GuestDto, guestInterested: 'Pending' | 'Interested' | 'Declined' }) => Promise<GuestDto>;
}

const FauxServerContext = createContext<FauxServerContextProps | undefined>(undefined);

export const FauxServerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [familyUnit, setFamilyUnit] = useState<FamilyUnitDto | null>(null);

  const getFamilyUnit = async (rsvpCode: string) => {
    const familyUnitResponse = Promise.resolve(rsvpCodeMatch).then((response) => {
      return response;
    });
    return familyUnitResponse;
  };

  const updateUserRsvp = async ({ guest, guestInterested }: {
    guest: GuestDto,
    guestInterested: 'Pending' | 'Interested' | 'Declined'
  }) => {
    const updatedUserResponse = Promise.resolve(updateInterest(guest, guestInterested)).then((response) => {
        return response;
      },
    );
    return updatedUserResponse;
  };

  const updateInterest = (guest: GuestDto, guestInterested: 'Pending' | 'Interested' | 'Declined'): GuestDto => {
    return {
      ...guest,
      rsvp: {
        ...guest.rsvp,
        invitationResponse: guestInterested,
      },
    };
  };

  return (
    <FauxServerContext.Provider value={{ getFamilyUnit, updateUserRsvp }}>
      {children}
    </FauxServerContext.Provider>
  );
};

export const useFauxServerContext = (): FauxServerContextProps => {
  const context = useContext(FauxServerContext);
  if (!context) {
    throw new Error('useFauxServer must be used within a FauxServerProvider');
  }
  return context;
};


export const updateUserRsvp = ({ guest, guestInterested }: {
  guest: GuestDto, guestInterested: 'Pending'
    | 'Interested' | 'Declined';
}): GuestDto => {
  return {
    ...guest,
    rsvp: {
      ...guest.rsvp,
      invitationResponse: guestInterested,
    },
  };
};

const rsvpCodeMatch: FamilyUnitDto = {
  rsvpCode: 'ABCDE',
  guests: [
    {
      guestId: '1',
      auth0Id: null,
      firstName: 'Steph',
      lastName: 'Stubler',
      roles: ['Admin'],
      email: 'steph.stubler@gmail.com',
      phone: null,
      rsvp: {
        guestId: null,
        wedding: 'Pending',
        invitationResponse: 'Pending',
        sleepPreference: 'Camping',
        rehearsalDinner: 'Pending',
        fourthOfJuly: 'Pending',
        buildWeek: 'Pending',
        arrivalDate: '2025-06-30',
      },
      preferences: {
        guestId: '1',
        meal: 'Omnivore',
        kidsPortion: false,
        foodAllergies: null,
        specialAlcoholRequests: null,

      },
      ageGroup: 'Adult',
    },
    {
      guestId: '2',
      auth0Id: null,
      firstName: 'Topher',
      lastName: 'Sikorra',
      roles: ['Admin'],
      email: 'topher.sikorra@gmail.com',
      phone: null,
      rsvp: {
        guestId: '2',
        wedding: 'Pending',
        invitationResponse: 'Pending',
        sleepPreference: 'Camping',
        rehearsalDinner: 'Pending',
        fourthOfJuly: 'Pending',
        buildWeek: 'Pending',
        /** Format: date-time */
        arrivalDate: '2025-06-30',
      },
      preferences: {
        guestId: '2',
        meal: 'Omnivore',
        kidsPortion: false,
        foodAllergies: null,
        specialAlcoholRequests: null,

      },
      ageGroup: 'Adult',
    },
    {
      guestId: '3',
      auth0Id: null,
      firstName: 'Kilton',
      lastName: 'Sikorra',
      roles: ['Admin'],
      email: 'topher.sikorra@gmail.com',
      phone: null,
      rsvp: {
        guestId: '3',
        wedding: 'Declined',
        invitationResponse: 'Pending',
        sleepPreference: 'Camping',
        rehearsalDinner: 'Pending',
        fourthOfJuly: 'Pending',
        buildWeek: 'Pending',
        arrivalDate: '2025-06-30',
      },
      preferences: {
        guestId: '3',
        meal: 'Omnivore',
        kidsPortion: false,
        foodAllergies: null,
        specialAlcoholRequests: null,

      },
      ageGroup: 'Adult',
    },
    {
      guestId: '4',
      auth0Id: null,
      firstName: 'Laney Jo',
      lastName: 'Sikorra',
      roles: ['Admin'],
      email: 'topher.sikorra@gmail.com',
      phone: null,
      rsvp: {
        guestId: '4',
        wedding: 'Declined',
        invitationResponse: 'Pending',
        sleepPreference: 'Camping',
        rehearsalDinner: 'Pending',
        fourthOfJuly: 'Pending',
        buildWeek: 'Pending',
        /** Format: date-time */
        arrivalDate: '2025-06-30',
      },
      preferences: {
        guestId: '3',
        meal: 'Omnivore',
        kidsPortion: false,
        foodAllergies: null,
        specialAlcoholRequests: null,

      },
      ageGroup: 'Adult',
    },
  ],
  mailingAddress: null,
  invitationResponseNotes: null,
  familyUnitLastLogin: null,
  potentialHeadCount: 4,
};
