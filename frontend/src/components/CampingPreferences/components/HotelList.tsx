import React from 'react';
import { Stack, Paper } from '@mui/material';
import { HotelListProps } from '../types';
import HotelOption from './HotelOption';

const HotelList: React.FC<HotelListProps> = ({
  hotelOptions,
  expandedHotel,
  handleToggleHotelDetails,
  takingShuttle,
  setTakingShuttle,
}) => {
  return (
    <Stack
      spacing={1}
      sx={{
        p: 1,
        width: '100%',
      }}
      data-testid="hotel-options-container"
    >
      {hotelOptions.map((hotel, index) => (
        <Paper
          key={index}
          elevation={1}
          sx={{
            overflow: 'hidden',
            backgroundColor: 'rgba(0,0,0,.4)',
            width: '100%',
          }}
        >
          <HotelOption
            hotel={hotel}
            index={index}
            isExpanded={expandedHotel === index}
            onToggle={() => handleToggleHotelDetails(index)}
          />
        </Paper>
      ))}
    </Stack>
  );
};

export default HotelList;