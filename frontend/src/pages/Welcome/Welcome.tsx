import React, { useEffect, useMemo } from 'react';
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

// Data arrays for random quotes and phrases
const LOVEY_QUOTES = [
  'Sittin in a tree',
  'would love your attendance and full attention, for a few days, max.',
  'love each other like Kanye loves Kanye.',
];

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
  'putting rings on it'
];

// Utility functions for random selections
const getRandomItem = (array: string[]) => 
  array[Math.floor(Math.random() * array.length)];

const Welcome = () => {
  const { contentHeight } = useAppLayout();
  const [user, _] = useUser();
  const [family, familyActions] = useFamily();
  const { user: auth0User } = useAuth0();
  
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
  
  return (
    <WelcomeContainer height={contentHeight}>
      <BackgroundImage backgroundImage={randomBgImage} />
      <BackgroundOverlay />
      
      <ContentContainer>
        <TitleSection randomQuote={getRandomItem(LOVEY_QUOTES)} />
          
        <WeddingInfoSection 
          randomGettingMarriedQuote={getRandomItem(GETTING_MARRIED_EUPHEMISMS)}
          user={user}
        />

        <StepperSection auth0User={auth0User} />
      </ContentContainer>
    </WelcomeContainer>
  );
};

export default Welcome;
