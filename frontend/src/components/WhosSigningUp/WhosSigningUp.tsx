import { Box, Button, Typography } from '@mui/material';
import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useInvitation } from '@/context/Providers/AppState/Wedding/Rsvp/useInvitation';
import { useAppStateContext } from '@/context/Providers/AppState/AppStateContext';

const WhosSigningUp = () => {
  const { matchingUsers, firstName } = useInvitation();
  const { loginWithRedirect } = useAuth0();
  const { setNavValue } = useAppStateContext();

  return (
    <Box px={18}>
      <Typography gutterBottom variant="h5">We&#39;d like to send you an invitation.</Typography>
      <Typography gutterBottom variant="h6">Please create an account so we can securely save your address</Typography>
      <Box display="flex" justifyContent="space-between" pt={4}>
        {matchingUsers?.some((user) => user.rsvp?.invitationResponse === 'Interested') &&
          <><Button variant="contained" color="primary" onClick={() => loginWithRedirect()}>
            Sign up as {firstName}
          </Button>
            <Button variant="outlined" onClick={() => setNavValue('/logout')}>I&#39;m not {firstName}</Button>
          </>
        }
      </Box>
    </Box>
  );
};

export default WhosSigningUp;