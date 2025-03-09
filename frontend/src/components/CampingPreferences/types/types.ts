import { GuestViewModel, SleepPreferenceEnum } from '@/types/api';

export interface HotelOption {
  name: string;
  image: string | undefined;
  googleRating: number;
  phoneNumber: string | undefined;
  numberOfRatings: number;
  hotelQuality: number;
  onShuttleRoute: boolean;
  driveMinsFromWedding: number;
  hotelBlock: boolean;
  hotelRateAskFor: string | undefined;
}

export interface PreferenceButtonProps {
  value: string;
  active: boolean;
  hasManorRole: boolean;
  disabled: boolean;
  onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

export interface HotelDetailProps {
  hotel: HotelOption;
  takingShuttle?: boolean;
  onToggleShuttle?: () => void;
}

export interface HotelDialogProps {
  open: boolean;
  onClose: () => void;
  hotelOptions: HotelOption[];
}

export interface HotelOptionProps {
  hotel: HotelOption;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}

export interface HotelListProps {
  hotelOptions: HotelOption[];
  expandedHotel: number | null;
  handleToggleHotelDetails: (index: number) => void;
}

export interface PreferenceButtonGroupProps {
  campingPreferences: string[];
  campingValue: SleepPreferenceEnum;
  hasManorRole: boolean;
  screenWidth: number;
  handleChangeSleepPreference: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    value: SleepPreferenceEnum
  ) => void;
  isPending: boolean;
  isFetching: boolean;
}

export interface PreferenceDescriptionProps {
  campingValue: SleepPreferenceEnum;
  hotelOptions: HotelOption[];
  expandedHotel: number | null;
  handleToggleHotelDetails: (index: number) => void;
  takingShuttle: boolean;
  setTakingShuttle: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface CampingPreferencesProps {
  guestId: string;
}