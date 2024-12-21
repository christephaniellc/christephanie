import {
  Box, ButtonBase, IconButton,
  Typography,

} from '@mui/material';
import { useChristephanieTheme } from '../context/ThemeContext';
import ElPulpoHead from '../assets/el_pulpo_cabeza.jpg';
import ElPulpoWide from '../assets/el_pulpo_andy.jpg';
import { DaysUntil } from '../components/DaysUntil';
import React, { useMemo } from 'react';
import { RsvpCodeTextInput } from '../components/RsvpCodeTextInput';
import { useRsvpContext } from '../context/Rsvp/RsvpContext';
import WeddingAttendanceRadios from '../components/WeddingAttendanceRadios';
import AddressAutocomplete from '../components/AddressAutocomplete';
import { useAppStateContext } from '../context/AppStateContext';
import StickFigureIcon from '../components/StickFigureIcon';
import { styled } from '@mui/material/styles';
import { components } from '../types/api';
import { AttendanceButton } from '../components/AttendanceButton';

export const Home = () => {
  const { theme } = useChristephanieTheme();
  const { matchingUsers, matchingUsersQuery, familyInterested } = useRsvpContext();
  const { screenWidth } = useAppStateContext();
  useMemo(() => {
    if (matchingUsers) {
      return matchingUsers.length === 1 ? 'I' : 'We';
    }
    return undefined;
  }, [matchingUsers]);

  return (
    <Box display="flex" flexDirection="column" height="100%" justifyContent="space-between">
      <Box textAlign="center" border="0px solid green" flexGrow={2} display="flex" flexDirection="column">
        <Typography variant="h4" color="text.primary" gutterBottom my={4}>
          Steph & Topher
        </Typography>
        <DaysUntil event="Wedding" />
      </Box>
      {!matchingUsersQuery.data && <Box maxWidth={300} mx="auto" mb={2}>
        <RsvpCodeTextInput />
      </Box>}
      {matchingUsers && matchingUsers.length && (
          <ButtonsContainer>
            {matchingUsers.map((guest: components['schemas']['GuestDto']) => (
              <AttendanceButton guestId={guest.guestId!} />
            ))}
          </ButtonsContainer>
      )}
      <Box sx={{ width: '100%', alignItems: 'flex-end', display: 'flex' }}>
        <img src={screenWidth < theme.breakpoints.values.md && ElPulpoHead || ElPulpoWide} alt="El Pulpo"
             style={{ width: '100%', height: 'auto' }} />
      </Box>
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
    mx:'auto',
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    alignSelf: 'center',
    flexGrow: 1,
    maxWidth: 800,
    mb: 4
  },
}));
