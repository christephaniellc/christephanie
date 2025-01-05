import Typography from '@mui/material/Typography';

import { useAuth0 } from '@auth0/auth0-react';
import Box from '@mui/material/Box';
import { GuestDto } from '@/types/api';
import AttendanceButton from '@/components/AttendanceButton';
import { styled } from '@mui/material/styles';
import AddressEnvelope from '@/components/AddressEnvelope/AddressEnvelope';
import {familyGuestsStates} from "@/store/family";
import {useRecoilValue} from "recoil";

function SaveTheDatePage() {
  // const { matchingUsers, allLastNames, lastNames, nobodyComing } = useInvitation();
  const { user: auth0User} = useAuth0();
  const { callByLastNames, attendingLastNames, guests, nobodyComing} = useRecoilValue(familyGuestsStates);

  if (!guests || !guests.length) return <>No guests found</>

  return (
    <Box display="flex" flexDirection="column" height="100%" justifyContent="space-between">
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
          {auth0User && !nobodyComing && <Box mt={15} display='flex' justifyContent='center'><AddressEnvelope /></Box>}
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