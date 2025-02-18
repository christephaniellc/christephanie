import { Box, ButtonProps, darken, Typography, useTheme } from '@mui/material';
import React, { useCallback, useMemo } from 'react';
import { styled } from '@mui/material/styles';
import { InvitationResponseEnum } from '@/types/api';
import { useRecoilValue } from 'recoil';
import { guestSelector, useFamily } from '@/store/family';
import LargeAttendanceButton from '@/components/AttendanceButton/ClientSideImportedComponents/LargeAttendanceButton';
import AgeSelector from '@/components/AgeSelector';
import Button from '@mui/material/Button';

interface AttendanceButtonProps {
  guestId: string;
}

export const AttendanceButton = ({ guestId }: AttendanceButtonProps) => {
  const guest = useRecoilValue(guestSelector(guestId));
  const theme = useTheme();
  const [_, familyActions] = useFamily();

  const isPending = familyActions.updateFamilyMutation.isPending;
  const darkenCoefficent = isPending ? .5 : 0;

  const setUserIsAttending = (guestId: string, interested: InvitationResponseEnum) => {
    familyActions.updateFamilyGuestInterest(guestId, interested);
  };

  const interested = useMemo(() => guest?.rsvp?.invitationResponse || InvitationResponseEnum.Pending, [guest]);

  const handleClick = useCallback(() => {
    if (!guest || !guest.guestId || !interested) return;
    if (interested === InvitationResponseEnum.Interested) {
      setUserIsAttending(guest.guestId, InvitationResponseEnum.Declined);
    } else if (interested === InvitationResponseEnum.Declined) {
      setUserIsAttending(guest.guestId, InvitationResponseEnum.Pending);
    } else {
      setUserIsAttending(guest.guestId, InvitationResponseEnum.Interested);
    }
  }, [guest, interested, setUserIsAttending]);


  const buttonProps = useMemo(() => {
    switch (interested) {
      case InvitationResponseEnum['Interested']:
        return {
          color: 'primary',
          fontSize: 'large',
          border: `2px solid ${darken(theme.palette.primary.main, darkenCoefficent)}; border-right-style: dotted; elevation:5;`,
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
  }, [interested, theme.palette.primary.main, theme.palette.secondary.main, darkenCoefficent]);

  // todo: move these to an age selector component
  // const [ageGroup, setAgeGroup] = useState<AgeGroupEnum>(AgeGroupEnum.Adult);
  // const toSliderValue = (ageGroup: AgeGroupEnum) => Object.values(AgeGroupEnum).indexOf(ageGroup);
  // const toAgeGroup = useCallback((value: number) => Object.values(AgeGroupEnum)[value] as AgeGroupEnum, []);

  const imgButtonSxProps = useMemo(() => {
    return {
      fontSize: buttonProps.fontSize,
      border: buttonProps.border,
      color: darken(theme.palette.text.primary, darkenCoefficent),
      width: interested === InvitationResponseEnum.Interested ? '150px !important' : '100%',
      minWidth: interested === InvitationResponseEnum.Interested ? '150px !important' : '100%',
      maxWidth: interested === InvitationResponseEnum.Interested ? '150px !important' : '100%',
    };
  }, [buttonProps.fontSize, buttonProps.border, theme.palette.text.primary, darkenCoefficent, interested]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'no-wrap',
        backdropFilter: 'blur(8px)',
        backgroundColor: 'rgba(0,0,0,0.5)',
        width: '100%',
        mr: 0,
        [theme.breakpoints.up('sm')]: {
          mr: 'auto',
        },
      }}
    >
      <Button
        disabled={familyActions.updateFamilyMutation.isPending}
        onClick={handleClick}
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
          height: 175,
          ...imgButtonSxProps,
          [theme.breakpoints.up('sm')]: {
            minWidth: 250,
            maxWidth: 250,
          },
          width: interested === InvitationResponseEnum.Interested ? '50% !important' : '100%',
        }}

      >
        <Box display="flex" alignItems="center">
          <LargeAttendanceButton guestId={guestId} isPending={familyActions.updateFamilyMutation.isPending}
                                 error={familyActions.updateFamilyMutation.error} />
        </Box>

      </Button>
      {interested === InvitationResponseEnum.Interested && <AgeSelector guestId={guestId} />}
      {/*  <Box alignContent="center"*/}
      {/*       sx={{ imgButtonSxProps, borderWidth: 2 }}*/}
      {/*  >*/}
      {/*    <StephsFavoriteTypography>*/}
      {/*      <Countdowns event="Wedding" interested={interested} guestId={guestId} />*/}
      {/*    </StephsFavoriteTypography>*/}
      {/*  </Box>*/}
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