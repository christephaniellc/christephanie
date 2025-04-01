import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Divider,
  Chip
} from '@mui/material';
import { AddressDto } from '@/types/api';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

interface AddressConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  originalAddress: AddressDto;
  validatedAddress: AddressDto;
  onConfirm: () => void;
}

const AddressConfirmationDialog: React.FC<AddressConfirmationDialogProps> = ({
  open,
  onClose,
  originalAddress,
  validatedAddress,
  onConfirm
}) => {
  // Helper function to format an address as a string
  const formatAddress = (address: AddressDto): string => {
    let formatted = address.streetAddress || '';
    if (address.secondaryAddress) {
      formatted += `, ${address.secondaryAddress}`;
    }
    formatted += `\n${address.city || ''}, ${address.state || ''} ${address.zipCode || ''}`;
    if (address.zipPlus4) {
      formatted += `-${address.zipPlus4}`;
    }
    return formatted;
  };

  // Determine which fields have changed
  const hasChanged = (field: keyof AddressDto): boolean => {
    // Skip these fields in comparison
    if (['uspsVerified', 'streetAddressAbbreviation', 'cityAbbreviation', 'zipPlus4'].includes(field)) {
      return false;
    }
    
    // Handle null/undefined values
    const origValue = originalAddress[field] || '';
    const validValue = validatedAddress[field] || '';
    
    return origValue !== validValue;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="address-confirmation-dialog-title"
    >
      <DialogTitle id="address-confirmation-dialog-title">
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <VerifiedUserIcon color="success" sx={{ mr: 1 }} />
          Confirm USPS Validated Address
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Typography variant="body1" paragraph>
          USPS has validated and standardized the address. Please review the changes and confirm if you want to save the validated address.
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Typography variant="subtitle1" gutterBottom>
              Original Address
            </Typography>
            <Box sx={{ 
              p: 2, 
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              height: '100%',
              minHeight: '150px',
              whiteSpace: 'pre-line'
            }}>
              <Typography variant="body1">
                {formatAddress(originalAddress)}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={2} sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <CompareArrowsIcon fontSize="large" />
          </Grid>
          
          <Grid item xs={12} md={5}>
            <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              USPS Validated Address
              <Chip 
                icon={<VerifiedUserIcon />} 
                label="Verified" 
                color="success" 
                size="small"
                sx={{ ml: 1 }}
              />
            </Typography>
            <Box sx={{ 
              p: 2, 
              border: '1px solid',
              borderColor: 'success.main',
              borderRadius: 1,
              bgcolor: 'success.light',
              color: 'success.contrastText',
              height: '100%',
              minHeight: '150px',
              whiteSpace: 'pre-line'
            }}>
              <Typography variant="body1">
                {formatAddress(validatedAddress)}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />
        
        <Typography variant="subtitle1" gutterBottom>
          Changes Made by USPS:
        </Typography>
        
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {hasChanged('streetAddress') && (
            <Grid item xs={12}>
              <Typography variant="body2">
                <strong>Street Address:</strong> {originalAddress.streetAddress} → <strong>{validatedAddress.streetAddress}</strong>
              </Typography>
            </Grid>
          )}
          
          {hasChanged('secondaryAddress') && (
            <Grid item xs={12}>
              <Typography variant="body2">
                <strong>Secondary Address:</strong> {originalAddress.secondaryAddress || 'None'} → <strong>{validatedAddress.secondaryAddress || 'None'}</strong>
              </Typography>
            </Grid>
          )}
          
          {hasChanged('city') && (
            <Grid item xs={12} sm={6}>
              <Typography variant="body2">
                <strong>City:</strong> {originalAddress.city} → <strong>{validatedAddress.city}</strong>
              </Typography>
            </Grid>
          )}
          
          {hasChanged('state') && (
            <Grid item xs={12} sm={6}>
              <Typography variant="body2">
                <strong>State:</strong> {originalAddress.state} → <strong>{validatedAddress.state}</strong>
              </Typography>
            </Grid>
          )}
          
          {hasChanged('zipCode') && (
            <Grid item xs={12} sm={6}>
              <Typography variant="body2">
                <strong>ZIP Code:</strong> {originalAddress.zipCode} → <strong>{validatedAddress.zipCode}</strong>
              </Typography>
            </Grid>
          )}
          
          {validatedAddress.zipPlus4 && (
            <Grid item xs={12} sm={6}>
              <Typography variant="body2">
                <strong>ZIP+4 Added:</strong> <strong>{validatedAddress.zipPlus4}</strong>
              </Typography>
            </Grid>
          )}
          
          {validatedAddress.streetAddressAbbreviation && (
            <Grid item xs={12}>
              <Typography variant="body2">
                <strong>Standardized Format:</strong> <strong>{validatedAddress.streetAddressAbbreviation}</strong>
                {validatedAddress.cityAbbreviation && `, ${validatedAddress.cityAbbreviation}`}, 
                {validatedAddress.state} {validatedAddress.zipCode}
                {validatedAddress.zipPlus4 && `-${validatedAddress.zipPlus4}`}
              </Typography>
            </Grid>
          )}
          
          {!hasChanged('streetAddress') && 
           !hasChanged('secondaryAddress') && 
           !hasChanged('city') && 
           !hasChanged('state') && 
           !hasChanged('zipCode') && 
           !validatedAddress.zipPlus4 && (
            <Grid item xs={12}>
              <Typography variant="body2">
                No significant changes were made to the address structure, but it has been validated by USPS.
              </Typography>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button 
          onClick={onConfirm} 
          variant="contained" 
          color="primary"
          startIcon={<VerifiedUserIcon />}
        >
          Save Validated Address
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddressConfirmationDialog;