import { FamilyUnitDto } from '@/types/api';

export const mockFamilyUnitDto = {
  invitationCode: "RVMBL",
  unitName: "Sikorra_Christopher Family",
  guests: [
    {
      invitationCode: "RVMBL",
      guestId: "6f2e238d-6792-453f-82d1-1cde35414d5b",
      guestNumber: 1,
      auth0Id: "google-oauth2|109165472878949322902",
      firstName: "Christopher",
      additionalFirstNames: [
        "topher.sikorra"
      ],
      lastName: "Sikorra",
      roles: [
        "Admin",
        "Rehearsal",
        "Manor",
        "FourthOfJuly"
      ],
      email: {
        value: "topher.sikorra@gmail.com",
        verified: true
      },
      phone: {
        value: "248-930-0000",
        verified: true
      },
      rsvp: {
        invitationResponse: "Pending"
      },
      preferences: {
        notificationPreference: [],
        foodAllergies: []
      },
      ageGroup: "Adult",
      lastActivity: "2025-02-06T05:05:15.228+00:00"
    },
    {
      invitationCode: "RVMBL",
      guestId: "8e22da5e-2943-4297-bb78-1d60e82ba94c",
      guestNumber: 2,
      firstName: "Stephanie",
      additionalFirstNames: [],
      lastName: "Stubler",
      roles: [
        "Admin",
        "Rehearsal",
        "Manor",
        "FourthOfJuly"
      ],
      rsvp: {
        invitationResponse: "Pending"
      },
      preferences: {
        notificationPreference: [],
        foodAllergies: []
      },
      ageGroup: "Adult"
    }
  ],
  additionalAddresses: [],
  familyUnitLastLogin: "2025-02-06T05:05:15.227+00:00"
} as FamilyUnitDto;