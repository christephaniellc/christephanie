import { Box, Divider, Typography, useTheme } from '@mui/material';
import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import InvitationCodeInputs from '@/components/InvitationCodeInputs';
import { useUser } from '@/store/user';
import { useAuth0 } from '@auth0/auth0-react';
import Countdowns from '@/components/Countdowns';
import { InvitationResponseEnum } from '@/types/api';
import { useRecoilValue } from 'recoil';
import { useFamily } from '@/store/family';
import WelcomeStepper from '@/components/WelcomeStepper';
import { useAppLayout } from '@/context/Providers/AppState/useAppLayout';
import { useQueryParamInvitationCode } from '@/hooks/useQueryParamInvitationCode';
import Container from '@mui/material/Container';
import WelcomeBg1 from '@/assets/WelcomePageBackground.jpg';
import WelcomeBg2 from '@/assets/WelcomeBg2.jpg';
import WelcomeBg3 from '@/assets/WelcomeBg3.jpg';
import WelcomeBg4 from '@/assets/WelcomeBg4.jpg';
import WelcomeBg5 from '@/assets/WelcomeBg5.jpg';
import NeonTitle from '@/components/NeonTitle';
import { 
  WelcomeContainer, 
  BackgroundOverlay, 
  ContentContainer, 
  WeddingInfoContainer, 
  LocationText,
  StepperContainer 
} from './styled';
import { alpha } from '@mui/material/styles';
import { CalendarMonth, LocationOn } from '@mui/icons-material';
import WeddingRings from '@/assets/weddingrings3.svg';

