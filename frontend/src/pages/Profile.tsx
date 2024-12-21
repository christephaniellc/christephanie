  import { useAppStateContext } from '../context/AppStateContext';
  import { useAuth0 } from '@auth0/auth0-react';
  import { Box, Typography } from '@mui/material';
  import React, { useEffect } from 'react';

  export const Profile: React.FC = () => {
    const { user } = useAuth0();
    return (
      <Box display='flex' alignItems='flex-start' flexGrow={2}>
        <Typography variant={'caption'}>{JSON.stringify(user)}</Typography>
      </Box>
    );
  }