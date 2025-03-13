import { Box, Typography, Button } from '@mui/material';
import { LockOutlined } from '@mui/icons-material';
import { useAuth0 } from '@auth0/auth0-react';
import { GuestViewModel } from '@/types/api';

export const AuthMismatchPlaceholder = ({ guest }: { guest: GuestViewModel }) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      p={4}
      textAlign="center"
      sx={{
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 2,
        border: '1px dashed rgba(255,255,255,0.2)',
        width: '100%',
        height: '100%'
      }}
    >
      <LockOutlined sx={{ fontSize: 24, color: 'error.main', mb: 2 }} />
      <Typography variant="body1" color="text.secondary" gutterBottom>
        {guest.firstName} needs to be logged in to update their communication preferences.
      </Typography>
    </Box>
  );
};