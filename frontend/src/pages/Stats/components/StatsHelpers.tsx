import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HelpIcon from '@mui/icons-material/Help';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import { themePaletteToRgba } from '@/components/AttendanceButton/AttendanceButton';

import { FamilyUnitViewModel, InvitationResponseEnum, RsvpEnum, FoodPreferenceEnum, SleepPreferenceEnum } from '@/types/api';

// Tier priority mapping (lower number = higher priority)
export const TIER_PRIORITY = {
  'Platinum+': 0,
  'Platinum': 1,
  'Gold': 2,
  'Sapphire': 3,
  'Ruby': 4,
  'Rubellite': 5,
  'Amethyst': 6,
  'Opal': 7,
  'Amber': 0,
  'Peridot': 0
};

// Tier colors for visual representation
export const TIER_COLORS = {
  'Platinum+': '#E5E4E2', // platinum silver with hint of blue
  'Platinum': '#D9D9D9', // light platinum
  'Gold': '#FFD700', // gold
  'Sapphire': '#0F52BA', // deep blue
  'Ruby': '#E0115F', // ruby red
  'Rubellite': '#E08ACC', // ruby red
  'Amethyst': '#9966CC', // purple
  'Opal': '#A8C3BC', // opal green-blue
  'Amber': '#FFBF00', // amber
  'Peridot': '#B4C424', // peridot
};

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
export const getInvitationStatusColor = (status?: InvitationResponseEnum, 
  confirmStatus?: RsvpEnum) => {
  if (confirmStatus !== undefined 
    && confirmStatus !== RsvpEnum.Pending) {
    switch(confirmStatus) {
      case RsvpEnum.Attending:
        return 'success.main';
      case RsvpEnum.Declined:
        return 'error.main';
      default:
        return 'warning.main';
    }
  }
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
export const getInvitationStatusIcon = (status?: InvitationResponseEnum, 
  confirmStatus?: RsvpEnum) => {
  if (confirmStatus !== undefined 
    && confirmStatus !== RsvpEnum.Pending) {
    switch(confirmStatus) {
      case RsvpEnum.Attending:
        return <ThumbUpIcon fontSize="small" />;
      case RsvpEnum.Declined:
        return <ThumbDownIcon fontSize="small" />;
      default:
        return <QuestionMarkIcon fontSize="small" />;
    }
  }
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

export const getExpandedInvitationStatusColor = (status?: InvitationResponseEnum, 
  confirmStatus?: RsvpEnum) => {
    if (confirmStatus !== undefined 
      && confirmStatus !== RsvpEnum.Pending) {
      switch(confirmStatus) {
        case RsvpEnum.Attending:
          return themePaletteToRgba('success.main', 0.3);
        case RsvpEnum.Declined:
          return themePaletteToRgba('error.main', 0.3);
        default:
          return themePaletteToRgba('warning.main', 0.2);
      }
    }
    switch(status) {
      case InvitationResponseEnum.Interested:
        return themePaletteToRgba('success.main', 0.3);
      case InvitationResponseEnum.Declined:
        return themePaletteToRgba('error.main', 0.3);
      case InvitationResponseEnum.Pending:
      default:
        return themePaletteToRgba('warning.main', 0.2);
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
    guest => 
      guest.rsvp?.wedding === RsvpEnum.Declined ||
      guest.rsvp?.invitationResponse === InvitationResponseEnum.Declined
  );
  
  const someInterested = family.guests?.some(
    guest => 
      guest.rsvp?.wedding === RsvpEnum.Attending ||
      guest.rsvp?.invitationResponse === InvitationResponseEnum.Interested
  );

  const allPending = !hasDeclined && !someInterested;
  
  if (hasDeclined && !someInterested) return 'error.light';
  if (allPending) return 'warning.light';
  if (someInterested) return 'success.light';
  return 'grey.200';
};

export function getLatestActivityAndGuest(family: FamilyUnitViewModel): { 
  firstName: string | null; lastActivity: Date | null } {
  
  // Create a list of all guests with audit timestamps
  const guestAudits: {
    guest: any,
    lastUpdate: Date
  }[] = [];
  
  // Add all RSVP and invitation response audit entries
  family.guests?.forEach(guest => {
    // Check invitation response audit
    if (guest.rsvp?.invitationResponseAudit?.lastUpdate) {
      guestAudits.push({
        guest,
        lastUpdate: new Date(guest.rsvp.invitationResponseAudit.lastUpdate)
      });
    }
    
    // Check RSVP audit
    if (guest.rsvp?.rsvpAudit?.lastUpdate) {
      guestAudits.push({
        guest,
        lastUpdate: new Date(guest.rsvp.rsvpAudit.lastUpdate)
      });
    }
    
    // Also include lastActivity as a fallback
    if (guest.lastActivity) {
      guestAudits.push({
        guest,
        lastUpdate: new Date(guest.lastActivity)
      });
    }
  });
  
  // If no valid audit entries found, return null values
  if (guestAudits.length === 0) {
    return { firstName: null, lastActivity: null };
  }
  
  // Find the most recent audit entry
  const latestAudit = guestAudits.reduce((latest, current) => {
    return current.lastUpdate > latest.lastUpdate ? current : latest;
  });
  
  // Use audit username if available, otherwise use guest's firstName
  // For RSVP or invitation response audits, check for username field
  let name = latestAudit.guest.firstName;
  
  if (latestAudit.guest.rsvp?.invitationResponseAudit?.lastUpdate === latestAudit.lastUpdate.toISOString() &&
      latestAudit.guest.rsvp?.invitationResponseAudit?.username) {
    name = latestAudit.guest.rsvp.invitationResponseAudit.username;
  } else if (latestAudit.guest.rsvp?.rsvpAudit?.lastUpdate === latestAudit.lastUpdate.toISOString() &&
            latestAudit.guest.rsvp?.rsvpAudit?.username) {
    name = latestAudit.guest.rsvp.rsvpAudit.username;
  }
  
  // Return the guest name and timestamp
  return { 
    firstName: name, 
    lastActivity: latestAudit.lastUpdate 
  };
}

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

// Helper function to get tier details (color and priority)
export const getTierDetails = (tier?: string | null) => {
  if (!tier) {
    return { color: '#9e9e9e', priority: 999 }; // Default gray for unknown tiers
  }
  
  return {
    color: TIER_COLORS[tier as keyof typeof TIER_COLORS] || '#9e9e9e',
    priority: TIER_PRIORITY[tier as keyof typeof TIER_PRIORITY] !== undefined 
      ? TIER_PRIORITY[tier as keyof typeof TIER_PRIORITY] 
      : 999
  };
};