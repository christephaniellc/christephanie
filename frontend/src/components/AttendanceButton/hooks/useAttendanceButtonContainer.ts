import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { guestSelector } from '@/store/family';
import { InvitationResponseEnum } from '@/types/api';
import { useTheme } from '@mui/material';
import { themePaletteToRgba } from '../utils/themePaletteToRgba';

export const useAttendanceButtonContainer = ({ guestId }: { guestId: string }) => {
  const guest = useRecoilValue(guestSelector(guestId));
  const theme = useTheme();

  const semiTransparentBackgroundColor = useMemo(() => {
    switch (guest?.rsvp.invitationResponse) {
      case InvitationResponseEnum.Interested:
        return themePaletteToRgba(theme.palette.primary.main, 0.1);
      case InvitationResponseEnum.Declined:
        return themePaletteToRgba(theme.palette.error.main, 0.1);
      case InvitationResponseEnum.Pending:
        return themePaletteToRgba(theme.palette.secondary.main, 0.1);
      default:
        return themePaletteToRgba(theme.palette.info.main, 0.1);
    }
  }, [guest, theme]);
  
  // Get the response color based on invitation status
  const getResponseColor = () => {
    if (guest?.rsvp.invitationResponse === InvitationResponseEnum.Interested) {
      return theme.palette.primary.main;
    } else if (guest?.rsvp.invitationResponse === InvitationResponseEnum.Declined) {
      return theme.palette.error.main;
    } else {
      return theme.palette.secondary.main;
    }
  };

  return {
    semiTransparentBackgroundColor,
    theme,
    guest,
    getResponseColor,
  };
};