import React from 'react';
import Box from '@mui/material/Box';
import { Typography, Paper, styled, useTheme, alpha, useMediaQuery } from '@mui/material';
import { useFamily } from '@/store/family';
import { GuestViewModel, RsvpEnum } from '@/types/api';
import RehearsalDinnerAttendance from '@/components/WeddingAttendanceRadios/RehearsalDinnerAttendance';
import { StephsActualFavoriteTypographyNoDrop, StephsStyledTypography } from '@/components/AttendanceButton/components/StyledComponents';
import { EventAvailable } from '@mui/icons-material';

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
  const isMobile = useMediaQuery('(max-width:375px)'); // iPhone SE size
  
  if (!family) return null;
  
  // Find if any guests are undecided
  const anyPending = family.guests.some(guest => guest.rsvp?.fourthOfJuly === RsvpEnum.Pending || !guest.rsvp?.fourthOfJuly);
  
  // Calculate aggregate status message
  const getMessage = () => {
    if (anyPending) {
      return "Let us know if you can make it to the 4th of July BBQ.";
    }
    
    const allAttending = family.guests.every(guest => guest.rsvp?.fourthOfJuly === RsvpEnum.Attending);
    const allDeclined = family.guests.every(guest => guest.rsvp?.fourthOfJuly === RsvpEnum.Declined);
    
    if (allAttending) {
      return "Great! We'll see you at a Potluck BBQ Dinner on the 4th of July. Don't forget to BYOB and fireworks that are legal in Virginia!";
    } else if (allDeclined) {
      return "We'll miss you at the 4th of July BBQ.";
    } else {
      return "Thanks for letting us know about your attendance to the 4th of July BBQ.";
    }
  };

  return (
    <>
      {/* Title section - only shown once */}
      {/* <TitlePaper elevation={3} sx={{ width: '100%', maxWidth: 600, mx: 'auto' }}>
        <Typography variant="h5" fontWeight="bold" sx={{ position: 'relative', zIndex: 2 }}>
          4th of July BBQ Dinner
        </Typography>
        <Typography variant="subtitle1" sx={{ position: 'relative', zIndex: 2 }}>
          Burgers & Dogs - BYOB
        </Typography>
      </TitlePaper> */}
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3,
          background: alpha(theme.palette.primary.main, 0.1),
          borderRadius: 1,
          py: 2,
          border: `1px dashed ${alpha(theme.palette.primary.main, 0.5)}`,
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'url("/textures/paper_texture.webp")',
            opacity: 0.1,
            pointerEvents: 'none',
            zIndex: 0,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0) 70%)',
            opacity: 0.2,
            pointerEvents: 'none',
            zIndex: 0,
          }
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'center', sm: 'flex-start' },
            justifyContent: 'space-between',
            width: '100%',
            mb: 1,
            px: 2,
          }}
        >
          <Box 
            id="4th-title"
            sx={{ 
              display: 'flex',
              flexDirection: 'column',
              alignItems: { xs: 'center', sm: 'flex-start' },
              position: 'relative',
              zIndex: 1,
              mb: 1,
              flex: '1 1 auto',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 1,
              }}
            >
              <EventAvailable 
                sx={{ 
                  mr: 1.5, 
                  color: theme.palette.primary.main,
                  fontSize: { xs: '1.8rem', sm: '2rem' },
                  filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.3))',
                }} 
              />
              <StephsActualFavoriteTypographyNoDrop
                variant="h5"
                fontSize={isMobile ? '1.2rem' : '1.5rem'}
                sx={{ 
                  my: 0, 
                  textAlign: 'center', 
                  letterSpacing: '0.05em',
                  fontWeight: 500,
                }}
              >
                4th of July: Potluck BBQ Dinner & Fireworks
              </StephsActualFavoriteTypographyNoDrop>
            </Box>
            <Typography
              variant="body2"
              component="p"
              sx={{ 
                color: alpha(theme.palette.secondary.main, 0.8),
                opacity: 0.8,
                position: 'relative',
                zIndex: 1,
                fontWeight: '800',
                textAlign: { xs: 'center', sm: 'left' },
                fontSize: { xs: '0.9rem', sm: '1.0rem' },
                mt: 0.5,
                pl: { sm: 3 },
              }}
            >
              Friday, July 4th
            </Typography>
            <Typography
              variant="body2"
              component="p"
              sx={{ 
                color: alpha('#FFFFF', 0.8),
                opacity: 0.8,
                position: 'relative',
                zIndex: 1,
                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                mt: 0.5,
                pl: { sm: 3 },
                textAlign: { xs: 'center', sm: 'left' },
              }}
            >
              Join us at the venue the day before for a potluck BBQ and fireworks!
            </Typography>
          </Box>
          <Paper
            id="4th-info"
            sx={{ 
              backgroundColor: alpha(theme.palette.primary.main, 0.2),
              padding: theme.spacing(1.5),
              borderRadius: 1,
              maxWidth: { xs: '90%', sm: '40%' },
              textAlign: 'left',
              boxShadow: theme.shadows[1],
              position: 'relative',
              zIndex: 1,
              ml: { sm: 2 },
              mt: { xs: 2, sm: 0 },
              alignSelf: { sm: 'stretch' },
            }}
          >
            <Typography
              variant="body2"
              component="p"
              sx={{ 
                color: alpha('#FFFFF', 0.8),
                opacity: 0.8,
                position: 'relative',
                zIndex: 1,
                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                mt: 0.5,
              }}
            >
              <strong>Please Bring:</strong>
              <ul>
                <li>Grill items, buns, and sides to share</li>
                <li>BYOB</li>
                <li>Fireworks (legal in Virginia)</li>
                <li>Instruments</li>  
              </ul>
            </Typography>
          </Paper>
        </Box>
      </Box>
      
      {/* Guest attendance buttons */}
      {family.guests.map((guest: GuestViewModel) => (
        <Box key={guest.guestId} sx={{ mb: 0, width: '100%' }}>
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