import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HelpIcon from '@mui/icons-material/Help';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';

import { FamilyUnitViewModel, InvitationResponseEnum, RsvpEnum, FoodPreferenceEnum, SleepPreferenceEnum } from '@/types/api';

// Helper function to get RSVP status color (legacy)
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

// Helper function to get RSVP status icon (legacy)
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

// Helper function to get Invitation status color
export const getInvitationStatusColor = (status?: InvitationResponseEnum) => {
  switch(status) {
    case InvitationResponseEnum.Interested:
      return 'success.main';
    case InvitationResponseEnum.Declined:
      return 'error.main';
    case InvitationResponseEnum.Pending:
    default:
      return 'warning.main';
  }
};

// Helper function to get Invitation status icon
export const getInvitationStatusIcon = (status?: InvitationResponseEnum) => {
  switch(status) {
    case InvitationResponseEnum.Interested:
      return <ThumbUpIcon fontSize="small" />;
    case InvitationResponseEnum.Declined:
      return <ThumbDownIcon fontSize="small" />;
    case InvitationResponseEnum.Pending:
    default:
      return <QuestionMarkIcon fontSize="small" />;
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

// Helper function to get overall family status color - updated to use InvitationResponseEnum
export const getFamilyStatusColor = (family: FamilyUnitViewModel) => {
  const hasDeclined = family.guests?.some(
    guest => guest.rsvp?.invitationResponse === InvitationResponseEnum.Declined
  );
  
  const allPending = family.guests?.every(
    guest => !guest.rsvp?.invitationResponse || 
             guest.rsvp?.invitationResponse === InvitationResponseEnum.Pending
  );
  
  const someInterested = family.guests?.some(
    guest => guest.rsvp?.invitationResponse === InvitationResponseEnum.Interested
  );
  
  if (hasDeclined && !someInterested) return 'error.light';
  if (allPending) return 'warning.light';
  if (someInterested) return 'success.light';
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