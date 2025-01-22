import { Box, ButtonBase, darken, Slider, Typography, useTheme } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';
import { styled } from '@mui/material/styles';
import { AgeGroupEnum, InvitationResponseEnum } from '@/types/api';
import WeddingAttendanceRadios from '@/components/WeddingAttendanceRadios';
import StickFigureIcon from '@/components/StickFigureIcon';
import Countdowns from '@/components/Countdowns';
import { useRecoilState } from 'recoil';
import { guestSelector, useFamily } from '@/store/family';
import { useAuth0 } from '@auth0/auth0-react';
import { Mark } from '@mui/material/Slider/useSlider.types';

interface AttendanceButtonProps {
  guestId: string;
}

export const AttendanceButton = ({ guestId }: AttendanceButtonProps) => {
  const [guest, setGuest] = useRecoilState(guestSelector(guestId));
  const { user } = useAuth0();
  const [familyUnit, familyActions] = useFamily();

  const isPending = familyActions.updateFamilyMutation.isPending;
  const darkenCoefficent = isPending ? .5 : 0;

  const setUserIsAttending = (guestId: string, interested: InvitationResponseEnum) => {
    console.log('sending request as', interested);
    familyActions.updateFamilyGuest(guestId, interested);
  };

  const theme = useTheme();

  const interested = useMemo(() => guest?.rsvp?.invitationResponse || InvitationResponseEnum.Pending, [guest]);

  const buttonProps = useMemo(() => {
    switch (interested) {
      case InvitationResponseEnum['Interested']:
        console.log('interested yay', InvitationResponseEnum.Interested);
        return {
          color: 'primary',
          fontSize: 'large',
          border: `2px solid ${darken(theme.palette.primary.main, darkenCoefficent)}`,
        };
      case InvitationResponseEnum.Declined:
        console.log('error red', InvitationResponseEnum.Declined);
        return {
          color: 'error',
          fontSize: 'small',
          border: `2px dashed ${darken(theme.palette.error.main, darkenCoefficent)}`,
        };
      case InvitationResponseEnum.Pending:
        console.log('pending yellow', InvitationResponseEnum.Pending);
        return {
          color: 'default',
          fontSize: 'medium',
          border: `2px solid ${darken(theme.palette.secondary.main, darkenCoefficent)}`,
        };
      default:
        return { color: 'default', fontSize: 'medium', border: `2px solid ${theme.palette.info.main}` };

    }
  }, [interested, theme.palette.primary.main, theme.palette.secondary.main, darkenCoefficent]);


  const [ageGroup, setAgeGroup] = useState<AgeGroupEnum>(AgeGroupEnum.Adult);
  const toSliderValue = (ageGroup: AgeGroupEnum) => Object.values(AgeGroupEnum).indexOf(ageGroup);
  const toAgeGroup = useCallback((value: number) => Object.values(AgeGroupEnum)[value] as AgeGroupEnum, []);


  return (
    <Box display="flex" flexGrow={1} mx="auto" width={250}>
      <ImageButton
        disabled={familyActions.updateFamilyMutation.isPending}
        onClick={() => {
          if (!guest || !guest.guestId) return;
          if (interested === InvitationResponseEnum.Interested) {
            setUserIsAttending(guest.guestId, InvitationResponseEnum.Declined);
          } else if (interested === InvitationResponseEnum.Declined) {
            setUserIsAttending(guest.guestId, InvitationResponseEnum.Pending);
          } else {
            setUserIsAttending(guest.guestId, InvitationResponseEnum.Interested);
          }
        }}
        sx={{
          fontSize: buttonProps.fontSize,
          border: buttonProps.border,
          color: darken(theme.palette.text.primary, darkenCoefficent),
          // borderRadius: 16,
          boxShadow: 1,
          '&:hover': {
            boxShadow: 3,
          },
          position: 'relative',
          marginBottom: theme.spacing(2),
          mr: theme.spacing(1),
        }}

      >
        <Box position="absolute" top={20} right={15}>
          <WeddingAttendanceRadios interested={interested} isMe={guest?.auth0Id === user?.sub} />
        </Box>
        <Box id="spacer" height={20} />
        <Box position="relative" mb={1} flexDirection="row" alignItems="flex-start" display="flex"
             mx={interested === 'Interested' ? 'auto' : 0}>
          <StickFigureIcon hidden={interested === 'Declined'}
                           fontSize={interested === 'Interested' && 'large' || 'medium'}
                           loading={familyActions.updateFamilyMutation.isPending} />
          <StickFigureIcon fontSize={'large'} hidden={true} />
        </Box>
        <CountdownMessage>
          <Countdowns event="Invitation" interested={interested} />
        </CountdownMessage>
        <Typography variant="h6" sx={{ mx: 'auto' }}>
          {guest?.auth0Id === user?.sub ? 'You' : guest?.firstName}
        </Typography>
      </ImageButton>
    </Box>
  );
};

const ImageButton = styled(ButtonBase)(({ theme }) => ({
  position: 'relative',
  height: 'auto',
  width: 200,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
  },
  '&:hover, &.Mui-focusVisible': {
    zIndex: 1,
    '& .MuiImageBackdrop-root': {
      opacity: 0.15,
    },
    '& .MuiImageMarked-root': {
      opacity: 0,
    },
    '& .MuiTypography-root': {
      // border: '4px solid currentColor',
    },
  },
}));

const CountdownMessage = styled(Typography)(({ theme }) => ({
  color: theme.palette.error.main,
  fontWeight: 700,
  fontSize: '1.5rem',
  position: 'absolute',
  right: '-90%',
  top: '40px',
  [theme.breakpoints.up('sm')]: {
    right: 0,
    top: '110%',
  },
}));