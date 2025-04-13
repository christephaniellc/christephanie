import React from 'react';
import Box from '@mui/material/Box';
import { Typography } from '@mui/material';
import { useFamily } from '@/store/family';
import { GuestViewModel } from '@/types/api';
import FoodPreferences from '@/components/FoodPreferences/FoodPreferences';

export const FoodPreferencesSection: React.FC = () => {
  const [family] = useFamily();

  if (!family) return null;

  return (
    <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto', py: 2 }}>
      <Typography variant="h5" align="center" gutterBottom mb={4} color="primary.main">
        Food Preferences
      </Typography>
      {family.guests.map((guest: GuestViewModel) => (
        <Box key={guest.guestId} sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            {guest.firstName} {guest.lastName}
          </Typography>
          <FoodPreferences guestId={guest.guestId} />
        </Box>
      ))}
    </Box>
  );
};

export default FoodPreferencesSection;