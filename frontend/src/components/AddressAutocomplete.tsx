import React from 'react';
import { TextField, useTheme } from '@mui/material';
import { useAddress } from '../context/Address/AddressContext';
import { useAddressAutocomplete } from '../context/Address/useAddressAutocomplete';

const AddressAutocomplete: React.FC = () => {
  const { address, setAddress } = useAddress();
  const theme = useTheme();
  const { inputRef, isAutocompleteEnabled } = useAddressAutocomplete();

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(event.target.value);
  };

  return (
    <TextField
      inputRef={isAutocompleteEnabled ? inputRef : undefined}
      value={address}
      onChange={handleInputChange}
      label="Enter Address"
      variant="outlined"
      fullWidth
      sx={{ maxWidth: theme.breakpoints.values.sm, mx: 2, mb: 2 }}
    />
  );
};

export default AddressAutocomplete;
