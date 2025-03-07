import React from 'react';
import { Typography, Box } from '@mui/material';
import { SleepPreferenceEnum } from '@/types/api';
import { PreferenceDescriptionProps } from '../types';
import HotelList from './HotelList';

const PreferenceDescription: React.FC<PreferenceDescriptionProps> = ({
  campingValue,
  hotelOptions,
  expandedHotel,
  handleToggleHotelDetails,
  takingShuttle,
  setTakingShuttle,
}) => {
  if (campingValue === SleepPreferenceEnum.Camping) {
    return (
      <Box sx={{ p: 2, backgroundColor: 'rgba(0,0,0,.2)' }}>
        <Typography 
          variant="body1" 
          color="secondary" 
          fontWeight="medium"
          data-testid="camping-description"
        >
          Camp with us at the venue! We have a block of campsites reserved for you and your gear.
        </Typography>
      </Box>
    );
  }

  if (campingValue === SleepPreferenceEnum.Manor) {
    return (
      <Box sx={{ p: 2, backgroundColor: 'rgba(0,0,0,.2)' }}>
        <Typography 
          variant="body1" 
          color="primary" 
          fontWeight="medium"
          data-testid="manor-description"
        >
          Stay in our Manor House! As a Manor guest, you'll have access to a private room in the
          historic house.
        </Typography>
      </Box>
    );
  }

  if (campingValue === SleepPreferenceEnum.Hotel) {
    return (
      <HotelList
        hotelOptions={hotelOptions}
        expandedHotel={expandedHotel}
        handleToggleHotelDetails={handleToggleHotelDetails}
        takingShuttle={takingShuttle}
        setTakingShuttle={setTakingShuttle}
      />
    );
  }

  // Default empty return for Unknown state
  return null;
};

export default PreferenceDescription;