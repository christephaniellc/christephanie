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

function SaveTheDatePage() {
  // const { matchingUsers, allLastNames, lastNames, nobodyComing } = useInvitation();
  const [family, familyActions] = useFamily();
  const { user: auth0User } = useAuth0();
  const { callByLastNames, attendingLastNames, guests, nobodyComing } = useRecoilValue(familyGuestsStates);


  return (
    <Box display="flex" flexDirection="column" justifyContent="" pb={10}>
      <Box display="flex" flexDirection="column" width="100%" maxWidth={'600px'} mx="auto" textAlign="center">
        <Typography variant="h4" color="text.primary" gutterBottom mt={4} width="100%">
          Steph & Topher
        </Typography>
        <Box mx="auto">
          <EightBitWeddingLogo />
        </Box>
        <Typography variant="caption" color="text.secondary" mt={-4}>
          We're gettin' hitched{auth0User ? ' on' : '!'}
        </Typography>
        <Countdowns event={'Wedding'} interested={InvitationResponseEnum.Pending} />
      </Box>
      {(!guests || !guests.length) && <div onClick={() => familyActions.getFamily()}>No guests found</div>}
      {guests && !!guests.length && (
        <Box>
          {!nobodyComing && <Typography sx={{ mx: 'auto', textAlign: 'center', mb: 2 }}>
            {guests.length === 1 ? 'I' : 'We'} are excited to celebrate with you, {attendingLastNames}!
          </Typography>}
          {nobodyComing && <Typography sx={{ mx: 'auto', textAlign: 'center', mb: 2 }}>
            {guests.length === 1 ? 'I' : 'We'} hope you can make it, {callByLastNames}!
          </Typography>}
          <ButtonsContainer>
            {guests.map((guest: GuestDto) => (
              <AttendanceButton guestId={guest.guestId!} key={guest.guestId} />
            ))}
          </ButtonsContainer>
          {auth0User && !nobodyComing && <Box mt={15} display="flex" justifyContent="center"><AddressEnvelope /></Box>}
        </Box>
      )}
    </Box>
  );
}

export default SaveTheDatePage;

const ButtonsContainer = styled(Box)(({ theme }) => ({
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