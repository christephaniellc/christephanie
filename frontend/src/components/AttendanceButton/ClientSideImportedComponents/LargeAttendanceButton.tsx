import { Box, Typography, CircularProgress } from '@mui/material';
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
  rsvpLoading?: boolean;
};
const LargeAttendanceButton = ({
  guestId,
  isPending = true,
  error = null,
  rsvpLoading = false,
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
      width="100%"
      justifyContent="center"
    >
      <Box display="flex" width="100%" flexWrap="wrap" justifyContent="center">
        <Typography variant="h6" sx={{ mx: 'auto', textAlign: 'center' }} width="100%">
          {guest?.auth0Id === user?.sub
            ? `You`
            : guest?.firstName}
        </Typography>
        <Box width="100%" display="flex" justifyContent="center" alignItems="center">
          {rsvpLoading ? (
            <Box display="flex" alignItems="center" justifyContent="center">
              <CircularProgress 
                size={24} 
                color={
                  guest.rsvp.invitationResponse === InvitationResponseEnum.Interested 
                    ? "primary" 
                    : guest.rsvp.invitationResponse === InvitationResponseEnum.Declined 
                      ? "error" 
                      : "secondary"
                } 
                sx={{ mr: 1 }} 
              />
              <Typography variant="caption" sx={{ fontWeight: 'bold', animation: 'pulse 1.5s infinite', '@keyframes pulse': {
                '0%': { opacity: 0.7 },
                '50%': { opacity: 1 },
                '100%': { opacity: 0.7 },
              } }}>
                Updating...
              </Typography>
            </Box>
          ) : (
            <Typography variant="caption" width="100%" textAlign="center">
              {guest.rsvp.invitationResponse}
            </Typography>
          )}
        </Box>
        {/*<Box id="spacer" height={20} border={'1px dashed white'}/>*/}
        <Box 
          width="100%" 
          display="flex" 
          justifyContent="center"
          mt={1}
        >
          <Box sx={{ position: 'relative' }}>
            <StickFigureIcon
              hidden={guest.rsvp.invitationResponse === 'Declined'}
              fontSize={(guest.rsvp.invitationResponse === 'Interested' && 'large') || 'medium'}
              loading={isPending || rsvpLoading}
              ageGroup={guest?.ageGroup}
            />
            {rsvpLoading && (
              <CircularProgress 
                size={24} 
                thickness={6}
                color={
                  guest.rsvp.invitationResponse === InvitationResponseEnum.Interested 
                    ? "primary" 
                    : guest.rsvp.invitationResponse === InvitationResponseEnum.Declined 
                      ? "error" 
                      : "secondary"
                }
                sx={{ 
                  position: 'absolute', 
                  top: '50%', 
                  left: '50%', 
                  transform: 'translate(-50%, -50%)',
                  animation: 'pulse 1.5s infinite ease-in-out',
                  '@keyframes pulse': {
                    '0%': { opacity: 0.7, transform: 'translate(-50%, -50%) scale(1)' },
                    '50%': { opacity: 1, transform: 'translate(-50%, -50%) scale(1.1)' },
                    '100%': { opacity: 0.7, transform: 'translate(-50%, -50%) scale(1)' },
                  },
                }}
              />
            )}
          </Box>
        </Box>
      </Box>
      <Box
        display="flex"
        width="100%"
        id={`wedding-attendance-radios-${guestId}`}
        justifyContent="center"
        mt={2}
        sx={{ height: 'auto', flexGrow: 1 }}
      >
        <WeddingAttendanceRadios guestId={guestId} />
      </Box>
    </Box>
  );
};

export default LargeAttendanceButton;
