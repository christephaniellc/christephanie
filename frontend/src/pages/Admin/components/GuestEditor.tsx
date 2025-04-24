import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Typography, 
  Paper, 
  Divider, 
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  Grid
} from '@mui/material';
import { 
  GuestDto, 
  AgeGroupEnum, 
  FoodPreferenceEnum, 
  SleepPreferenceEnum,
  NotificationPreferenceEnum,
  InvitationResponseEnum,
  RsvpEnum,
  FamilyUnitDto,
  AdminPatchGuestRequest
} from '@/types/api';
import { useApiContext } from '@/context/ApiContext';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

interface GuestEditorProps {
  guest: GuestDto;
  family: FamilyUnitDto;
  onCancel: () => void;
  onSave: () => void;
}

const GuestEditor: React.FC<GuestEditorProps> = ({ 
  guest, 
  family,
  onCancel,
  onSave
}) => {
  const [editedGuest, setEditedGuest] = useState<GuestDto>({...guest});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const { apiInstance } = useApiContext();
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedGuest(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setEditedGuest(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleAgeGroupChange = (e: any) => {
    setEditedGuest(prev => ({
      ...prev,
      ageGroup: e.target.value
    }));
  };
  
  const handlePreferencesChange = (e: any) => {
    const { name, value } = e.target;
    setEditedGuest(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [name]: value
      }
    }));
  };
  
  const handleRsvpChange = (e: any) => {
    const { name, value } = e.target;
    setEditedGuest(prev => ({
      ...prev,
      rsvp: {
        ...prev.rsvp,
        [name]: value
      }
    }));
  };
  
  const handleAllergiesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const allergiesString = e.target.value;
    // Split by commas, remove whitespace, and filter out empty strings
    const allergiesArray = allergiesString.split(',')
      .map(item => item.trim())
      .filter(item => item !== '');
    
    setEditedGuest(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        foodAllergies: allergiesArray
      }
    }));
  };
  
  const handleNotificationPreferenceChange = (preference: NotificationPreferenceEnum) => {
    const currentPreferences = editedGuest.preferences?.notificationPreference || [];
    let newPreferences: NotificationPreferenceEnum[];
    
    if (currentPreferences.includes(preference)) {
      // Remove preference if already selected
      newPreferences = currentPreferences.filter(p => p !== preference);
    } else {
      // Add preference if not already selected
      newPreferences = [...currentPreferences, preference];
    }
    
    setEditedGuest(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        notificationPreference: newPreferences
      }
    }));
  };
  
  const handleSave = async () => {
    if (!apiInstance) return;
    
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      // Create the AdminPatchGuestRequest
      const patchRequest: AdminPatchGuestRequest = {
        invitationCode: family.invitationCode || '',
        guestId: editedGuest.guestId || '',
        firstName: editedGuest.firstName,
        lastName: editedGuest.lastName,
        // Include only the specific fields that are editable via AdminPatchGuestRequest
        invitationResponse: editedGuest.rsvp?.invitationResponse,
        rehearsalDinner: editedGuest.rsvp?.rehearsalDinner,
        fourthOfJuly: editedGuest.rsvp?.fourthOfJuly,
        wedding: editedGuest.rsvp?.wedding
      };
      
      // Use the admin API to patch the guest
      await apiInstance.adminPatchGuest(patchRequest);
      
      setSuccessMessage('Guest information updated successfully');
      setTimeout(() => {
        onSave(); // Notify parent component of successful save
      }, 1500);
    } catch (err) {
      console.error('Failed to update guest:', err);
      setError('Failed to update guest information. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Box sx={{ maxWidth: '800px', mx: 'auto' }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Edit Guest: {guest.firstName} {guest.lastName}
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Alert severity="info" sx={{ mb: 3 }}>
          This form allows you to edit basic guest information and RSVP status. For more advanced editing (preferences, allergies, etc.), please use the full family unit editor.
        </Alert>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="First Name"
              name="firstName"
              value={editedGuest.firstName || ''}
              onChange={handleInputChange}
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Last Name"
              name="lastName"
              value={editedGuest.lastName || ''}
              onChange={handleInputChange}
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="age-group-label">Age Group</InputLabel>
              <Select
                labelId="age-group-label"
                id="age-group"
                value={editedGuest.ageGroup || ''}
                onChange={handleAgeGroupChange}
                label="Age Group"
              >
                <MenuItem value=""><em>None</em></MenuItem>
                {Object.values(AgeGroupEnum).map((ageGroup) => (
                  <MenuItem key={ageGroup} value={ageGroup}>
                    {ageGroup}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Contact Information
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              value={editedGuest.email?.value || ''}
              InputProps={{
                readOnly: true, // Email should be read-only in admin interface
              }}
              helperText="Email can only be changed by the user"
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone"
              name="phone"
              value={editedGuest.phone?.value || ''}
              InputProps={{
                readOnly: true, // Phone should be read-only in admin interface
              }}
              helperText="Phone can only be changed by the user"
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              <Typography variant="body2" gutterBottom sx={{ width: '100%' }}>
                Notification Preferences:
              </Typography>
              <Alert severity="info" sx={{ width: '100%', mb: 1 }}>
                Notification preferences cannot be edited in the admin interface
              </Alert>
              {Object.values(NotificationPreferenceEnum).map((pref) => (
                <Chip
                  key={pref}
                  label={pref}
                  color={editedGuest.preferences?.notificationPreference?.includes(pref) ? 'primary' : 'default'}
                  disabled={true}
                />
              ))}
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              RSVP Status
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="invitation-response-label">Invitation Response</InputLabel>
              <Select
                labelId="invitation-response-label"
                id="invitation-response"
                value={editedGuest.rsvp?.invitationResponse || ''}
                onChange={(e) => {
                  setEditedGuest(prev => ({
                    ...prev,
                    rsvp: {
                      ...prev.rsvp,
                      invitationResponse: e.target.value as InvitationResponseEnum
                    }
                  }));
                }}
                label="Invitation Response"
              >
                <MenuItem value=""><em>None</em></MenuItem>
                {Object.values(InvitationResponseEnum).map((response) => (
                  <MenuItem key={response} value={response}>
                    {response}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="wedding-label">Wedding</InputLabel>
              <Select
                labelId="wedding-label"
                id="wedding"
                value={editedGuest.rsvp?.wedding || ''}
                onChange={(e) => {
                  setEditedGuest(prev => ({
                    ...prev,
                    rsvp: {
                      ...prev.rsvp,
                      wedding: e.target.value as RsvpEnum
                    }
                  }));
                }}
                label="Wedding"
              >
                <MenuItem value=""><em>None</em></MenuItem>
                {Object.values(RsvpEnum).map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="rehearsal-dinner-label">Rehearsal Dinner</InputLabel>
              <Select
                labelId="rehearsal-dinner-label"
                id="rehearsal-dinner"
                value={editedGuest.rsvp?.rehearsalDinner || ''}
                onChange={(e) => {
                  setEditedGuest(prev => ({
                    ...prev,
                    rsvp: {
                      ...prev.rsvp,
                      rehearsalDinner: e.target.value as RsvpEnum
                    }
                  }));
                }}
                label="Rehearsal Dinner"
              >
                <MenuItem value=""><em>None</em></MenuItem>
                {Object.values(RsvpEnum).map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="fourth-of-july-label">Fourth of July</InputLabel>
              <Select
                labelId="fourth-of-july-label"
                id="fourth-of-july"
                value={editedGuest.rsvp?.fourthOfJuly || ''}
                onChange={(e) => {
                  setEditedGuest(prev => ({
                    ...prev,
                    rsvp: {
                      ...prev.rsvp,
                      fourthOfJuly: e.target.value as RsvpEnum
                    }
                  }));
                }}
                label="Fourth of July"
              >
                <MenuItem value=""><em>None</em></MenuItem>
                {Object.values(RsvpEnum).map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="RSVP Notes"
              name="rsvpNotes"
              value={editedGuest.rsvp?.rsvpNotes || ''}
              onChange={(e) => {
                setEditedGuest(prev => ({
                  ...prev,
                  rsvp: {
                    ...prev.rsvp,
                    rsvpNotes: e.target.value
                  }
                }));
              }}
              margin="normal"
              multiline
              rows={3}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Preferences
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Preferences can only be updated by the guest or by using the family update endpoint
            </Alert>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="food-preference-label">Food Preference</InputLabel>
              <Select
                labelId="food-preference-label"
                id="food-preference"
                name="foodPreference"
                value={editedGuest.preferences?.foodPreference || ''}
                label="Food Preference"
                disabled
              >
                <MenuItem value=""><em>None</em></MenuItem>
                {Object.values(FoodPreferenceEnum).map((pref) => (
                  <MenuItem key={pref} value={pref}>
                    {pref}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="sleep-preference-label">Sleep Preference</InputLabel>
              <Select
                labelId="sleep-preference-label"
                id="sleep-preference"
                name="sleepPreference"
                value={editedGuest.preferences?.sleepPreference || ''}
                label="Sleep Preference"
                disabled
              >
                <MenuItem value=""><em>None</em></MenuItem>
                {Object.values(SleepPreferenceEnum).map((pref) => (
                  <MenuItem key={pref} value={pref}>
                    {pref}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Food Allergies (comma separated)"
              name="foodAllergies"
              value={editedGuest.preferences?.foodAllergies?.join(', ') || ''}
              margin="normal"
              InputProps={{
                readOnly: true,
              }}
              helperText="Food allergies can only be updated by the guest or by using the family update endpoint"
            />
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            variant="outlined" 
            color="secondary" 
            onClick={onCancel}
            startIcon={<CancelIcon />}
            sx={{ mr: 2 }}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSave}
            startIcon={loading ? <CircularProgress size={24} /> : <SaveIcon />}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default React.memo(GuestEditor);