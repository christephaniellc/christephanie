import Meta from '@/components/Meta';
import Box from '@mui/material/Box';
import { useRecoilState, useRecoilValue } from 'recoil';
import { seriousFoodAllergies } from '@/components/Allergies';
import Button from '@mui/material/Button';
import { OverridableComponent } from '@mui/material/OverridableComponent';
import { createSvgIcon, Icon, SvgIcon, SvgIconTypeMap, useTheme } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { guestSelector, useFamily } from '@/store/family';
import { ImageButton } from '@/components/AgeSelector/AgeSelector';
import { userState } from '@/store/user';
import Shark from '@/assets/shark.svg';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { rgba } from 'polished';

function FoodAllergies({ guestId }: { guestId: string }) {
  const theme = useTheme();
  const [allergies, setAllergies] = useState(seriousFoodAllergies);
  const [family, familyActions] = useFamily();
  const [newAllergies, setNewAllergies] = useState(['None']);
  const guest = useRecoilValue(guestSelector(guestId));
  const user = useRecoilValue(userState);

  const chosenAllergies = useMemo(() => {
    const maybeAllergies = allergies.filter(allergy => allergy.selected).map(allergy => allergy.allergyName);
    return maybeAllergies.length ? maybeAllergies : ['none'];
  }, [allergies]);

  const guestAllergies = useMemo(() => {
    return guest?.preferences?.foodAllergies;
  }, [guest]);

  const showSaveButton = useMemo(() => chosenAllergies.join(',') === guestAllergies?.join(',') ? 'none' : 'block', [chosenAllergies, guestAllergies]);

  const resetAllergies = () => {
    const allAllergiesSelectedFalse = seriousFoodAllergies.map(allergy => ({ ...allergy, selected: false }));
    setAllergies(allAllergiesSelectedFalse);
  };

  useEffect(() => {
    if (showSaveButton && guestAllergies) {
      const updatedAllergies = allergies.map(allergy => ({
        ...allergy,
        selected: guestAllergies.includes(allergy.allergyName),
      }));
      setAllergies(updatedAllergies);
    }
  }, [guest]);

  useEffect(() => {
    const activeAllergies = allergies.filter(allergy => allergy.selected);
    if (activeAllergies.length) {
      setNewAllergies(activeAllergies.map(allergy => allergy.allergyName));
    } else {
      setNewAllergies(['none']);
    }
  }, [allergies]);

  const guestName = guest?.auth0Id === user.auth0Id ? 'You' : guest?.firstName;
  const filterColorPrimary = 'brightness(0) saturate(100%) invert(9%) sepia(100%) saturate(7453%) hue-rotate(278deg) brightness(106%) contrast(114%);';
  const filterColorSecondary = 'brightness(0) saturate(100%) invert(75%) sepia(57%) saturate(5816%) hue-rotate(9deg) brightness(106%) contrast(91%);';

  const saveAllergiesState = useMemo(() => {
    return familyActions.updateFamilyMutation.status;
  }, [familyActions.updateFamilyMutation]);

  return (
    <Box display="flex" my={2} border={'1px dotted green'} sx={{ backdropFilter: 'blur(16px)', backgroundColor: 'rgba(0,0,0,.8)' }}>
      <Box border={'1px solid blue'} display="flex" width={300} p={2} minHeight="100%" flexWrap="wrap">
        <Box width={'100%'} flexWrap="wrap" alignContent="flex-start" display="flex">
          <Typography sx={{ width: '100%' }}>
            {guestName}
          </Typography>
          <Typography sx={{ width: '100%' }} variant="caption">
            Food Allergies:
          </Typography>
          <Typography sx={{ width: '100%' }} color="secondary"
                      variant="body 2">{newAllergies?.join(', ')}</Typography>
        </Box>
        <Button
          variant="outlined"
          color="secondary"
          fullWidth
          disabled={familyActions.updateFamilyMutation.status === 'pending'}
          sx={{ display: showSaveButton, mt: 'auto', mx: 'auto', alignSelf: 'flex-end' }}
          onClick={() => familyActions.updateFamilyGuestFoodAllergies(guestId, chosenAllergies)}>
          {saveAllergiesState === 'idle' && 'Save'}
          {saveAllergiesState === 'pending' && 'Saving...'}
          {saveAllergiesState === 'success' && 'Saved'}
          {saveAllergiesState === 'error' && familyActions.updateFamilyMutation.error?.error}
        </Button>
      </Box>
      <Box border={`1px dashed ${theme.palette.secondary.main}`} p={2}>
        <Meta title="Food Allergies" />
        <Box display="flex" flexWrap="wrap" height="100%" maxWidth={600}>
          <Button fullWidth
                  color={(chosenAllergies.join('') === 'none' ? 'secondary' : 'primary') as 'primary' | 'secondary'}
                  variant={(chosenAllergies.join('') === 'none' ? 'outlined' : 'text') as 'contained' | 'text'}
                  onClick={resetAllergies}>
            <IconButton mr={1} position="relative">
              <Box component={'img'} src={`${Shark}`} width={24} height={24}
                   sx={{ filter: chosenAllergies.join('') === 'none' ? filterColorSecondary : filterColorPrimary }} />
            </IconButton>
            <Typography>None</Typography>
          </Button>
          {allergies.map((allergy) => {
            const matchingAllergy = allergies.find((a) => a === allergy);
            if (!matchingAllergy) return;
            const newAllergies = allergies.filter((a) => a !== allergy);
            if (!newAllergies) return;
            return <Button key={allergy.allergyName} onClick={() => setAllergies([...newAllergies, {
              ...matchingAllergy,
              selected: !matchingAllergy?.selected,
            }].sort(
              (a, b) => a.allergyName.localeCompare(b.allergyName),
            ) as {
              icon: OverridableComponent<SvgIconTypeMap> & { muiName: string },
              allergyName: string,
              selected: boolean
            }[])}>
              <Box mr={1} width={'33%'} position="relative">
                <allergy.icon />
                <Box position="absolute" top={0} bottom={0} left={0} right={0}
                     sx={{
                       '&::before': {
                         content: '""',
                         position: 'absolute',
                         top: 0,
                         left: 0,
                         width: '100%',
                         height: '4px',
                         backgroundColor: 'red',
                         transform: 'rotate(45deg)',
                         transformOrigin: 'bottom left',
                         display: matchingAllergy.selected ? 'block' : 'none',
                       },
                     }}
                />
              </Box>{allergy.allergyName}
            </Button>;
          })}
        </Box>
      </Box>
    </Box>
  );
}

export default FoodAllergies;
