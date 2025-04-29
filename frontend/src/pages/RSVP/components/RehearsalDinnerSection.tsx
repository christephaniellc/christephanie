import React from 'react';
import Box from '@mui/material/Box';
import { Typography, Paper, styled, useTheme, alpha, useMediaQuery } from '@mui/material';
import { useFamily } from '@/store/family';
import { GuestViewModel, RsvpEnum } from '@/types/api';
import RehearsalDinnerAttendance from '@/components/WeddingAttendanceRadios/RehearsalDinnerAttendance';
import { StephsActualFavoriteTypographyNoDrop, StephsStyledTypography } from '@/components/AttendanceButton/components/StyledComponents';
import { EventAvailable } from '@mui/icons-material';

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
  const isXsScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isSmallMobile = useMediaQuery('(max-width:375px)'); // iPhone SE size
  
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
          py: { xs: 1.5, sm: 2 },
          border: `1px dashed ${alpha(theme.palette.primary.main, 0.5)}`,
          overflow: 'hidden',
          width: '100%',
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
            mb: { xs: 0.5, sm: 1 },
            px: { xs: 1, sm: 2 },
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
              mb: { xs: 0.5, sm: 1 },
              flex: '1 1 auto',
              width: '100%',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 0.5,
                flexWrap: 'wrap',
                justifyContent: { xs: 'center', sm: 'flex-start' },
                width: '100%',
              }}
            >
              <EventAvailable 
                sx={{ 
                  mr: { xs: 0.5, sm: 10.5 }, 
                  color: theme.palette.primary.main,
                  fontSize: { xs: '1.3rem', sm: '1.8rem', md: '2rem' },
                  filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.3))',
                }} 
              />
              <StephsActualFavoriteTypographyNoDrop
                variant={isXsScreen ? "h6" : "h5"}
                fontSize={isSmallMobile ? '1rem' : isXsScreen ? '1.1rem' : '1.5rem'}
                sx={{ 
                  my: 0, 
                  textAlign: { xs: 'center', sm: 'left' }, 
                  letterSpacing: { xs: '0.03em', sm: '0.05em' },
                  fontWeight: 500,
                  lineHeight: { xs: 1.2, sm: 1.5 },
                  // Give it full width on mobile to ensure proper centering
                  ...(isXsScreen && {
                    width: '100%',
                    mt: 0.5,
                  }),
                }}
              >
                4th of July: Potluck BBQ{isXsScreen ? <br /> : ' '}& Fireworks
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
                fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1.0rem' },
                mt: 0.5,
                pl: { xs: 0, sm: 3 },
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
                fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.9rem' },
                mt: 0.5,
                pl: { xs: 0, sm: 3 },
                textAlign: { xs: 'center', sm: 'left' },
                px: { xs: 1, sm: 0 },
              }}
            >
              Join us at the venue the day before for a potluck BBQ and fireworks!
            </Typography>
          </Box>
          <Paper
            id="4th-info"
            sx={{ 
              backgroundColor: alpha(theme.palette.primary.main, 0.2),
              padding: { xs: theme.spacing(1), sm: theme.spacing(1.5) },
              borderRadius: 1,
              width: { xs: '100%', sm: 'auto' },
              maxWidth: { xs: '100%', sm: '40%' },
              textAlign: 'left',
              boxShadow: theme.shadows[1],
              position: 'relative',
              zIndex: 1,
              ml: { sm: 2 },
              mt: { xs: 1.5, sm: 0 },
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
                fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.9rem' },
                mt: { xs: 0, sm: 0.5 },
              }}
            >
              <span style={{
                  color: theme.palette.secondary.main,
                  fontWeight: 'bold',
                }}>Please Bring:</span>
              <ul style={{ 
                margin: isXsScreen ? '0.25rem 0 0.25rem 1.25rem' : '0.5rem 0 0.5rem 1.5rem', 
                paddingLeft: 0,
                lineHeight: isXsScreen ? 1.3 : 1.5
              }}>
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
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        width: '100%',
        gap: { xs: 0.5, sm: 1 }
      }}>
        {family.guests.map((guest: GuestViewModel) => (
          <Box key={guest.guestId} sx={{ width: '100%' }}>
            <RehearsalDinnerAttendance 
              guestId={guest.guestId} 
              showHeader={false} 
            />
          </Box>
        ))}
      </Box>
      
      {/* Bottom message - only shown once */}
      <InfoBox sx={{
        padding: { xs: theme.spacing(1.5), sm: theme.spacing(2) },
        fontSize: { xs: '0.85rem', sm: '1rem' },
        minHeight: { xs: '60px', sm: '80px' },
      }}>
        <Typography 
          variant={isXsScreen ? "body2" : "body1"} 
          color={anyPending ? 'info.main' : 'success.main'}
          sx={{ 
            lineHeight: 1.2,
            fontSize: { xs: '0.85rem', sm: '1rem' },
            px: { xs: 1, sm: 2 }
          }}
        >
          {getMessage()}
        </Typography>
      </InfoBox>
    </>
  );
};

export default RehearsalDinnerSection;