import React, { useEffect, useMemo } from 'react';
import { Box, FormGroup, TextField, Typography, useTheme } from '@mui/material';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { familyGuestsStates, useFamily } from '@/store/family';
import {
  addressState,
  cityAddressState,
  secondaryAddressState, stateAddressState,
  streetAddressState,
  zipCodeAddressState,
} from '@/store/address';
import Button from '@mui/material/Button';

const AddressEnvelope: React.FC = () => {
  const [familyUnit, familyActions] = useFamily();
  const { callByLastNames } = useRecoilValue(familyGuestsStates);
  const address = useRecoilValue(addressState);
  const setStreetAddress = useSetRecoilState(streetAddressState);
  const setSecondaryAddress = useSetRecoilState(secondaryAddressState);
  const setCity = useSetRecoilState(cityAddressState);
  const setState = useSetRecoilState(stateAddressState);
  const setZipCode = useSetRecoilState(zipCodeAddressState);

  const theme = useTheme();
  const gradientBorder = `
    repeating-linear-gradient(
      45deg,
      ${theme.palette.primary.main}, 
      ${theme.palette.primary.main} 5%,
      white 5%, 
      white 10%,
      ${theme.palette.secondary.main} 10%, 
      ${theme.palette.secondary.main} 15%
    )
  `;

  useEffect(() => {
    if (familyUnit && familyUnit.mailingAddress) {
      setStreetAddress(familyUnit.mailingAddress.streetAddress);
      setSecondaryAddress(familyUnit.mailingAddress.secondaryAddress);
      setCity(familyUnit.mailingAddress.city);
      setState(familyUnit.mailingAddress.state);
      setZipCode(familyUnit.mailingAddress.zipCode);
    }
  }, [familyUnit]);

  const saveAddressState = useMemo(() => {
    return familyActions.validateFamilyAddress.status;
  }, [familyActions.updateFamilyMutation]);

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <Typography mb={4} gutterBottom variant="h5">Where should we send your formal invitation?</Typography>
      <Box
        sx={{
          width: '100%',
          maxWidth: '400px',
          height: '350px',
          // backgroundColor: "#ffffff",
          borderRadius: '10px',
          margin: 'auto',
          position: 'relative',
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          border: '10px solid transparent',
          borderImageSource: gradientBorder,
          borderImageSlice: 1,
          padding: '16px',
          textAlign: 'center',
          // add blur to the background
          backdropFilter: 'blur(16px)',
        }}
      >
        <Typography variant="h6" sx={{ marginBottom: '16px' }}>
          The {callByLastNames}
        </Typography>
        <Box
          component={FormGroup}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <TextField color="secondary"
                     label="Street Address"
                     variant="standard"
                     fullWidth
                     value={address.streetAddress}
                     onChange={(e) => {
                       setStreetAddress(e.target.value);
                     }}
                     error={!!familyActions.validateFamilyAddress.error}
                     size="small"
          />
          <TextField
            value={address.secondaryAddress}
            color="secondary" label="Apt/Unit" variant="standard" fullWidth size="small"
            onChange={(e) => setSecondaryAddress(e.target.value)} />
          <TextField
            value={address.city}
            color="secondary" label="City" variant="standard" fullWidth size="small"
            onChange={(e) => setCity(e.target.value)} />
          <Box width="100%" textAlign="start">
            <TextField
              value={address?.state}

              sx={{ width: '100px', display: 'inline-flex' }}
              color="secondary" label="State" variant="standard" size="small"
              onChange={(e) => {
                const value = e.target.value.toUpperCase().slice(0, 2);
                setState(value);
              }} />
            <TextField
              sx={{ width: '100px', display: 'inline-flex' }}

              value={address.zipCode}
              color="secondary" label="Zip Code" variant="standard" size="small"
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 5);
                setZipCode(value);
              }} />
          </Box>
          <Button variant='contained' color='secondary' onClick={() => {
            if (address !== null) familyActions.validateFamilyAddress.mutate(address)
          }}
          >

            {saveAddressState === 'idle' && 'Save'}
            {saveAddressState === 'pending' && 'Saving...'}
            {saveAddressState === 'success' && 'Saved'}
            {saveAddressState === 'error' && familyActions.validateFamilyAddress.error.description}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default AddressEnvelope;
