import { Box, Typography } from '@mui/material';
import React, { useEffect } from 'react';
import { styled } from '@mui/material/styles';
import InvitationCodeInputs from '@/components/InvitationCodeInputs';
import EightBitWeddingLogo from '@/components/EightBitWeddingLogo';
import { useUser } from '@/store/user';
import { Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import Countdowns from '@/components/Countdowns';
import { InvitationResponseEnum } from '@/types/api';
import Button from '@mui/material/Button';
import { ArrowRightAlt } from '@mui/icons-material';
import routes from '@/routes';
import { Pages } from '@/routes/types';
import { unstable_useLazyRef } from '@mui/utils';
import { useRecoilValue } from 'recoil';
import { familyGuestsStates, useFamily } from '@/store/family';
import WelcomePageStepper from '@/components/VerticalStepper/WelcomePageStepper';


const Welcome = () => {
  const [user, _] = useUser();
  const familyStates = useRecoilValue(familyGuestsStates);
  const [family, familyActions] = useFamily();
  const { user: auth0User } = useAuth0();

  useEffect(() => {
    if (user.auth0Id && family === null) {
      familyActions.getFamily();
    }
  }, [user, family, familyActions]);
  return (
    <Box display="flex" height="100%" justifyContent="center" alignContent="flex-start" textAlign="center"
         flexWrap="wrap">
      <Box display="flex" flexDirection="column" width="100%">
        <Typography variant="h4" color="text.primary" gutterBottom mt={4} width="100%" textAlign="center">
          Steph & Topher
        </Typography>
        <Box mx="auto">
          <EightBitWeddingLogo />
        </Box>
        <Typography variant="caption" color="text.secondary" mt={-4}>
          We're gettin' hitched{auth0User ? ' on' : '!'}
        </Typography>
      </Box>
      <Box maxWidth={600} mx="auto" mb={2}>
        {!auth0User && <InvitationCodeInputs /> || (
          <>
            <Countdowns event={'Wedding'}
                        interested={user.rsvp?.invitationResponse || InvitationResponseEnum.Pending} />
            <WelcomePageStepper />
          </>
        )}
      </Box>
    </Box>
  );
};

styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  mx: 'auto',
  [theme.breakpoints.up('sm')]: {
    mx: 'auto',
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    alignSelf: 'center',
    flexGrow: 1,
    maxWidth: 800,
    mb: 4,
  },
}));

export default Welcome;