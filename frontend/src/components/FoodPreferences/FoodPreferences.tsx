import React, { useRef, useState } from 'react';
import { guestSelector, useFamily } from '@/store/family';
import { useRecoilValue } from 'recoil';
import { AgeGroupEnum, FoodPreferenceEnum } from '@/types/api';
import { ButtonGroup, darken, Typography, useTheme } from '@mui/material';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Shark from '@/assets/shark.svg';
import Omnivore from '@/assets/Omnivore.png';
import Vegetarian from '@/assets/Vegetarian.png';
import Vegan from '@/assets/Vegan.png';
import { alpha, Stack } from '@mui/system';
import { useAppLayout } from '@/context/Providers/AppState/useAppLayout';
import Paper from '@mui/material/Paper';
import BabyBottleIcon from '@/components/SharkIcon/BottleIcon';

const FoodPreferences = ({ guestId }: { guestId: string }) => {
  const { screenWidth } = useAppLayout();
  const [clientButtonValue, setClientButtonValue] = React.useState<FoodPreferenceEnum | null>(null);
  const guest = useRecoilValue(guestSelector(guestId));
  const [_, familyActions] = useFamily();
  const mousePosition = useRef({ x: 0, y: 0 });
  const theme = useTheme();

  const handleSetFoodPreference = (foodPreference: FoodPreferenceEnum) => {
    setClientButtonValue(foodPreference);
    familyActions.updateFamilyGuestFoodPreferences(guestId, foodPreference);
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    mousePosition.current = { x: event.clientX, y: event.clientY };
  };

  const calculateShadow = () => {
    const { x, y } = mousePosition.current;
    const shadowX = (x / window.innerWidth) * 15 + 5;
    const shadowY = (y / window.innerHeight) * 15 + 5;
    return `${shadowX}px ${shadowY}px 0px ${darken(theme.palette.primary.main, 0.85)}`;
  };

  React.useEffect(() => {
    setClientButtonValue(guest?.preferences?.foodPreference);
  }, [guest]);

  // Get aria-label for selection status
  const getButtonAriaLabel = (preference: FoodPreferenceEnum) => {
    const isSelected = clientButtonValue === preference;
    const buttonLabels = {
      [FoodPreferenceEnum.Unknown]: "Only animals (meat-based diet)",
      [FoodPreferenceEnum.Omnivore]: "All Life (eats both plants and animals)",
      [FoodPreferenceEnum.Vegetarian]: "Mostly Plants (vegetarian diet)",
      [FoodPreferenceEnum.Vegan]: "Vegan (plant-based diet only)",
      [FoodPreferenceEnum.BYOB]: "Bring your own baby food/formula"
    };
    
    return `${buttonLabels[preference]}${isSelected ? ' (selected)' : ''}`;
  };

  return (
    <Stack
      display="flex"
      width="100%"
      height="100%"
      my="auto"
      justifyContent="center"
      alignItems="center"
      px={2}
      onMouseMove={handleMouseMove}
      role="region"
      aria-label={`Food preferences for ${guest.firstName || 'guest'}`}
    >
      <Paper
        elevation={5}
        sx={{
          backdropFilter: 'blur(20px)',
          backgroundColor: 'rgba(0,0,0,.1)',
          filter: `drop-shadow(${calculateShadow()})`,
        }}
      >
        <Box sx={{ p: 2, pb: 1, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
          <Typography 
            variant="subtitle1" 
            fontWeight="500" 
            color="primary"
            id="food-preferences-heading"
          >
            These are delicious to me:
          </Typography>
        </Box>
        {guest.ageGroup !== AgeGroupEnum.Baby && (
          <ButtonGroup
            fullWidth
            orientation={screenWidth > 800 ? 'horizontal' : 'vertical'}
            sx={{
              backgroundColor: 'rgba(0,0,0,.8)',
            }}
            role="radiogroup"
            aria-label="Food preference options"
          >
            <Button
              sx={{
                width: '100%',
                lineHeight: 1.2,
                justifyContent: 'flex-start',
                paddingY: 1.5,
              }}
              color="secondary"
              disabled={
                familyActions.patchFamilyMutation.status === 'pending' ||
                familyActions.getFamilyUnitQuery.isFetching
              }
              variant={
                (clientButtonValue?.includes(FoodPreferenceEnum.Unknown)
                  ? 'contained'
                  : 'outlined') as 'contained' | 'outlined'
              }
              onClick={() => handleSetFoodPreference(FoodPreferenceEnum.Unknown)}
              value={FoodPreferenceEnum.Unknown}
              aria-pressed={clientButtonValue === FoodPreferenceEnum.Unknown}
              aria-label={getButtonAriaLabel(FoodPreferenceEnum.Unknown)}
              role="radio"
              endIcon={
                <Box
                  component={'img'}
                  src={`${Shark}`}
                  width={24}
                  height={24}
                  alt="Shark icon representing meat-based diet"
                  sx={{
                    filter: !clientButtonValue?.includes(FoodPreferenceEnum.Unknown)
                      ? 'brightness(0) saturate(100%) invert(75%) sepia(57%) saturate(5816%) hue-rotate(9deg) brightness(106%) contrast(91%)'
                      : '',
                  }}
                />
              }
            >
              Only animals
            </Button>
            <Button
              sx={{
                width: '100%',
                lineHeight: 1.2,
                justifyContent: 'flex-start',
                paddingY: 1.5,
              }}
              color="secondary"
              variant={
                (clientButtonValue?.includes(FoodPreferenceEnum.Omnivore)
                  ? 'contained'
                  : 'outlined') as 'contained' | 'outlined'
              }
              disabled={
                familyActions.patchFamilyMutation.status === 'pending' ||
                familyActions.getFamilyUnitQuery.isFetching
              }
              value={FoodPreferenceEnum.Omnivore}
              aria-pressed={clientButtonValue === FoodPreferenceEnum.Omnivore}
              aria-label={getButtonAriaLabel(FoodPreferenceEnum.Omnivore)}
              role="radio"
              onClick={() => handleSetFoodPreference(FoodPreferenceEnum.Omnivore)}
              endIcon={
                <Box
                  component={'img'}
                  src={`${Omnivore}`}
                  width={24}
                  height={24}
                  alt="Omnivore icon representing mixed diet"
                  sx={{
                    filter: !clientButtonValue?.includes(FoodPreferenceEnum.Omnivore)
                      ? 'brightness(0) saturate(100%) invert(75%) sepia(57%) saturate(5816%) hue-rotate(9deg) brightness(106%) contrast(91%)'
                      : '',
                  }}
                />
              }
            >
              All Life
            </Button>
            <Button
              sx={{
                width: '100%',
                lineHeight: 1.2,
                justifyContent: 'flex-start',
                paddingY: 1.5,
              }}
              color="secondary"
              disabled={
                familyActions.patchFamilyMutation.status === 'pending' ||
                familyActions.getFamilyUnitQuery.isFetching
              }
              variant={
                (clientButtonValue?.includes(FoodPreferenceEnum.Vegetarian)
                  ? 'contained'
                  : 'outlined') as 'contained' | 'outlined'
              }
              value={FoodPreferenceEnum.Vegetarian}
              aria-pressed={clientButtonValue === FoodPreferenceEnum.Vegetarian}
              aria-label={getButtonAriaLabel(FoodPreferenceEnum.Vegetarian)}
              role="radio"
              endIcon={
                <Box
                  sx={{
                    filter: !clientButtonValue?.includes(FoodPreferenceEnum.Vegetarian)
                      ? 'brightness(0) saturate(100%) invert(75%) sepia(57%) saturate(5816%) hue-rotate(9deg) brightness(106%) contrast(91%)'
                      : '',
                  }}
                  component={'img'}
                  src={`${Vegetarian}`}
                  width={20}
                  height={20}
                  alt="Vegetarian icon"
                  mr={1}
                />
              }
              onClick={() => handleSetFoodPreference(FoodPreferenceEnum.Vegetarian)}
            >
              Mostly Plants
            </Button>
            <Button
              sx={{
                width: '100%',
                lineHeight: 1.2,
                justifyContent: 'flex-start',
                paddingY: 1.5,
              }}
              color="secondary"
              endIcon={
                <Box
                  sx={{
                    filter: !clientButtonValue?.includes(FoodPreferenceEnum.Vegan)
                      ? 'brightness(0) saturate(100%) invert(75%) sepia(57%) saturate(5816%) hue-rotate(9deg) brightness(106%) contrast(91%)'
                      : '',
                  }}
                  component={'img'}
                  src={`${Vegan}`}
                  width={20}
                  height={20}
                  alt="Vegan icon"
                  mr={1}
                />
              }
              disabled={
                familyActions.patchFamilyMutation.status === 'pending' ||
                familyActions.getFamilyUnitQuery.isFetching
              }
              value={FoodPreferenceEnum.Vegan}
              aria-pressed={clientButtonValue === FoodPreferenceEnum.Vegan}
              aria-label={getButtonAriaLabel(FoodPreferenceEnum.Vegan)}
              role="radio"
              variant={
                (clientButtonValue?.includes(FoodPreferenceEnum.Vegan)
                  ? 'contained'
                  : 'outlined') as 'contained' | 'outlined'
              }
              onClick={() => handleSetFoodPreference(FoodPreferenceEnum.Vegan)}
            >
              Vegan
            </Button>
          </ButtonGroup>
        )}
        {guest.ageGroup === AgeGroupEnum.Baby && (
          <ButtonGroup
            fullWidth
            sx={{
              backgroundColor: 'rgba(0,0,0,.8)',
            }}
            role="radiogroup"
            aria-label="Baby food preference"
          >
            <Button
              sx={{
                width: '100%',
                lineHeight: 1.2,
                justifyContent: 'flex-start',
                paddingY: 1.5,
              }}
              color="secondary"
              endIcon={
                <BabyBottleIcon
                  sx={{
                    filter: !clientButtonValue?.includes(FoodPreferenceEnum.BYOB)
                      ? 'brightness(0) saturate(100%) invert(75%) sepia(57%) saturate(5816%) hue-rotate(9deg) brightness(106%) contrast(91%)'
                      : '',
                  }}
                  width={32}
                  height={32}
                  mr={1}
                  aria-hidden="true"
                />
              }
              disabled={
                familyActions.patchFamilyMutation.status === 'pending' ||
                familyActions.getFamilyUnitQuery.isFetching
              }
              variant={
                (guest.ageGroup === AgeGroupEnum.Baby ? 'contained' : 'outlined') as
                  | 'contained'
                  | 'outlined'
              }
              aria-pressed={true}
              aria-label="Bring your own baby food - automatically selected for babies"
              role="radio"
              onClick={() => handleSetFoodPreference(FoodPreferenceEnum.BYOB)}
            >
              BYOB
            </Button>
          </ButtonGroup>
        )}
      </Paper>
    </Stack>
  );
};

export default FoodPreferences;
