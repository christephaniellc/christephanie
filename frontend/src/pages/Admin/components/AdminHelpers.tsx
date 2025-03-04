import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HelpIcon from '@mui/icons-material/Help';

import { FamilyUnitViewModel, InvitationResponseEnum, RsvpEnum, FoodPreferenceEnum, SleepPreferenceEnum } from '@/types/api';

// Helper function to get RSVP status color
export const getRsvpStatusColor = (status?: RsvpEnum) => {
  switch(status) {
    case RsvpEnum.Attending:
      return 'success.main';
    case RsvpEnum.Declined:
      return 'error.main';
    case RsvpEnum.Pending:
    default:
      return 'warning.main';
  }
};

// Helper function to get RSVP status icon
export const getRsvpStatusIcon = (status?: RsvpEnum) => {
  switch(status) {
    case RsvpEnum.Attending:
      return <CheckCircleIcon fontSize="small" />;
    case RsvpEnum.Declined:
      return <CancelIcon fontSize="small" />;
    case RsvpEnum.Pending:
    default:
      return <HelpIcon fontSize="small" />;
  }
};

// Interface for guest detail popper state
export interface GuestPopperState {
  open: boolean;
  anchorEl: HTMLElement | null;
  guestId: string | null;
  flipped: boolean;
  flipAxis: string;
}

// Helper function to get food preference label and color
export const getFoodPreferenceDetails = (preference?: FoodPreferenceEnum) => {
  switch(preference) {
    case FoodPreferenceEnum.Omnivore:
      return { 
        label: 'Omnivore', 
        color: '#9c27b0' // purple
      };
    case FoodPreferenceEnum.Vegetarian:
      return { 
        label: 'Vegetarian', 
        color: '#4caf50' // green 
      };
    case FoodPreferenceEnum.Vegan:
      return { 
        label: 'Vegan', 
        color: '#00bcd4' // cyan
      };
    case FoodPreferenceEnum.BYOB:
      return { 
        label: 'BYOB', 
        color: '#ff9800' // orange
      };
    default:
      return { 
        label: 'Unknown', 
        color: '#9e9e9e' // grey
      };
  }
};

// Helper function to get sleep preference details
export const getSleepPreferenceDetails = (preference?: SleepPreferenceEnum) => {
  switch(preference) {
    case SleepPreferenceEnum.Camping:
      return { 
        label: 'Camping', 
        color: '#388e3c' // dark green
      };
    case SleepPreferenceEnum.Hotel:
      return { 
        label: 'Hotel', 
        color: '#1976d2' // blue
      };
    case SleepPreferenceEnum.Manor:
      return { 
        label: 'Manor', 
        color: '#d32f2f' // red
      };
    case SleepPreferenceEnum.Other:
      return { 
        label: 'Other', 
        color: '#7b1fa2' // purple
      };
    default:
      return { 
        label: 'Unknown', 
        color: '#9e9e9e' // grey
      };
  }
};

// Helper function to get overall family status color
export const getFamilyStatusColor = (family: FamilyUnitViewModel) => {
  const hasDeclined = family.guests?.some(
    guest => guest.rsvp?.invitationResponse === InvitationResponseEnum.Declined || 
              guest.rsvp?.wedding === RsvpEnum.Declined
  );
  
  const allPending = family.guests?.every(
    guest => guest.rsvp?.invitationResponse === InvitationResponseEnum.Pending ||
              !guest.rsvp?.wedding ||
              guest.rsvp?.wedding === RsvpEnum.Pending
  );
  
  const someAttending = family.guests?.some(
    guest => guest.rsvp?.wedding === RsvpEnum.Attending
  );
  
  if (hasDeclined && !someAttending) return 'error.light';
  if (allPending) return 'warning.light';
  if (someAttending) return 'success.light';
  return 'grey.200';
};

// Generate fun quotes for the guest narrative
export const getRandomNarrative = (guest: any) => {
  const narratives = [
    `${guest.firstName} is excited to attend and might bring a flame thrower!`,
    `We hear ${guest.firstName} has been preparing dance moves for months.`,
    `${guest.firstName} will likely arrive on a unicorn or similar magical creature.`,
    `There's a rumor that ${guest.firstName} is planning something spectacular for the wedding.`,
    `${guest.firstName} has been collecting shiny objects in preparation for the festivities.`,
    `In an alternate universe, ${guest.firstName} is the one getting married.`,
    `${guest.firstName} once survived a desert monsoon and is ready for anything!`,
    `If the wedding were underwater, ${guest.firstName} would be bringing their own oxygen tank.`,
    `${guest.firstName} is known for their legendary playa survival skills.`,
    `Some say ${guest.firstName} already practiced the wedding dance with aliens in Area 51.`
  ];
  
  return narratives[Math.floor(Math.random() * narratives.length)];
};

// Generate a random axis for the 3D flip animation
export const getRandomAxis = () => {
  const axes = ['X', 'Y'];
  return axes[Math.floor(Math.random() * axes.length)];
};