import React, { useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import { useRecoilValue } from 'recoil';
import { FoodAllergyIconProps, seriousFoodAllergies } from '@/components/Allergies';
import Button from '@mui/material/Button';
import { ButtonGroup, Chip, InputAdornment, TextField, useTheme } from '@mui/material';
import { guestSelector, useFamily } from '@/store/family';
import { userState } from '@/store/user';
import Vegetarian from '@/assets/Vegetarian.png';
import Vegan from '@/assets/Vegan.png';
import Omnivore from '@/assets/Omnivore.png';
import Typography from '@mui/material/Typography';
import { Stack } from '@mui/system';
import { FoodPreferenceEnum } from '@/types/api';
import { Inbox, LunchDining, SvgIconComponent, WarningAmber } from '@mui/icons-material';
import AddAllergyButton from '@/components/AddAllergyButton/AddAllergyButton';
import SharkIcon from '@/components/SharkIcon/SharkIcon';
import ListItem from '@mui/material/ListItem';

function FoodAllergies({ guestId }: { guestId: string }) {
  const filterColorPrimary =
    'brightness(0) saturate(100%) invert(9%) sepia(100%) saturate(7453%) hue-rotate(278deg) brightness(106%) contrast(114%);';
  const filterColorSecondary =
    'brightness(0) saturate(100%) invert(75%) sepia(57%) saturate(5816%) hue-rotate(9deg) brightness(106%) contrast(91%);';

  const theme = useTheme();
  const [allergyIconProps, setAllergyIconProps] =
    useState<FoodAllergyIconProps[]>(seriousFoodAllergies);
  const [_, familyActions] = useFamily();
  const [newAllergies, setNewAllergies] = useState(['None']);
  const guest = useRecoilValue(guestSelector(guestId));
  const loggedInUser = useRecoilValue(userState);

  useEffect(() => {
    console.log('guestAllergies', guestAllergies);
    setPageAllergies();
  }, []);

  useEffect(() => {
    if (guestAllergies && guest !== null) {
      const updatedAllergies = allergyIconProps.map((allergy) => ({
        ...allergy,
        selected: guestAllergies.includes(allergy.allergyName),
      }));
      setAllergyIconProps(updatedAllergies);
    }
  }, [guest]);

  const chosenAllergies = useMemo(() => {
    const maybeAllergies = allergyIconProps
      .filter((allergy) => allergy.selected)
      .map((allergy) => allergy.allergyName);
    return maybeAllergies.length ? maybeAllergies : ['none'];
  }, [allergyIconProps]);

  const activeEatingIcon = useMemo(() => {
    switch (guest.preferences.foodPreference) {
      case FoodPreferenceEnum.Vegan:
        return (
          <Box
            sx={{
              filter: guest?.preferences?.foodPreference?.includes(FoodPreferenceEnum.Vegan)
                ? filterColorSecondary
                : '',
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
              filter: guest?.preferences?.foodPreference?.includes(FoodPreferenceEnum.Vegetarian)
                ? filterColorSecondary
                : '',
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
  }, [guest, chosenAllergies]);

  const [addingAllergy, setAddingAllergy] = useState<boolean>(false);

  const guestAllergies = useMemo(() => {
    return guest?.preferences?.foodAllergies;
  }, [guest]);

  // const showSaveButton = useMemo(() => chosenAllergies.join(',') === guestAllergies?.join(',') ? 'none' : 'block', [chosenAllergies, guestAllergies]);

  const setPageAllergies = () => {
    if (guest?.preferences?.foodAllergies.length) {
      setNewAllergies(guest?.preferences?.foodAllergies);
    } else {
      setNewAllergies(['none']);
    }
  };

  useEffect(() => {
    const activeAllergies = allergyIconProps.filter((allergy) => allergy.selected);
    if (activeAllergies.length) {
      setNewAllergies(activeAllergies.map((allergy) => allergy.allergyName));
    }
    setPageAllergies();
  }, [allergyIconProps]);

  const guestName = guest?.auth0Id === loggedInUser.auth0Id ? 'You' : guest?.firstName;

  const handleGuestFoodAllergy = (allergyName: string) => {
    const updatedAllergies = allergyIconProps.map((allergy) => {
      if (allergy.allergyName === allergyName) {
        return { ...allergy, selected: !allergy.selected };
      }
      return allergy;
    });
    const maybeAllergies = updatedAllergies
      .filter((allergy) => allergy.selected)
      .map((allergy) => allergy.allergyName);
    familyActions.updateFamilyGuestFoodAllergies(
      guestId,
      maybeAllergies.length ? maybeAllergies : ['none'],
    );
    setAllergyIconProps(updatedAllergies);
  };
  const resetAllergies = () => {
    const allAllergiesSelectedFalse = seriousFoodAllergies.map((allergy) => ({
      ...allergy,
      selected: false,
    }));
    familyActions.updateFamilyGuestFoodAllergies(guestId, ['none']);
    setAllergyIconProps(allAllergiesSelectedFalse);
  };

  return (
    <Box
      sx={{
        maxHeight: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        p: 1,
        m: 0,
        flexWrap: 'wrap',
        border: `1px dashed ${theme.palette.secondary.main}`,
        // overflow: 'hidden',
      }}
    >
      <Chip
        sx={{
          backdropFilter: 'blur(20px)',
          backgroundColor: 'rgba(0,0,0,.6)',
          my: 1,
          width: '100%',
        }}
        icon={<>{activeEatingIcon}</>}
        label={'Nope'}
        disabled={
          familyActions.patchFamilyMutation.status === 'pending' ||
          familyActions.getFamilyUnitQuery.isFetching
        }
        color={
          (chosenAllergies.join('') === 'none' ? 'secondary' : 'primary') as 'primary' | 'secondary'
        }
        variant={
          (chosenAllergies.join('') === 'none' ? 'outlined' : 'filled') as 'outlined' | 'filled'
        }
        onClick={() => resetAllergies()}
      />
      <Box
        height={110}
        mb={2}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          gap: 1,
          flexWrap: 'wrap',
          overflow: 'auto',
        }}
      >
        {allergyIconProps.map((allergy) => {
          const matchingAllergy = allergyIconProps.find((a) => a === allergy);
          if (!matchingAllergy) return;

          const newAllergies = allergyIconProps.filter((a) => a !== allergy);
          if (!newAllergies) return;

          return (
            <Chip
              sx={{
                backdropFilter: 'blur(20px)',
                backgroundColor: 'rgba(0,0,0,.6)',
                // my: 0.5,
                cursor: 'pointer',
                color: guest.preferences.foodAllergies.includes(allergy.allergyName) ? theme.palette.warning.main : theme.palette.success.light,
              }}
              variant={
                guest.preferences.foodAllergies.includes(allergy.allergyName)
                  ? 'outlined'
                  : ('filled' as 'outlined' | 'filled')
              }
              color={
                guest.preferences.foodAllergies.includes(allergy.allergyName)
                  ? 'error'
                  : ('success' as 'primary' | 'error' | 'success' | 'secondary')
              }
              icon={<allergy.icon />}
              disabled={
                familyActions.patchFamilyMutation.status === 'pending' ||
                familyActions.getFamilyUnitQuery.isFetching
              }
              label={allergy.allergyName}
              onClick={() => handleGuestFoodAllergy(allergy.allergyName)}
            />
          );
        })}
      </Box>
    </Box>
  );
}

export default FoodAllergies;
