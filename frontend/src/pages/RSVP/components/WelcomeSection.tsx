import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import { GuestViewModel, InvitationResponseEnum } from '@/types/api';
import { useFamily } from '@/store/family';
import { useTheme, useMediaQuery } from '@mui/material';
import { darken } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useAppLayout } from '@/context/Providers/AppState/useAppLayout';

export const WelcomeSection: React.FC = () => {
  const [family, familyActions] = useFamily();
  const theme = useTheme();
  const { screenWidth } = useAppLayout();
  const isBreakpointUpMin = screenWidth > theme.breakpoints.values.md;
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Force a refresh to ensure we have the latest data
  React.useEffect(() => {
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

  const handleResponseChange = (guestId: string, response: InvitationResponseEnum) => {
    familyActions.updateFamilyGuestInterest(guestId, response);
  };

  return (
    <Box sx={{ width: '100%', py: 2 }}>
      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent>
          <Typography 
            variant="h6" 
            component="h2" 
            gutterBottom 
            align="center" 
            sx={{ 
              mb: 3, 
              minHeight: '64px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}
          >
            Will you be attending our wedding?
          </Typography>
          
          <List>
            {family.guests.map((guest, index) => (
              <ListItem 
                key={guest.guestId} 
                divider={index < family.guests.length - 1}
                sx={{ 
                  flexDirection: { xs: 'column', sm: 'row' }, 
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  py: 2
                }}
              >
                <ListItemText
                  primary={`${guest.firstName} ${guest.lastName}`}
                  sx={{ 
                    mb: { xs: 1, sm: 0 },
                    minWidth: { sm: '200px' }
                  }}
                />
                
                <ButtonGroup
                  fullWidth
                  orientation={isBreakpointUpMin ? 'horizontal' : 'vertical'}
                  sx={{
                    backgroundColor: 'rgba(0,0,0,.8)',
                    '& .MuiButtonGroup-grouped': {
                      borderRadius: 0,
                    },
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Button 
                    color="success"
                    onClick={() => handleResponseChange(guest.guestId, InvitationResponseEnum.Interested)}
                    variant={guest.rsvp?.invitationResponse === InvitationResponseEnum.Interested ? "contained" : "outlined"}
                    disabled={familyActions.patchFamilyGuestMutation.status === 'pending' || familyActions.getFamilyUnitQuery.isFetching}
                    sx={{ 
                      lineHeight: 1.2,
                      justifyContent: 'center',
                      paddingY: 1.5,
                      paddingX: 2,
                      width: isBreakpointUpMin ? '50%' : '100%',
                      height: !isBreakpointUpMin ? '50%' : '100%'
                    }}
                  >
                    <Box
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                      gap={1}
                      sx={{ width: '100%' }}
                    >
                      {guest.rsvp?.invitationResponse === InvitationResponseEnum.Interested && (
                        <CheckCircleIcon sx={{ mr: 0.5 }} />
                      )}
                      <Typography sx={{
                        textShadow: guest.rsvp?.invitationResponse === InvitationResponseEnum.Interested 
                          ? `2px 2px 0 ${darken(theme.palette.success.dark, 0.5)}`
                          : 'none',
                        fontWeight: guest.rsvp?.invitationResponse === InvitationResponseEnum.Interested ? 'bold' : 'normal'
                      }}>
                        Yes, attending
                      </Typography>
                    </Box>
                  </Button>
                  <Button 
                    color="error"
                    onClick={() => handleResponseChange(guest.guestId, InvitationResponseEnum.Declined)}
                    variant={guest.rsvp?.invitationResponse === InvitationResponseEnum.Declined ? "contained" : "outlined"}
                    disabled={familyActions.patchFamilyGuestMutation.status === 'pending' || familyActions.getFamilyUnitQuery.isFetching}
                    sx={{ 
                      lineHeight: 1.2,
                      justifyContent: 'center',
                      paddingY: 1.5,
                      paddingX: 2,
                      width: isBreakpointUpMin ? '50%' : '100%',
                      height: !isBreakpointUpMin ? '50%' : '100%'
                    }}
                  >
                    <Box
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                      gap={1}
                      sx={{ width: '100%' }}
                    >
                      {guest.rsvp?.invitationResponse === InvitationResponseEnum.Declined && (
                        <CancelIcon sx={{ mr: 0.5 }} />
                      )}
                      <Typography sx={{
                        textShadow: guest.rsvp?.invitationResponse === InvitationResponseEnum.Declined 
                          ? `2px 2px 0 ${darken(theme.palette.error.dark, 0.5)}`
                          : 'none',
                        fontWeight: guest.rsvp?.invitationResponse === InvitationResponseEnum.Declined ? 'bold' : 'normal'
                      }}>
                        Cannot attend
                      </Typography>
                    </Box>
                  </Button>
                </ButtonGroup>
                
                {guest.rsvp?.invitationResponse === InvitationResponseEnum.Pending && (
                  <Typography 
                    variant="caption" 
                    color="warning.main" 
                    sx={{ 
                      display: 'block', 
                      mt: 1, 
                      textAlign: 'center',
                      fontStyle: 'italic',
                      width: '100%'
                    }}
                  >
                    Please select an option
                  </Typography>
                )}
              </ListItem>
            ))}
          </List>
          
          <Box 
            sx={{ 
              mt: 3, 
              p: 2, 
              borderRadius: 1, 
              bgcolor: 'background.paper', 
              minHeight: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Typography variant="body2" color="text.secondary" align="center">
              Please continue through the RSVP process to provide additional details.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default WelcomeSection;