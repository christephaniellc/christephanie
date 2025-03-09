import React from 'react';
import { Box } from '@mui/material';
import { LunchDining } from '@mui/icons-material';
import { AgeGroupEnum, FoodPreferenceEnum } from '@/types/api';
import BabyBottleIcon from '@/components/SharkIcon/BottleIcon';
import SharkIcon from '@/components/SharkIcon/SharkIcon';
import Vegan from '@/assets/Vegan.png';
import Vegetarian from '@/assets/Vegetarian.png';
import { useRecoilValue } from 'recoil';
import { guestSelector } from '@/store/family';

interface ActiveEatingIconProps {
  guestId: string;
  filterColorSecondary: string;
}

const ActiveEatingIcon: React.FC<ActiveEatingIconProps> = ({ guestId, filterColorSecondary }) => {
  const guest = useRecoilValue(guestSelector(guestId));
  
  if (guest.ageGroup === AgeGroupEnum.Baby) {
    return (
      <BabyBottleIcon
        sx={{
          filter: filterColorSecondary,
        }}
        width={32}
        height={32}
        mr={1}
      />
    );
  }
  
  switch (guest.preferences.foodPreference) {
    case FoodPreferenceEnum.Vegan:
      return (
        <Box
          sx={{
            filter: guest?.preferences?.foodPreference?.includes(FoodPreferenceEnum.Vegan) && guest?.preferences?.foodAllergies.includes('none')
              ? ''
              : filterColorSecondary
          }}
          component={'img'}
          src={`${Vegan}`}
          width={20}
          height={20}
          mr={1}
        />
      );
    case FoodPreferenceEnum.Vegetarian:
      return (
        <Box
          sx={{
            filter: guest?.preferences?.foodPreference?.includes(FoodPreferenceEnum.Vegetarian) && guest?.preferences?.foodAllergies.includes('none')
              ? ''
              : filterColorSecondary
          }}
          component={'img'}
          src={`${Vegetarian}`}
          width={20}
          height={20}
          mr={1}
        />
      );
    case FoodPreferenceEnum.Omnivore:
      return <LunchDining />;
    case FoodPreferenceEnum.Unknown:
    default:
      return <SharkIcon />;
  }
};

export default ActiveEatingIcon;