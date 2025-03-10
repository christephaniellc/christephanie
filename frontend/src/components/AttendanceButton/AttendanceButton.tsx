import { Box, useMediaQuery } from '@mui/material';
import React, { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { stdStepperState } from '@/store/steppers/steppers';
import FoodPreferences from '@/components/FoodPreferences/FoodPreferences';
import CommunicationPreferences from '@/components/CommunicationPreferences';
import CampingPreferences from '@/components/CampingPreferences';
import AgeSelector from '@/components/AgeSelector';
import FoodAllergies from '@/components/FoodPreferences';
import { AttendanceButtonMain } from './components/AttendanceButtonMain';
import { AttendanceButtonStatus } from './components/AttendanceButtonStatus';
import { MobileAttendanceView } from './components/MobileAttendanceView';
import { useAttendanceButtonContainer } from './hooks/useAttendanceButtonContainer';
import { InvitationResponseEnum } from '@/types/api';

// Re-export typography components to maintain backwards compatibility
export * from './components/StyledComponents';
export { themePaletteToRgba } from './utils/themePaletteToRgba';

interface AttendanceButtonProps {
  guestId: string;
}

export const AttendanceButton = ({ guestId }: AttendanceButtonProps) => {
  const { semiTransparentBackgroundColor, theme, guest } = useAttendanceButtonContainer({ guestId });
  const stdStepper = useRecoilValue(stdStepperState);
  const isNonAttendanceStep = stdStepper.tabIndex > 0;
  const isAttendanceStep = !isNonAttendanceStep;
  
  // Check if we're on a small screen
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // If we're on a small screen and not on the attendance step, use the mobile view
  const shouldUseMobileView = isMobile && isNonAttendanceStep;

  // Only show step-specific content if we're on the attendance step or the guest is attending
  const isAttending = guest?.rsvp?.invitationResponse === InvitationResponseEnum.Interested;
  const showStepContent = isAttendanceStep || isAttending;

  const CurrentComponent = useMemo(() => {
    // Only show step components if we're on the attendance step or if the guest is attending
    if (!showStepContent) return <></>;

    switch (stdStepper.currentStep[0]) {
      case 'ageGroup':
        return <AgeSelector guestId={guestId} />;
      case 'foodPreferences':
        return <FoodPreferences guestId={guestId} />;
      case 'foodAllergies':
        return <FoodAllergies guestId={guestId} />;
      case 'communicationPreference':
        return <CommunicationPreferences guestId={guestId} />;
      case 'camping':
        return <CampingPreferences guestId={guestId} />;
      default:
        return <></>;
    }
  }, [guestId, stdStepper.currentStep, showStepContent]);

  // Use mobile view with sticky headers for small screens on non-attendance steps
  if (shouldUseMobileView) {
    return <MobileAttendanceView guestId={guestId} />;
  }

  // Use the original layout for medium screens and up, or for the attendance step
  
  return (
    <Box
      data-testid={'attendance-button'}
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: { xs: isAttendanceStep ? 'column' : 'row', md: 'row' },
        flexWrap: 'no-wrap',
        height: 'auto',
        backdropFilter: 'blur(16px)',
        borderTop: `2px solid ${semiTransparentBackgroundColor}`,
        borderRight: `2px solid ${semiTransparentBackgroundColor}`,
        borderBottom: `2px solid ${semiTransparentBackgroundColor}`,
        backgroundColor: semiTransparentBackgroundColor,
        width: '100%',
        mr: 0,
        p: 2,
        [theme.breakpoints.up('sm')]: {
          mr: 'auto',
        },
      }}
    >
      <AttendanceButtonMain guestId={guestId} />
      
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' },
        width: '100%',
        mt: { xs: isAttendanceStep && isMobile ? 2 : 0, md: 0 }
      }}>
        <AttendanceButtonStatus guestId={guestId} />

        <Box sx={{ 
          overflowY: 'auto', 
          ml: { xs: 0, md: '2vw' },
          mt: { xs: isAttendanceStep && isMobile ? 2 : 0, md: 0 },
          flexGrow: 2,
          display: 'flex',
          justifyContent: stdStepper.currentStep[0] === 'ageGroup' ? 'center' : 'flex-start',
          width: '100%'
        }}>
          {CurrentComponent}
        </Box>
      </Box>
    </Box>
  );
};