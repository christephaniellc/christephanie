import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { StephsActualFavoriteTypography } from '@/components/AttendanceButton/AttendanceButton';
import InfoIcon from '@mui/icons-material/Info';

const MobileView: React.FC = () => {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center',
        height: '100vh',
        p: 3,
        textAlign: 'center',
        bgcolor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)'
      }}
    >
      <StephsActualFavoriteTypography variant="h5" gutterBottom>
        Printed RSVP Preview
      </StephsActualFavoriteTypography>
      <InfoIcon sx={{ fontSize: 48, mb: 2, opacity: 0.7 }} />
      <Typography variant="body1" paragraph>
        Please use a larger screen or desktop device to view the printed RSVP template.
        This page is designed to show accurate physical dimensions of our printed materials.
      </Typography>
      <Button 
        variant="outlined" 
        color="secondary"
        onClick={() => window.history.back()}
      >
        Go Back
      </Button>
    </Box>
  );
};

export default MobileView;