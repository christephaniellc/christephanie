import * as React from 'react';
import { Box, Typography } from '@mui/material';
import { useMemo } from 'react';
import { InvitationResponseEnum } from '@/types/api';
import StickFigureIcon from '@/components/StickFigureIcon';
import { useQueryClient } from '@tanstack/react-query';

interface WeddingAttendanceRadiosProps {
  interested: InvitationResponseEnum;
  isMe: boolean;
}

const WeddingAttendanceRadios = ({ interested, isMe }: WeddingAttendanceRadiosProps) => {
  const response = useMemo(() => {
      return interested === 'Interested' ? 'interested!' : interested === 'Declined' ? "unable to attend" : 'still thinking about it.';
    }, [interested])

  const queryKey = ['updateFamilyUnit'];
  const queryClient = useQueryClient();

  const familyQuery = queryClient.getQueryState(queryKey)


  const declined = useMemo(() => interested === 'Declined', [interested]);
  return (
    <Box display={'flex'} alignItems='center'>
      <Typography variant='caption' mr={declined ? 2 : 0}>{isMe ? "I'm" : "They're"} {response}</Typography>
      {declined && <StickFigureIcon fontSize='small' loading={familyQuery?.fetchStatus === 'fetching'} />}
    </Box>
  );
}

export default WeddingAttendanceRadios;