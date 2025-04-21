import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { GuestViewModel, NotificationPreferenceEnum } from '@/types/api';
import { useFamily } from '@/store/family';
import { 
  useTheme, 
  useMediaQuery, 
  alpha, 
  Paper,
  styled,
  Card,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
  Divider,
  Button,
  Icon,
  Tooltip,
  Alert
} from '@mui/material';
import { 
  ConnectWithoutContact,
  Email,
  Phone,
  VerifiedUser,
  ErrorOutline,
  CheckCircle,
  Info
} from '@mui/icons-material';
import { useAppLayout } from '@/context/Providers/AppState/useAppLayout';
import { StephsActualFavoriteTypographyNoDrop } from '@/components/AttendanceButton/AttendanceButton';
import CommunicationPreferences from '@/components/CommunicationPreferences/CommunicationPreferences';
import { useAuth0 } from '@auth0/auth0-react';
import { isFeatureEnabled } from '@/config';

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

// Styled card for preferences placeholder
const StyledCard = styled(Card)(({ theme }) => ({
  background: alpha(theme.palette.background.paper, 0.9),
  backdropFilter: 'blur(10px)',
  borderRadius: theme.shape.borderRadius * 2,
  overflow: 'visible',
  transition: 'all 0.3s ease',
  marginBottom: theme.spacing(3),
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  boxShadow: theme.shadows[3],
}));

export const CommunicationSection: React.FC = () => {
  console.log("YAY - CommunicationSection component is being rendered");
  
  // Force this component to be very visible
  React.useEffect(() => {
    console.log("🎉🎉🎉 COMMUNICATION SECTION MOUNTED 🎉🎉🎉");
    return () => console.log("COMMUNICATION SECTION UNMOUNTED");
  }, []);
  
  const [family, familyActions] = useFamily();
  const theme = useTheme();
  const { screenWidth } = useAppLayout();
  const isMobile = useMediaQuery('(max-width:375px)'); // iPhone SE size
  const { user } = useAuth0();
  
  // Force a refresh to ensure we have the latest data
  useEffect(() => {
    familyActions.getFamily();
  }, []);

  if (!family?.guests?.length) {
    return (
      <Box sx={{ width: '100%', py: 2 }}>
        <Typography variant="h5" component="p" gutterBottom align="center">
          Loading guest information...
        </Typography>
      </Box>
    );
  }

  // Find current user's guest record
  const currentUserGuest = family.guests.find(guest => 
    guest.auth0Id && guest.auth0Id === user?.sub
  );

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
          <ConnectWithoutContact
            sx={{
              mr: 1.5,
              color: theme.palette.primary.main,
              fontSize: { xs: '1.8rem', sm: '2rem' },
              filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.3))',
            }} />
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
            How would you like to hear from us?
          </StephsActualFavoriteTypographyNoDrop>
        </Box>
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
            px: 2,
            textAlign: 'center',
          }}
        >
          Choose how you would like to receive updates about our wedding.
        </Typography>      
      </Box>
      
      <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto', py: 2 }}>
        {currentUserGuest ? (
          // Display for current user
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
              {currentUserGuest.firstName}
            </Typography>
            <CommunicationPreferences guestId={currentUserGuest.guestId} showTitle={false} />
          </Box>
        ) : (
          // Placeholder for when no guest matches current user
          <Alert 
            severity="info" 
            sx={{ mb: 3 }}
            variant="outlined"
          >
            Communication preferences are only available for your own account. Please log in with the correct account to manage your preferences.
          </Alert>
        )}
        
        {/* Display read-only view of other guests */}
        {family.guests
          .filter(guest => guest.auth0Id !== user?.sub)
          .map((guest: GuestViewModel) => (
            <Box key={guest.guestId} sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                {guest.firstName}
              </Typography>
              
              <StyledCard>
                <Box sx={{ p: 2, pb: 1, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                  <Typography variant="subtitle1" fontWeight="500" color="secondary">
                    Communication Preferences
                  </Typography>
                </Box>
                
                <List disablePadding>
                  <ListItem>
                    <ListItemIcon>
                      <Email color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Email Communication" 
                      secondary={guest.email?.maskedValue || "No email provided"}
                    />
                    {guest.preferences?.notificationPreference?.includes(NotificationPreferenceEnum.Email) ? (
                      <CheckCircle color="success" sx={{ ml: 1 }} />
                    ) : (
                      <Info color="disabled" sx={{ ml: 1 }} />
                    )}
                  </ListItem>
                  
                  <Divider variant="inset" component="li" />
                  
                  <ListItem>
                    <ListItemIcon>
                      <Phone color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Text Communication" 
                      secondary={guest.phone?.maskedValue || "No phone number provided"}
                    />
                    {guest.preferences?.notificationPreference?.includes(NotificationPreferenceEnum.Text) ? (
                      <CheckCircle color="success" sx={{ ml: 1 }} />
                    ) : (
                      <Info color="disabled" sx={{ ml: 1 }} />
                    )}
                  </ListItem>
                  <ListItem
                    sx={{                      
                      background: alpha(theme.palette.primary.main, 0.1),
                      borderRadius: 1,
                      py: 0,
                      border: `1px dashed ${alpha(theme.palette.primary.main, 0.5)}`,
                    }}
                  >                    
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        textAlign: 'center', 
                        mt: 2, 
                        mb: 2,
                        opacity: 1.0, 
                        fontStyle: 'italic',
                        px: 2
                      }}
                    >
                      Note: Communication preferences can only be managed by the account owner
                    </Typography>
                  </ListItem>
                </List>
              </StyledCard>
            </Box>
          ))}
      </Box>
    </>
  );
};

export default CommunicationSection;