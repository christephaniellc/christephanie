import React from 'react';
import Box from '@mui/material/Box';
import { useFamily } from '@/store/family';
import { GuestViewModel } from '@/types/api';
import RehearsalDinnerAttendance from '@/components/WeddingAttendanceRadios/RehearsalDinnerAttendance';

export const RehearsalDinnerSection: React.FC = () => {
  const [family] = useFamily();

  if (!family) return null;

  return (
    <>
      {family.guests.map((guest: GuestViewModel) => (
        <Box key={guest.guestId} sx={{ mb: 3, width: '100%' }}>
          <RehearsalDinnerAttendance guestId={guest.guestId} />
        </Box>
      ))}
    </>
  );
};

export default RehearsalDinnerSection;