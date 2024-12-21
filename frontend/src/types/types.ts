// Enums
export type AgeGroupEnum = 'Adult' | 'Teenager' | 'Child' | 'Toddler' | 'Baby';
export type InvitationResponseEnum = 'Pending' | 'Interested' | 'Declined';
export type MealPreferenceEnum = 'Omnivore' | 'Vegetarian' | 'Vegan';
export type RoleEnum = 'Guest' | 'Party' | 'Rehearsal' | 'Builder' | 'Staff' | 'Admin';
export type RsvpEnum = 'Pending' | 'Attending' | 'Declined';
export type SleepPreferenceEnum = 'Unknown' | 'Camping' | 'Hotel';

// Interfaces
export interface APIGatewayProxyResponse {
  statusCode: number;
  headers?: Record<string, string | null>;
  multiValueHeaders?: Record<string, (string | null)[]>;
  body?: string | null;
  isBase64Encoded: boolean;
}

export interface AddressDto {
  streetAddress?: string | null;
  streetAddressAbbreviation?: string | null;
  secondaryAddress?: string | null;
  city?: string | null;
  cityAbbreviation?: string | null;
  state?: string | null;
  postalCode?: string | null;
  province?: string | null;
  zipCode?: string | null;
  zipPlus4?: string | null;
  urbanization?: string | null;
  country?: string | null;
  countryISOCode?: string | null;
}

export interface DeleteResponse {
  success: boolean;
}

export interface FamilyUnitDto {
  rsvpCode?: string | null;
  unitName?: string | null;
  tier?: string | null;
  guests?: GuestDto[] | null;
  mailingAddress?: string | null;
  additionalAddresses?: string[] | null;
  invitationResponseNotes?: string | null;
  potentialHeadCount: number;
  familyUnitLastLogin?: string | null;
}

export interface GuestDto {
  rsvpCode?: string | null;
  guestId?: string | null;
  guestNumber?: number | null;
  auth0Id?: string | null;
  firstName?: string | null;
  additionalFirstNames?: string[] | null;
  lastName?: string | null;
  roles?: RoleEnum[] | null;
  email?: string | null;
  phone?: string | null;
  rsvp?: RsvpDto;
  preferences?: PreferencesDto;
  ageGroup?: AgeGroupEnum;
  guestLogins?: string[] | null;
}

export interface PreferencesDto {
  guestId?: string | null;
  meal?: MealPreferenceEnum;
  kidsPortion?: boolean | null;
  foodAllergies?: string | null;
  specialAlcoholRequests?: string | null;
}

export interface ProblemDetails {
  type?: string | null;
  title?: string | null;
  status?: number | null;
  detail?: string | null;
  instance?: string | null;
}

export interface RsvpDto {
  guestId?: string | null;
  invitationResponse?: InvitationResponseEnum;
  wedding?: RsvpEnum;
  sleepPreference?: SleepPreferenceEnum;
  rehearsalDinner?: RsvpEnum;
  fourthOfJuly?: RsvpEnum;
  buildWeek?: RsvpEnum;
  arrivalDate?: string | null;
  rsvpNotes?: string | null;
}
