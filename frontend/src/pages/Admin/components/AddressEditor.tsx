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
  
  const { validateAddressMutation } = useApiContext();
  
  // Update local form state when initialAddress changes or edit mode is entered
  useEffect(() => {
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
  }, [initialAddress, editMode]);
  
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
      
      // Call the API to validate the address
      const validatedAddressResult = await validateAddressMutation.mutateAsync(addressForm);
      
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
                  { value: null, label: 'United States', flag: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMjM1IDY1MCIgeG1sbnM6dj0iaHR0cHM6Ly92ZWN0YS5pby9uYW5vIj48cGF0aCBkPSJNMCAwaDEyMzV2NjUwSDB6IiBmaWxsPSIjZmZmIi8+PHBhdGggZD0iTTAgNTBoMTIzNXY1MEgwem0wIDEwMGgxMjM1djUwSDB6bTAgMTAwaDEyMzV2NTBIMHptMCAxMDBoMTIzNXY1MEgwem0wIDEwMGgxMjM1djUwSDB6bTAgMTAwaDEyMzV2NTBIMHoiIGZpbGw9IiNiMjIyMzQiLz48cGF0aCBkPSJNMCAwaDQ5NHYzNTBIMHoiIGZpbGw9IiMzYzNiNmUiLz48cGF0aCBkPSJNNDEuNyA1MGw2LjIgMTkuMWgxOS45bC0xNi4xIDExLjcgNi4yIDE5LTEwLjEtOS4yTDQxLjcgMDEwMS43bDYuMi0xOS4xLTE2LjEtMTEuN2gxOS45em04MiAwbDYuMiAxOS4xaDIwbC0xNi4xIDExLjcgNi4yIDE5LjEtMTYuMy0xMS44LTE2LjEgMTEuOCA2LjItMTkuMS0xNi4yLTExLjdoMjB6bTgyIDBsNi4yIDE5LjFoMTAuOWwtMTYuMSAxMS43IDYuMiAxOS4xLTE2LjMtMTEuOC0xNi4xIDExLjggNi4yLTE5LjEtMTYuMi0xMS43aDIwem04MiAwbDYuMiAxOS4xaDE5LjlsLTE2LjEgMTEuNyA2LjIgMTkuMS0xNi4zLTExLjgtMTYuMSAxMS44IDYuMi0xOS4xLTE2LjItMTEuN2gyMHptODIgMGw2LjIgMTkuMWgyMGwtMTYuMiAxMS43IDYuMiAxOS4xLTE2LjItMTEuOC0xNi4xIDExLjggNi4xLTE5LjEtMTYuMS0xMS43aDIwek00MS43IDEwMGw2LjIgMTkuMWgxOS45bC0xNi4xIDExLjcgNi4yIDE5LTEwLjEtOS4yTDQxLjcgMDE1MS43bDYuMi0xOS4xLTE2LjEtMTEuN2gxOS45em04MiAwbDYuMiAxOS4xaDIwbC0xNi4xIDExLjcgNi4yIDE5LjEtMTYuMy0xMS44LTE2LjEgMTEuOCA2LjItMTkuMS0xNi4yLTExLjdoMjB6bTgyIDBsNi4yIDE5LjFoMTkuOWwtMTYuMSAxMS43IDYuMiAxOS4xLTE2LjMtMTEuOC0xNi4xIDExLjggNi4yLTE5LjEtMTYuMi0xMS43aDIwem04MiAwbDYuMiAxOS4xaDE5LjlsLTE2LjEgMTEuNyA2LjIgMTkuMS0xNi4zLTExLjgtMTYuMSAxMS44IDYuMi0xOS4xLTE2LjItMTEuN2gyMHptODIgMGw2LjIgMTkuMWgyMGwtMTYuMiAxMS43IDYuMiAxOS4xLTE2LjItMTEuOC0xNi4xIDExLjggNi4xLTE5LjEtMTYuMS0xMS43aDIwek00MS43IDE1MGw2LjIgMTkuMWgxOS45bC0xNi4xIDExLjcgNi4yIDE5LTEwLjEtOS4yTDQxLjcgMDIwMS43bDYuMi0xOS4xLTE2LjEtMTEuN2gxOS45em04MiAwbDYuMiAxOS4xaDIwbC0xNi4xIDExLjcgNi4yIDE5LjEtMTYuMy0xMS44LTE2LjEgMTEuOCA2LjItMTkuMS0xNi4yLTExLjdoMjB6bTgyIDBsNi4yIDE5LjFoMTkuOWwtMTYuMSAxMS43IDYuMiAxOS4xLTE2LjMtMTEuOC0xNi4xIDExLjggNi4yLTE5LjEtMTYuMi0xMS43aDIwem04MiAwbDYuMiAxOS4xaDE5LjlsLTE2LjEgMTEuNyA2LjIgMTkuMS0xNi4zLTExLjgtMTYuMSAxMS44IDYuMi0xOS4xLTE2LjItMTEuN2gyMHptODIgMGw2LjIgMTkuMWgyMGwtMTYuMiAxMS43IDYuMiAxOS4xLTE2LjItMTEuOC0xNi4xIDExLjggNi4xLTE5LjEtMTYuMS0xMS43aDIwek00MS43IDIwMGw2LjIgMTkuMWgxOS45bC0xNi4xIDExLjcgNi4yIDE5LjEtMTYuMy0xMS44LTE2LjEgMTEuOCA2LjItMTkuMS0xNi4yLTExLjdoMjB6bTgyIDBsNi4yIDE5LjFoMjBsLTE2LjEgMTEuNyA2LjIgMTkuMS0xNi4zLTExLjgtMTYuMSAxMS44IDYuMi0xOS4xLTE2LjItMTEuN2gyMHptODIgMGw2LjIgMTkuMWgxOS45bC0xNi4xIDExLjcgNi4yIDE5LjEtMTYuMy0xMS44LTE2LjEgMTEuOCA2LjItMTkuMS0xNi4yLTExLjdoMjB6bTgyIDBsNi4yIDE5LjFoMTkuOWwtMTYuMSAxMS43IDYuMiAxOS4xLTE2LjMtMTEuOC0xNi4xIDExLjggNi4yLTE5LjEtMTYuMi0xMS43aDIwem04MiAwbDYuMiAxOS4xaDIwbC0xNi4yIDExLjcgNi4yIDE5LjEtMTYuMi0xMS44LTE2LjEgMTEuOCA2LjEtMTkuMS0xNi4xLTExLjdoMjB6TTgyLjYgMjc1bDYuMiAxOS4xaDIwbC0xNi4yIDExLjcgNi4yIDE5LjEtMTYuMi0xMS44LTE2LjEgMTEuOCA2LjEtMTkuMS0xNi4xLTExLjdoMjB6bTgyIDBsNi4yIDE5LjFoMTkuOWwtMTYuMSAxMS43IDYuMiAxOS4xLTE2LjMtMTEuOC0xNi4xIDExLjggNi4yLTE5LjEtMTYuMi0xMS43aDIwem04MiAwbDYuMiAxOS4xaDE5LjlsLTE2LjEgMTEuNyA2LjIgMTkuMS0xNi4zLTExLjgtMTYuMSAxMS44IDYuMi0xOS4xLTE2LjItMTEuN2gyMHptODIgMGw2LjIgMTkuMWgxOS45bC0xNi4xIDExLjcgNi4yIDE5LjEtMTYuMy0xMS44LTE2LjEgMTEuOCA2LjItMTkuMS0xNi4yLTExLjdoMjB6bTgyIDBsNi4yIDE5LjFoMjBsLTE2LjIgMTEuNyA2LjIgMTkuMS0xNi4yLTExLjgtMTYuMSAxMS44IDYuMS0xOS4xLTE2LjEtMTEuN2gyMHoiIGZpbGw9IiNmZmYiLz48L3N2Zz4=' },
                  { value: 'Canada', label: 'Canada', flag: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAwIiBoZWlnaHQ9IjYwMCIgdmlld0JveD0iMCAwIDEyMDAgNjAwIj48cGF0aCBmaWxsPSIjZjAwIiBkPSJNMCAwaDEyMDB2NjAwSDB6Ii8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTMwMCAwaDYwMHY2MDBIMzAweiIvPjxyZWN0IHdpZHRoPSI0OTUiIGhlaWdodD0iMzAiIHg9IjM1Mi41IiB5PSI0MDAiIGZpbGw9IiNmZmYiLz48cGF0aCBkPSJNNjAwIDQzMEw1ODUgMzg1bC00MiAyNyAyLTUwLTQwLTEzIDQwLTEzLTItNTAgNDIgMjcgMTUtNDUgMTUgNDUgNDItMjctMiA1MCA0MCAxMy00MCAxMyAyIDUwLTQyLTI3bTE4Ljc1LTQ1LjVsMTUuMjUgNDUuNS00Mi0yNyAyIDUwLTQwIDEzIDQwIDEzLTIgNTAgNDItMjcgMTIuNSAzNy41LjUgMS41LjUgMS41IDIgNnYuMDAxcy0uMDYzLjIyLS4xMjUuMTI1Yy0uMDYyLS4wOTUtLjM3LS4yMjItLjM3LS4yMjJhMjYwLjk2NyAyNjAuOTY3IDAgMCAwLTIuMzU0LS44NDRjLS45MzQtLjMxMS0yLjM3LS43MzMtMy42MjUtMWwtLjI1LS4wNjNhNjguNzQ4IDY4Ljc0OCAwIDAgMC0yLjUzLS42MjRjLS41MjctLjExOS0xLjMxLS4yODItMi4zMTMtLjQzOGExNDUuNjQyIDE0NS42NDIgMCAwIDAtNy4xMjQtLjk2OWMtMS4yNzUtLjEyNi0yLjUzMi0uMjE4LTMuNzUtLjI1YTQ0Ljc1IDQ0Ljc1IDAgMCAwLTcuMjUtLjEyNmMtLjUzLjAzMS0xLjIwMy4xMDMtMi4wNjMuMjJhMzIuNyAzMi43IDAgMCAwLTMuMzc1LjY4N2MtMi40NTQuNjU4LTQuNDk0IDEuNjctNy4xMjUgMy4wMzEtMS4yOTcuNjctMi43NTIgMS40NzYtNC4zNzUgMi40MzgtMi41NTcgMS41MTgtNS42NzQgMy41MDctOS4yMTkgNmwtLjEyNS4wOTRjLS4wNjYuMDU1LS41NjIuNDMyLS42MjUuNXYtLjAwMWwtLjAzMS0uMDMxcy42NDYtLjgzNC44NDQtMS4xNTdjLjE5Ny0uMzIyLjIxNy0uNTkuMDYyLS45NjktLjE1NC0uMzc5LS45MzgtLjg3NS0uOTM4LS44NzUgMC0uMDAxLTEuMDkyLjgzLTEuNjY5Ljk2OS0uNTgzLjEzOC0xLjA4OC0uMzYtMS40MzctLjY4OC0uMzQ4LS4zMjgtLjcxOS0xLjA2Mi0uNzE5LTEuMDYyIDAgLjAwMS0uMDQyLjkyMS0uNTMxIDEuMzEzLS40OS40LTEuNjczLjA5NC0xLjY4Ny4wNjIuMDEzLjAzMS0xLjI5OC0uMjIyLTEuNjU2LS41LS4zNTgtLjI3OS0uMjY2LS43NS0uMTI1LTEuMTg4LjE0MS0uNDM4LS4wMzEtLjk2OS0uMDMxLS45NjktLjAwMS0uMDAxLTEuMzcuNjQtMS43MTkuNTk0LS4zNDgtLjA0Ni0uOTA1LS41MzUtMS4wOTQtLjkwNi0uMTg5LS4zNy0uNjI1LTIuMjUtLjYyNS0yLjI1bC0uODEzLjEyNWMtLjE5Mi0uNjg5LTIuMDYyLTEuNTMtMi4wNjItMS41My0uMDAxIDAtLjUzIDEuMjU4LS45MzcgMS40MzctLjQwNy4xOC0uODQ0LS4zNzUtLjg0NC0uMzc1cy0uMjUgMS4wNjEtLjc1IDEuNDY5Yy0uNTA0LjQxLTEuMTQzLjIyLS45MDYtLjY1Ny4yMzctLjg3Ny43NS0yLjIyLjc1LTIuMzEzIDAtLjA5Mi0uNzE5LS45MzgtLjcxOS0uOTM4IDAgLjAwMS0uNTkzLjAzOC0uNzgxLjE4OC0uMTkuMTUtLjcxOC43NS0uNzE4Ljc1bC0uMDYzLS44NzVzLS4zMTQuMTQtLjc1LjEyNWMtLjQzNS0uMDE0LTEuMTktLjQzOC0xLjE4Ny0uNzE5LjAwMi0uMjgxLjkwNi0uNjI1LjkwNi0uNjI1IDAgLjAwMS0uODYtLjk1OS0xLjA5My0xLjI1LS4yMzQtLjI5MS0uNTM4LS41NjctLjY4OC0uNTk0LS4xNS0uMDI3LS42MjUuMDYyLS42MjUuMDYyczEuMDE2LTEuNzAxIDEuMjUtMi4yODFjLjIzNC0uNTgxLjE4Ny0xLjAzMS0uMzEyLTEuMjUtLjUtLjIxOS0xLjE1Ni0uMDAxLTEuMTU2LDAgMC0uMDAxIDAgLjA2Mi0uMDMxLS4zNDQtLjAzMS0uNDA2LS4xMjUtMS40MDYtLjEyNS0xLjQwNmwtLjQwNi0xLjI1Yy0uMDAxLS4wMDEtLjY3NCAxLjA1Mi0xLjI1IDEuNjI1LS41NzYuNTczLTEuNTYzIDEuMTU2LTIuMDYzIDEuMTU2LS41IDAtLjYyMi0uNzgyLS43MTktMS40MzctLjA5Ny0uNjU1LS4xMjYtMS43NS0uMTI2LTEuNzVzLTEuMzc2LjYyNS0yLjAzMS43MTljLS42NTUuMDk0LTEuMjE1LS4yMTktMS4yNS0uODEzcy4yOC0xLjYwNC0uMDMxLTIuMTg3OHYuMDAycy0uMzg4LTEuNzE0LS41NjMtMi40MzdjLS4xNzUtLjcyMy0uNDg3LTEuODQ1LS40MDYtMi42ODcuMDgtLjg0MyAyLjEyNS0yLjk1IDIuMTI1LTIuOTVsLjg1NS0xLjIyMi4wNTItLjAwNS0uMDAyLS4wMjEgNC4zNjgtLjM4LjU0LTEuODEzYy4wMDMtLjAwOCAxLjY5NC4xMDEgMi45MzguMzExIDEuMjQ0LjIwNSAyLjMxNC41NjUgMi4zNzUuNDY5IDAgMCAwLS4wMDIuMTU2IDAgLjE1Ni4wMDIgMi41NTQtLjI1IDMuMTI1LS4yNS41NyAwIC42NTQtLjQzOS44NzUtLjY4OC4yMy0uMjUuODQtLjc3NyAxLjMxLS43OC40NjguMDAxIDEuMzI2LjkzNSAxLjYwNSAxLjM1NS4yOC40Mi40MzUgMS4xNTIuNjg3IDEuMzEyLjI1My4xNi41NjUuMDYgMS4wMDEtLjEyNS40MzctLjE5NCAxLjI4LS43MzIgMS45MzgtLjc1Ni42NTgtLjAyMyAxLjA3OC40NjYgMS42ODcuNzgxLjYxLjMxNSAxLjY1OS44MTIgMi4xODguNzgxLjUyOS0uMDMgMS4xNDktLjI4NCAxLjY4Ny0uNDM3LjUzOC0uMTUzLjg4LS4zMDIgMS4wOTQtLjMxMy4yMTQtLjAxIDEuMjUtLjEyNSAxLjI1LS4xMjRsMi4xNzUtMS42OTljLTEuOTI0LTEuNTk3LTIuNTY3LTEuNzMyLTIuNTYyLTEuNzU3LS4wMDQuMDI1LTEuOTA3LS4xOS0xLjk2OSAuMDYzLS4wNjIuMjUyLS4wOTMuNTkzLS41My43NS0uNDM4LjE1Ni0xLjIzOS0uNjI1LTEuMTg4LS45MzcuMDUyLS4zMTMuNjg4LS42MjUuNjg4LS42MjUgMC0uMDAxLTEuNDgzLS4yMzUtMS43NS0uNDY4LS4yNjYtLjIzNC0uNDY4LS44MTMtLjQ2OC0uODEzbC0uNS0xLjA5M2MuMDQ5LjAwNi0uNzQ0LS4yNDUtMS4wMzEtLjMxMy0uMjg3LS4wNjktLjgxMi0uMjQ4LS45MzctLjM3NC0uMTI2LS4xMjYtLjQ3LS41NjYtLjQ3LS43NSAwLS4xODQuNDM4LS42ODcuNDM4LS42ODcgMC0uMDAxLS41MjMtLjQyOC0uNzUtLjY4OC0uMTcyLS4yLS4xMzMtLjcxOC0uMTMzLTcxOGw1LjQ2Ni0uNTAyLjU5NS0uNDA2cy0uMDg3LS4xOTctLjE2LS40MDZjLS4wNzQtLjIxLS4wOTQtLjQwNC0uMDYzLS40MzguMDMyLS4wMzQuMTg2LjA2My4xODguMDYybDEuMTg3LS4zNDNTNTYxLjk3OCAyNzAgNTYyIDI3MGMuMDIyIDAgMTUuMyA0NSAzOC43NSA5MHMxOCAzMCAxOCAzMHptLTEzOC4xMjUtMTIwczguNTcgMTEuNTk0LjczQTYuNDQ3IDYuNDQ3IDAgMCAwLTIxLjQzOGg0LjI1eiIgZmlsbD0iI2YwMCIvPjwvc3ZnPg==' },
                  { value: 'Germany', label: 'Germany', flag: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAwIDYwMCI+PHBhdGggZmlsbD0iIzAwMCIgZD0iTTAgMGgxMDAwdjYwMEgweiIvPjxwYXRoIGZpbGw9IiNmMDAiIGQ9Ik0wIDIwMGgxMDAwdjIwMEgweiIvPjxwYXRoIGZpbGw9IiNmZmQiIGQ9Ik0wIDQwMGgxMDAwdjIwMEgweiIvPjwvc3ZnPg==' },
                  { value: 'Norway', label: 'Norway', flag: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTAwIDgwMCI+PHBhdGggZmlsbD0iI2VmMmI2ZCIgZD0iTTAgMGgxMTAwdjgwMEgweiIvPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0zMDAgMGgxMDB2ODAwSDMwMHoiLz48cGF0aCBmaWxsPSIjZmZmIiBkPSJNMCAzNTBoMTEwMHYxMDBIMHoiLz48cGF0aCBmaWxsPSIjMDAyODY4IiBkPSJNMCAzODBoMTEwMHY0MEgweiIvPjxwYXRoIGZpbGw9IiMwMDI4NjgiIGQ9Ik0zMzAgMGg0MHY4MDBIMzMweiIvPjwvc3ZnPg==' },
                  { value: 'Mexico', label: 'Mexico', flag: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAwIDcwMCI+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTAgMGgxMDAwdjcwMEgweiIvPjxwYXRoIGZpbGw9IiNjZTE0MjYiIGQ9Ik0wIDBoMzMzLjN2NzAwSDB6Ii8+PHBhdGggZmlsbD0iIzAwNTIzZiIgZD0iTTY2Ni43IDBoMzMzLjN2NzAwSDY2Ni43eiIvPjxnIGZpbGw9IiM4YjRiMTkiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDUwMCAzNTApIj48Y2lyY2xlIHIgMTI1IGZpbGw9IiNmZmVhZDEiLz48cGF0aCBkPSJNIDAgMGgxMjVsLTYyLjUgMTAwemgwIiBmaWxsPSIjOGI0YjE5Ii8+PGVsbGlwc2UgY3g9IjAiIGN5PSItCTI1IiByeD0iMTIuNSIgcnk9IjI1IiBmaWxsPSIjOGI0YjE5Ii8+PGVsbGlwc2UgY3g9IjAiIGN5PSIyNSIgcng9IjEyLjUiIHJ5PSIyNSIgZmlsbD0iIzhiNGIxOSIvPjxlbGxpcHNlIGN4PSIwIiBjeT0iMCIgcng9IjI1IiByeT0iMTIuNSIgZmlsbD0iIzhiNGIxOSIvPjwvZz48L3N2Zz4=' },
                  { value: 'Thailand', label: 'Thailand', flag: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA5MDAgNjAwIj48cGF0aCBmaWxsPSIjMmQyYTRhIiBkPSJNMCAwaDkwMHY2MDBIMHoiLz48cGF0aCBmaWxsPSIjYjEwYjE0IiBkPSJNMCAxMDBoOTAwdjQwMEgweiIvPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0wIDE1MGg5MDB2MzAwSDB6Ii8+PC9zdmc+' }
                ].map((option) => (
                  <Button
                    key={option.value || 'usa'}
                    onClick={() => handleInputChange('country', option.value)}
                    variant={addressForm.country === option.value ? 'contained' : 'outlined'}
                    color={addressForm.country === option.value ? 'primary' : 'inherit'}
                    disabled={disabled}
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