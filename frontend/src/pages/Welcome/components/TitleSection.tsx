import React from 'react';
import { useTheme, Box } from '@mui/material';
import NeonTitle from '@/components/NeonTitle';
import { TitleContainer } from '../styled';
import { useAppLayout } from '@/context/Providers/AppState/useAppLayout';

interface TitleSectionProps {}

const TitleSection: React.FC<TitleSectionProps> = () => {
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
      {/* Title Section - Centered */}
      <Box sx={{ textAlign: 'center' }}>
        <NeonTitle 
          text="Steph & Topher" 
          fontSize={getFontSize()}
          pulsate={true}
          flicker={false}
        />
      </Box>
    </TitleContainer>
  );
};

export default TitleSection;