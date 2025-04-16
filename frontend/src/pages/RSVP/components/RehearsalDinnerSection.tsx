import React from 'react';
import Box from '@mui/material/Box';
import { Typography, Paper, styled, useTheme } from '@mui/material';
import { useFamily } from '@/store/family';
import { GuestViewModel, RsvpEnum } from '@/types/api';
import RehearsalDinnerAttendance from '@/components/WeddingAttendanceRadios/RehearsalDinnerAttendance';

const TitlePaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(3),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  borderRadius: theme.spacing(1),
  textAlign: 'center',
  position: 'relative',
  overflow: 'hidden',
  boxShadow: theme.shadows[5],
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.1) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.1) 75%, transparent 75%, transparent)',
    backgroundSize: '10px 10px',
    zIndex: 1,
  },
}));

const InfoBox = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  textAlign: 'center',
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[2],
  minHeight: '80px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(4),
}));

export const RehearsalDinnerSection: React.FC = () => {
  const [family] = useFamily();
  const theme = useTheme();
  
  if (!family) return null;
  
  // Find if any guests are undecided
  const anyPending = family.guests.some(guest => guest.rsvp?.fourthOfJuly === RsvpEnum.Pending || !guest.rsvp?.fourthOfJuly);
  
  // Calculate aggregate status message
  const getMessage = () => {
    if (anyPending) {
      return "Let us know if you can make it to the 4th of July Rehearsal Dinner.";
    }
    
    const allAttending = family.guests.every(guest => guest.rsvp?.fourthOfJuly === RsvpEnum.Attending);
    const allDeclined = family.guests.every(guest => guest.rsvp?.fourthOfJuly === RsvpEnum.Declined);
    
    if (allAttending) {
      return "Great! We'll see you at the Rehearsal Dinner on the 4th of July. Don't forget to BYOB!";
    } else if (allDeclined) {
      return "We'll miss you at the Rehearsal Dinner.";
    } else {
      return "Thanks for letting us know about your attendance to the Rehearsal Dinner.";
    }
  };

  return (
    <>
      {/* Title section - only shown once */}
      <TitlePaper elevation={3} sx={{ width: '100%', maxWidth: 600, mx: 'auto' }}>
        <Typography variant="h5" fontWeight="bold" sx={{ position: 'relative', zIndex: 2 }}>
          4th of July Rehearsal Dinner
        </Typography>
        <Typography variant="subtitle1" sx={{ position: 'relative', zIndex: 2 }}>
          Burgers & Dogs - BYOB
        </Typography>
      </TitlePaper>
      
      {/* Guest attendance buttons */}
      {family.guests.map((guest: GuestViewModel) => (
        <Box key={guest.guestId} sx={{ mb: 3, width: '100%' }}>
          <RehearsalDinnerAttendance 
            guestId={guest.guestId} 
            showHeader={false} 
          />
        </Box>
      ))}
      
      {/* Bottom message - only shown once */}
      <InfoBox>
        <Typography 
          variant="body1" 
          color={anyPending ? 'info.main' : 'success.main'}
          sx={{ lineHeight: 1.2 }}
        >
          {getMessage()}
        </Typography>
      </InfoBox>
    </>
  );
};

export default RehearsalDinnerSection;