import React from 'react';
import { Box, TextField, Typography } from '@mui/material';
import { useRsvpContext } from '../context/Rsvp/RsvpContext';
import { useChristephanieTheme } from '../context/ThemeContext';

const AddressEnvelope: React.FC = () => {
  const { lastNames, setFamilyUnitAddress, familyUnit } = useRsvpContext();
  const { theme } = useChristephanieTheme();
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

  return (
    <Box display='flex' flexDirection="column" alignItems='center'>
      <Typography gutterBottom variant={'h4'}>Where should we send your formal invitation?</Typography>
      <Box
        sx={{
          width: '400px',
          height: '300px',
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
          The {lastNames}
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
                     label="House Address & Street Name"
                     variant="standard"
                     fullWidth
                     value={familyUnit?.mailingAddress || ''}
                     onChange={(e) => setFamilyUnitAddress('street', e.target.value)}
                     size="small"
          />
          <TextField color="secondary" label="Apartment Number" variant="standard" fullWidth size="small" />
          <TextField color="secondary" label="City, State, Zip Code" variant="standard" fullWidth size="small" />
        </Box>
      </Box>
    </Box>
  );
};

export default AddressEnvelope;
