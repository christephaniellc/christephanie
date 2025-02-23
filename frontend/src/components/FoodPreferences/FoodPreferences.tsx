import { guestSelector, useFamily } from '@/store/family';
import { useRecoilValue } from 'recoil';
import { FoodPreferenceEnum } from '@/types/api';
import { ButtonGroup } from '@mui/material';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Shark from '@/assets/shark.svg';
import Omnivore from '@/assets/Omnivore.png';
import Vegetarian from '@/assets/Vegetarian.png';
import Vegan from '@/assets/Vegan.png';
import { Stack } from '@mui/system';
import React from 'react';

const FoodPreferences = ({ guestId }: { guestId: string }) => {
  const guest = useRecoilValue(guestSelector(guestId));
  const [_, familyActions] = useFamily();
  const handleSetFoodPreference = (foodPreference: FoodPreferenceEnum) => {
    familyActions.patchFamilyGuestMutation.mutate({ updatedGuest: { guestId, foodPreference } });
  };

  const filterColorPrimary = 'brightness(0) saturate(100%) invert(9%) sepia(100%) saturate(7453%) hue-rotate(278deg) brightness(106%) contrast(114%);';
  const filterColorSecondary = 'brightness(0) saturate(100%) invert(75%) sepia(57%) saturate(5816%) hue-rotate(9deg) brightness(106%) contrast(91%);';


  return (
    <Stack display="flex" width="100%" height="100%">
      <ButtonGroup fullWidth orientation='vertical' sx={{ backdropFilter: 'blur(20px)', backgroundColor: 'rgba(0,0,0,.6)' }}>
        <Button
          color="secondary"
          disabled={familyActions.patchFamilyMutation.status === 'pending' || familyActions.getFamilyUnitQuery.isFetching}
          variant={(guest?.preferences?.foodPreference?.includes(FoodPreferenceEnum.Unknown) ? 'contained' : 'outlined') as 'contained' | 'outlined'}
          onClick={() => familyActions.updateFamilyGuestFoodPreferences(guestId, FoodPreferenceEnum.Unknown)}
          value={FoodPreferenceEnum.Unknown}
          endIcon={<Box component={'img'} src={`${Shark}`} width={24} height={24}
                        sx={{ filter: !guest?.preferences?.foodPreference?.includes(FoodPreferenceEnum.Unknown) ? filterColorSecondary : '' }} />}>
          Carnivore
        </Button>
        <Button
          color="secondary"
          variant={(guest?.preferences?.foodPreference?.includes(FoodPreferenceEnum.Omnivore) ? 'contained' : 'outlined') as 'contained' | 'outlined'}
          // key={value}
          disabled={familyActions.patchFamilyMutation.status === 'pending' || familyActions.getFamilyUnitQuery.isFetching}
          value={FoodPreferenceEnum.Omnivore}
          onClick={() => familyActions.updateFamilyGuestFoodPreferences(guestId, FoodPreferenceEnum.Omnivore)}
          endIcon={<Box component={'img'} src={`${Omnivore}`} width={24} height={24}
                        sx={{ filter: !guest?.preferences?.foodPreference?.includes(FoodPreferenceEnum.Omnivore) ? filterColorSecondary : '' }} />}>
          Omnivore</Button>
        <Button
          color="secondary"
          disabled={familyActions.patchFamilyMutation.status === 'pending' || familyActions.getFamilyUnitQuery.isFetching}
          variant={(guest?.preferences?.foodPreference?.includes(FoodPreferenceEnum.Vegetarian) ? 'contained' : 'outlined') as 'contained' | 'outlined'}
          value={FoodPreferenceEnum.Vegetarian}
          endIcon={<Box
            sx={{ filter: !guest?.preferences?.foodPreference?.includes(FoodPreferenceEnum.Vegetarian) ? filterColorSecondary : '' }}
            component={'img'} src={`${Vegetarian}`} width={20}
            height={20} mr={1} />}
          onClick={() => familyActions.updateFamilyGuestFoodPreferences(guestId, FoodPreferenceEnum.Vegetarian)}
        >Vegetarian</Button>
        <Button
          color="secondary"
          endIcon={<Box
            sx={{ filter: !guest?.preferences?.foodPreference?.includes(FoodPreferenceEnum.Vegan) ? filterColorSecondary : '' }}
            component={'img'} src={`${Vegan}`} width={20}
            height={20} mr={1} />}
          disabled={familyActions.patchFamilyMutation.status === 'pending' || familyActions.getFamilyUnitQuery.isFetching}
          value={FoodPreferenceEnum.Vegan}
          variant={(guest?.preferences?.foodPreference?.includes(FoodPreferenceEnum.Vegan) ? 'contained' : 'outlined') as 'contained' | 'outlined'}
          onClick={() => familyActions.updateFamilyGuestFoodPreferences(guestId, FoodPreferenceEnum.Vegan)}>Vegan</Button>
      </ButtonGroup>
    </Stack>
  );
};

export default FoodPreferences;