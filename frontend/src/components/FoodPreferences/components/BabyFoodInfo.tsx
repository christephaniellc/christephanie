import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import BabyBottleIcon from '@/components/SharkIcon/BottleIcon';
import { useRecoilValue } from 'recoil';
import { guestSelector } from '@/store/family';
import { userState } from '@/store/user';

interface BabyFoodInfoProps {
  guestId: string;
}

const BabyFoodInfo: React.FC<BabyFoodInfoProps> = ({ guestId }) => {
  const theme = useTheme();
  const guest = useRecoilValue(guestSelector(guestId));
  const loggedInUser = useRecoilValue(userState);
  const guestName = guest?.auth0Id === loggedInUser.auth0Id ? 'You' : guest?.firstName;
  
  return (
    <Box sx={{ textAlign: 'center', width: '100%', p: 2 }}>
      <BabyBottleIcon 
        sx={{ 
          mb: 2,
          color: theme.palette.secondary.main 
        }} 
      />
      <Typography variant="h6" color="secondary" gutterBottom>
        {guestName} is a baby.
      </Typography>
      <Typography variant="h6" color="secondary" sx={{ backdropFilter: 'blur(50px)' }}>
        Please bring any specific food your little one prefers.
      </Typography>
    </Box>
  );
};

export default BabyFoodInfo;