import {GuestDto} from "@/types/api";

export interface FamilyGuestsStates {
  allUsersResponded: boolean;
  attendingLastNames: string[];
  callByLastNames: string;
  guests: GuestDto[];
  mailingAddressEntered: boolean;
  mailingAddressUspsVerified: boolean;
  nobodyComing: boolean;
  saveTheDateComplete: boolean;
}