import { Box, Typography } from '@mui/material';
import WeddingAttendanceRadios from '@/components/WeddingAttendanceRadios';
import StickFigureIcon from '@/components/StickFigureIcon';
import React, { useMemo } from 'react';
import { InvitationResponseEnum } from '@/types/api';
import { useRecoilValue } from 'recoil';
import { guestSelector } from '@/store/family';
import { ApiError } from '@/api/Api';
import { useAuth0 } from '@auth0/auth0-react';

type AsyncAttendanceButtonProps = {
  guestId: string;
  isPending?: boolean;
  error: ApiError | null;
};
const LargeAttendanceButton = ({
  guestId,
  isPending = true,
  error = null,
}: AsyncAttendanceButtonProps) => {
  //todo: move this to a hook
  const { user } = useAuth0();
  const guest = useRecoilValue(guestSelector(guestId));
  return (
    <Box
      height="100%"
      display="flex"
      flexWrap="wrap"
      id={`large-attendance-button-${guest.firstName}`}
    >
      <Box display="flex" width="100%" flexWrap="wrap">
        <Typography variant="h6" sx={{ mx: 'auto' }} width="100%">
          {guest?.auth0Id === user?.sub
            ? `You${guest.rsvp.invitationResponse === 'Pending' ? `, Maybe.` : ''}`
            : guest?.firstName}
        </Typography>
        <Typography variant="caption" width="80%" textAlign="center">
          {guest.rsvp.invitationResponse}
        </Typography>
        {/*<Box id="spacer" height={20} border={'1px dashed white'}/>*/}
        <Box width="20%" mx={guest.rsvp.invitationResponse === 'Interested' ? 'auto' : 0}>
          <StickFigureIcon
            hidden={guest.rsvp.invitationResponse === 'Declined'}
            fontSize={(guest.rsvp.invitationResponse === 'Interested' && 'large') || 'medium'}
            loading={isPending}
            ageGroup={guest?.ageGroup}
          />
        </Box>
      </Box>
      <Box
        display="flex"
        width="100%"
        id={`wedding-attendance-radios-${guestId}`}
        justifyContent="center"
      >
        <WeddingAttendanceRadios guestId={guestId} />
      </Box>
    </Box>
  );
};

export default LargeAttendanceButton;
