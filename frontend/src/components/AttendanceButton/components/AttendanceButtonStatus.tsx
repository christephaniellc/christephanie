import { Button, Typography } from '@mui/material';
import { DoubleArrow, EditOutlined } from '@mui/icons-material';
import React from 'react';
import { useAttendanceButtonStatus } from '../hooks/useAttendanceButtonStatus';
import { InvitationResponseEnum } from '@/types/api';
import { useAttendanceButtonMain } from '../hooks/useAttendanceButtonMain';
import { darken } from '@mui/material';

interface AttendanceButtonStatusProps {
  guestId: string;
}

export const AttendanceButtonStatus = ({ guestId }: AttendanceButtonStatusProps) => {
  const {
    theme,
    stdStepper,
    guest,
    daysUntilDeadline,
    handleGoToAttendanceStep,
    getResponseColor,
  } = useAttendanceButtonStatus({ guestId });

  const { handleClick, calculateShadow } = useAttendanceButtonMain({ guestId });

  return (
    <>
      {/* Response status messages - shown to the right of the attendance button */}
      {/* For Pending status - on attendance step */}
      {[InvitationResponseEnum.Pending, InvitationResponseEnum.Declined].includes(
        guest.rsvp.invitationResponse,
      ) &&
        stdStepper.tabIndex === 0 && (
          <Button
            onClick={() => handleClick(guest?.rsvp.invitationResponse)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              ml: 3,
              p: 2,
              borderRadius: 1,
              backgroundColor: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(8px)',
              textTransform: 'none',
              boxShadow: calculateShadow(),
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.8)',
              },
            }}
          >
            <DoubleArrow
              sx={{
                mr: 2,
                fontSize: '1.8rem',
                color: getResponseColor(),
                strokeWidth: 1.5,
                textShadow: '3px 3px 0px rgba(0,0,0,0.7)',
                filter: 'drop-shadow(2px 2px 1px rgba(0,0,0,0.5))',
                animation: 'pulse 1.2s infinite ease-in-out',
                '@keyframes pulse': {
                  '0%': { opacity: 1, transform: 'translateX(0px) rotate(180deg)' },
                  '50%': { opacity: 0.5, transform: 'translateX(13px) rotate(180deg)' },
                  '100%': { opacity: 1, transform: 'translateX(0px) rotate(180deg)' },
                },
              }}
            />
            <Typography
              variant="body2"
              color="secondary.light"
              sx={{
                fontWeight: 'medium',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              Click to update your response. You have {daysUntilDeadline} days left to respond.
            </Typography>
          </Button>
        )}

      {/* For Pending status - on other steps */}
      {guest.rsvp.invitationResponse === InvitationResponseEnum.Pending &&
        stdStepper.tabIndex > 0 && (
          <Button
            onClick={handleGoToAttendanceStep}
            sx={{
              display: 'flex',
              alignItems: 'center',
              ml: 3,
              p: 2,
              borderRadius: 1,
              backgroundColor: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(8px)',
              textTransform: 'none',
              boxShadow: (theme) => `5px 5px 10px ${darken(theme.palette.secondary.dark, 0.5)}`,
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.8)',
              },
            }}
          >
            <EditOutlined 
              sx={{ 
                mr: 2,
                color: theme.palette.secondary.main,
                filter: 'drop-shadow(2px 2px 1px rgba(0,0,0,0.5))',
              }} 
            />
            <Typography variant="body2" color="secondary.light" sx={{ fontWeight: 'medium' }}>
              Click to change your response. {daysUntilDeadline} days remaining.
            </Typography>
          </Button>
        )}

      {/* For Declined status on other steps */}
      {guest.rsvp.invitationResponse === InvitationResponseEnum.Declined &&
        stdStepper.tabIndex > 0 && (
          <Button
            onClick={handleGoToAttendanceStep}
            sx={{
              display: 'flex',
              alignItems: 'center',
              ml: 3,
              p: 2,
              borderRadius: 1,
              backgroundColor: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(8px)',
              textTransform: 'none',
              boxShadow: (theme) => `5px 5px 10px ${darken(theme.palette.error.dark, 0.5)}`,
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.8)',
              },
            }}
          >
            <EditOutlined 
              sx={{ 
                mr: 2,
                color: theme.palette.error.main,
                filter: 'drop-shadow(2px 2px 1px rgba(0,0,0,0.5))', 
              }} 
            />
            <Typography variant="body2" color="error.light" sx={{ fontWeight: 'medium' }}>
              Click to change your response. {daysUntilDeadline} days remaining.
            </Typography>
          </Button>
        )}
    </>
  );
};