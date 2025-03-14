import React from 'react';
import { Box, useTheme } from '@mui/material';
import WeddingRings from '@/assets/weddingrings3.svg';
import { useAppLayout } from '@/context/Providers/AppState/useAppLayout';

const RollingRingsAnimation: React.FC = () => {
  const theme = useTheme();
  const { screenWidth } = useAppLayout();
  
  // Responsive sizing for the rings animation
  const getRingSize = () => {
    if (screenWidth < theme.breakpoints.values.sm) return 20;
    if (screenWidth < theme.breakpoints.values.md) return 22;
    return 24;
  };
  
  const getAnimationWidth = () => {
    if (screenWidth < theme.breakpoints.values.sm) return 'calc(100% - 80px)';
    return 'calc(100% - 120px)';
  };
  
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
        '@keyframes rollLogo': {
          '0%, 10%': { left: 0, transform: 'rotate(0deg)' },
          '30%': { left: getAnimationWidth(), transform: 'rotate(360deg)' },
          '50%, 60%': { left: 0, transform: 'rotate(0deg)' },
          '80%': { left: getAnimationWidth(), transform: 'rotate(-360deg)' },
          '100%': { left: 0, transform: 'rotate(0deg)' }
        },
        '& img': {
          position: 'absolute',
          height: `${getRingSize() * 5}px`,
          width: `${getRingSize() * 5}px`,
          animation: 'rollLogo 8s infinite',
        }
      }}
    >               
      <Box
        component={'img'}
        src={`${WeddingRings}`}
        width={getRingSize()}
        height={getRingSize()}
      />
    </Box>
  );
};

export default RollingRingsAnimation;