import { Box, ButtonProps, darken, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo } from 'react';
import { styled } from '@mui/material/styles';
import { GuestDto, InvitationResponseEnum } from '@/types/api';
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

  // const darkenCoefficent = useMemo(() => familyActions.patchFamilyGuestMutation.isPending ? .5 : 0, [familyActions.patchFamilyGuestMutation.isPending]);
  const darkenCoefficent = 0;
  const setUserIsAttending = (interestedResponse: InvitationResponseEnum) => {
    console.log('setting user is attending');

    familyActions.patchFamilyGuestMutation.mutate({
      updatedGuest: {
        guestId: guestId,
        rsvp: { ...guest.rsvp, invitationResponse: interestedResponse },
      },
    });
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
  }, [guest]);

  const imgButtonSxProps = useMemo(() => {
    console.log('imgButtonSxPropsing for ', guest?.rsvp.invitationResponse);
    return {
      fontSize: buttonProps.fontSize,
      border: buttonProps.border,
      color: darken(theme.palette.text.primary, darkenCoefficent),
      width: guest?.rsvp.invitationResponse === InvitationResponseEnum.Interested ? '150px !important' : '100%',
      minWidth: guest?.rsvp.invitationResponse === InvitationResponseEnum.Interested ? '150px !important' : '100%',
      maxWidth: guest?.rsvp.invitationResponse === InvitationResponseEnum.Interested ? '150px !important' : '100%',
    };
  }, [buttonProps, darkenCoefficent]);

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
        disabled={familyActions.patchFamilyGuestMutation.isPending || familyActions.getFamilyUnitQuery.isFetching}
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
          height: 175,
          ...imgButtonSxProps,
          [theme.breakpoints.up('sm')]: {
            minWidth: 250,
            maxWidth: 250,
          },
          width: guest?.rsvp.invitationResponse === InvitationResponseEnum.Interested ? '50% !important' : '100%',
        }}

      >
        <Box display="flex" alignItems="center">
          {guest &&
            <LargeAttendanceButton guestId={guest.guestId} isPending={familyActions.updateFamilyMutation.isPending}
                                   error={familyActions.updateFamilyMutation.error} />}
        </Box>

      </Button>
      {guest?.rsvp.invitationResponse === InvitationResponseEnum.Interested && <AgeSelector guestId={guest?.guestId} />}
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