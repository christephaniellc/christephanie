import Meta from '@/components/Meta';
import Box from '@mui/material/Box';
import { useRecoilState, useRecoilValue } from 'recoil';
import { seriousFoodAllergies } from '@/components/Allergies';
import Button from '@mui/material/Button';
import { OverridableComponent } from '@mui/material/OverridableComponent';
import { createSvgIcon, Icon, SvgIcon, SvgIconTypeMap } from '@mui/material';
import { useEffect, useState } from 'react';
import { guestSelector, useFamily } from '@/store/family';
import { ImageButton } from '@/components/AgeSelector/AgeSelector';
import { userState } from '@/store/user';
import Shark from '@/assets/shark.svg';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { rgba } from 'polished';

function FoodAllergies({ guestId }: { guestId: string }) {
  const [allergies, setAllergies] = useState(seriousFoodAllergies);
  const [family, familyActions] = useFamily();
  const [newAllergies, setNewAllergies] = useState(['None']);
  const guest = useRecoilValue(guestSelector(guestId));
  const user = useRecoilValue(userState);

  const guestAllergies = guest?.preferences?.foodAllergies || [];

  const resetAllergies = () => {
    const allAllergiesSelectedFalse = seriousFoodAllergies.map(allergy => ({ ...allergy, selected: false }))
    setAllergies(allAllergiesSelectedFalse);
  }

  useEffect(() => {
    const activeAllergies = allergies.filter( allergy => allergy.selected);
    if (activeAllergies.length) {
      setNewAllergies(activeAllergies.map(allergy => allergy.allergyName));
    } else {
      setNewAllergies(["none"])
    }
  }, [allergies]);

  const guestName = guest?.auth0Id === user.auth0Id ? "You" : guest?.firstName

  return (
    <Box display='flex'>
      <Box>
        <ImageButton >
          {guestName}
        </ImageButton>
        <Button onClick={() => {}}>Save</Button>
      </Box>
      <Box border={'1px dashed yellow'} my={2}>
        <Meta title="Food Allergies" />
        <Box display="flex" flexWrap="wrap" height="100%" maxWidth={600}>
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
          <Button onClick={resetAllergies}>
            <IconButton mr={1} position="relative">
              <Box component={'img'} src={`${Shark}`} width={24} height={24} sx={{ filter: "brightness(0) saturate(100%) invert(9%) sepia(100%) saturate(7453%) hue-rotate(278deg) brightness(106%) contrast(114%);" }} />
            </IconButton>
            <Typography>None</Typography>
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default FoodAllergies;
