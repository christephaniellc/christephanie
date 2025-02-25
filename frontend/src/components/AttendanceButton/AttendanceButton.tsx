import { Box, ButtonProps, darken, Typography, useTheme } from '@mui/material';
import React, { useMemo } from 'react';
import { styled } from '@mui/material/styles';
import { InvitationResponseEnum } from '@/types/api';
import { useRecoilValue } from 'recoil';
import { guestSelector, useFamily } from '@/store/family';
import LargeAttendanceButton from '@/components/AttendanceButton/ClientSideImportedComponents/LargeAttendanceButton';
import Button from '@mui/material/Button';
import { stdStepperState } from '@/store/steppers/steppers';
import FoodPreferences from '@/components/FoodPreferences/FoodPreferences';
import CommunicationPreferences from '@/components/CommunicationPreferences';
import CampingPreferences from '@/components/CampingPreferences';
import AgeSelector from '@/components/AgeSelector';
import FoodAllergies from '@/components/FoodPreferences';

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
    const shadowX = 10
    const shadowY = 10;
    return `${shadowX}px ${shadowY}px 0px ${guest.rsvp.invitationResponse === InvitationResponseEnum.Interested ? theme.palette.primary.dark : guest.rsvp.invitationResponse === InvitationResponseEnum.Pending ? theme.palette.secondary.dark : theme.palette.error.dark}`;
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
        disabled={!familyActions.patchFamilyGuestMutation.isIdle || familyActions.getFamilyUnitQuery.isFetching}
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
          background: 'rgba(0,0,0,1)',
          width: '100%',
          filter: `drop-shadow(${calculateShadow()})`,
        }}


      >
        <Box display="flex" alignItems="center">
          {guest &&
            <LargeAttendanceButton guestId={guest.guestId} isPending={familyActions.patchFamilyMutation.isPending}
                                   error={familyActions.patchFamilyMutation.error} />}
        </Box>

      </Button>
      <Box sx={{ overflowX: 'auto', ml: "2vw",  }}>
        {guest.rsvp.invitationResponse === InvitationResponseEnum.Interested && stdStepper.tabIndex < stdStepper.totalTabs && (
          CurrentComponent
        )}
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

export const useAttendanceButton = ({ guestId }: { guestId: string }) => {
  const guest = useRecoilValue(guestSelector(guestId));
  const theme = useTheme();
  const [_, familyActions] = useFamily();

  const darkenCoefficent = useMemo(() => familyActions.patchFamilyGuestMutation.isPending ? .5 : 0, [familyActions.patchFamilyGuestMutation.isPending]);

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
        return { color: 'default', fontSize: 'medium', border: `2px solid ${theme.palette.info.main}` };

    }
  }, [guest]);

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
      width: guest?.rsvp.invitationResponse === InvitationResponseEnum.Interested ? '200px !important' : '100%',
      minWidth: guest?.rsvp.invitationResponse === InvitationResponseEnum.Interested ? '200px !important' : '100%',
      maxWidth: guest?.rsvp.invitationResponse === InvitationResponseEnum.Interested ? '200px !important' : '100%',
    };
  }, [buttonProps, darkenCoefficent]);

  return { semiTransparentBackgroundColor, theme, familyActions, handleClick, guest, imgButtonSxProps };
};