import React, { useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import { useRecoilValue } from 'recoil';
import { FoodAllergyIconProps, seriousFoodAllergies } from '@/components/Allergies';
import Button from '@mui/material/Button';
import { ButtonGroup, Chip, InputAdornment, TextField, useTheme } from '@mui/material';
import { guestSelector, useFamily } from '@/store/family';
import { userState } from '@/store/user';
import Vegetarian from '@/assets/Vegetariant.png';
import Vegan from '@/assets/Vegan.png';
import Omnivore from '@/assets/Omnivore.png';
import Typography from '@mui/material/Typography';
import { Stack } from '@mui/system';
import { FoodPreferenceEnum } from '@/types/api';
import { Inbox, LunchDining, SvgIconComponent, WarningAmber } from '@mui/icons-material';
import AddAllergyButton from '@/components/AddAllergyButton/AddAllergyButton';
import SharkIcon from '@/components/SharkIcon/SharkIcon';

function FoodAllergies({ guestId }: { guestId: string }) {
  const theme = useTheme();
  const [allergyIconProps, setAllergyIconProps] = useState<FoodAllergyIconProps[]>(seriousFoodAllergies);
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
      const updatedAllergies = allergyIconProps.map(allergy => ({
        ...allergy,
        selected: guestAllergies.includes(allergy.allergyName),
      }));
      setAllergyIconProps(updatedAllergies);
    }
  }, [guest]);

  const chosenAllergies = useMemo(() => {
    const maybeAllergies = allergyIconProps.filter(allergy => allergy.selected).map(allergy => allergy.allergyName);
    return maybeAllergies.length ? maybeAllergies : ['none'];
  }, [allergyIconProps]);

  const activeEatingIcon = useMemo(() => {
    switch (guest.preferences.foodPreference) {
      case FoodPreferenceEnum.Vegan:
        return Vegan;
      case FoodPreferenceEnum.Vegetarian:
        return Vegetarian;
      case FoodPreferenceEnum.Omnivore:
        return LunchDining;
      case FoodPreferenceEnum.Unknown:
        return SharkIcon;
      default:
        return SharkIcon;
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
    const activeAllergies = allergyIconProps.filter(allergy => allergy.selected);
    if (activeAllergies.length) {
      setNewAllergies(activeAllergies.map(allergy => allergy.allergyName));
    }
    setPageAllergies();
  }, [allergyIconProps]);

  const guestName = guest?.auth0Id === loggedInUser.auth0Id ? 'You' : guest?.firstName;

  const handleGuestFoodAllergy = (allergyName: string) => {
    const updatedAllergies = allergyIconProps.map(allergy => {
      if (allergy.allergyName === allergyName) {
        return { ...allergy, selected: !allergy.selected };
      }
      return allergy;
    });
    const maybeAllergies = updatedAllergies.filter(allergy => allergy.selected).map(allergy => allergy.allergyName);
    familyActions.updateFamilyGuestFoodAllergies(guestId, maybeAllergies.length ? maybeAllergies : ['none']);
    setAllergyIconProps(updatedAllergies);
  };
  const resetAllergies = () => {
    const allAllergiesSelectedFalse = seriousFoodAllergies.map(allergy => ({ ...allergy, selected: false }));
    familyActions.updateFamilyGuestFoodAllergies(guestId, ['none']);
    setAllergyIconProps(allAllergiesSelectedFalse);
  };

  return (
    <Box border={`1px dashed ${theme.palette.secondary.main}`} p={2} overflow={'auto'} maxHeight="100%">
      <Chip
        icon={<>{activeEatingIcon}</>}
        label={'test'}
        disabled={familyActions.patchFamilyMutation.status === 'pending' || familyActions.getFamilyUnitQuery.isFetching}
        color={(chosenAllergies.join('') === 'none' ? 'secondary' : 'primary') as 'primary' | 'secondary'}
        variant={(chosenAllergies.join('') === 'none' ? 'outlined' : 'filled') as 'outlined' | 'filled'}
        onClick={() => resetAllergies()}
      />

      {/*{allergyIconProps.map((allergy) => {*/}
      {/*  const matchingAllergy = allergyIconProps.find((a) => a === allergy);*/}
      {/*  if (!matchingAllergy) return;*/}

      {/*  const newAllergies = allergyIconProps.filter((a) => a !== allergy);*/}
      {/*  if (!newAllergies) return;*/}

      {/*  return <Chip*/}
      {/*    variant="outlined"*/}
      {/*    icon={<allergy.icon />}*/}
      {/*    disabled={familyActions.patchFamilyMutation.status === 'pending' || familyActions.getFamilyUnitQuery.isFetching}*/}
      {/*    key={allergy.allergyName}*/}
      {/*    label={'test'}*/}
      {/*    // color={allergy.selected ? 'primary' : 'secondary' as 'primary' | 'secondary'}*/}
      {/*    // onClick={() => handleGuestFoodAllergy(allergy.allergyName)}*/}
      {/*  />;*/}
      {/*})}*/}
    </Box>
  );
}

export default FoodAllergies;
