import {
  Box, Typography,
} from '@mui/material';
import { useChristephanieTheme } from '../context/Providers/AppState/ThemeContext';
import React, { useMemo } from 'react';
import { useRsvpContext } from '../context/Providers/AppState/Wedding/Rsvp/RsvpContext';
import { useAppStateContext } from '../context/Providers/AppState/AppStateContext';
import { styled } from '@mui/material/styles';
import { AttendanceButton } from '../components/AttendanceButton';
import AddressEnvelope from '../components/AddressEnvelope';
import { useAuth0 } from '@auth0/auth0-react';
import WhosSigningUp from '../components/WhosSigningUp';
import { GuestDto } from '../types/types';

export const Invitation = () => {
  const { theme } = useChristephanieTheme();
  const { matchingUsers, getFamilyQuery, allLastNames, hasAddress, lastNames, nobodyComing } = useRsvpContext();
  const { appLayout } = useAppStateContext();
  const { screenWidth } = appLayout;
  const { user} = useAuth0();
  useMemo(() => {
    if (matchingUsers) {
      return matchingUsers.length === 1 ? 'I' : 'We';
    }
    return undefined;
  }, [matchingUsers]);


  return (
    <Box display="flex" flexDirection="column" height="100%" justifyContent="space-between">
      {matchingUsers && !!matchingUsers.length && (
        <Box>
          {!nobodyComing && <Typography sx={{ mx: 'auto', textAlign: 'center', mb: 2 }}>
            {matchingUsers.length === 1 ? 'I' : 'We'} are excited to celebrate with you, {lastNames}!
          </Typography>}
          {nobodyComing && <Typography sx={{ mx: 'auto', textAlign: 'center', mb: 2 }}>
            {matchingUsers.length === 1 ? 'I' : 'We'} hope you can make it, {allLastNames}!
          </Typography>}
          <ButtonsContainer>
            {matchingUsers.map((guest: GuestDto) => (
              <AttendanceButton guestId={guest.guestId!} key={guest.guestId} />
            ))}
          </ButtonsContainer>
          {user && !nobodyComing && <Box mt={15} display='flex' justifyContent='center'><AddressEnvelope /></Box>}
          {!user && !nobodyComing && <Box mt={15} display={'flex'} justifyContent={'center'}><WhosSigningUp /></Box>}
        </Box>
      )}
    </Box>
  );
};

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
