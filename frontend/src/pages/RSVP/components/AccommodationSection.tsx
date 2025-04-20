import React from 'react';
import Box from '@mui/material/Box';
import { useFamily } from '@/store/family';
import { GuestViewModel } from '@/types/api';
import CampingPreferences from '@/components/CampingPreferences/CampingPreferences';

export const AccommodationSection: React.FC = () => {
  const [family] = useFamily();

  if (!family) return null;

  return (
    <>
      {family.guests.map((guest: GuestViewModel) => (
        <Box key={guest.guestId} sx={{ mb: 3, width: '100%' }}>
          <CampingPreferences 
            guestId={guest.guestId}
            guestFirstName={guest.firstName} />
        </Box>
      ))}
    </>
  );
};

export default AccommodationSection;