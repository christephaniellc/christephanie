import { Box, useTheme } from '@mui/material';
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
import { useAttendanceButtonContainer } from './hooks/useAttendanceButtonContainer';

// Re-export typography components to maintain backwards compatibility
export * from './components/StyledComponents';
export { themePaletteToRgba } from './utils/themePaletteToRgba';

interface AttendanceButtonProps {
  guestId: string;
}

export const AttendanceButton = ({ guestId }: AttendanceButtonProps) => {
  const { semiTransparentBackgroundColor, theme } = useAttendanceButtonContainer({ guestId });
  const stdStepper = useRecoilValue(stdStepperState);

  const CurrentComponent = useMemo(() => {
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
  }, [guestId, stdStepper.currentStep]);

  return (
    <Box
      data-testid={'attendance-button'}
      sx={{
        p: 2,
        display: 'flex',
        flexWrap: 'no-wrap',
        height: 'auto',
        backdropFilter: 'blur(16px)',
        borderTop: `2px solid ${semiTransparentBackgroundColor}`,
        borderRight: `2px solid ${semiTransparentBackgroundColor}`,
        borderBottom: `2px solid ${semiTransparentBackgroundColor}`,
        backgroundColor: semiTransparentBackgroundColor,
        width: '100%',
        mr: 0,
        [theme.breakpoints.up('sm')]: {
          mr: 'auto',
        },
      }}
    >
      <AttendanceButtonMain guestId={guestId} />
      <AttendanceButtonStatus guestId={guestId} />

      <Box sx={{ overflowY: 'auto', ml: '2vw', flexGrow: 2 }}>
        {CurrentComponent}
      </Box>
    </Box>
  );
};