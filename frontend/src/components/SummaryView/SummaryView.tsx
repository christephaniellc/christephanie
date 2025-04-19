import React from 'react';
import { 
  Box, Card, CardContent, Typography, Divider, List, ListItem, ListItemText, 
  ListItemIcon, Button, useTheme, Chip, Avatar
} from '@mui/material';
import { useRecoilValue } from 'recoil';
import { saveTheDateStepsState, stdTabIndex } from '@/store/steppers/steppers';
import { rsvpStepsState, rsvpTabIndex } from '@/store/steppers';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFamily, familyGuestsStates } from '@/store/family';
import { userCommentState } from '@/store/userComment/userComment';
import { StephsActualFavoriteTypography, StephsActualFavoriteTypographyBackNext, StephsActualFavoriteTypographyNoDrop } from '@/components/AttendanceButton/AttendanceButton';
import { darken } from '@mui/system';
import { useBoxShadow } from '@/hooks/useBoxShadow';
import { AgeGroupEnum, GuestViewModel, RsvpEnum } from '@/types/api';
import StickFigureIcon from '@/components/StickFigureIcon';

// Icons
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import FaceIcon from '@mui/icons-material/Face';
import NotificationsIcon from '@mui/icons-material/Notifications';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import NoMealsIcon from '@mui/icons-material/NoMeals';
import HotelIcon from '@mui/icons-material/Hotel';
import HomeIcon from '@mui/icons-material/Home';
import CommentIcon from '@mui/icons-material/Comment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HelpIcon from '@mui/icons-material/Help';
import CancelIcon from '@mui/icons-material/Cancel';
import MailOutlineIcon from '@mui/icons-material/MailOutline';

