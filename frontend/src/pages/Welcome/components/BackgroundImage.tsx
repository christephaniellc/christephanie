import React from 'react';
import { Box } from '@mui/material';

interface BackgroundImageProps {
  backgroundImage: string;
}

const BackgroundImage: React.FC<BackgroundImageProps> = ({ backgroundImage }) => {
  return (
    <Box
      position="absolute"
      top={0}
      bottom={0}
      left={0}
      right={0}
      sx={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '100%',
        width: '100%',
        zIndex: 0,
      }}
    />
  );
};

export default BackgroundImage;