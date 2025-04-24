import React from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Grid,
  Paper,
  Divider,
  Button
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PersonIcon from '@mui/icons-material/Person';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import HotelIcon from '@mui/icons-material/Hotel';
import CampingIcon from '@mui/icons-material/EmojiFlags';
import HomeIcon from '@mui/icons-material/Home';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import EditIcon from '@mui/icons-material/Edit';
import { GuestDto, AgeGroupEnum } from '@/types/api';
import { 
  getInvitationResponseDetails, 
  getRsvpStatusDetails, 
  getFoodPreferenceDetails, 
  getSleepPreferenceDetails,
  formatDate
} from './AdminHelpers';

interface GuestListProps {
  guests: GuestDto[] | undefined;
  onEditGuest?: (guest: GuestDto) => void;
  readOnly?: boolean;
}

const GuestList: React.FC<GuestListProps> = ({ 
  guests, 
  onEditGuest,
  readOnly = false
}) => {
  if (!guests || guests.length === 0) {
    return (
      <Box sx={{ py: 2, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No guests found for this family unit
        </Typography>
      </Box>
    );
  }
  
  // Get sleep preference icon based on preference
  const getSleepPreferenceIcon = (preference: any) => {
    const sleepPreference = getSleepPreferenceDetails(preference);
    
    switch (sleepPreference.icon) {
      case 'hotel':
        return <HotelIcon />;
      case 'camping':
        return <CampingIcon />;
      case 'house':
        return <HomeIcon />;
      default:
        return <HelpOutlineIcon />;
    }
  };
  
  // Get guest icon based on age group
  const getGuestIcon = (ageGroup: AgeGroupEnum | undefined) => {
    if (ageGroup === AgeGroupEnum.Under13) {
      return <ChildCareIcon />;
    }
    return <PersonIcon />;
  };

  return (
    <Box>
      {guests.map((guest) => (
        <Accordion key={guest.guestId} sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              width: '100%',
              pr: 2
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ mr: 1 }}>
                  {getGuestIcon(guest.ageGroup)}
                </Box>
                <Typography>
                  {guest.firstName} {guest.lastName}
                </Typography>
              </Box>
              
              {guest.rsvp?.invitationResponse && (
                <Chip 
                  label={getInvitationResponseDetails(guest.rsvp.invitationResponse).label}
                  color={getInvitationResponseDetails(guest.rsvp.invitationResponse).color}
                  size="small"
                />
              )}
            </Box>
          </AccordionSummary>
          
          <AccordionDetails>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
              {!readOnly && (
                <Button 
                  variant="outlined" 
                  size="small" 
                  startIcon={<EditIcon />}
                  onClick={() => onEditGuest && onEditGuest(guest)}
                >
                  Edit Guest
                </Button>
              )}
            </Box>
            
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Basic Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Guest ID
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {guest.guestId}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Age Group
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {guest.ageGroup || 'Not specified'}
                  </Typography>
                </Grid>
                
                {guest.auth0Id && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Auth0 ID
                    </Typography>
                    <Typography variant="body1" gutterBottom sx={{ wordBreak: 'break-all' }}>
                      {guest.auth0Id}
                    </Typography>
                  </Grid>
                )}
                
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Last Activity
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formatDate(guest.lastActivity)}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
            
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Contact Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <EmailIcon sx={{ mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Email
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body1">
                      {guest.email?.value || 'Not provided'}
                    </Typography>
                    {guest.email?.verified && (
                      <Chip 
                        label="Verified" 
                        color="success" 
                        size="small" 
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PhoneIcon sx={{ mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Phone
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body1">
                      {guest.phone?.value || 'Not provided'}
                    </Typography>
                    {guest.phone?.verified && (
                      <Chip 
                        label="Verified" 
                        color="success" 
                        size="small" 
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Paper>
            
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                RSVP Status
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {guest.rsvp ? (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="text.secondary">
                      Invitation Response
                    </Typography>
                    <Chip 
                      label={getInvitationResponseDetails(guest.rsvp.invitationResponse).label}
                      color={getInvitationResponseDetails(guest.rsvp.invitationResponse).color}
                      size="small"
                      sx={{ mt: 1 }}
                    />
                    {guest.rsvp.invitationResponseAudit?.lastUpdate && (
                      <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                        Updated: {formatDate(guest.rsvp.invitationResponseAudit.lastUpdate)}
                      </Typography>
                    )}
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="text.secondary">
                      Wedding
                    </Typography>
                    <Chip 
                      label={getRsvpStatusDetails(guest.rsvp.wedding).label}
                      color={getRsvpStatusDetails(guest.rsvp.wedding).color}
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="text.secondary">
                      Rehearsal Dinner
                    </Typography>
                    <Chip 
                      label={getRsvpStatusDetails(guest.rsvp.rehearsalDinner).label}
                      color={getRsvpStatusDetails(guest.rsvp.rehearsalDinner).color}
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="text.secondary">
                      Fourth of July
                    </Typography>
                    <Chip 
                      label={getRsvpStatusDetails(guest.rsvp.fourthOfJuly).label}
                      color={getRsvpStatusDetails(guest.rsvp.fourthOfJuly).color}
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </Grid>
                  
                  {guest.rsvp.rsvpNotes && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        RSVP Notes
                      </Typography>
                      <Typography variant="body1" paragraph sx={{ mt: 1 }}>
                        {guest.rsvp.rsvpNotes}
                      </Typography>
                    </Grid>
                  )}
                  
                  {guest.rsvp.rsvpAudit?.lastUpdate && (
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">
                        RSVP Last Updated: {formatDate(guest.rsvp.rsvpAudit.lastUpdate)}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              ) : (
                <Typography variant="body1" color="text.secondary">
                  No RSVP information available
                </Typography>
              )}
            </Paper>
            
            {guest.preferences && (
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Preferences
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  {guest.preferences.foodPreference && (
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <RestaurantIcon sx={{ mr: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          Food Preference
                        </Typography>
                      </Box>
                      <Typography variant="body1" gutterBottom>
                        {getFoodPreferenceDetails(guest.preferences.foodPreference).label}
                      </Typography>
                      
                      {guest.preferences.foodAllergies && guest.preferences.foodAllergies.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Food Allergies
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                            {guest.preferences.foodAllergies.map((allergy, index) => (
                              <Chip key={index} label={allergy} size="small" />
                            ))}
                          </Box>
                        </Box>
                      )}
                    </Grid>
                  )}
                  
                  {guest.preferences.sleepPreference && (
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        {getSleepPreferenceIcon(guest.preferences.sleepPreference)}
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                          Sleep Preference
                        </Typography>
                      </Box>
                      <Typography variant="body1" gutterBottom>
                        {getSleepPreferenceDetails(guest.preferences.sleepPreference).label}
                      </Typography>
                    </Grid>
                  )}
                  
                  {guest.preferences.notificationPreference && guest.preferences.notificationPreference.length > 0 && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Notification Preferences
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                        {guest.preferences.notificationPreference.map((pref, index) => (
                          <Chip key={index} label={pref} size="small" />
                        ))}
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            )}
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default React.memo(GuestList);