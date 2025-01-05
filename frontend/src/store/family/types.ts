import {GuestDto} from "@/types/api";

export type FamilyGuestsStates = {
  callByLastNames: string;
  attendingLastNames: (string | null | undefined)[];
  nobodyComing: boolean;
  guests: GuestDto[]
};