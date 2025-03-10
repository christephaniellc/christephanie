import { useRecoilValue } from 'recoil';
import { guestSelector, useFamily } from '@/store/family';
import { useTheme, useMediaQuery } from '@mui/material';
import { InvitationResponseEnum } from '@/types/api';
import { useMemo, useState } from 'react';
import { stdStepperState } from '@/store/steppers/steppers';
import { darken } from '@mui/material';

export const useAttendanceButtonMain = ({ guestId }: { guestId: string }) => {
  const guest = useRecoilValue(guestSelector(guestId));
  const theme = useTheme();
  const [_, familyActions] = useFamily();
  const stdStepper = useRecoilValue(stdStepperState);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const darkenCoefficent = useMemo(
    () => (familyActions.patchFamilyGuestMutation.isPending || stdStepper.tabIndex > 0 ? 0.5 : 0),
    [familyActions.patchFamilyGuestMutation.isPending, stdStepper.tabIndex]
  );

  const setUserIsAttending = (interestedResponse: InvitationResponseEnum) => {
    familyActions.updateFamilyGuestInterest(guestId, interestedResponse);
  };

  const handleClick = (invitationResponse: InvitationResponseEnum) => {
    if (invitationResponse === InvitationResponseEnum.Interested) {
      setUserIsAttending(InvitationResponseEnum.Declined);
    } else if (invitationResponse === InvitationResponseEnum.Declined) {
      setUserIsAttending(InvitationResponseEnum.Pending);
    } else {
      setUserIsAttending(InvitationResponseEnum.Interested);
    }
  };

  const buttonProps = useMemo(() => {
    switch (guest?.rsvp.invitationResponse) {
      case InvitationResponseEnum['Interested']:
        return {
          color: 'primary',
          fontSize: 'large',
          border: `2px solid ${darken(theme.palette.primary.main, darkenCoefficent)}; elevation:5;`,
        };
      case InvitationResponseEnum.Declined:
        return {
          color: 'error',
          fontSize: 'small',
          border: `2px dashed ${darken(theme.palette.error.main, darkenCoefficent)}`,
        };
      case InvitationResponseEnum.Pending:
        return {
          color: 'default',
          fontSize: 'medium',
          border: `2px dashed ${darken(theme.palette.secondary.main, darkenCoefficent)}`,
        };
      default:
        return {
          color: 'default',
          fontSize: 'medium',
          border: `2px solid ${theme.palette.info.main}`,
        };
    }
  }, [guest, darkenCoefficent, theme]);

  // Use MediaQuery hook for responsive detection
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isAttendanceStep = stdStepper.tabIndex === 0;
  const shouldBeFullWidth = isMobile && isAttendanceStep;

  const imgButtonSxProps = useMemo(() => {    
    return {
      fontSize: buttonProps.fontSize,
      border: buttonProps.border,
      color: darken(theme.palette.text.primary, darkenCoefficent),
      width: shouldBeFullWidth ? '100% !important' : '200px !important',
      minWidth: shouldBeFullWidth ? '100% !important' : '200px !important',
      maxWidth: shouldBeFullWidth ? 'none !important' : '200px !important',
    };
  }, [buttonProps, darkenCoefficent, theme, shouldBeFullWidth]);

  const calculateShadow = () => {
    const shadowX = stdStepper.tabIndex > 0 ? 0 : 10;
    const shadowY = stdStepper.tabIndex > 0 ? 0 : 10;
    return `${shadowX}px ${shadowY}px 0px ${
      guest.rsvp.invitationResponse === InvitationResponseEnum.Interested
        ? theme.palette.primary.dark
        : guest.rsvp.invitationResponse === InvitationResponseEnum.Pending
          ? theme.palette.secondary.dark
          : theme.palette.error.dark
    }`;
  };

  return {
    theme,
    familyActions,
    handleClick,
    guest,
    imgButtonSxProps,
    calculateShadow,
    stdStepper,
  };
};