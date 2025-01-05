import {
  Box, Typography,
} from '@mui/material';
import React from 'react';
import { styled } from '@mui/material/styles';
import InvitationCodeInputs from '@/components/InvitationCodeInputs';
import EightBitWeddingLogo from '@/components/EightBitWeddingLogo';


const Welcome = () => {
  return (
    <Box display="flex" height="100%" justifyContent="center" alignContent="flex-start" textAlign="center" flexWrap='wrap'>
      <Box display='flex' flexDirection='column' width='100%'>
        <Typography variant="h4" color="text.primary" gutterBottom mt={4} width="100%" textAlign="center">
        Steph & Topher
        </Typography>
        <Box mx='auto'>
          <EightBitWeddingLogo />
        </Box>
        <Typography variant='caption' color='text.secondary' mt={-4}>
          We're gettin' hitched.
        </Typography>
      </Box>
      <Box maxWidth={600} mx="auto" mb={2}>
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