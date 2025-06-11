import React, { useEffect, useMemo, useState, useRef, useLayoutEffect } from 'react';
import { useUser } from '@/store/user';
import { useAuth0 } from '@auth0/auth0-react';
import { useFamily } from '@/store/family';
import { useAppLayout } from '@/context/Providers/AppState/useAppLayout';
import { useQueryParamInvitationCode } from '@/hooks/useQueryParamInvitationCode';
import WelcomeBg1 from '@/assets/WelcomePageBackground.jpg';
import WelcomeBg2 from '@/assets/WelcomeBg2.jpg';
import WelcomeBg3 from '@/assets/WelcomeBg3.jpg';
import WelcomeBg4 from '@/assets/WelcomeBg4.jpg';
import WelcomeBg5 from '@/assets/WelcomeBg5.jpg';
import { WelcomeContainer, BackgroundOverlay, ContentContainer } from './styled';
import BackgroundImage from './components/BackgroundImage';
import TitleSection from './components/TitleSection';
import WeddingInfoSection from './components/WeddingInfoSection';
import StepperSection from './components/StepperSection';
import { Box, Button, Container, Typography, Paper, Divider } from '@mui/material';
import { useRecoilValue } from 'recoil';
import { randomWeddingEuphemismState } from '@/store/welcome';
import HomePageSchedule from './components/HomePageSchedule';
import { alpha } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import { StephsActualFavoriteTypography } from '@/components/AttendanceButton/AttendanceButton';
import { EventNote, CardGiftcard } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Utility functions for random selections
const getRandomItem = (array: string[]) => 
  array[Math.floor(Math.random() * array.length)];

