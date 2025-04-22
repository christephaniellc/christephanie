import { useRecoilValue, useSetRecoilState } from 'recoil';
import { guestSelector } from '@/store/family';
import { useTheme } from '@mui/material';
import { InvitationResponseEnum } from '@/types/api';
import { stdStepperState, stdTabIndex } from '@/store/steppers/saveTheDateStepper';

export const useAttendanceButtonStatus = ({ guestId }: { guestId: string }) => {
  const guest = useRecoilValue(guestSelector(guestId));
  const theme = useTheme();
  const stdStepper = useRecoilValue(stdStepperState);
  const setTabIndex = useSetRecoilState(stdTabIndex);

  // Calculate days until deadline (April 15th, 2025)
  const getDaysUntilDeadline = () => {
    const today = new Date();
    const deadline = new Date('2025-04-15');
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const daysUntilDeadline = getDaysUntilDeadline();

  // For non-attendance steps, we need to navigate back to the attendance step
  const handleGoToAttendanceStep = () => {
    // Set tab index to 0 to navigate to the attendance step
    setTabIndex(0);
  };

  // Get the response color based on invitation status
  const getResponseColor = () => {
    if (guest.rsvp.invitationResponse === InvitationResponseEnum.Interested) {
      return theme.palette.primary.main;
    } else if (guest.rsvp.invitationResponse === InvitationResponseEnum.Declined) {
      return theme.palette.error.main;
    } else {
      return theme.palette.secondary.main;
    }
  };

  return {
    theme,
    stdStepper,
    guest,
    daysUntilDeadline,
    handleGoToAttendanceStep,
    getResponseColor,
  };
};