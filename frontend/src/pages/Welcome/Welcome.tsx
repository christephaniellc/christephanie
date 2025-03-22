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
import { Box } from '@mui/material';
import { useRecoilValue } from 'recoil';
import { randomWeddingEuphemismState } from '@/store/welcome';

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

        {/* Always show stepper directly */}
        <Box data-section="stepper">
          <StepperSection auth0User={auth0User} />
        </Box>
      </ContentContainer>
    </WelcomeContainer>
  );
};

export default Welcome;
