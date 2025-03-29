import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Stack
} from '@mui/material';
import { AddressDto, FamilyUnitDto } from '@/types/api';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useApiContext } from '@/context/ApiContext';

interface AddressEditorProps {
  address: AddressDto | undefined;
  invitationCode: string;
  onUpdate: (updatedData: Partial<FamilyUnitDto>) => void;
  onClose: () => void;
}

const AddressEditor: React.FC<AddressEditorProps> = ({
  address,
  invitationCode,
  onUpdate,
  onClose
}) => {
  const { validateAddressMutation } = useApiContext();
  const [editedAddress, setEditedAddress] = useState<AddressDto>({
    streetAddress: address?.streetAddress || null,
    secondaryAddress: address?.secondaryAddress || null,
    city: address?.city || null,
    state: address?.state || null,
    postalCode: address?.postalCode || null,
    zipPlus4: address?.zipPlus4 || null,
    uspsVerified: address?.uspsVerified || false
  });
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleChange = (field: keyof AddressDto, value: string | null) => {
    setEditedAddress(prev => ({
      ...prev,
      [field]: value,
      // If address is changed, it's no longer verified
      uspsVerified: field !== 'uspsVerified' ? false : prev.uspsVerified
    }));
  };

  const validateAddress = async () => {
    setIsValidating(true);
    setValidationError(null);
    
    try {
      // Ensure address has all required fields before validation
      if (!editedAddress.streetAddress || !editedAddress.city || !editedAddress.state || !editedAddress.postalCode) {
        setValidationError('Address is incomplete. Please fill in all required fields.');
        setIsValidating(false);
        return;
      }

      // Create a clean address object for validation
      const addressForValidation = {
        streetAddress: editedAddress.streetAddress,
        secondaryAddress: editedAddress.secondaryAddress,
        city: editedAddress.city,
        state: editedAddress.state,
        postalCode: editedAddress.postalCode,
        zipCode: editedAddress.postalCode, // Use postalCode for zipCode field
        country: 'USA'
      };
      
      const result = await validateAddressMutation.mutateAsync(addressForValidation);
      
      // Check if we got a valid result
      if (result) {
        setEditedAddress({
          ...editedAddress,
          ...result,
          uspsVerified: true
        });
      } else {
        setValidationError('Address validation failed. The service might be temporarily unavailable.');
      }
    } catch (error: any) {
      console.error('Error validating address:', error);
      
      // Provide more detailed error message based on the error
      if (error?.status === 400) {
        setValidationError('Invalid address format. Please check all fields and try again.');
      } else if (error?.status === 500) {
        setValidationError('Server error during validation. You can still save the address without validation.');
      } else {
        setValidationError('Address validation failed. You can still save the address without validation.');
      }
    } finally {
      setIsValidating(false);
    }
  };

  const handleSave = () => {
    onUpdate({
      mailingAddress: editedAddress
    });
    onClose();
  };

  const isFormValid = !!editedAddress.streetAddress && 
                     !!editedAddress.city && 
                     !!editedAddress.state && 
                     !!editedAddress.postalCode;

  return (
    <Box sx={{ p: 2 }}>
      {validationError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {validationError}
        </Alert>
      )}
      
      <Typography variant="subtitle2" gutterBottom>
        Family: {invitationCode}
      </Typography>
      
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid item xs={12}>
          <TextField
            label="Street Address"
            value={editedAddress.streetAddress || ''}
            onChange={(e) => handleChange('streetAddress', e.target.value || null)}
            fullWidth
            variant="outlined"
            size="small"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Apt/Unit (Optional)"
            value={editedAddress.secondaryAddress || ''}
            onChange={(e) => handleChange('secondaryAddress', e.target.value || null)}
            fullWidth
            variant="outlined"
            size="small"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="City"
            value={editedAddress.city || ''}
            onChange={(e) => handleChange('city', e.target.value || null)}
            fullWidth
            variant="outlined"
            size="small"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <TextField
            label="State"
            value={editedAddress.state || ''}
            onChange={(e) => {
              const value = e.target.value.toUpperCase().slice(0, 2);
              handleChange('state', value || null);
            }}
            inputProps={{ maxLength: 2 }}
            fullWidth
            variant="outlined"
            size="small"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <TextField
            label="Zip Code"
            value={editedAddress.postalCode || ''}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 5);
              handleChange('postalCode', value || null);
              handleChange('zipPlus4', null); // Clear zip+4 when zip changes
            }}
            inputProps={{ maxLength: 5 }}
            fullWidth
            variant="outlined"
            size="small"
          />
        </Grid>
      </Grid>
      
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 3, mb: 1 }}>
        <Chip 
          icon={editedAddress.uspsVerified ? <CheckCircleOutlineIcon /> : <ErrorOutlineIcon />}
          label={editedAddress.uspsVerified ? "Address Verified" : "Address Not Verified"}
          color={editedAddress.uspsVerified ? "success" : "default"}
          variant={editedAddress.uspsVerified ? "filled" : "outlined"}
        />
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={validateAddress}
            disabled={isValidating || !isFormValid}
            startIcon={isValidating ? <CircularProgress size={20} /> : null}
          >
            {isValidating ? 'Validating...' : 'Validate Address'}
          </Button>
          <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', alignSelf: 'center' }}>
            {!editedAddress.uspsVerified && !validationError && "Optional - you can save without validation"}
          </Typography>
        </Box>
      </Stack>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          color="primary"
          disabled={!isFormValid}
        >
          Save Changes
        </Button>
      </Box>
    </Box>
  );
};

export default AddressEditor;