const Welcome: React.FC = () => {
  const { contentHeight } = useAppLayout();
  const [user, _] = useUser();
  const [family, familyActions] = useFamily();
  const { user: auth0User } = useAuth0();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentNeedsModal, setContentNeedsModal] = useState(false);
  const randomWeddingEuphemism = useRecoilValue(randomWeddingEuphemismState);
  const theme = useTheme();
  const navigate = useNavigate();
  
  // Random background image
  const randomBgImage = useMemo(() => {
    const bgImages = [WelcomeBg1, WelcomeBg2, WelcomeBg3, WelcomeBg4, WelcomeBg5];
    return bgImages[Math.floor(Math.random() * bgImages.length)];
  }, []);
  
  // Use the hook to check for invitation code in URL
  useQueryParamInvitationCode();

  // Fetch family data when user is authenticated
  useEffect(() => {
    if (auth0User && family === null) {
      familyActions.getFamily();
    }
  }, [user, family, familyActions, auth0User]);

  // Always allow scrolling rather than using modal
  useLayoutEffect(() => {
    // Force content to be scrollable by setting modal to false
    setContentNeedsModal(false);
    
    // No need for resize observer since we're always allowing scrolling
  }, []);
  
  // Handle scroll detection
  useEffect(() => {
    // If content fits, no need for scroll-up modal
    if (!contentNeedsModal) return;
    
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY > 0) {
        // Scrolling down - only show modal if content doesn't fit
        if (contentNeedsModal) {
          setIsModalVisible(true);
        }
      } else if (e.deltaY < 0 && isModalVisible) {
        // Scrolling up
        setIsModalVisible(false);
      }
    };
    
    // Handle touch events for mobile
    let startY = 0;
    const isTouching = false;
    
    const handleTouchStart = (e: TouchEvent) => {
      // Store initial touch position
      startY = e.touches[0].clientY;
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      
      const currentY = e.touches[0].clientY;
      const diff = startY - currentY;
          
      if (diff > 30) {
        // Scrolling down - only show modal if content doesn't fit
        if (contentNeedsModal) {
          setIsModalVisible(true);
        }
      } else if (diff < -30 && isModalVisible) {
        // Scrolling up
        setIsModalVisible(false);
      }
    };
        
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: true });
      container.addEventListener('touchstart', handleTouchStart, { passive: true });
      container.addEventListener('touchmove', handleTouchMove, { passive: true });
      
      return () => {
        container.removeEventListener('wheel', handleWheel);
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchmove', handleTouchMove);
      };
    }
  }, [isModalVisible, contentNeedsModal]);

  // Handler for tab link navigation
  const handleTabLink = (to: string) => {
    navigate(to);
  };
  
  return (
    <WelcomeContainer ref={containerRef} height={contentHeight}>
      <BackgroundImage backgroundImage={randomBgImage} />
      <BackgroundOverlay />
      
      <ContentContainer ref={contentRef}>
        <Box data-section="title">
          <TitleSection />
        </Box>

        <Box data-section="wedding-info">
          <WeddingInfoSection 
            randomGettingMarriedQuote={randomWeddingEuphemism}
            user={user}
          />
        </Box>

        {/* Schedule Section Title */}
        <Box 
          sx={{ 
            width: '100%', 
            display: 'flex', 
            justifyContent: 'center',
            mb: 2,
            mt: { xs: 1, sm: 2 },
            px: { xs: 1, sm: 2 }
          }}
        >
          <Paper
            sx={{
              backgroundColor: alpha(theme.palette.background.paper, 0.2),
              backdropFilter: 'blur(10px)',
              padding: theme.spacing(2),
              textAlign: 'center',
              borderRadius: theme.shape.borderRadius,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
              width: '100%',
              maxWidth: '800px',
            }}
          >
            <StephsActualFavoriteTypography 
              variant="h5" 
              sx={{ 
                textShadow: `0 0 10px ${theme.palette.primary.main}`,
              }}
            >
              WEDDING WEEKEND SCHEDULE
            </StephsActualFavoriteTypography>
          </Paper>
        </Box>

        {/* Wedding Schedule Section */}
        <Box 
          data-section="schedule" 
          sx={{ 
            width: '100%',
            mb: 4,
            px: { xs: 1, sm: 2 },
            maxWidth: '800px',
            mx: 'auto'
          }}
        >
          <HomePageSchedule handleTabLink={handleTabLink} />
        </Box>

        {/* Mobile Only: Links to Details and Registry */}
        <Box 
          data-section="links" 
          sx={{ 
            width: '100%', 
            px: 2, 
            mb: 4,
            display: { xs: 'flex', md: 'none' },
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <Box sx={{ 
            width: '100%',
            maxWidth: '600px',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'center',
            gap: 2
          }}>
            <Button 
              variant="contained" 
              color="secondary"
              size="large"
              startIcon={<EventNote />}
              onClick={() => handleTabLink('/details')}
              sx={{
                py: 1.5,
                borderRadius: '8px',
                fontWeight: 'bold',
                width: { xs: '100%', sm: 'auto' },
                boxShadow: `0 4px 8px ${alpha(theme.palette.secondary.main, 0.4)}`,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 6px 12px ${alpha(theme.palette.secondary.main, 0.5)}`,
                },
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
            >
              Wedding Details
            </Button>
            
            <Button 
              variant="contained" 
              color="secondary"
              size="large"
              startIcon={<CardGiftcard />}
              onClick={() => handleTabLink('/registry')}
              sx={{
                py: 1.5,
                borderRadius: '8px',
                fontWeight: 'bold',
                width: { xs: '100%', sm: 'auto' },
                boxShadow: `0 4px 8px ${alpha(theme.palette.secondary.main, 0.4)}`,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 6px 12px ${alpha(theme.palette.secondary.main, 0.5)}`,
                },
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
            >
              Registry
            </Button>
          </Box>
        </Box>

        {/* Always show stepper directly */}
        <Box data-section="stepper">
          <StepperSection auth0User={auth0User} />
        </Box>
      </ContentContainer>
    </WelcomeContainer>
  );
};

export default Welcome;
