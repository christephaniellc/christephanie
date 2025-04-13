import React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import ElPulpo from '@/assets/el_pulpo_cabeza.jpg';
import { NavigationButtons } from './NavigationButtons';

interface RSVPBackgroundProps {
  tabIndex: number;
}

export const RSVPBackground: React.FC<RSVPBackgroundProps> = ({ tabIndex }) => {
  return (
    <Box
      position="absolute"
      component={Container}
      bottom={0}
      left={0}
      right={0}
      sx={{
        backgroundImage: `url(${ElPulpo})`,
        backgroundSize: 'cover',
        backgroundPosition: 'top',
        height: 500, // Increased height for better mobile appearance
        zIndex: 49,
      }}
    >
      {tabIndex < 10 && <NavigationButtons tabIndex={tabIndex} />}
    </Box>
  );
};

export default RSVPBackground;