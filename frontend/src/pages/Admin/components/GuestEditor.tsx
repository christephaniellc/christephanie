import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
  Typography,
  Divider,
  Select,
  MenuItem,
  InputLabel,
  Grid,
  Alert
} from '@mui/material';
import { 
  GuestDto, 
  InvitationResponseEnum, 
  RsvpEnum, 
  GuestViewModel
} from '@/types/api';
import { useApiContext } from '@/context/ApiContext';

interface GuestEditorProps {
  guest: {
    guestId?: string;
    firstName?: string;
    lastName?: string;
    invitationCode?: string;
    rsvp?: {
      invitationResponse?: InvitationResponseEnum;
      wedding?: RsvpEnum;
      rehearsalDinner?: RsvpEnum;
      fourthOfJuly?: RsvpEnum;
    };
  };
  onClose: () => void;
  onSuccess: () => void;
}

const GuestEditor: React.FC<GuestEditorProps> = ({ guest, onClose, onSuccess }) => {
  const apiContext = useApiContext();
  const [editedRsvp, setEditedRsvp] = useState({
    invitationResponse: guest.rsvp?.invitationResponse || InvitationResponseEnum.Pending,
    wedding: guest.rsvp?.wedding || RsvpEnum.Pending,
    rehearsalDinner: guest.rsvp?.rehearsalDinner || RsvpEnum.Pending,
    fourthOfJuly: guest.rsvp?.fourthOfJuly || RsvpEnum.Pending
  });
  
  // If guest is null, don't render anything
  if (!guest || !guest.guestId) {
    // Only log error when there's a problem
    console.error('Guest data is missing required fields:', guest);
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body1" color="error">
          Guest data not available
        </Typography>
        <Button onClick={onClose} color="primary" variant="contained" sx={{ mt: 2 }}>
          Close
        </Button>
      </Box>
    );
  }
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: string, value: any) => {
    setEditedRsvp(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // First, find the guest's family in the application context
      // This would ideally be passed from the parent component
      
      // Use the admin API instead of the regular patch endpoint
      // Since this approach requires updating the whole family, we need to:
      // 1. Get the current family record from the admin API
      // 2. Update the specific guest in the family
      // 3. Submit the entire updated family back

      const { apiInstance } = apiContext;
      
      // Test admin access first
      if (apiInstance) {
        const hasAccess = await apiInstance.testAdminAccess();
        if (!hasAccess) {
          throw new Error('You do not have admin access to perform this operation');
        }
      }
      
      if (!apiInstance || !guest.invitationCode) {
        throw new Error('API instance or invitation code not available');
      }
      
      // Get the current family data
      const family = await apiInstance.adminGetFamilyByInvitationCode(guest.invitationCode);
      
      if (!family || !family.guests) {
        throw new Error('Family not found or has no guests');
      }
      
      // Update the specific guest in the family
      const updatedGuests = family.guests.map(g => {
        if (g.guestId === guest.guestId) {
          return {
            ...g,
            rsvp: {
              ...g.rsvp,
              invitationResponse: editedRsvp.invitationResponse,
              wedding: editedRsvp.wedding,
              rehearsalDinner: editedRsvp.rehearsalDinner,
              fourthOfJuly: editedRsvp.fourthOfJuly
            }
          };
        }
        return g;
      });
      
      // Create updated family object
      const updatedFamily = {
        ...family,
        guests: updatedGuests
      };
      
      // Submit the update using the admin API
      try {
        await apiInstance.adminUpdateFamily(updatedFamily);
        
        // Show success message
        setError(null);
        
        // Set a timeout to close the dialog after success
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 500);
        
        return; // Exit early to prevent the code below from running
      } catch (updateError) {
        console.error('Error in adminUpdateFamily call:', updateError);
        throw new Error(`API error: ${updateError.message || 'Unknown error'}`);
      }
      
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error updating guest:', err);
      setError(err instanceof Error ? err.message : 'Failed to update guest information. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Edit Guest: {guest.firstName} {guest.lastName}
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FormControl component="fieldset" fullWidth>
            <FormLabel component="legend">RSVP Status</FormLabel>
            <RadioGroup
              value={editedRsvp.invitationResponse}
              onChange={(e) => handleChange('invitationResponse', e.target.value)}
            >
              <FormControlLabel
                value={InvitationResponseEnum.Interested}
                control={<Radio />}
                label="Interested"
              />
              <FormControlLabel
                value={InvitationResponseEnum.Declined}
                control={<Radio />}
                label="Declined"
              />
              <FormControlLabel
                value={InvitationResponseEnum.Pending}
                control={<Radio />}
                label="Pending"
              />
            </RadioGroup>
          </FormControl>
        </Grid>
        
        <Grid item xs={12}>
          <Divider />
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>Wedding</InputLabel>
            <Select
              value={editedRsvp.wedding || RsvpEnum.Pending}
              label="Wedding"
              onChange={(e) => handleChange('wedding', e.target.value)}
            >
              <MenuItem value={RsvpEnum.Pending}>Pending</MenuItem>
              <MenuItem value={RsvpEnum.Attending}>Attending</MenuItem>
              <MenuItem value={RsvpEnum.Declined}>Declined</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>Rehearsal Dinner</InputLabel>
            <Select
              value={editedRsvp.rehearsalDinner || RsvpEnum.Pending}
              label="Rehearsal Dinner"
              onChange={(e) => handleChange('rehearsalDinner', e.target.value)}
            >
              <MenuItem value={RsvpEnum.Pending}>Pending</MenuItem>
              <MenuItem value={RsvpEnum.Attending}>Attending</MenuItem>
              <MenuItem value={RsvpEnum.Declined}>Declined</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>Fourth of July</InputLabel>
            <Select
              value={editedRsvp.fourthOfJuly || RsvpEnum.Pending}
              label="Fourth of July"
              onChange={(e) => handleChange('fourthOfJuly', e.target.value)}
            >
              <MenuItem value={RsvpEnum.Pending}>Pending</MenuItem>
              <MenuItem value={RsvpEnum.Attending}>Attending</MenuItem>
              <MenuItem value={RsvpEnum.Declined}>Declined</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </Box>
    </Box>
  );
};

export default GuestEditor;