const SummaryView: React.FC = () => {
  const [family] = useFamily();
  const attendanceState = useRecoilValue(familyGuestsStates);
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const comment = useRecoilValue(userCommentState);
  
  // Determine which flow we're in based on the current URL
  const isRsvpFlow = location.pathname.includes('/rsvp');
  
  // Use the appropriate steps and tab index based on the current flow
  const saveTheDateSteps = useRecoilValue(saveTheDateStepsState);
  const rsvpSteps = useRecoilValue(rsvpStepsState);
  const saveTheDateTabIndex = useRecoilValue(stdTabIndex);
  const rsvpCurrentTabIndex = useRecoilValue(rsvpTabIndex);
  
  // Get the current steps and tab index
  const currentSteps = isRsvpFlow ? rsvpSteps : saveTheDateSteps;
  const tabIndex = isRsvpFlow ? rsvpCurrentTabIndex : saveTheDateTabIndex;
  
  const { boxShadow } = useBoxShadow();

  // Get the step key by index
  const getStepKeyByIndex = (index: number): string => {
    return Object.keys(currentSteps)[index];
  };

  // Navigate to a specific step based on the current flow
  const navigateToStep = (stepIndex: number) => {
    const basePath = isRsvpFlow ? '/rsvp' : '/save-the-date';
    navigate(`${basePath}?step=${getStepKeyByIndex(stepIndex)}`);
  };

  // Map of step keys to icons
  const stepIcons = {
    // Save the Date step keys
    attendance: <EventAvailableIcon />,
    ageGroup: <FaceIcon />,
    communicationPreference: <NotificationsIcon />,
    foodPreferences: <RestaurantIcon />,
    foodAllergies: <NoMealsIcon />,
    camping: <HotelIcon />,
    mailingAddress: <HomeIcon />,
    comments: <CommentIcon />,
    
    // RSVP step keys
    weddingAttendance: <EventAvailableIcon />,
    fourthOfJulyAttendance: <EventAvailableIcon />,
    transportation: <EventAvailableIcon />,
    accommodation: <HotelIcon />,
  };

  // Helper to get the status icon
  const getStatusIcon = (completed: boolean, unknown: boolean = false) => {
    if (unknown) return <HelpIcon color="action" />;
    return completed ? 
      <CheckCircleIcon color="success" /> : 
      <CancelIcon color="error" />;
  };

  // Helper to get response value for a step
  const getResponseValueForStep = (stepKey: string) => {
    if (!family) return "Information not available";

    switch (stepKey) {
      case 'attendance':
        // Return a summary of guest attendance
        if (!family.guests || family.guests.length === 0) return "No attendance information";
        
        const attendingCount = isRsvpFlow 
          ? family.guests.filter(g => g.rsvp?.wedding === RsvpEnum.Attending).length 
          : family.guests.filter(g => g.rsvp?.invitationResponse === 'Interested').length;
        const decliningCount = isRsvpFlow 
          ? family.guests.filter(g => g.rsvp?.wedding === RsvpEnum.Declined).length
          : family.guests.filter(g => g.rsvp?.invitationResponse === 'Declined').length;
          const pendingCount = isRsvpFlow 
          ? family.guests.filter(g => g.rsvp?.wedding === RsvpEnum.Pending || !g.rsvp?.wedding).length
          : family.guests.filter(g => g.rsvp?.invitationResponse === 'Pending' || !g.rsvp?.invitationResponse).length;
        
        return `${attendingCount} interested, ${decliningCount} declining, ${pendingCount} pending`;
        
      case 'ageGroup':
        // Return a summary of guest ages
        if (!family.guests || family.guests.length === 0) return "No age information";
        
        const adultCount = family.guests.filter(g => g.ageGroup === 'Adult').length;
        const childCount = family.guests.filter(g => g.ageGroup === 'Under13' || g.ageGroup === 'Under21').length;
        const babyCount = family.guests.filter(g => g.ageGroup === 'Baby').length;
        
        let ageString = "";
        if (adultCount > 0) ageString += `${adultCount} Adult${adultCount > 1 ? 's' : ''} `;
        if (childCount > 0) ageString += `${childCount} Child${childCount > 1 ? 'ren' : ''} `;
        if (babyCount > 0) ageString += `${babyCount} Bab${babyCount > 1 ? 'ies' : 'y'} `;
        
        return ageString.trim() || "No age information";
        
      case 'communicationPreference':
        // Return communication preferences from guests
        if (!family.guests || family.guests.length === 0) return "No preferences set";
        
        const preferences = family.guests
          .flatMap(g => g.preferences?.notificationPreference || [])
          .filter(Boolean);
        
        const uniquePrefs = [...new Set(preferences)];
        
        return uniquePrefs.map(pref => {
          switch(pref) {
            case 'Email': return 'Email';
            case 'Text': return 'Text/SMS';
            default: return pref;
          }
        }).join(', ') || "No preferences set";
        
      case 'foodPreferences':
        // Return a summary of food preferences
        if (!family.guests || family.guests.length === 0) return "No food preferences";
        
        const dietTypes = family.guests
          .map(g => g.preferences?.foodPreference)
          .filter(Boolean);
        
        const uniqueDiets = [...new Set(dietTypes)];
        
        return uniqueDiets.join(', ') || "No food preferences set";
        
      case 'foodAllergies':
        // Return a summary of food allergies
        if (!family.guests || family.guests.length === 0) return "No food allergies";
        
        const allergies = family.guests
          .flatMap(g => g.preferences?.foodAllergies || [])
          .filter(Boolean);
        
        const uniqueAllergies = [...new Set(allergies)];
        
        return uniqueAllergies.join(', ') || "No allergies";
        
      case 'camping':
        // Return sleep preferences from guests
        if (!family.guests || family.guests.length === 0) return "No preferences set";
        
        const sleepPreferences = family.guests
          .map(g => g.preferences?.sleepPreference)
          .filter(Boolean);
        
        const uniqueSleepPrefs = [...new Set(sleepPreferences)]
          .map(pref => {
            switch(pref) {
              case 'Camping': return 'Camping on property';
              case 'Hotel': return 'Hotel nearby';
              case 'Manor': return 'Manor house';
              case 'Other': return 'Other accommodation';
              default: return pref;
            }
          });
        
        return uniqueSleepPrefs.join(', ') || "No sleeping preference set";
        
      case 'mailingAddress':
        // Return mailing address if available
        if (!family.mailingAddress) return "No address provided";
        
        const { streetAddress, secondaryAddress, city, state, postalCode, zipCode } = family.mailingAddress;
        const address1 = streetAddress;
        const address2 = secondaryAddress;
        const zip = postalCode || zipCode;
        
        if (!address1 && !city) return "No address provided";
        
        return [
          address1, 
          address2, 
          city && state ? `${city}, ${state} ${zip}` : null
        ].filter(Boolean).join(', ');
        
      case 'comments':
        // Return comment if available
        return family.invitationResponseNotes || comment || "No comments provided";
        
      default:
        return <></>;
    }
  };

  // Get guest-specific information
  const renderGuestDetails = (guest: GuestViewModel) => {
    const fullName = `${guest.firstName} ${guest.lastName}`;
    
    // Get attendance status
    const attendanceStatus = guest.rsvp?.invitationResponse || 'Pending';
    
    // Get age group
    const ageGroup = guest.ageGroup || 'Not specified';
    
    // Get communication preferences
    const communicationPrefs = guest.preferences?.notificationPreference || [];
    
    // Get food preference
    const foodPreference = guest.preferences?.foodPreference || 'Not specified';
    
    // Get food allergies
    const allergies = guest.preferences?.foodAllergies || [];
    
    // Get sleep preference
    const sleepPreference = guest.preferences?.sleepPreference || 'Not specified';
    
    // Prepare a formatted sleep preference
    let formattedSleepPreference = sleepPreference;
    if (sleepPreference === 'Camping') {
      formattedSleepPreference = 'Camping on property';
    } else if (sleepPreference === 'Hotel') {
      formattedSleepPreference = 'Hotel nearby';
    } else if (sleepPreference === 'Manor') {
      formattedSleepPreference = 'Manor house';
    } else if (sleepPreference === 'Other') {
      formattedSleepPreference = 'Other accommodation';
    }

    return (
      <Box sx={{ p: 1 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          <Chip 
            icon={<EventAvailableIcon />} 
            label={`Attendance: ${attendanceStatus}`} 
            color={attendanceStatus === (isRsvpFlow ? RsvpEnum.Attending : 'Interested') 
              ? 'success' : attendanceStatus === ('Declined') 
              ? 'error' : 'default'}
            variant="outlined"
          />
          <Chip 
            icon={<FaceIcon />} 
            label={`Age: ${ageGroup}`} 
            variant="outlined" 
          />
          {communicationPrefs.map((pref, idx) => (
            <Chip 
              key={idx}
              icon={<NotificationsIcon />} 
              label={pref === 'Email' ? 'Email' : 'Text/SMS'} 
              variant="outlined" 
              color="primary"
            />
          ))}
        </Box>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Chip 
            icon={<RestaurantIcon />} 
            label={`Diet: ${foodPreference}`} 
            variant="outlined" 
          />
          {allergies.length > 0 ? (
            allergies.map((allergy, idx) => (
              <Chip 
                key={idx}
                icon={<NoMealsIcon />} 
                label={allergy} 
                variant="outlined" 
                color="secondary"
              />
            ))
          ) : (
            <Chip 
              icon={<NoMealsIcon />} 
              label="No allergies" 
              variant="outlined" 
            />
          )}
          <Chip 
            icon={<HotelIcon />} 
            label={`Stay: ${formattedSleepPreference}`} 
            variant="outlined" 
          />
        </Box>
      </Box>
    );
  };

  return (
    <Box 
      sx={{ 
        width: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        py: 3,
      }}
    >

      <Card 
        sx={{ 
          width: '100%', 
          maxWidth: 600,
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow,
        }}
      >
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {isRsvpFlow 
              ? "Thank you for confirming your RSVP details."
              : "Thank you for providing your information."
            }
          </Typography> 
          {attendanceState.atLeastOneAttending && 
          <>
            <StephsActualFavoriteTypographyNoDrop variant='caption' sx={{
              color: theme.palette.secondary.main,
            }}>
              See you on July 5 at 6:00pm
            </StephsActualFavoriteTypographyNoDrop>
          </>
          }
          
          <Typography variant="body2" color="text.secondary" paragraph>
            Here's a summary of what you've shared with us. Click on any item to update your information.
          </Typography>

          {!isRsvpFlow && (
            <Box sx={{ 
              width: '100%', 
              textAlign: 'center',
              justifyContent: 'space-between',
              alignItems: 'center',
              display: 'flex',
              mt: 4,
              mb: 2,
              py: 1.5,
              px: 3,
              mx: 'auto',
              maxWidth: 'fit-content',
              borderRadius: 2,
              border: `1px dashed ${theme.palette.secondary.main}`,
              position: 'relative',
              overflow: 'hidden',
              zIndex: 1,
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: theme.palette.mode === 'dark' 
                  ? 'rgba(0, 0, 0, 0.75)' 
                  : 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(8px)',
                zIndex: -1,
              }
            }}>
              <Box sx={{
                pr: 2,
                color: theme.palette.secondary.main,
                verticalAlign: 'center'
              }}>
                <MailOutlineIcon/>
              </Box>
              <Box sx={{
                flex: 1
              }}>
                <Typography sx={{ 
                  fontWeight: 'medium',
                  color: theme.palette.secondary.main,
                  fontSize: '0.95rem',
                  letterSpacing: '0.01em',
                  textShadow: theme.palette.mode === 'dark'
                    ? '0 1px 2px rgba(0,0,0,0.8)'
                    : 'none',
                }}>
                    Formal RSVP invitations will be coming in the mail soon!
                </Typography>
              </Box>
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

          <List sx={{ width: '100%' }}>
            {Object.entries(currentSteps).slice(0, Object.entries(currentSteps).length -1).map(([stepKey, step], index) => (
              <React.Fragment key={stepKey}>
                <ListItem 
                  alignItems="flex-start"
                  sx={{ 
                    mb: 1, 
                    borderRadius: 1,
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: theme.palette.action.hover,
                    },
                  }}
                  onClick={() => navigateToStep(index)}
                >
                  <ListItemIcon>
                    {stepIcons[stepKey as keyof typeof stepIcons]}
                  </ListItemIcon>
                  <ListItemText
                    primary={`${step.label}${step.label === 'Wedding Attendance' ? ' - July 5th' : ''}`}
                    secondary={getResponseValueForStep(stepKey)}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                    {getStatusIcon(step.completed)}
                  </Box>
                </ListItem>
                
                {/* Add guest-level breakdown for certain steps */}
                {['ageGroup', 'communicationPreference', 'foodPreferences', 'foodAllergies', 'camping'].includes(stepKey) && stepKey !== 'summary' && 
                  family?.guests && family.guests.length > 0 && (
                  <Box sx={{ ml: 4, mb: 2, width: 'calc(100% - 32px)' }}>
                    <Box 
                      sx={{ 
                        pl: 1,
                        borderLeft: `2px solid ${theme.palette.divider}` 
                      }}
                    >
                      {family.guests.map((guest, idx) => {
                        // Only show relevant information based on the step and attendance status
                        let relevantContent = null;
                        const attendanceStatus = isRsvpFlow 
                        ? guest.rsvp?.wedding 
                        : guest.rsvp?.invitationResponse || 'Pending';
                        const isAttending = attendanceStatus === 'Interested' || 'Attending';
                        
                        // For non-attending guests, show a message instead of preferences
                        if (!isAttending) {
                          relevantContent = (
                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                              Not attending
                            </Typography>
                          );
                        } else if (stepKey === 'ageGroup') {
                          const ageGroup = guest.ageGroup || 'Not specified';
                          relevantContent = (
                            <Chip 
                              size="small"
                              icon={<FaceIcon />} 
                              label={ageGroup}
                              variant="outlined"
                            />
                          );
                        } else if (stepKey === 'communicationPreference') {
                          const communicationPrefs = guest.preferences?.notificationPreference || [];
                          relevantContent = (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {communicationPrefs.length > 0 ? (
                                communicationPrefs.map((pref, idx) => (
                                  <Chip 
                                    key={idx}
                                    size="small"
                                    icon={<NotificationsIcon />} 
                                    label={pref === 'Email' ? 'Email' : 'Text/SMS'}
                                    variant="outlined"
                                    color="primary"
                                  />
                                ))
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  No preference set
                                </Typography>
                              )}
                            </Box>
                          );
                        } else if (stepKey === 'foodPreferences') {
                          const foodPreference = guest.preferences?.foodPreference || 'Not specified';
                          relevantContent = (
                            <Chip 
                              size="small"
                              icon={<RestaurantIcon />} 
                              label={foodPreference}
                              variant="outlined"
                            />
                          );
                        } else if (stepKey === 'foodAllergies') {
                          const allergies = guest.preferences?.foodAllergies || [];
                          relevantContent = (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {allergies.length > 0 ? (
                                allergies.map((allergy, idx) => (
                                  <Chip 
                                    key={idx}
                                    size="small"
                                    icon={<NoMealsIcon />} 
                                    label={allergy}
                                    variant="outlined"
                                    color="secondary"
                                  />
                                ))
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  No allergies reported
                                </Typography>
                              )}
                            </Box>
                          );
                        } else if (stepKey === 'camping') {
                          const sleepPreference = guest.preferences?.sleepPreference || 'Not specified';
                          let formattedSleepPreference = sleepPreference;
                          if (sleepPreference === 'Camping') formattedSleepPreference = 'Camping on property';
                          else if (sleepPreference === 'Hotel') formattedSleepPreference = 'Hotel nearby';
                          else if (sleepPreference === 'Manor') formattedSleepPreference = 'Manor house';
                          else if (sleepPreference === 'Other') formattedSleepPreference = 'Other accommodation';
                          
                          relevantContent = (
                            <Chip 
                              size="small"
                              icon={<HotelIcon />} 
                              label={formattedSleepPreference}
                              variant="outlined"
                            />
                          );
                        }
                        
                        return (
                          <Box 
                            key={guest.guestId} 
                            sx={{ 
                              display: 'flex',
                              alignItems: 'center',
                              mb: 1,
                              pb: 1,
                              borderBottom: idx < family.guests.length - 1 ? `1px dashed ${theme.palette.divider}` : 'none',
                            }}
                          >
                            <Box 
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 28,
                                height: 28,
                                mr: 1.5,
                              }}
                            >
                              <StickFigureIcon 
                                fontSize="small" 
                                ageGroup={guest.ageGroup || AgeGroupEnum.Adult}
                                color={guest.rsvp?.invitationResponse === 'Interested' ? theme.palette.success.main : 
                                       guest.rsvp?.invitationResponse === 'Declined' ? theme.palette.error.main : 
                                       theme.palette.grey[500]}
                              />
                            </Box>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                minWidth: 100,
                                fontWeight: 'medium'
                              }}
                            >
                              {guest.firstName}:&nbsp;&nbsp;
                            </Typography>
                            <Box sx={{ flexGrow: 1 }}>
                              {relevantContent}
                            </Box>
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                )}
              </React.Fragment>
            ))}
          </List>
        </CardContent>
      </Card>

      <Button 
        variant="contained" 
        color="primary"
        sx={{ mt: 3 }}
        onClick={() => navigate('/')}
      >
        Return to Home
      </Button>
    </Box>
  );
};

export default SummaryView;