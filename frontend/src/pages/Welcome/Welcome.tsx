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
import { WelcomeContainer, BackgroundOverlay, ContentContainer, StepperModal } from './styled';
import BackgroundImage from './components/BackgroundImage';
import TitleSection from './components/TitleSection';
import WeddingInfoSection from './components/WeddingInfoSection';
import StepperSection from './components/StepperSection';
import { IconButton, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
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

  // Check if content needs the modal (only if it doesn't fit in the viewport)
  useLayoutEffect(() => {
    const checkContentFit = () => {
      if (contentRef.current && containerRef.current) {
        // Calculate the total height of all content
        const titleSection = contentRef.current.querySelector('[data-section="title"]');
        const weddingInfoSection = contentRef.current.querySelector('[data-section="wedding-info"]');
        const stepperSection = contentRef.current.querySelector('[data-section="stepper"]');
        
        let totalContentHeight = 0;
        if (titleSection) totalContentHeight += titleSection.getBoundingClientRect().height;
        if (weddingInfoSection) totalContentHeight += weddingInfoSection.getBoundingClientRect().height;
        if (stepperSection) totalContentHeight += stepperSection.getBoundingClientRect().height;
        
        // Add some margin between sections
        totalContentHeight += 40; // Approximate margins between sections
        
        // Compare with available container height
        const containerHeight = containerRef.current.getBoundingClientRect().height;
        
        // Set state based on whether content fits
        setContentNeedsModal(totalContentHeight > containerHeight);
      }
    };
    
    // Check on mount and when auth0User changes (which might change content)
    checkContentFit();
    
    // Also add a resize observer to check when window size changes
    const resizeObserver = new ResizeObserver(checkContentFit);
    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }
    
    return () => {
      resizeObserver.disconnect();
    };
  }, [auth0User, contentHeight]);
  
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
    let isTouching = false;
    
    const handleTouchStart = (e: TouchEvent) => {
      // Store initial touch position
      startY = e.touches[0].clientY;
      isTouching = true;
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (!isTouching) return;
      
      const currentY = e.touches[0].clientY;
      const diff = startY - currentY;
      
      // Only process vertical scrolling, not small finger movements
      if (Math.abs(diff) < 10) return;
      
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
    
    const handleTouchEnd = () => {
      // Reset touch state when touch ends
      isTouching = false;
    };
    
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: true });
      container.addEventListener('touchstart', handleTouchStart, { passive: true });
      container.addEventListener('touchmove', handleTouchMove, { passive: true });
      container.addEventListener('touchend', handleTouchEnd, { passive: true });
      container.addEventListener('touchcancel', handleTouchEnd, { passive: true });
      
      return () => {
        container.removeEventListener('wheel', handleWheel);
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchmove', handleTouchMove);
        container.removeEventListener('touchend', handleTouchEnd);
        container.removeEventListener('touchcancel', handleTouchEnd);
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

        {/* Only show stepper directly if it fits or modal is not visible */}
        {(!contentNeedsModal || !isModalVisible) && (
          <Box data-section="stepper">
            <StepperSection auth0User={auth0User} />
          </Box>
        )}
      </ContentContainer>
      
      {/* Stepper section in modal - only when content doesn't fit */}
      {contentNeedsModal && (
        <StepperModal className={isModalVisible ? 'visible' : ''}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
            <IconButton 
              onClick={() => setIsModalVisible(false)}
              size="small"
              aria-label="close"
              sx={{ color: 'text.secondary' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          <StepperSection auth0User={auth0User} />
        </StepperModal>
      )}
    </WelcomeContainer>
  );
};

export default Welcome;
