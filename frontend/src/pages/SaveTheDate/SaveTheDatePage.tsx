import Typography from '@mui/material/Typography';

import { useAuth0 } from '@auth0/auth0-react';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import { familyGuestsStates, useFamily } from '@/store/family';
import { useRecoilValue } from 'recoil';
import React, { useEffect } from 'react';
import { FullSizeCenteredFlexBox } from '@/components/styled';
import SaveTheDateStepper from '@/components/VerticalStepper/SaveTheDateStepper';
import ElPulpoExasperated from '@/assets/el_pulpo_exasperated.png';
import ElPulpoConfused from '@/assets/el_pulpo_confused.png';
import ElPulpoSad from '@/assets/el_pulpo_sadface.png';
import ElPulpo from '@/assets/el_pulpo_original.jpg';
import { StephsFavoriteFont } from '@/components/AttendanceButton/AttendanceButton';
import Button from '@mui/material/Button';

function SaveTheDatePage() {
  // const { matchingUsers, allLastNames, lastNames, nobodyComing } = useInvitation();
  const [family, familyActions] = useFamily();
  const { user: auth0User } = useAuth0();
  const saveTheDateGuestStates = useRecoilValue(familyGuestsStates);
  const { getFamilyUnitQuery } = familyActions;
  const [backgroundImage, setBackgroundImage] = React.useState(ElPulpo);

  useEffect(() => {
    if (auth0User && getFamilyUnitQuery.isPending) {
      familyActions.getFamily();
    }
  }, [auth0User, getFamilyUnitQuery.isPending, family]);

  if (!saveTheDateGuestStates && getFamilyUnitQuery.isPending) {
    return <FullSizeCenteredFlexBox>Loading...</FullSizeCenteredFlexBox>;
  }

  if (!saveTheDateGuestStates && getFamilyUnitQuery.isError) {
    setBackgroundImage(ElPulpoExasperated);
    return <FullSizeCenteredFlexBox sx={{
      // add hover effects
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'contain',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'bottom',
      zIndex: -1,
    }}>
      <Box display='flex' width='100%' flexWrap='wrap' justifyContent='center' mb={'50%'}
        onMouseOver={() => setBackgroundImage(ElPulpoSad)}
        onMouseOut={() => setBackgroundImage(ElPulpoExasperated)}
      >
        <Typography width='100%' textAlign='center'>There was an error loading your family</Typography>
        <Button id='RetryButton' fullWidth><StephsFavoriteFont>Ok, well try again I guess</StephsFavoriteFont></Button>
      </Box>
    </FullSizeCenteredFlexBox>;
  }

  if(!saveTheDateGuestStates && getFamilyUnitQuery.status === 'success') {
    return <FullSizeCenteredFlexBox><StephsFavoriteFont>Oh man, I dunno what went wrong.  My bad...</StephsFavoriteFont></FullSizeCenteredFlexBox>;
  }

  const queryParams = new URLSearchParams(window.location.search);
  const { callByLastNames, attendingLastNames, guests, nobodyComing } = saveTheDateGuestStates;

  return (
    <Box display="flex" flexDirection="column" justifyContent="" pb={10} positon={'relative'}
         border={'0px dashed yellow'} pt={2}>
      {(!guests || !guests.length) && <div onClick={() => familyActions.getFamily()}>No guests found</div>}
      <SaveTheDateStepper />
      <Box position="absolute" bottom={0} left={0} right={0} sx={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'top',
        height: 400,
        zIndex: -1,
      }}>
      </Box>
    </Box>
  );
}

export default SaveTheDatePage;

export const ButtonsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'space-between',
  gap: 16,
  justifyContent: 'space-between',
  width: '100%',
  mx: 'auto',
  [theme.breakpoints.up('sm')]: {
    marginLeft: 'auto',
    marginRight: 'auto',
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    alignSelf: 'center',
    flexGrow: 1,
    maxWidth: 800,
    mb: 4,
  },
}));