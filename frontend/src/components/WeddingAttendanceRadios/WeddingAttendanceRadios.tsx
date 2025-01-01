import * as React from 'react';
import { Box, Typography } from '@mui/material';
import { useMemo } from 'react';
import { InvitationResponseEnum } from '@/types/api';
import StickFigureIcon from '@/components/StickFigureIcon';

interface WeddingAttendanceRadiosProps {
  interested: InvitationResponseEnum;
}

const WeddingAttendanceRadios = ({ interested }: WeddingAttendanceRadiosProps) => {
  const response = useMemo(() => {
      return interested === 'Interested' ? 'interested!' : interested === 'Declined' ? 'not attending!' : 'still thinking about it.';
    }, [interested])

  const declined = useMemo(() => interested === 'Declined', [interested]);
  return (
    <Box display={'flex'} alignItems='center'>
      <Typography variant='caption' mr={declined ? 2 : 0}>I&#39;m {response}</Typography>
      {declined && <StickFigureIcon fontSize='small' />}
    </Box>
  );
}

export default WeddingAttendanceRadios;