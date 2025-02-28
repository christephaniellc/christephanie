import { Box, Typography } from '@mui/material';
import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { styled } from '@mui/material/styles';
import InvitationCodeInputs from '@/components/InvitationCodeInputs';
import EightBitWeddingLogo from '@/components/EightBitWeddingLogo';
import { useUser } from '@/store/user';
import { useAuth0 } from '@auth0/auth0-react';
import Countdowns from '@/components/Countdowns';
import { InvitationResponseEnum } from '@/types/api';
import { useRecoilValue } from 'recoil';
import { useFamily } from '@/store/family';
import WelcomePageStepper from '@/components/Steppers/WelcomePageStepper';
import { useAppLayout } from '@/context/Providers/AppState/useAppLayout';


const Welcome = () => {
  const { contentHeight } = useAppLayout();
  const [user, _] = useUser();
  const [family, familyActions] = useFamily();
  const [stepperHeight, setStepperHeight] = React.useState(0);
  const { user: auth0User } = useAuth0();

  const welcomeBannerRef = useRef<null | HTMLElement>(null);

  useLayoutEffect(() => {
    if (!welcomeBannerRef.current) return;
    console.log('contentHeight', contentHeight);
    console.log('welcomeBannerRef', welcomeBannerRef.current!.clientHeight);
    const welcomeBannerHeight = welcomeBannerRef.current!.clientHeight;
    setStepperHeight(contentHeight - welcomeBannerHeight);
  }, [welcomeBannerRef, contentHeight]);

  useEffect(() => {
    if (auth0User && family === null) {
      familyActions.getFamily();
    }
  }, [user, family, familyActions]);

  const randomLoveyQuotesWithFunnyTwists = [
    'Sittin in a tree',
    'would love your attendance and full attention, for a few days, max.',
    'love each other like Kanye loves Kanye.',
  ];

  const randomQuote = () => randomLoveyQuotesWithFunnyTwists[Math.floor(Math.random() * randomLoveyQuotesWithFunnyTwists.length)];
  const shortScreen = contentHeight < 800;

  return (
    <Box display="flex" height="100%" justifyContent="center" alignContent="flex-start" textAlign="center"
         flexWrap="wrap" id={'welcome-page'} position="relative">
      <Box position="absolute" top={0} left={0} bottom={0} right={0} zIndex={-1}>
        {/*<ForestBackground figureCount={200} />*/}
      </Box>

      <Box display="flex" flexDirection="column" width="100%" ref={welcomeBannerRef}>
        <Typography variant="h4" color="text.primary" gutterBottom mt={shortScreen ? 2 : 4} width="100%"
                    textAlign="center">
          Steph & Topher
        </Typography>
        <Box mx="auto">
          <EightBitWeddingLogo />
        </Box>
        <Typography variant="caption" color="text.secondary" mb={shortScreen ? 1 : 4} mt={shortScreen ? -4 : 0}
                    maxWidth={200} mx="auto" textAlign="justify" height={40}>
          ({randomQuote()})
        </Typography>
        <Countdowns event={'Wedding'}
                    interested={user.rsvp?.invitationResponse || InvitationResponseEnum.Pending} />
      </Box>

      {stepperHeight === 0 ? 'Loading' : <Box maxWidth={600} mx="auto" mb={2} overflow="auto">
        {!auth0User && <InvitationCodeInputs /> || (
          <WelcomePageStepper />
        )}
      </Box>}
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