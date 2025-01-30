import { Box, Typography } from '@mui/material';
import WeddingAttendanceRadios from '@/components/WeddingAttendanceRadios';
import StickFigureIcon from '@/components/StickFigureIcon';
import Countdowns from '@/components/Countdowns';
import React, { useMemo } from 'react';
import { InvitationResponseEnum } from '@/types/api';
import { useRecoilValue } from 'recoil';
import { guestSelector } from '@/store/family';
import { ApiError } from '@/api/Api';
import { useAuth0 } from '@auth0/auth0-react';
import { CountdownMessage } from '@/components/AttendanceButton/AttendanceButton';


type AsyncAttendanceButtonProps = {
  guestId: string,
  isPending?: boolean,
  error: ApiError | null,
};
const LargeAttendanceButton = ({ guestId, isPending = true, error = null }: AsyncAttendanceButtonProps) => {
  //todo: move this to a hook
  const { user } = useAuth0();
  const guest = useRecoilValue(guestSelector(guestId));
  const interested = useMemo(() => guest?.rsvp?.invitationResponse || InvitationResponseEnum.Pending, [guest]);
  return (
    <Box width='100%' height='100%' display="flex" flexWrap="wrap">
      <Box display="flex" width="100%" >
        <WeddingAttendanceRadios guestId={guestId} />
      </Box>
      {/*<Box id="spacer" height={20} border={'1px dashed white'}/>*/}
      <Box
        mb={1}
        mx={interested === 'Interested' ? 'auto' : 0}
      >
        <StickFigureIcon hidden={interested === 'Declined'}
                         fontSize={interested === 'Interested' && 'large' || 'medium'}
                         loading={isPending} />
        <StickFigureIcon fontSize={'large'} hidden={true} />
      </Box>
      <Typography variant="h6" sx={{ mx: 'auto' }} width='100%'>
        {guest?.auth0Id === user?.sub ? 'You' : guest?.firstName}
      </Typography>
    </Box>
  );
};

export default LargeAttendanceButton;