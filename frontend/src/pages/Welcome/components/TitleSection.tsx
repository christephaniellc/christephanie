import React from 'react';
import { useTheme } from '@mui/material';
import NeonTitle from '@/components/NeonTitle';
import { TitleContainer, QuoteText } from '../styled';
import { useAppLayout } from '@/context/Providers/AppState/useAppLayout';

interface TitleSectionProps {
  randomQuote: string;
}

const TitleSection: React.FC<TitleSectionProps> = ({ randomQuote }) => {
  const theme = useTheme();
  const { screenWidth } = useAppLayout();
  
  // Responsive font size calculation
  const getFontSize = () => {
    if (screenWidth < theme.breakpoints.values.sm) return '1.8rem';
    if (screenWidth < theme.breakpoints.values.md) return '2.2rem';
    return '2.8rem';
  };
  
  return (
    <TitleContainer>
      <NeonTitle 
        text="Steph & Topher" 
        fontSize={getFontSize()}
        pulsate={true}
        flicker={false}
      />
      
      <QuoteText variant="caption">
        {randomQuote}
      </QuoteText>
    </TitleContainer>
  );
};

export default TitleSection;