import {
  Box, Typography,
} from '@mui/material';
import React from 'react';
import { styled } from '@mui/material/styles';
import InvitationCodeInputs from '@/components/InvitationCodeInputs';

const Welcome = () => {
  return (
    <Box display="flex" flexDirection="column" height="100%" justifyContent="flex-start" alignItems="flex-center"
         textAlign="center">
      <Typography variant="h2" color="text.primary" gutterBottom mt={4}>
        welcomeMessage
      </Typography>
      <Typography variant="h4" color="text.primary" gutterBottom mt={4} data-testid={'invitation-code'}>
        Please enter your invitation code to get started.
      </Typography>
      <Box maxWidth={300} mx="auto" mb={2}>
        <InvitationCodeInputs />
      </Box>
    </Box>
  );
};

styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  mx: 'auto',
  [theme.breakpoints.up('sm')]: {
    mx: 'auto',
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    alignSelf: 'center',
    flexGrow: 1,
    maxWidth: 800,
    mb: 4,
  },
}));

export default Welcome;