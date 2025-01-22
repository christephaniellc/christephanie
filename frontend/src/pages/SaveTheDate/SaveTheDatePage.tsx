import Typography from '@mui/material/Typography';

import { useAuth0 } from '@auth0/auth0-react';
import Box from '@mui/material/Box';
import { GuestDto, InvitationResponseEnum } from '@/types/api';
import AttendanceButton from '@/components/AttendanceButton';
import { styled } from '@mui/material/styles';
import AddressEnvelope from '@/components/AddressEnvelope/AddressEnvelope';
import { familyGuestsStates, useFamily } from '@/store/family';
import { useRecoilValue } from 'recoil';
import EightBitWeddingLogo from '@/components/EightBitWeddingLogo';
import React from 'react';
import Countdowns from '@/components/Countdowns';
import ElPulpo from '@/assets/el_pulpo_cabeza.jpg';
import { FullSizeCenteredFlexBox } from '@/components/styled';
import SaveTheDateStepper from '@/components/VerticalStepper/SaveTheDateStepper';

function SaveTheDatePage() {
  // const { matchingUsers, allLastNames, lastNames, nobodyComing } = useInvitation();
  const [family, familyActions] = useFamily();
  const { user: auth0User } = useAuth0();
  const saveTheDateGuestStates = useRecoilValue(familyGuestsStates);

  if (!saveTheDateGuestStates) {
    familyActions.getFamily();
    return <FullSizeCenteredFlexBox>Loading...</FullSizeCenteredFlexBox>
  }
  const queryParams = new URLSearchParams(window.location.search);
  const { callByLastNames, attendingLastNames, guests, nobodyComing } = saveTheDateGuestStates;


  return (
    <Box display="flex" flexDirection="column" justifyContent="" pb={10} positon={'relative'} pt={2}>
      {(!guests || !guests.length) && <div onClick={() => familyActions.getFamily()}>No guests found</div>}
      <SaveTheDateStepper />
      <Box position='absolute' bottom={0} left={0} right={0} sx={{
        backgroundImage: `url(${ElPulpo})`,
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
  flexDirection: 'column',
  alignItems: 'center',
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