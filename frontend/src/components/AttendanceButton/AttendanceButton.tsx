import { Box, ButtonProps, darken, Typography, useTheme, Paper } from '@mui/material';
import React, { useMemo } from 'react';
import { styled } from '@mui/material/styles';
import { InvitationResponseEnum } from '@/types/api';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { guestSelector, useFamily } from '@/store/family';
import LargeAttendanceButton from '@/components/AttendanceButton/ClientSideImportedComponents/LargeAttendanceButton';
import Button from '@mui/material/Button';
import { stdStepperState, stdTabIndex } from '@/store/steppers/steppers';
import FoodPreferences from '@/components/FoodPreferences/FoodPreferences';
import CommunicationPreferences from '@/components/CommunicationPreferences';
import CampingPreferences from '@/components/CampingPreferences';
import AgeSelector from '@/components/AgeSelector';
import FoodAllergies from '@/components/FoodPreferences';
import { rgba } from 'polished';
import { ArrowBack, ArrowForward, EditOutlined, LoopOutlined } from '@mui/icons-material';

interface AttendanceButtonProps {
  guestId: string;
}

export const themePaletteToRgba = (colorHexString: string, opacity: number = 0.1) => {
  const hexToRgba = colorHexString.replace('#', '');
  const r = parseInt(hexToRgba.substring(0, 2), 16);
  const g = parseInt(hexToRgba.substring(2, 4), 16);
  const b = parseInt(hexToRgba.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${opacity})`;
};

export const AttendanceButton = ({ guestId }: AttendanceButtonProps) => {
  const {
    semiTransparentBackgroundColor,
    theme,
    familyActions,
    handleClick,
    guest,
    imgButtonSxProps,
  } = useAttendanceButton({ guestId });
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });

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

  const calculateShadow = () => {
    const { x, y } = mousePosition;
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
  const setTabIndex = useSetRecoilState(stdTabIndex);

  /**
   * Handles navigating back to the attendance step for buttons on other pages
   */
  const handleGoToAttendanceStep = () => {
    console.log('Navigating to attendance step');
    // Set tab index to 0 to navigate to the attendance step
    setTabIndex(0);
  };

  return (
    <Box
      data-testid={'attendance-button'}
      sx={{
        p: 2,
        display: 'flex',
        flexWrap: 'no-wrap',
        height: 'auto',
        // blur and add 0.5 opacity
        backdropFilter: 'blur(16px)',
        // backgroundColor: 'rgba(0,0,0,0.5)',
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
          minWidth: 175,
          maxWidth: 175,
          height: 'auto',
          ...imgButtonSxProps,
          [theme.breakpoints.up('sm')]: {
            minWidth: '100%',
            maxWidth: '`100%`',
          },
          color:
            !familyActions.patchFamilyMutation.isIdle || stdStepper.tabIndex > 0
              ? 'white !important'
              : 'inherit',
          background: 'rgba(0,0,0,1)',
          width: '100%',
          filter: `drop-shadow(${calculateShadow()})`,
        }}
      >
        <Box display="flex" alignItems="center">
          {guest && (
            <LargeAttendanceButton
              guestId={guest.guestId}
              isPending={familyActions.patchFamilyMutation.isPending}
              error={familyActions.patchFamilyMutation.error}
            />
          )}
        </Box>
      </Button>

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
            <ArrowBack
              sx={{
                mr: 2,
                fontSize: '1.5rem',
                animation: 'pulse 1.5s infinite ease-in-out',
                '@keyframes pulse': {
                  '0%': { opacity: 0.5, transform: 'translateX(0)' },
                  '50%': { opacity: 1, transform: 'translateX(-5px)' },
                  '100%': { opacity: 0.5, transform: 'translateX(0)' },
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
            <EditOutlined sx={{ mr: 2 }} />
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
            <EditOutlined sx={{ mr: 2 }} />
            <Typography variant="body2" color="error.light" sx={{ fontWeight: 'medium' }}>
              Click to change your response. {daysUntilDeadline} days remaining.
            </Typography>
          </Button>
        )}

      <Box sx={{ overflowY: 'auto', ml: '2vw' }}>
        {(guest.rsvp.invitationResponse === InvitationResponseEnum.Interested ||
          stdStepper.currentStep[0] === 'mailingAddress') &&
          stdStepper.tabIndex < stdStepper.totalTabs &&
          CurrentComponent}
      </Box>
    </Box>
  );
};

const ImageButton = styled(Button)<ButtonProps>(({ theme }) => ({}));

export const StephsFavoriteTypography = styled(Typography)(({ theme }) => ({
  color: theme.palette.error.main,
  fontWeight: 700,
  fontSize: '1.5rem',
  [theme.breakpoints.up('sm')]: {},
}));

export const StephsActualFavoriteTypography = styled(Typography)(({ theme }) => ({
  fontFamily: 'Snowstorm, sans-serif',
  color: rgba(255, 255, 255, 0.98),
  textShadow: '3px 3px 0 #E9950C',
  fontWeight: 300,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  fontSize: '1.5rem',
  lineHeight: '2.5rem',
}));

export const useAttendanceButton = ({ guestId }: { guestId: string }) => {
  const guest = useRecoilValue(guestSelector(guestId));
  const theme = useTheme();
  const [_, familyActions] = useFamily();
  const stdStepper = useRecoilValue(stdStepperState);
  const darkenCoefficent = useMemo(
    () => (familyActions.patchFamilyGuestMutation.isPending || stdStepper.tabIndex > 0 ? 0.5 : 0),
    [familyActions.patchFamilyGuestMutation.isPending],
  );

  const setUserIsAttending = (interestedResponse: InvitationResponseEnum) => {
    console.log('setting user is attending');
    familyActions.updateFamilyGuestInterest(guestId, interestedResponse);
  };

  const handleClick = (invitationResponse: InvitationResponseEnum) => {
    console.log('clicky');
    if (invitationResponse === InvitationResponseEnum.Interested) {
      setUserIsAttending(InvitationResponseEnum.Declined);
    } else if (invitationResponse === InvitationResponseEnum.Declined) {
      setUserIsAttending(InvitationResponseEnum.Pending);
    } else {
      setUserIsAttending(InvitationResponseEnum.Interested);
    }
  };

  const buttonProps = useMemo(() => {
    console.log('buttonPropping for ', guest?.rsvp.invitationResponse);
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
  }, [guest, darkenCoefficent]);

  const semiTransparentBackgroundColor = useMemo(() => {
    switch (guest?.rsvp.invitationResponse) {
      case InvitationResponseEnum.Interested:
        // theme primary within rgba
        return themePaletteToRgba(theme.palette.primary.main, 0.1);
      case InvitationResponseEnum.Declined:
        return themePaletteToRgba(theme.palette.error.main, 0.1);
      case InvitationResponseEnum.Pending:
        return themePaletteToRgba(theme.palette.secondary.main, 0.1);
      default:
        return themePaletteToRgba(theme.palette.info.main, 0.1);
    }
  }, [guest]);

  const imgButtonSxProps = useMemo(() => {
    console.log('imgButtonSxPropsing for ', guest?.rsvp.invitationResponse);
    return {
      fontSize: buttonProps.fontSize,
      border: buttonProps.border,
      color: darken(theme.palette.text.primary, darkenCoefficent),
      width: '200px !important',
      minWidth: '200px !important',
      maxWidth: '200px !important',
    };
  }, [buttonProps, darkenCoefficent]);

  return {
    semiTransparentBackgroundColor,
    theme,
    familyActions,
    handleClick,
    guest,
    imgButtonSxProps,
  };
};
