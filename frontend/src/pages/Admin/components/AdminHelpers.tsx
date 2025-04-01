import { 
  RsvpEnum, 
  InvitationResponseEnum, 
  FoodPreferenceEnum, 
  SleepPreferenceEnum
} from '@/types/api';

// Type definitions for tier information
interface TierInfo {
  label: string;
  color: string;
  priority: number;
}

// Get tier details with consistent formatting and priority
export const getTierDetails = (tier: string | null): TierInfo => {
  if (!tier) {
    return { label: 'Unknown', color: '#999999', priority: 99 };
  }
  
  const tierLower = tier.toLowerCase();
  
  if (tierLower.includes('inner')) {
    return { label: 'Inner Circle', color: '#8e24aa', priority: 1 };
  }
  
  if (tierLower.includes('bridesmaid') || tierLower.includes('groomsman') || tierLower.includes('party')) {
    return { label: 'Wedding Party', color: '#673ab7', priority: 2 };
  }
  
  if (tierLower.includes('family')) {
    return { label: 'Family', color: '#7cb342', priority: 3 };
  }
  
  if (tierLower.includes('friend')) {
    return { label: 'Friends', color: '#26a69a', priority: 4 };
  }
  
  if (tierLower.includes('work')) {
    return { label: 'Work', color: '#42a5f5', priority: 5 };
  }
  
  if (tierLower.includes('acquaintance')) {
    return { label: 'Acquaintances', color: '#78909c', priority: 6 };
  }
  
  return { label: tier, color: '#9e9e9e', priority: 10 };
};

// Get RSVP status details
export const getRsvpStatusDetails = (status: RsvpEnum | undefined | null) => {
  switch(status) {
    case RsvpEnum.Attending:
      return { label: 'Attending', color: 'success' as const };
    case RsvpEnum.Declined:
      return { label: 'Declined', color: 'error' as const };
    case RsvpEnum.Pending:
    default:
      return { label: 'Pending', color: 'warning' as const };
  }
};

// Get invitation response details
export const getInvitationResponseDetails = (response: InvitationResponseEnum | undefined | null) => {
  switch(response) {
    case InvitationResponseEnum.Interested:
      return { label: 'Interested', color: 'success' as const };
    case InvitationResponseEnum.Declined:
      return { label: 'Declined', color: 'error' as const };
    default:
      return { label: 'Pending', color: 'default' as const };
  }
};

// Get food preference details
export const getFoodPreferenceDetails = (preference: FoodPreferenceEnum | undefined | null) => {
  switch(preference) {
    case FoodPreferenceEnum.Omnivore:
      return { label: 'Omnivore', color: '#8d6e63' as const };
    case FoodPreferenceEnum.Vegetarian:
      return { label: 'Vegetarian', color: '#66bb6a' as const };
    case FoodPreferenceEnum.Vegan:
      return { label: 'Vegan', color: '#26a69a' as const };
    default:
      return { label: 'Not Specified', color: '#9e9e9e' as const };
  }
};

// Get sleep preference details
export const getSleepPreferenceDetails = (preference: SleepPreferenceEnum | undefined | null) => {
  switch(preference) {
    case SleepPreferenceEnum.Hotel:
      return { label: 'Hotel', icon: 'hotel' as const };
    case SleepPreferenceEnum.Camping:
      return { label: 'Camping', icon: 'camping' as const };
    case SleepPreferenceEnum.Manor:
      return { label: 'House', icon: 'house' as const };
    case SleepPreferenceEnum.Other:
        return { label: 'House', icon: 'house' as const };
    default:
      return { label: 'Not Specified', icon: 'help_outline' as const };
  }
};

// Format date with consistent rules
export const formatDate = (date: string | undefined | null): string => {
  if (!date) return 'Never';
  
  try {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};