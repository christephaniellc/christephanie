import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Grid, 
  Typography, 
  CircularProgress,
  Chip,
  Paper,
  Divider,
  Alert
} from '@mui/material';
import { AddressDto } from '@/types/api';
import { useApiContext } from '@/context/ApiContext';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

// Import confirmation dialog
import AddressConfirmationDialog from './AddressConfirmationDialog';

interface AddressEditorProps {
  address: AddressDto | null | undefined;
  onAddressUpdate: (updatedAddress: AddressDto) => Promise<void>;
  readOnly?: boolean;
}

const AddressEditor: React.FC<AddressEditorProps> = ({ 
  address, 
  onAddressUpdate,
  readOnly = false
}) => {
  const [editMode, setEditMode] = useState(false);
  const [validatingAddress, setValidatingAddress] = useState(false);
  const [addressValidationError, setAddressValidationError] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [originalAddress, setOriginalAddress] = useState<AddressDto | null>(null);
  const [validatedAddress, setValidatedAddress] = useState<AddressDto | null>(null);
  
  const [editedAddress, setEditedAddress] = useState<AddressDto>(
    address || {
      streetAddress: '',
      secondaryAddress: '',
      city: '',
      state: '',
      zipCode: '',
      uspsVerified: false
    }
  );
  
  const { validateAddressMutation } = useApiContext();
  
  // Set address when it changes from props
  React.useEffect(() => {
    if (address) {
      setEditedAddress(address);
    }
  }, [address]);
  
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setEditedAddress(prev => ({
      ...prev,
      [name]: value,
      // If we're editing a verified address, mark it as unverified
      ...(name !== 'secondaryAddress' && prev.uspsVerified ? { uspsVerified: false } : {})
    }));
  };
  
  const handleValidateAddress = async () => {
    if (!editedAddress.streetAddress || !editedAddress.city || !editedAddress.state || !editedAddress.zipCode) {
      setAddressValidationError('Please fill out all required address fields before validating.');
      return;
    }
    
    setValidatingAddress(true);
    setAddressValidationError(null);
    
    try {
      // Store the original address for comparison
      setOriginalAddress({...editedAddress});
      
      // Call the API to validate the address
      const validatedAddressResult = await validateAddressMutation.mutateAsync(editedAddress);
      
      // Update the local state with the validated address
      if (validatedAddressResult) {
        // Create an address with the USPS verified flag explicitly set
        const verifiedAddress: AddressDto = {
          ...validatedAddressResult,
          uspsVerified: true // Ensure it's marked as verified
        };
        
        // Store the validated address and open the confirmation dialog
        setValidatedAddress(verifiedAddress);
        setConfirmDialogOpen(true);
      }
    } catch (error) {
      console.error('Address validation failed:', error);
      setAddressValidationError('Address validation failed. Please check the address and try again.');
    } finally {
      setValidatingAddress(false);
    }
  };
  
  // Handle confirmation of validated address
  const handleConfirmValidatedAddress = async () => {
    if (!validatedAddress) return;
    
    try {
      // Update the local state
      setEditedAddress(validatedAddress);
      
      // Save the validated address to the family using the admin endpoint
      await onAddressUpdate(validatedAddress);
      
      // Close the dialog and exit edit mode
      setConfirmDialogOpen(false);
      setEditMode(false);
    } catch (error) {
      console.error('Failed to save validated address:', error);
      setAddressValidationError('Failed to save validated address. Please try again.');
      setConfirmDialogOpen(false);
    }
  };
  
  const handleSaveAddress = async () => {
    try {
      await onAddressUpdate(editedAddress);
      setEditMode(false);
    } catch (error) {
      console.error('Failed to save address:', error);
      setAddressValidationError('Failed to save address. Please try again.');
    }
  };
  
  const handleCancelEdit = () => {
    // Reset to original address
    if (address) {
      setEditedAddress(address);
    }
    setEditMode(false);
    setAddressValidationError(null);
  };
  
  if (!address && !editMode) {
    return (
      <Box>
        <Typography variant="body1" sx={{ mb: 2 }}>
          No address information available.
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<EditIcon />}
          onClick={() => setEditMode(true)}
          disabled={readOnly}
        >
          Add Address
        </Button>
      </Box>
    );
  }
  
  return (
    <>
      {/* Confirmation Dialog */}
      {originalAddress && validatedAddress && (
        <AddressConfirmationDialog
          open={confirmDialogOpen}
          onClose={() => setConfirmDialogOpen(false)}
          originalAddress={originalAddress}
          validatedAddress={validatedAddress}
          onConfirm={handleConfirmValidatedAddress}
        />
      )}
      
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 2
        }}>
          <Typography variant="h6">
            Mailing Address
          </Typography>
          {!editMode && !readOnly && (
            <Button 
              variant="outlined" 
              size="small"
              startIcon={<EditIcon />} 
              onClick={() => setEditMode(true)}
            >
              Edit
            </Button>
          )}
          {address?.uspsVerified && (
            <Chip 
              icon={<VerifiedUserIcon />} 
              label="USPS Verified" 
              color="success" 
              size="small"
            />
          )}
        </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      {addressValidationError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {addressValidationError}
        </Alert>
      )}
      
      {editMode ? (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              name="streetAddress"
              label="Street Address"
              value={editedAddress.streetAddress || ''}
              onChange={handleAddressChange}
              error={!editedAddress.streetAddress}
              helperText={!editedAddress.streetAddress ? 'Required' : ''}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              name="secondaryAddress"
              label="Apartment, Suite, etc. (optional)"
              value={editedAddress.secondaryAddress || ''}
              onChange={handleAddressChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              name="city"
              label="City"
              value={editedAddress.city || ''}
              onChange={handleAddressChange}
              error={!editedAddress.city}
              helperText={!editedAddress.city ? 'Required' : ''}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField
              fullWidth
              required
              name="state"
              label="State"
              value={editedAddress.state || ''}
              onChange={handleAddressChange}
              error={!editedAddress.state}
              helperText={!editedAddress.state ? 'Required' : ''}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField
              fullWidth
              required
              name="zipCode"
              label="ZIP Code"
              value={editedAddress.zipCode || ''}
              onChange={handleAddressChange}
              error={!editedAddress.zipCode}
              helperText={!editedAddress.zipCode ? 'Required' : ''}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button 
                variant="outlined" 
                color="secondary"
                startIcon={<CancelIcon />}
                onClick={handleCancelEdit}
              >
                Cancel
              </Button>
              
              <Box>
                <Button 
                  variant="contained" 
                  color="primary"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveAddress}
                  sx={{ mr: 1 }}
                  disabled={
                    !editedAddress.streetAddress || 
                    !editedAddress.city || 
                    !editedAddress.state || 
                    !editedAddress.zipCode ||
                    validatingAddress
                  }
                >
                  Save
                </Button>
                
                <Button 
                  variant="contained" 
                  color="success"
                  startIcon={validatingAddress ? <CircularProgress size={20} /> : <CheckCircleIcon />}
                  onClick={handleValidateAddress}
                  disabled={
                    validatingAddress || 
                    !editedAddress.streetAddress || 
                    !editedAddress.city || 
                    !editedAddress.state || 
                    !editedAddress.zipCode
                  }
                >
                  {validatingAddress ? 'Validating...' : 'Validate with USPS'}
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
      ) : (
        <Box>
          <Typography variant="body1">
            {editedAddress.streetAddress}
          </Typography>
          {editedAddress.secondaryAddress && (
            <Typography variant="body1">
              {editedAddress.secondaryAddress}
            </Typography>
          )}
          <Typography variant="body1">
            {editedAddress.city}, {editedAddress.state} {editedAddress.zipCode}
            {editedAddress.zipPlus4 && `-${editedAddress.zipPlus4}`}
          </Typography>
          
          {editedAddress.streetAddressAbbreviation && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              USPS Standardized: {editedAddress.streetAddressAbbreviation}, 
              {editedAddress.cityAbbreviation && ` ${editedAddress.cityAbbreviation},`} 
              {editedAddress.state} {editedAddress.zipCode}
              {editedAddress.zipPlus4 && `-${editedAddress.zipPlus4}`}
            </Typography>
          )}
          
          {!editedAddress.uspsVerified && (
            <Chip 
              icon={<ErrorIcon />} 
              label="Not Verified" 
              color="warning" 
              size="small"
              sx={{ mt: 2 }}
            />
          )}
        </Box>
      )}
    </Paper>
    </>
  );
};

export default AddressEditor;