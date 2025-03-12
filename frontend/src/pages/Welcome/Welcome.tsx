import React, { useEffect, useMemo, useState, useRef } from 'react';
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

const GETTING_MARRIED_EUPHEMISMS = [
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
  'putting rings on it',
  'Sittin in a tree',
  'would love your attendance and full attention, for a few days, max.',
  'love each other like Kanye loves Kanye.',
];

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
  
  // Handle scroll detection
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY > 0) {
        // Scrolling down
        setIsModalVisible(true);
      } else if (e.deltaY < 0 && isModalVisible) {
        // Scrolling up
        setIsModalVisible(false);
      }
    };
    
    // Handle touch events for mobile
    let startY = 0;
    
    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      const currentY = e.touches[0].clientY;
      const diff = startY - currentY;
      
      if (diff > 30) {
        // Scrolling down
        setIsModalVisible(true);
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
  }, [isModalVisible]);
  
  return (
    <WelcomeContainer ref={containerRef} height={contentHeight}>
      <BackgroundImage backgroundImage={randomBgImage} />
      <BackgroundOverlay />
      
      <ContentContainer>
        <TitleSection />

        <WeddingInfoSection 
          randomGettingMarriedQuote={getRandomItem(GETTING_MARRIED_EUPHEMISMS)}
          user={user}
        />

        {/* Only show in main content if modal is not visible */}
        {!isModalVisible && <StepperSection auth0User={auth0User} />}
      </ContentContainer>
      
      {/* Stepper section in modal */}
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
    </WelcomeContainer>
  );
};

export default Welcome;
