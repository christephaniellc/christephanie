import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { alpha, useTheme, useMediaQuery } from '@mui/material';
import { RestaurantMenu } from '@mui/icons-material';
import { useFamily } from '@/store/family';
import { InvitationResponseEnum } from '@/types/api';
import FoodAllergies from '@/components/FoodPreferences/FoodAllergies';
import { StephsStyledTypography } from '@/components/AttendanceButton/components/StyledComponents';
import { useBoxShadow } from '@/hooks/useBoxShadow';

export const FoodAllergiesSection: React.FC = () => {
  const [family] = useFamily();
  const theme = useTheme();
  const { boxShadow } = useBoxShadow();
  const isMobile = useMediaQuery('(max-width:375px)'); // iPhone SE size

  if (!family?.guests?.length) {
    return (
      <Box sx={{ width: '100%', py: 2 }}>
        <Typography variant="h5" component="p" gutterBottom align="center">
          Loading guest information...
        </Typography>
      </Box>
    );
  }

  // Filter to show only attending guests
  const attendingGuests = family.guests.filter(
    guest => guest.rsvp?.invitationResponse === InvitationResponseEnum.Interested
  );

  return (
    <Box sx={{ width: '100%', py: 2 }}>
      <Card 
        variant="outlined" 
        sx={{ 
          mb: 4, 
          boxShadow: 3,
          background: 'rgba(0,0,0,0.05)',
          backdropFilter: 'blur(10px)',
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
          overflow: 'hidden',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: 'url("/textures/paper_texture.webp")',
            backgroundBlendMode: 'overlay',
            opacity: 0.05,
            pointerEvents: 'none',
          }
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
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
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                zIndex: 1,
                mb: 1,
              }}
            >
              <RestaurantMenu 
                sx={{ 
                  mr: 1.5, 
                  color: theme.palette.primary.main,
                  fontSize: { xs: '1.8rem', sm: '2rem' },
                  filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.3))',
                }} 
              />
              <StephsStyledTypography
                variant="h5"
                component="h2"
                textColor={theme.palette.primary.main}
                shadowSize={1.5}
                fontSize="1.2rem"
                sx={{ 
                  my: 0, 
                  textAlign: 'center', 
                  letterSpacing: '0.05em',
                  fontWeight: 500,
                  fontSize: { xs: '1.2rem', sm: '1.5rem' },
                }}
              >
                Which foods cause you distress?
              </StephsStyledTypography>
            </Box>
            <Typography
              variant="body2"
              component="p"
              sx={{ 
                color: alpha(theme.palette.primary.main, 0.8),
                opacity: 0.8,
                position: 'relative',
                zIndex: 1,
                fontStyle: 'italic',
                textAlign: 'center',
                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                mt: 0.5,
                px: 2,
              }}
            >
              Please let us know about any allergies or dietary restrictions
            </Typography>
          </Box>
          
          <List sx={{ width: '100%', px: 0 }}>
            {attendingGuests.length === 0 ? (
              <Typography variant="body1" align="center" sx={{ my: 3 }}>
                No guests are currently marked as attending.
              </Typography>
            ) : (
              attendingGuests.map((guest, index) => (
                <ListItem 
                  key={guest.guestId} 
                  sx={{ 
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    py: 3,
                    px: 0,
                    borderBottom: index < attendingGuests.length - 1 
                      ? `1px solid ${alpha(theme.palette.divider, 0.1)}` 
                      : 'none',
                  }}
                >
                  <Typography 
                    variant="h6" 
                    component="div"
                    sx={{ 
                      mb: 2,
                      fontWeight: 'bold',
                      color: theme.palette.text.primary,
                      textAlign: 'left',
                      width: '100%',
                      fontSize: isMobile ? '1.2rem' : '1.3rem',
                    }}
                  >
                    {guest.firstName} {guest.lastName}
                  </Typography>
                  
                  <Box sx={{ width: '100%' }}>
                    <FoodAllergies guestId={guest.guestId} />
                  </Box>
                </ListItem>
              ))
            )}
          </List>
          
          <Box 
            sx={{ 
              mt: { xs: 2, sm: 3 }, 
              p: { xs: 1.5, sm: 2 }, 
              borderRadius: 1, 
              background: 'rgba(0,0,0,0.45)', 
              backdropFilter: 'blur(10px)',
              minHeight: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundImage: 'url("/textures/paper_texture.webp")',
                backgroundBlendMode: 'overlay',
                opacity: 0.05,
                pointerEvents: 'none',
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '1px',
                background: `linear-gradient(90deg, 
                  transparent 0%, 
                  ${alpha(theme.palette.primary.main, 0.3)} 20%, 
                  ${alpha(theme.palette.primary.main, 0.6)} 50%,
                  ${alpha(theme.palette.primary.main, 0.3)} 80%, 
                  transparent 100%)`,
                boxShadow: `0 0 8px 1px ${alpha(theme.palette.primary.main, 0.3)}`,
              }
            }}
          >
            <Box component="div" sx={{ position: 'relative', zIndex: 1, px: 1 }}>
              <Typography 
                variant="body1" 
                color="primary.light" 
                align="center"
                sx={{ 
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  lineHeight: 1.5,
                  fontWeight: 300,
                  letterSpacing: '0.02em',
                  textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                }}
              >
                We want to ensure everyone can enjoy the celebration - your dietary needs are important to us.
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default FoodAllergiesSection;