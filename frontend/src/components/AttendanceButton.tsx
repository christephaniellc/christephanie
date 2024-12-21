import { Box, ButtonBase, Typography, useTheme } from '@mui/material';
import StickFigureIcon from './StickFigureIcon';
import React, { useEffect } from 'react';
import { styled } from '@mui/material/styles';
import { useRsvpContext } from '../context/Rsvp/RsvpContext';
import { InvitationResponse } from '../types/types';
import WeddingAttendanceRadios from './WeddingAttendanceRadios';
import { DaysUntil } from './DaysUntil';
import AddressAutocomplete from './AddressAutocomplete';

interface AttendanceButtonProps {
  guestId: string;
}

export const AttendanceButton = ({ guestId }: AttendanceButtonProps) => {
  const { matchingUsers, setFamilyInterested, familyInterested } = useRsvpContext();
  const theme = useTheme();
  const guest = matchingUsers?.find((user) => user.guestId === guestId);
  const [interested, setInterested] = React.useState<InvitationResponse>('Pending');

  useEffect(() => {
    // setFamilyInterested(matchingUsers?.some((user) => user.rsvp?.wedding === 'Attending') || false);
    setFamilyInterested(interested === "Interested");
  }, [interested]);

  useEffect(() => {
    if (guest && guest.rsvp) {
      switch (guest.rsvp.wedding) {
        case 'Attending':
          setInterested('Interested');
          break;
        case 'Declined':
          setInterested('Declined');
          break;
        default:
          setInterested('Pending');
          break;
      }
    }
  }, [guest]);

  if (!guest) {
    return <Typography variant="caption">No guest found</Typography>;
  }

  const buttonProps = {
    'Interested': { color: 'primary', fontSize: 'large', border: `2px solid ${theme.palette.primary.main}` },
    'Declined': { color: 'error', fontSize: 'small', border: '2px dashed red' },
    'Pending': { color: 'default', fontSize: 'medium', border: `2px solid ${theme.palette.secondary.main}` },
  } as const;

  return (
    <ImageButton
      onClick={() => {
        if (interested === 'Interested') {
          setInterested('Declined');
        } else if (interested === 'Declined') {
          setInterested('Pending');
        } else {
          setInterested('Interested');
        }
      }}
      sx={{
        fontSize: buttonProps[interested].fontSize,
        border: buttonProps[interested].border,
        color: buttonProps[interested].color,
        // borderRadius: 16,
        boxShadow: 1,
        '&:hover': {
          boxShadow: 3,
        },
        position: 'relative',
        marginBottom: theme.spacing(2),
        marginRight: theme.spacing(2),
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
        {interested === "Pending" && <DaysUntil event="Invitation" />}
        {interested === "Interested" && <AddressAutocomplete />}
      </CountdownMessage>
      <Typography variant="h6" sx={{ mx: 'auto' }}>{guest?.firstName}</Typography>
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