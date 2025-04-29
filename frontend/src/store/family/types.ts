import {GuestViewModel} from "@/types/api";

export interface FamilyGuestsStates {
  allUsersResponded: boolean;
  attendingLastNames: string[];
  callByLastNames: string;
  guests: GuestViewModel[];
  mailingAddressEntered: boolean;
  mailingAddressUspsVerified: boolean;
  nobodyComing: boolean;
  atLeastOneAttending: boolean;
  saveTheDateComplete: boolean;
  allAllergiesResponded: boolean;
}

export interface FamilyGuestsWeddingStates {
  [x: string]: any;
  allUsersResponded: boolean;
  allUsers4thAttendanceResponded: boolean;
  attendingLastNames: string[];
  callByLastNames: string;
  guests: GuestViewModel[];
  nobodyComing: boolean;
  rsvpComplete: boolean;
}