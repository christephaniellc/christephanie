import React, { useEffect, useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { guestSelector, useFamily } from '@/store/family';
import { GuestViewModel, RoleEnum, SleepPreferenceEnum } from '@/types/api';
import { HotelOption } from '../types';

export const useCampingPreferences = (guestId: string) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const guest: GuestViewModel | null = useRecoilValue(guestSelector(guestId));
  const [_, familyActions] = useFamily();
  const campingPreferences = Object.keys(SleepPreferenceEnum);
  const [campingValue, setCampingValue] = React.useState<SleepPreferenceEnum>(
    SleepPreferenceEnum.Unknown,
  );
  const [takingShuttle, setTakingShuttle] = React.useState(true);
  const [expandedHotel, setExpandedHotel] = React.useState<number | null>(null);

  // Check if the guest has the Manor role
  const hasManorRole = useMemo(() => {
    return guest?.roles?.includes(RoleEnum.Manor) || false;
  }, [guest?.roles]);

  const handleChangeSleepPreference = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    value: SleepPreferenceEnum,
  ) => {
    if (guest?.preferences?.sleepPreference === value) {
      setCampingValue(SleepPreferenceEnum.Unknown);
      setAnchorEl(null);
      familyActions.updateFamilyGuestSleepingPreference(guestId, SleepPreferenceEnum.Unknown);
    } else {
      setCampingValue(value);
      setAnchorEl(e.currentTarget);
      familyActions.updateFamilyGuestSleepingPreference(guestId, value);
    }
  };

  const handleToggleHotelDetails = (index: number) => {
    setExpandedHotel(expandedHotel === index ? null : index);
  };

  const hotelOptions: HotelOption[] = [
    {
      name: 'Holiday Inn Express Suites - Brunswick, MD',
      image: '.../assets/holiday-inn-express-brunswick.jpg',
      googleRating: 4.6,
      phoneNumber: "(301) 969-8020",
      numberOfRatings: 195,
      hotelQuality: 3,
      onShuttleRoute: true,
      driveMinsFromWedding: 18,
      hotelBlock: false,
      bookingNote: "This hotel does not do formal wedding blocks, but they will give you a discount if you ask for the 'wedding rate'"
    },
    {
      name: 'Holiday Inn Express Charles Town, Ranson, WV',
      image: '.../assets/holiday-inn-express-charlestown.jpg',
      googleRating: 4.5,
      phoneNumber: "(304) 725-1330",
      numberOfRatings: 755,
      hotelQuality: 2,
      onShuttleRoute: true,
      driveMinsFromWedding: 23,
      hotelBlock: true,
      bookingNote: "We have reserved a block of hotel rooms here: ask for the 'Stubler Wedding block rate'"
    },
    {
      name: 'Lovettsville Area Hotels',
      image: undefined,
      googleRating: 0,
      phoneNumber: undefined,
      numberOfRatings: 0,
      hotelQuality: 0,
      onShuttleRoute: false,
      driveMinsFromWedding: 0,
      hotelBlock: false,
      bookingNote: undefined
    },
  ];

  useEffect(() => {
    setCampingValue(guest?.preferences?.sleepPreference || SleepPreferenceEnum.Unknown);
  }, [guest]);

  const open = Boolean(anchorEl);
  const id = open ? anchorEl?.id : undefined;

  return {
    campingPreferences,
    campingValue,
    hasManorRole,
    hotelOptions,
    expandedHotel,
    takingShuttle,
    setTakingShuttle,
    handleChangeSleepPreference,
    handleToggleHotelDetails,
    isPending: familyActions.patchFamilyMutation.isPending,
    isFetching: familyActions.getFamilyUnitQuery.isFetching,
    popoverId: id,
  };
};