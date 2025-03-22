import { FamilyUnitDto } from '@/types/api';

export type CardSide = 'front' | 'back';
export type CardOrientation = 'horizontal' | 'vertical';
export type SortOption = 'name' | 'invitationCode' | 'guestCount' | 'responseStatus' | 'completionStatus' | 'lastUpdated';
export type StepCompletion = {
  hasGuests: boolean;
  hasAgeGroups: boolean;
  hasNotificationPrefs: boolean;
  hasFoodPrefs: boolean;
  hasAccommodation: boolean;
  hasMailingAddress: boolean;
  hasComments: boolean;
};

export interface FamilyStats {
  totalFamilies: number;
  totalGuests: number;
  interestedGuests: number;
  declinedGuests: number;
  pendingGuests: number;
  interestedPercentage: number;
  declinedPercentage: number;
  pendingPercentage: number;
}

export interface PhotoGridItem {
  id: number;
  photoSrc: string;
  position: [number, number]; // [row, column]
  isLocked: boolean;
  objectFit?: string;
  objectPosition?: string;
}

export type PhotoVariant = {
  id: string;
  name: string;
  description?: string;
  layout: PhotoGridItem[];
}