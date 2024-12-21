import { components } from '../types/api';

export type FamilyUnitDto = components['schemas']['FamilyUnitDto'];
export const rsvpCodeMatch = async (rsvpCode: string): Promise<components['schemas']['FamilyUnitDto']> => {
  const familyUnitResponse: components['schemas']['FamilyUnitDto'] = {
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
          sleepPreference: 'Camping',
          rehearsalDinner: 'Pending',
          fourthOfJuly: 'Pending',
          buildWeek: 'Pending',
          /** Format: date-time */
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
        rsvpNotes: null,
        guestLastLogin: null,
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
        rsvpNotes: null,
        guestLastLogin: null,
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
        rsvpNotes: null,
        guestLastLogin: null,
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
        rsvpNotes: null,
        guestLastLogin: null,
      }
    ],
    invitationResponse: 'Declined',
    mailingAddress: null,
    invitationResponseNotes: null,
    headCount: 0,
    familyUnitLastLogin: null,
  };
  return Promise.resolve(familyUnitResponse);
};


