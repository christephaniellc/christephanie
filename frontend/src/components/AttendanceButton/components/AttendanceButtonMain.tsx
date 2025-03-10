import { Box, Button, useMediaQuery, useTheme } from '@mui/material';
import React from 'react';
import LargeAttendanceButton from '@/components/AttendanceButton/ClientSideImportedComponents/LargeAttendanceButton';
import { useAttendanceButtonMain } from '../hooks/useAttendanceButtonMain';

interface AttendanceButtonMainProps {
  guestId: string;
}

export const AttendanceButtonMain = ({ guestId }: AttendanceButtonMainProps) => {
  const {
    familyActions,
    handleClick,
    guest,
    imgButtonSxProps,
    calculateShadow,
    stdStepper,
  } = useAttendanceButtonMain({ guestId });
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isAttendanceStep = stdStepper.tabIndex === 0;
  
  return (
    <Button
      disabled={
        !familyActions.patchFamilyGuestMutation.isIdle ||
        familyActions.getFamilyUnitQuery.isFetching ||
        stdStepper.tabIndex > 0
      }
      onClick={() => handleClick(guest?.rsvp.invitationResponse)}
      sx={{
        alignItems: 'flex-start',
        boxShadow: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 2,
        position: 'relative',
        height: 'auto',
        ...imgButtonSxProps,
        color:
          !familyActions.patchFamilyMutation.isIdle || stdStepper.tabIndex > 0
            ? 'white !important'
            : 'inherit',
        background: 'rgba(0,0,0,1)',
        filter: `drop-shadow(${calculateShadow()})`,
      }}
    >
      <Box display="flex" alignItems="center" width="100%">
        {guest && (
          <LargeAttendanceButton
            guestId={guest.guestId}
            isPending={familyActions.patchFamilyMutation.isPending}
            error={familyActions.patchFamilyMutation.error}
          />
        )}
      </Box>
    </Button>
  );
};