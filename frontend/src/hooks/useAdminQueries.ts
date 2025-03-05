import { useContext } from 'react';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { ApiError } from '@/api/Api';
import { FamilyUnitViewModel, RoleEnum, InvitationResponseEnum, SleepPreferenceEnum, FoodPreferenceEnum, RsvpEnum, AgeGroupEnum } from '@/types/api';
import { ApiContext } from '@/context/ApiContext';
import { mockFamilyUnitDto } from '../../test-utils/mockResponses';

// Mock data for development until the API endpoint is ready
const MOCK_FAMILIES: FamilyUnitViewModel[] = [
  // Convert the mock family to a view model
  {
    invitationCode: mockFamilyUnitDto.invitationCode,
    unitName: mockFamilyUnitDto.unitName,
    guests: mockFamilyUnitDto.guests?.map(guest => ({
      invitationCode: guest.invitationCode,
      guestId: guest.guestId,
      guestNumber: guest.guestNumber,
      auth0Id: guest.auth0Id,
      firstName: guest.firstName,
      additionalFirstNames: guest.additionalFirstNames,
      lastName: guest.lastName,
      roles: guest.roles,
      email: guest.email ? {
        maskedValue: guest.email.value,
        verified: guest.email.verified
      } : undefined,
      phone: guest.phone ? {
        maskedValue: guest.phone.value,
        verified: guest.phone.verified
      } : undefined,
      rsvp: guest.rsvp,
      preferences: guest.preferences,
      ageGroup: guest.ageGroup,
      lastActivity: guest.lastActivity
    })),
    mailingAddress: {
      streetAddress: "123 Wedding Way",
      city: "Ann Arbor",
      state: "MI",
      postalCode: "48103",
      uspsVerified: true
    },
    familyUnitLastLogin: mockFamilyUnitDto.familyUnitLastLogin
  },
  // Additional mock family with different attributes
  {
    invitationCode: "ABCDE",
    unitName: "Johnson Family",
    guests: [
      {
        invitationCode: "ABCDE",
        guestId: "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
        guestNumber: 1,
        firstName: "Michael",
        lastName: "Johnson",
        roles: [RoleEnum.Guest],
        rsvp: {
          invitationResponse: InvitationResponseEnum.Interested,
          rehearsalDinner: RsvpEnum.Attending,
          fourthOfJuly: RsvpEnum.Declined,
          wedding: RsvpEnum.Attending
        },
        preferences: {
          sleepPreference: SleepPreferenceEnum.Camping,
          foodPreference: FoodPreferenceEnum.Vegetarian,
          foodAllergies: ["Nuts", "Dairy"]
        },
        ageGroup: AgeGroupEnum.Adult
      },
      {
        invitationCode: "ABCDE",
        guestId: "2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q",
        guestNumber: 2,
        firstName: "Sarah",
        lastName: "Johnson",
        roles: [RoleEnum.Guest],
        rsvp: {
          invitationResponse: InvitationResponseEnum.Interested,
          rehearsalDinner: RsvpEnum.Declined,
          fourthOfJuly: RsvpEnum.Attending,
          wedding: RsvpEnum.Attending
        },
        preferences: {
          sleepPreference: SleepPreferenceEnum.Camping,
          foodPreference: FoodPreferenceEnum.Omnivore
        },
        ageGroup: AgeGroupEnum.Adult
      }
    ],
    mailingAddress: {
      streetAddress: "456 Party Lane",
      city: "Detroit",
      state: "MI",
      postalCode: "48201",
      uspsVerified: true
    },
    familyUnitLastLogin: "2025-01-15T14:30:45.123Z"
  },
  // Family with no address or login date
  {
    invitationCode: "NOADR",
    unitName: "Smith Family",
    guests: [
      {
        invitationCode: "NOADR",
        guestId: "3c4d5e6f-7g8h-9i0j-1k2l-3m4n5o6p7q8r",
        guestNumber: 1,
        firstName: "John",
        lastName: "Smith",
        roles: [RoleEnum.Guest],
        rsvp: {
          invitationResponse: InvitationResponseEnum.Pending
        },
        ageGroup: AgeGroupEnum.Adult
      }
    ],
    // No mailing address or login date
  }
];

export const useAdminQueries = () => {
  const apiContext = useContext(ApiContext);
  
  // Query to get all families with mock data until API endpoint is ready
  const getAllFamiliesQuery = useQuery<FamilyUnitViewModel[], ApiError>({
    queryKey: ['getAllFamilies'],
    queryFn: () => apiContext.getAllFamilies(),
    refetchOnMount: false,
    enabled: false, // Don't fetch on component mount, we'll do it manually
  }) as UseQueryResult<FamilyUnitViewModel[], ApiError>;

  return {
    getAllFamiliesQuery,
  };
};