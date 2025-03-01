import {GuestDto, GuestViewModel} from "@/types/api";

export interface FamilyGuestsStates {
  allUsersResponded: boolean;
  attendingLastNames: string[];
  callByLastNames: string;
  guests: GuestViewModel[];
  mailingAddressEntered: boolean;
  mailingAddressUspsVerified: boolean;
  nobodyComing: boolean;
  saveTheDateComplete: boolean;
  allAllergiesResponded: boolean;
}