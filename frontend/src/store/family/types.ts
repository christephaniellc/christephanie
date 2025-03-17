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