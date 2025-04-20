import React, { useState } from 'react';
import { Typography, Box, Button } from '@mui/material';
import { SleepPreferenceEnum } from '@/types/api';
import { PreferenceDescriptionProps } from '../types';
import HotelDialog from './HotelDialog';
import { HotelOutlined, OpenInNew } from '@mui/icons-material';

const PreferenceDescription: React.FC<PreferenceDescriptionProps> = ({
  campingValue,
  hotelOptions,
  expandedHotel,
  handleToggleHotelDetails,
  takingShuttle,
  setTakingShuttle,
}) => {
  const [isHotelDialogOpen, setIsHotelDialogOpen] = useState(false);

  const handleOpenHotelDialog = () => {
    setIsHotelDialogOpen(true);
  };

  const handleCloseHotelDialog = () => {
    setIsHotelDialogOpen(false);
  };

  if (campingValue === SleepPreferenceEnum.Camping) {
    return (
      <Box sx={{ 
        p: 2, 
        backgroundColor: 'rgba(0,0,0,.2)' 
      }}>
        <Typography 
          variant="body1" 
          color="white" 
          fontWeight="medium"
          data-testid="camping-description"
        >
          <ul>
            <li>Camp with Steph and Topher at our venue!</li>
            <li>We have some campsite space for you and your gear.</li>
            <li>(RV hookups not available, unfortunately)</li>
          </ul>
        </Typography>
      </Box>
    );
  }

  if (campingValue === SleepPreferenceEnum.Manor) {
    return (
      <Box sx={{ p: 2, backgroundColor: 'rgba(0,0,0,.2)' }}>
        <Typography 
          color="white" 
          fontWeight="medium"
          //fontSize="0.9rem"
          data-testid="manor-description"
        >
          * You have been chosen to stay in the Manor House!
          <ul>
            <li>As an honored Manor guest, you'll have access to a private room in the
            historic house at our venue.</li>
            <li>Breakfasts are included.</li>
            <li>Good times are included.</li>
          </ul>
        </Typography>
      </Box>
    );
  }

  if (campingValue === SleepPreferenceEnum.Hotel) {
    return (
      <Box sx={{ p: 3, backgroundColor: 'rgba(0,0,0,.2)', textAlign: 'center' }}>
        <Typography 
          variant="body1" 
          color="white" 
          fontWeight="medium"
          gutterBottom
          data-testid="hotel-description"
          sx={{            
            textAlign: 'left'
          }}
        >
         <ul>
            <li>Book soon! Hotels may fill up for the holiday weekend.</li>
            <li>We've partnered with hotels in the area to provide you with convenient options. Click to view details:</li>
        </ul>
        </Typography>
        
        <Button 
          variant="contained" 
          color="secondary"
          startIcon={<HotelOutlined />}
          onClick={handleOpenHotelDialog}
          sx={{ 
            mt: 2,
            fontWeight: 'bold',
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          View Hotel Options
        </Button>
        
        <HotelDialog 
          open={isHotelDialogOpen} 
          onClose={handleCloseHotelDialog} 
          hotelOptions={hotelOptions} 
        />
      </Box>
    );
  }

  // Default empty return for Unknown state
  return null;
};

export default PreferenceDescription;