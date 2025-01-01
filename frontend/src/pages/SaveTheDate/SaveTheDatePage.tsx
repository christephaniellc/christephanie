import Typography from '@mui/material/Typography';

import { useAuth0 } from '@auth0/auth0-react';
import { useMemo } from 'react';
import Box from '@mui/material/Box';
import { GuestDto } from '@/types/api';
import { useInvitation } from '@/context/Providers/AppState/Wedding/Rsvp/useInvitation';
import AttendanceButton from '@/components/AttendanceButton';
import { styled } from '@mui/material/styles';
import AddressEnvelope from '@/components/AddressEnvelope/AddressEnvelope';
import WhosSigningUp from '@/components/WhosSigningUp/WhosSigningUp';

function SaveTheDatePage() {
  const { matchingUsers, allLastNames, lastNames, nobodyComing } = useInvitation();
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