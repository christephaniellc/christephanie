import React, { useState, useEffect } from 'react';
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
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { AddressDto } from '@/types/api';
import { useApiContext } from '@/context/ApiContext';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import PublicIcon from '@mui/icons-material/Public';
import FlagUS from '@/assets/flags/us.svg';
import FlagCA from '@/assets/flags/ca.svg';
import FlagDE from '@/assets/flags/de.svg';
import FlagNO from '@/assets/flags/no.svg';
import FlagMX from '@/assets/flags/mx.svg';
import FlagTH from '@/assets/flags/th.svg';

// Import confirmation dialog
import AddressConfirmationDialog from './AddressConfirmationDialog';

interface AddressEditorProps {
  address: AddressDto | null | undefined;
  onAddressUpdate: (updatedAddress: AddressDto) => Promise<void>;
  readOnly?: boolean;
}

const AddressEditor: React.FC<AddressEditorProps> = ({ 
  address: initialAddress,
  onAddressUpdate,
  readOnly = false
}) => {
  // Local form state instead of Recoil to prevent slow typing
  const [addressForm, setAddressForm] = useState<AddressDto & { country?: string }>({
    streetAddress: '',
    secondaryAddress: '',
    city: '',
    state: '',
    zipCode: '',
    uspsVerified: false,
    country: null
  });
  
  const [editMode, setEditMode] = useState(false);
  const [validatingAddress, setValidatingAddress] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressValidationError, setAddressValidationError] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [originalAddress, setOriginalAddress] = useState<AddressDto | null>(null);
  const [validatedAddress, setValidatedAddress] = useState<AddressDto | null>(null);
  
  // Use apiInstance directly instead of validateAddressMutation to avoid the side effect
  // of updating the current user's address
  const { apiInstance } = useApiContext();
  
  // Update local form state when initialAddress changes and exit edit mode when family changes
  useEffect(() => {
    // Reset all states when the address changes (family selection changes)
    setEditMode(false);
    setAddressValidationError(null);
    setValidatingAddress(false);
    setSavingAddress(false);
    setConfirmDialogOpen(false);
    setOriginalAddress(null);
    setValidatedAddress(null);
    
    if (initialAddress) {
      setAddressForm({
        streetAddress: initialAddress.streetAddress || '',
        secondaryAddress: initialAddress.secondaryAddress || '',
        city: initialAddress.city || '',
        state: initialAddress.state || '',
        zipCode: initialAddress.zipCode || '',
        uspsVerified: initialAddress.uspsVerified || false,
        streetAddressAbbreviation: initialAddress.streetAddressAbbreviation,
        cityAbbreviation: initialAddress.cityAbbreviation,
        zipPlus4: initialAddress.zipPlus4,
        country: (initialAddress as any)?.country || null // Add country field with default
      });
    }
  }, [initialAddress]);
  
  // Handle input changes without using Recoil
  const handleInputChange = (field: keyof AddressDto, value: string | null) => {
    setAddressForm(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleValidateAddress = async () => {
    if (!addressForm.streetAddress || !addressForm.city || !addressForm.state || !addressForm.zipCode) {
      setAddressValidationError('Please fill out all required address fields before validating.');
      return;
    }
    
    setValidatingAddress(true);
    setAddressValidationError(null);
    
    try {
      // Store the original address for comparison
      setOriginalAddress({...addressForm});
      
      // Call the API directly to validate the address without triggering the side effect
      // of updating the current user's address
      const validatedAddressResult = apiInstance ? await apiInstance.validateAddress(addressForm) : null;
      
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
      setSavingAddress(true);
      
      // Update the form state with validated values
      setAddressForm(validatedAddress);
      
      // Save the validated address to the family using the admin endpoint
      await onAddressUpdate(validatedAddress);
      
      // Close the dialog and exit edit mode
      setConfirmDialogOpen(false);
      setEditMode(false);
    } catch (error) {
      console.error('Failed to save validated address:', error);
      setAddressValidationError('Failed to save validated address. Please try again.');
    } finally {
      setSavingAddress(false);
      setConfirmDialogOpen(false);
    }
  };
  
  const handleSaveAddress = async () => {
    try {
      setSavingAddress(true);
      // Create a clean address object with only the fields we want to update
      const addressToSave: AddressDto & { country?: string } = {
        streetAddress: addressForm.streetAddress || null,
        secondaryAddress: addressForm.secondaryAddress || null,
        city: addressForm.city || null,
        state: addressForm.state || null,
        zipCode: addressForm.zipCode || null,
        uspsVerified: false, // Mark as unverified when manually saved
        country: addressForm.country || null
      };
      
      await onAddressUpdate(addressToSave as AddressDto);
      setEditMode(false);
    } catch (error) {
      console.error('Failed to save address:', error);
      setAddressValidationError('Failed to save address. Please try again.');
    } finally {
      setSavingAddress(false);
    }
  };
  
  const handleCancelEdit = () => {
    // Reset form state to the original address
    if (initialAddress) {
      setAddressForm({
        streetAddress: initialAddress.streetAddress || '',
        secondaryAddress: initialAddress.secondaryAddress || '',
        city: initialAddress.city || '',
        state: initialAddress.state || '',
        zipCode: initialAddress.zipCode || '',
        uspsVerified: initialAddress.uspsVerified || false,
        streetAddressAbbreviation: initialAddress.streetAddressAbbreviation,
        cityAbbreviation: initialAddress.cityAbbreviation,
        zipPlus4: initialAddress.zipPlus4,
        country: (initialAddress as any)?.country || null
      });
    }
    setEditMode(false);
    setAddressValidationError(null);
  };
  
  if (!initialAddress && !editMode) {
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
          loading={savingAddress}
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
          {initialAddress?.uspsVerified && (
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
              value={addressForm.streetAddress || ''}
              onChange={(e) => handleInputChange('streetAddress', e.target.value || null)}
              error={!addressForm.streetAddress}
              helperText={!addressForm.streetAddress ? 'Required' : ''}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              name="secondaryAddress"
              label="Apartment, Suite, etc. (optional)"
              value={addressForm.secondaryAddress || ''}              
              onChange={(e) => handleInputChange('secondaryAddress', e.target.value || null)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              name="city"
              label="City"
              value={addressForm.city || ''}
              onChange={(e) => handleInputChange('city', e.target.value || null)}
              error={!addressForm.city}
              helperText={!addressForm.city ? 'Required' : ''}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField
              fullWidth
              required
              name="state"
              label="State"
              value={addressForm.state || ''}
              onChange={(e) => {
                const value = e.target.value.toUpperCase().slice(0, 2);
                handleInputChange('state', value || null);
              }}
              error={!addressForm.state}
              helperText={!addressForm.state ? 'Required' : ''}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField
              fullWidth
              required
              name="zipCode"
              label={(addressForm.country === null) 
                ? 'ZIP Code' 
                : 'Postal Code'}
              value={addressForm.zipCode || ''}
              onChange={(e) => {
                let value = e.target.value;
                
                // Format postal code based on country
                if (addressForm.country === null) {
                  // US - only numbers, max 5 digits
                  value = e.target.value.replace(/\D/g, '').slice(0, 5);
                } else if (addressForm.country === 'Canada') {
                  // Canadian format: A1A 1A1
                  value = e.target.value.replace(/[^a-zA-Z0-9 ]/g, '').toUpperCase();
                  if (value.length > 3 && !value.includes(' ')) {
                    value = `${value.slice(0, 3)} ${value.slice(3, 7)}`.trim();
                  }
                  value = value.slice(0, 7); // Max length including space
                } else if (['Germany', 'Mexico', 'Thailand'].includes(addressForm.country)) {
                  // Postal codes for these countries are numeric, usually 5 digits
                  value = e.target.value.replace(/\D/g, '').slice(0, 5);
                } else if (addressForm.country === 'Norway') {
                  // Norway uses 4-digit postal codes
                  value = e.target.value.replace(/\D/g, '').slice(0, 4);
                } else {
                  // For any other countries, allow alphanumeric
                  value = e.target.value.slice(0, 10);
                }
                
                handleInputChange('zipCode', value || null);
              }}
              error={!addressForm.zipCode}
              helperText={!addressForm.zipCode ? 'Required' : ''}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Country</Typography>
              <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 1 
              }}>
                {[
                  { value: null, label: 'United States', flag: FlagUS },
                  { value: 'Canada', label: 'Canada', flag: FlagCA },
                  { value: 'Germany', label: 'Germany', flag: FlagDE },
                  { value: 'Norway', label: 'Norway', flag: FlagNO },
                  { value: 'Mexico', label: 'Mexico', flag: FlagMX },
                  { value: 'Thailand', label: 'Thailand', flag: FlagTH }
                ].map((option) => (
                  <Button
                    key={option.value || 'usa'}
                    onClick={() => handleInputChange('country', option.value)}
                    variant={addressForm.country === option.value ? 'contained' : 'outlined'}
                    color={addressForm.country === option.value ? 'primary' : 'inherit'}
                    //disabled={disabled}
                    sx={{
                      minWidth: '100px',
                      height: '36px',
                      p: '0 10px',
                      ml: 0,
                      borderRadius: 1,
                      '& .MuiButton-startIcon': {
                        marginRight: 1,
                        marginLeft: 0
                      }
                    }}
                    startIcon={
                      <Box 
                        component="img" 
                        src={option.flag} 
                        alt={option.label}
                        sx={{
                          width: 24,
                          height: 16,
                          objectFit: 'cover',
                          borderRadius: 0.5,
                          border: '1px solid rgba(0,0,0,0.1)'
                        }}
                      />
                    }
                  >
                    {option.label}
                  </Button>
                ))}
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button 
                variant="outlined" 
                color="secondary"
                startIcon={<CancelIcon />}
                onClick={handleCancelEdit}
                disabled={savingAddress || validatingAddress}
              >
                Cancel
              </Button>
              
              <Box>
                <Button 
                  variant="contained" 
                  color="primary"
                  startIcon={savingAddress ? <CircularProgress size={20} /> : <SaveIcon />}
                  onClick={handleSaveAddress}
                  sx={{ mr: 1 }}
                  disabled={
                    !addressForm.streetAddress || 
                    !addressForm.city || 
                    !addressForm.state || 
                    !addressForm.zipCode ||
                    validatingAddress ||
                    savingAddress
                  }
                >
                  {savingAddress ? 'Saving...' : 'Save'}
                </Button>
                
                <Button 
                  variant="contained" 
                  color="success"
                  startIcon={validatingAddress ? <CircularProgress size={20} /> : <CheckCircleIcon />}
                  onClick={handleValidateAddress}
                  disabled={
                    validatingAddress || 
                    savingAddress ||
                    !addressForm.streetAddress || 
                    !addressForm.city || 
                    !addressForm.state || 
                    !addressForm.zipCode ||
                    // Disable USPS validation for non-US addresses
                    addressForm.country !== null
                  }
                >
                  {validatingAddress ? 'Validating...' : 'Validate with USPS'}
                </Button>
                {/* Show helper text for non-US addresses */}
                {addressForm.country !== null && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, textAlign: 'right' }}>
                    USPS validation is only available for US addresses
                  </Typography>
                )}
              </Box>
            </Box>
          </Grid>
        </Grid>
      ) : (
        <Box>
          {/* Display address based on country format */}
          {(initialAddress as any)?.country ? (
            ['Canada', 'Mexico', 'Thailand'].includes((initialAddress as any)?.country) ? (
              // North American/Asian format
              <>
                <Typography variant="body1">
                  {initialAddress?.streetAddress}
                </Typography>
                {initialAddress?.secondaryAddress && (
                  <Typography variant="body1">
                    {initialAddress.secondaryAddress}
                  </Typography>
                )}
                <Typography variant="body1">
                  {initialAddress?.city}, {initialAddress?.state} {initialAddress?.zipCode}
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {(initialAddress as any)?.country.toUpperCase()}
                </Typography>
              </>
            ) : (
              // European address format (Germany/Norway)
              <>
                <Typography variant="body1">
                  {initialAddress?.streetAddress}
                </Typography>
                {initialAddress?.secondaryAddress && (
                  <Typography variant="body1">
                    {initialAddress.secondaryAddress}
                  </Typography>
                )}
                <Typography variant="body1">
                  {initialAddress?.zipCode} {initialAddress?.city}
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {(initialAddress as any)?.country.toUpperCase()}
                </Typography>
              </>
            )
          ) : (
            // US address format
            <>
              <Typography variant="body1">
                {initialAddress?.streetAddress}
              </Typography>
              {initialAddress?.secondaryAddress && (
                <Typography variant="body1">
                  {initialAddress.secondaryAddress}
                </Typography>
              )}
              <Typography variant="body1">
                {initialAddress?.city}, {initialAddress?.state} {initialAddress?.zipCode}
                {initialAddress?.zipPlus4 && `-${initialAddress.zipPlus4}`}
              </Typography>
              
              {initialAddress?.streetAddressAbbreviation && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  USPS Standardized: {initialAddress.streetAddressAbbreviation}, 
                  {initialAddress.cityAbbreviation && ` ${initialAddress.cityAbbreviation},`} 
                  {initialAddress.state} {initialAddress.zipCode}
                  {initialAddress.zipPlus4 && `-${initialAddress.zipPlus4}`}
                </Typography>
              )}
            </>
          )}
          
          {/* Country indicator */}
          <Chip 
            icon={<PublicIcon />}
            label={(initialAddress as any)?.country || 'United States'}
            color="info"
            size="small"
            sx={{ mr: 1, mt: 2 }}
          />
          
          {/* Verification status */}
          {!initialAddress?.uspsVerified && (
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