import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { HotelOptionProps } from '../../types';
import HotelDetail from '../../components/HotelDetail';

const HotelOption: React.FC<HotelOptionProps> = ({ hotel, index, isExpanded, onToggle }) => {
  return (
    <>
      <Button
        fullWidth
        variant="text"
        color="secondary"
        onClick={onToggle}
        data-testid={`hotel-button-${index}`}
      >
        <Box>
          <Typography>{hotel.name}</Typography>
          {hotel.googleRating > 0 && (
            <Typography>{hotel.googleRating}</Typography>
          )}
          {hotel.onShuttleRoute && (
            <Typography>Shuttle</Typography>
          )}
        </Box>
      </Button>
      
      {isExpanded && (
        <HotelDetail 
          hotel={hotel}
        />
      )}
    </>
  );
};

export default HotelOption;