const Welcome = () => {
  const { contentHeight } = useAppLayout();
  const theme = useTheme();
  const [user, _] = useUser();
  const [family, familyActions] = useFamily();
  const [stepperHeight, setStepperHeight] = React.useState(0);
  const { user: auth0User } = useAuth0();

  // Use the hook to check for invitation code in URL
  useQueryParamInvitationCode();

  const welcomeBannerRef = useRef<null | HTMLElement>(null);

  useLayoutEffect(() => {
    if (!welcomeBannerRef.current) return;
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

  const randomGettingMarriedEuphemisms = [
    'getting married',
    'gettin\' hitched',
    'tying the knot',
    'signing a legal document to proclaim togetherness',
    'joining the matrimony circus',
    'jumping on the marriage bus',
    'merging our hearts, bodies, and crippling debts',
    'jumping into the love lagoon',
    'making it legal',
    'teaming up for some marriage stuff',
    'tossing our hat into the marriage ring',
    'marrying and stuff',
    'linking up legally',
    'signing on for the whole matrimony thing',
    'putting rings on it'
  ];

  const randomBgImage = useMemo(() => {
    const bgImages = () => [WelcomeBg1, WelcomeBg2, WelcomeBg3, WelcomeBg4, WelcomeBg5];
    return bgImages()[Math.floor(Math.random() * bgImages().length)];
  }, []);

  const randomQuote = () =>
    randomLoveyQuotesWithFunnyTwists[
      Math.floor(Math.random() * randomLoveyQuotesWithFunnyTwists.length)
    ];

  const randomGettingMarriedQuotes = () =>
    randomGettingMarriedEuphemisms[
      Math.floor(Math.random() * randomGettingMarriedEuphemisms.length)
    ];
  
  const shortScreen = contentHeight < 800;
  
  return (
    <WelcomeContainer height={contentHeight}>
      {/* Background Image */}
      <Box
        position="absolute"
        component={Container}
        top={0}
        bottom={0}
        left={0}
        right={0}
        sx={{
          backgroundImage: `url(${randomBgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: '100%',
          width: '100%',
          zIndex: 0,
        }}
      />
      
      {/* Dark overlay for better text readability */}
      <BackgroundOverlay />
      
      {/* Main content container */}
      <ContentContainer>
        {/* Wedding info section */}
        <Box 
          display="flex" 
          flexDirection="column" 
          width="100%" 
          ref={welcomeBannerRef}
          sx={{ 
            pt: shortScreen ? 2 : 4,
            pb: 2
          }}
        >
          {/* Neon title for the couple's names */}
          <NeonTitle 
            text="Steph & Topher" 
            fontSize={shortScreen ? '2rem' : '2.8rem'}
            pulsate={true}
            flicker={false}
          />
          
          {/* Fun quote below the title */}
          <Typography
            variant="caption"
            color="common.white"
            sx={{
              opacity: 0.9,
              fontSize: '0.9rem',
              fontStyle: 'italic',
              mb: 2,
              mt: -1,
              display: 'block',
              textAlign: 'center'
            }}
          >
            {randomQuote()}
          </Typography>
          
          {/* Wedding info container with date and location */}
        <WeddingInfoContainer>
          <Box display="flex">
            {/* Left container that spans all boxes */}
            <Box
              sx={{
                width: 200, // restricts the box to 200px
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start', // align content at the top of the box
                alignItems: 'center', // center items horizontally
                mr: 2,
                px: 2,
                py: 1,
                backgroundColor: alpha(theme.palette.background.paper, 0.1),
                borderRadius: theme.shape.borderRadius,
                textAlign: 'center', // center the text within the box
                whiteSpace: 'normal', // allows text to wrap onto multiple lines
                wordWrap: 'break-word',
              }}
            >
              <Typography variant="h6" color="common.white">
              Are {randomGettingMarriedQuotes()}!
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  overflow: 'hidden',
                  position: 'relative',
                  '@keyframes rollLogo': {
                    '0%, 10%': { left: 0, transform: 'rotate(0deg)' },
                    '30%': { left: 'calc(100% - 120px)', transform: 'rotate(360deg)' },
                    '50%, 60%': { left: 0, transform: 'rotate(0deg)' },
                    '80%': { left: 'calc(100% - 120px)', transform: 'rotate(-360deg)' },
                    '100%': { left: 0, transform: 'rotate(0deg)' }
                  },
                  '& img': {
                    position: 'absolute',
                    height: '120px',
                    width: '120px',
                    animation: 'rollLogo 8s infinite',
                  }
                }}
              >               
                <Box
                  component={'img'}
                  src={`${WeddingRings}`}
                  width={24}
                  height={24}
                  // sx={{
                  //   filter: 'brightness(0) saturate(100%) invert(75%) sepia(57%) saturate(5816%) hue-rotate(9deg) brightness(106%) contrast(91%)'
                  // }}
                />
              </Box>
              </Typography>
            </Box>

            {/* Right container with the three vertically stacked boxes */}
            <Box>
              {/* Date Section */}
              <Box 
                display="flex" 
                alignItems="center" 
                sx={{ 
                  mb: 1,
                  px: 2,
                  py: 1,
                  // backgroundColor: alpha(theme.palette.background.paper, 0.2),
                  borderRadius: theme.shape.borderRadius,
                  // backdropFilter: 'blur(8px)'
                }}
              >
                <CalendarMonth 
                  sx={{ 
                    mr: 1,
                    color: theme.palette.secondary.main
                  }} 
                />
                <Typography
                  variant="h6"
                  color="common.white"
                  fontWeight="medium"
                  fontSize={shortScreen ? '1.2rem' : '1.5rem'}
                >
                  July 5, 2025
                </Typography>
              </Box>
              
              {/* Location Section */}
              <Box 
                display="flex" 
                alignItems="center"
                sx={{ 
                  px: 2,
                  py: 1,
                  backgroundColor: alpha(theme.palette.background.paper, 0.2),
                  borderRadius: theme.shape.borderRadius,
                  backdropFilter: 'blur(8px)'  
                }}
              >
                <LocationOn 
                  sx={{ 
                    mr: 1,
                    color: theme.palette.secondary.main
                  }} 
                />
                <LocationText>
                  Lovettsville, VA
                </LocationText>
              </Box>
              
              {/* Countdown Section */}
              <Box mt={2} width="100%">
                <Countdowns
                  event="Wedding"
                  interested={user.rsvp?.invitationResponse || InvitationResponseEnum.Pending}
                />
              </Box>
            </Box>
          </Box>
        </WeddingInfoContainer>

        {/* Stepper section (invitation code inputs or welcome page stepper) */}
        {stepperHeight === 0 ? (
          <Box sx={{ textAlign: 'center', p: 2 }}>
            <Typography color="common.white">Loading...</Typography>
          </Box>
        ) : (
          <StepperContainer
            height={`calc(${stepperHeight}px - 32px)`}
          >
            {(!auth0User && <InvitationCodeInputs />) || <WelcomeStepper />}
          </StepperContainer>
        )}
        </Box>
      </ContentContainer>
    </WelcomeContainer>
  );
};

export default Welcome;
