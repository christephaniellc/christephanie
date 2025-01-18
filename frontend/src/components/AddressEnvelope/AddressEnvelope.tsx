import React, { useEffect } from 'react';
import { Box, TextField, Typography, useTheme } from '@mui/material';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { familyGuestsStates, familyState, useFamily } from '@/store/family';
import {
  addressState,
  cityAddressState,
  secondaryAddressState, stateAddressState,
  streetAddressState,
  zipCodeAddressState,
} from '@/store/address';
import Button from '@mui/material/Button';

const cityStateZipRegex = /^([\p{L}\p{N}\s'.-]+)\s*,\s*([A-Za-z]{2})\s*,\s*(\d{5})$/u;
// Explanation of the pattern:
//   ^ Start of string
//   ([\p{L}\p{N}\s'.-]+)  -> capture "city" portion (letters, digits, spaces, apostrophes, periods, dashes, etc.)
//   \s*,\s*               -> comma (with optional spaces around it)
//   ([A-Za-z]{2})         -> capture 2 letters for the state
//   \s*,\s*               -> comma (with optional spaces around it)
//   (\d{5})               -> capture 5 digits for the zip
//   $ End of string
//
// The "u" flag allows matching full Unicode (helpful for \p{L}).

const AddressEnvelope: React.FC = () => {
  // const { lastNames, setFamilyUnitAddress, familyUnit } = useInvitation();
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
    familyActions.setFamily({...familyUnit, mailingAddress: address});
  }, [address]);

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <Typography gutterBottom variant="h4">Where should we send your formal invitation?</Typography>
      <Box
        sx={{
          width: '400px',
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
        }}
      >
        <Typography variant="h6" sx={{ marginBottom: '16px' }}>
          The {callByLastNames}
        </Typography>
        <Box
          component="form"
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
                     value={familyUnit?.mailingAddress?.streetAddress}
                     onChange={(e) => {
                       console.log('setting street address', e.target.value);
                       setStreetAddress(e.target.value);
                     }}
                     size="small"
          />
          <TextField
            value={familyUnit?.mailingAddress?.secondaryAddress}
            color="secondary" label="Apt/Unit" variant="standard" fullWidth size="small"
            onChange={(e) => setSecondaryAddress(e.target.value)} />
          <TextField
            value={familyUnit?.mailingAddress?.city}
            color="secondary" label="City" variant="standard" fullWidth size="small"
            onChange={(e) => setCity(e.target.value)} />
          <Box width='100%' textAlign='start'>
            <TextField
              value={familyUnit?.mailingAddress?.state}

              sx={{ width: '100px', display: 'inline-flex' }}
              color="secondary" label="State" variant="standard" size="small"
              onChange={(e) => {
                const value = e.target.value.toUpperCase().slice(0, 2);
                setState(value);
              }} />
            <TextField
              sx={{ width: '100px', display: 'inline-flex' }}

              value={familyUnit?.mailingAddress?.zipCode}
              color="secondary" label="Zip Code" variant="standard" size="small"
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 5);
                setZipCode(value);
              }} />
          </Box>
          <Button onClick={() => familyActions.updateFamilyAddress(address)}>Update Address</Button>
        </Box>
      </Box>
    </Box>
  );
};

export default AddressEnvelope;
