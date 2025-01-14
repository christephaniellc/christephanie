import {Box, ButtonBase, Typography, useTheme} from '@mui/material';
import React, {useEffect} from 'react';
import {styled} from '@mui/material/styles';
import {InvitationResponseEnum} from '@/types/api';
import WeddingAttendanceRadios from '@/components/WeddingAttendanceRadios';
import StickFigureIcon from '@/components/StickFigureIcon';
import Countdowns from '@/components/Countdowns';
import { useRecoilState, useRecoilValue } from 'recoil';
import {guestSelector} from "@/store/family";
import { userState } from '@/store/user';

interface AttendanceButtonProps {
  guestId: string;
}

export const AttendanceButton = ({ guestId }: AttendanceButtonProps) => {
  const [interested, setInterested] = React.useState<InvitationResponseEnum>(InvitationResponseEnum.Pending);
  const [guest, setGuest] = useRecoilState(guestSelector(guestId));
  const user = useRecoilValue(userState);

  const setUserIsAttending = (guestId: string, interested: InvitationResponseEnum) => {
    setGuest({...guest, rsvp: {invitationResponse: interested}});
  }

  const theme = useTheme();

  useEffect(() => {
    if (guest && guest.rsvp && guest.rsvp.invitationResponse) {
      setInterested(guest.rsvp.invitationResponse);
    }
  }, [guest]);

  if (!guest || !guest.guestId) {
    return <Typography variant="caption">No guest found</Typography>;
  }

  console.log('guest', guest);
  console.log('user', user);

  const buttonProps = (interested: InvitationResponseEnum) => {
    switch (interested) {
      case InvitationResponseEnum.Interested:
        return {color: 'primary', fontSize: 'large', border: `2px solid ${theme.palette.primary.main}`};
      case InvitationResponseEnum.Declined:
        return {color: 'error', fontSize: 'small', border: '2px dashed red'};
      case InvitationResponseEnum.Pending:
        return {color: 'default', fontSize: 'medium', border: `2px solid ${theme.palette.secondary.main}`};
    }
  };



  return (
    <ImageButton
      onClick={() => {
        if (!guest || !guest.guestId) return;
        if (interested === InvitationResponseEnum.Interested) {
          setUserIsAttending(guest.guestId, InvitationResponseEnum.Declined);
        } else if (interested === InvitationResponseEnum.Declined) {
          setUserIsAttending(guest.guestId, InvitationResponseEnum.Pending);
        } else {
          setUserIsAttending(guest.guestId,InvitationResponseEnum.Interested);
        }
      }}
      sx={{
        fontSize: buttonProps(interested)?.fontSize || 'medium',
        border: buttonProps(interested)?.border || `2px solid ${theme.palette.secondary.main}`,
        color: buttonProps(interested)?.color || 'default',
        // borderRadius: 16,
        boxShadow: 1,
        '&:hover': {
          boxShadow: 3,
        },
        position: 'relative',
        marginBottom: theme.spacing(2),
        mx: theme.spacing(1),
      }}

    >
      <Box position="absolute" top={20} right={15}>
        <WeddingAttendanceRadios interested={interested} />
      </Box>
      <Box id="spacer" height={20} />
      <Box position="relative" mb={1} flexDirection="row" alignItems="flex-start" display="flex"
           mx={interested === 'Interested' ? 'auto' : 0}>
        <StickFigureIcon hidden={interested === 'Declined'}
                         fontSize={interested === 'Interested' && 'large' || 'medium'} />
        <StickFigureIcon fontSize={'large'} hidden={true} />
      </Box>
      <CountdownMessage>
        <Countdowns event="Invitation" interested={interested} />
      </CountdownMessage>
      {/*{guest.guestId}*/}
      <Typography variant="h6" sx={{ mx: 'auto' }}>
        {guest.guestId === user.guestId ? 'You' : guest?.firstName}
      </Typography>
    </ImageButton>
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
    width: '45% !important', // Overrides inline-style
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
  right: "-90%",
  top: "40px",
  [theme.breakpoints.up('sm')]: {
    right: 0,
    top: "110%",
  },
}));