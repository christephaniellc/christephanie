import React from 'react';
import Box from '@mui/material/Box';
import { Typography, Paper } from '@mui/material';

export const TransportationSection: React.FC = () => {
  return (
    <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto', py: 2 }}>
      <Typography variant="h5" align="center" gutterBottom mb={4} color="secondary.main">
        Please Carpool or Use the Shuttle Service
      </Typography>
      <Paper
        elevation={5}
        sx={{
          backdropFilter: 'blur(20px)',
          backgroundColor: 'rgba(0,0,0,.8)',
          padding: 3,
          borderRadius: 2,
          color: 'white',
        }}
      >
        <Typography variant="h6" gutterBottom>
          Shuttle Service Available
        </Typography>
        <Typography variant="body1" paragraph>
          We will be providing shuttle service between the recommended hotels and the wedding venue.
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>Pick-up times:</strong>
          <br />
          - Holiday Inn Express Brunswick: 3:30pm and 4:00pm
          <br />
          - Holiday Inn Express Charles Town: 3:15pm and 3:45pm
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>Return shuttles:</strong>
          <br />
          Will run at 10:00pm, 10:30pm, and 11:00pm
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Please make sure to be at the hotel lobby at least 5 minutes before shuttle departure.
        </Typography>
      </Paper>
    </Box>
  );
};

export default TransportationSection;