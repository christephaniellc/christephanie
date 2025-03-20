import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  FormGroup,
  TextField,
  Typography,
  useTheme,
  ButtonGroup,
  Paper,
  Fade,
} from '@mui/material';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { guestSelector, useFamily, familyGuestsStates } from '@/store/family';
import {
  addressState,
  cityAddressState,
  secondaryAddressState,
  stateAddressState,
  streetAddressState,
  zipCodeAddressState,
} from '@/store/address';
import { InvitationResponseEnum } from '@/types/api';
import Button from '@mui/material/Button';
import { rem } from 'polished';
import { StephsActualFavoriteTypography, StephsActualFavoriteTypographyNoDrop } from '@/components/AttendanceButton/AttendanceButton';
import { useAppLayout } from '@/context/Providers/AppState/useAppLayout';
import LoadingBox from '@/components/LoadingBox';
import StickFigureIcon from '@/components/StickFigureIcon';
import { CheckCircleOutline, ErrorOutline } from '@mui/icons-material';

const AddressEnvelope: React.FC = () => {
  const [familyUnit, familyActions] = useFamily();
  const attendanceState = useRecoilValue(familyGuestsStates);
  const { contentHeight } = useAppLayout();
  const address = useRecoilValue(addressState);
  const setStreetAddress = useSetRecoilState(streetAddressState);
  const setSecondaryAddress = useSetRecoilState(secondaryAddressState);
  const setCity = useSetRecoilState(cityAddressState);
  const setState = useSetRecoilState(stateAddressState);
  const setZipCode = useSetRecoilState(zipCodeAddressState);

  // State for announcement preference (for declined/pending users)
  const [wantsAnnouncement, setWantsAnnouncement] = useState<boolean | null>(null);
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
  
  // Helper to safely compare values treating empty strings as null
  const areEquivalent = (a: string | null | undefined, b: string | null | undefined): boolean => {
    // If both values are empty-ish (null, undefined, or empty string), treat them as equal
    if ((a === null || a === '' || a === undefined) && (b === null || b === '' || b === undefined)) {
      return true;
    }
    return a === b;
  };
  const familyStates = useRecoilValue(familyGuestsStates);
  const callByLastNames = familyStates?.callByLastNames || 'Family';

  useEffect(() => {
    if (familyUnit && familyUnit.mailingAddress) {
      // Use nullish coalescing operator to only convert undefined to empty string,
      // but keep null values as null
      setStreetAddress(familyUnit.mailingAddress.streetAddress ?? null);
      setSecondaryAddress(familyUnit.mailingAddress.secondaryAddress ?? null);
      setCity(familyUnit.mailingAddress.city ?? null);
      setState(familyUnit.mailingAddress.state ?? null);
      setZipCode(familyUnit.mailingAddress.zipCode ?? null);

      // If they already have a mailing address, that implies
      // they want an announcement
      const areAllGuestsDeclinedOrPending = !attendanceState.atLeastOneAttending;
      if (areAllGuestsDeclinedOrPending) {
        setWantsAnnouncement(familyUnit.mailingAddress?.uspsVerified || false);
      }
    }
  }, [familyUnit, attendanceState]);

  const saveAddressState = useMemo(() => {
    return familyActions.patchFamilyMutation.status;
  }, [familyActions.patchFamilyMutation]);

  const statusIcon = familyUnit?.mailingAddress?.uspsVerified ? (
    <Box sx={{ color: 'success.main', display: 'flex', alignItems: 'center' }}>
      <CheckCircleOutline sx={{ mr: 1 }} fontSize="small" color="success" /> Verified
    </Box>
  ) : (
    <Box sx={{ color: 'error.main', display: 'flex', alignItems: 'center' }}>
      <ErrorOutline fontSize="small" color="error" sx={{ mr: 1 }} /> Validate Address
    </Box>
  );

  const disabled = useMemo(
    () =>
      familyActions.patchFamilyMutation.status === 'pending' ||
      familyActions.getFamilyUnitQuery.isFetching,
    [familyActions.patchFamilyMutation, familyActions.getFamilyUnitQuery],
  );

  // Function to handle announcement preference selection
  const handleAnnouncementSelection = (wants: boolean) => {
    setWantsAnnouncement(wants);

    // We're not using tags to avoid modifying the user's comment
    // Just store their preference in state
    // The server-side can determine if they want an announcement by checking
    // if they provided an address (wantsAnnouncement === true case shows the address form)
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      sx={{
        overflowY: 'auto',
      }}
    >
      {!attendanceState?.atLeastOneAttending && (
        <Fade in={true} timeout={500}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              mb: 4,
              width: '100%',
              maxWidth: rem(600),
              textAlign: 'center',
              backgroundColor: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(8px)',
              borderRadius: 2,
            }}
          >
            <Typography
              variant="h5"
              color="secondary"
              sx={{ mb: 2, fontFamily: 'Snowstorm, sans-serif' }}
            >
              Would you like to receive a wedding announcement in the mail celebrating how great and
              perfect our lives are in every way, with pictures of us laughing in different
              directions at real life amazing stuff?
            </Typography>

            <ButtonGroup variant="contained" color="secondary" size="large" sx={{ mt: 2 }}>
              <Button
                onClick={() => handleAnnouncementSelection(true)}
                variant={
                  wantsAnnouncement === true
                    ? 'contained'
                    : ('outlined' as 'contained' | 'outlined')
                }
                sx={{
                  px: 4,
                  backgroundColor:
                    wantsAnnouncement === true ? theme.palette.secondary.main : 'rgba(0,0,0,.8)',
                  fontFamily: 'Snowstorm, sans-serif',
                }}
              >
                Yes
              </Button>
              <Button
                onClick={() => handleAnnouncementSelection(false)}
                variant={
                  wantsAnnouncement === false
                    ? 'contained'
                    : ('outlined' as 'contained' | 'outlined')
                }
                sx={{
                  px: 4,
                  backgroundColor:
                    wantsAnnouncement === false ? theme.palette.secondary.main : 'rgba(0,0,0,.8)',
                  fontFamily: 'Snowstorm, sans-serif',
                }}
              >
                No
              </Button>
            </ButtonGroup>
          </Paper>
        </Fade>
      )}

      {/* Only show the address form if the user wants an announcement or not declined/pending */}
      {(attendanceState?.atLeastOneAttending || wantsAnnouncement === true) && (
        <Box
          sx={{
            minWidth: '100%',
            width: rem(300),
            maxWidth: '100%',
            height: '350px',
            minHeight: '350px',
            borderRadius: '10px',
            margin: 'auto',
            position: 'relative',
            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
            border: '10px solid transparent',
            borderImageSource: gradientBorder,
            borderImageSlice: 1,
            padding: '16px',
            pb: 0,
            textAlign: 'center',
            // add blur to the background
            backdropFilter: 'blur(16px)',
          }}
        >
          <StephsActualFavoriteTypographyNoDrop variant="h6" 
            sx={{ 
              marginBottom: '1rem',
              lineHeight: '1.3rem' 
              }}>
            The {callByLastNames}
          </StephsActualFavoriteTypographyNoDrop>
          <Box
            component={FormGroup}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <TextField
              color="secondary"
              label="Street Address"
              disabled={disabled}
              variant="standard"
              fullWidth
              InputLabelProps={{
                shrink: address.streetAddress !== null && address.streetAddress !== '',
              }}
              value={address.streetAddress || ''}
              onChange={(e) => {
                // Empty string becomes null
                setStreetAddress(e.target.value || null);
              }}
              onBlur={(e) => {
                // Use the safe comparison helper
                const inputValue = e.target.value.trim();
                const currentValue = familyUnit?.mailingAddress?.streetAddress;
                
                // Only update if the values are truly different
                if (!areEquivalent(inputValue, currentValue)) {
                  familyActions.updateFamilyAddress({
                    ...address,
                    streetAddress: inputValue === '' ? null : inputValue,
                  });
                }
              }}
              error={!!familyActions.patchFamilyMutation.error}
              size="small"
            />
            <TextField
              disabled={disabled}
              value={address.secondaryAddress || ''}
              color="secondary"
              label="Apt/Unit"
              variant="standard"
              fullWidth
              size="small"
              InputLabelProps={{
                shrink: address.secondaryAddress !== null && address.secondaryAddress !== '',
              }}
              onBlur={(e) => {
                // Use the safe comparison helper
                const inputValue = e.target.value.trim();
                const currentValue = familyUnit?.mailingAddress?.secondaryAddress;
                
                // Only update if the values are truly different
                if (!areEquivalent(inputValue, currentValue)) {
                  console.log('Updating secondaryAddress', { 
                    inputValue, 
                    currentValue,
                    areTheyEquivalent: areEquivalent(inputValue, currentValue)
                  });
                  
                  familyActions.updateFamilyAddress({
                    ...address,
                    secondaryAddress: inputValue === '' ? null : inputValue,
                  });
                } else {
                  console.log('NOT updating secondaryAddress - values equivalent', { 
                    inputValue, 
                    currentValue,
                    areTheyEquivalent: areEquivalent(inputValue, currentValue)
                  });
                }
              }}
              onChange={(e) => setSecondaryAddress(e.target.value || null)}
            />
            <TextField
              disabled={disabled}
              value={address.city || ''}
              color="secondary"
              label="City"
              variant="standard"
              fullWidth
              size="small"
              InputLabelProps={{
                shrink: address.city !== null && address.city !== '',
              }}
              onBlur={(e) => {
                // Use the safe comparison helper
                const inputValue = e.target.value.trim();
                const currentValue = familyUnit?.mailingAddress?.city;
                
                // Only update if the values are truly different
                if (!areEquivalent(inputValue, currentValue)) {
                  familyActions.updateFamilyAddress({
                    ...address,
                    city: inputValue === '' ? null : inputValue,
                  });
                }
              }}
              onChange={(e) => setCity(e.target.value || null)}
            />
            <Box width="100%" textAlign="start" mb={1}>
              <TextField
                disabled={disabled}
                value={address?.state || ''}
                sx={{ width: '100px', display: 'inline-flex' }}
                color="secondary"
                label="State"
                variant="standard"
                size="small"
                InputLabelProps={{
                  shrink: address.state !== null && address.state !== '',
                }}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase().slice(0, 2);
                  setState(value || null);
                }}
                onBlur={(e) => {
                  // Use the safe comparison helper
                  const inputValue = e.target.value.trim();
                  const currentValue = familyUnit?.mailingAddress?.state;
                  
                  // Only update if the values are truly different
                  if (!areEquivalent(inputValue, currentValue)) {
                    familyActions.updateFamilyAddress({
                      ...address,
                      state: inputValue === '' ? null : inputValue,
                    });
                  }
                }}
              />
              <TextField
                disabled={disabled}
                sx={{ width: '100px', display: 'inline-flex' }}
                value={address.zipCode || ''}
                color="secondary"
                label="Zip Code"
                variant="standard"
                size="small"
                InputLabelProps={{
                  shrink: address.zipCode !== null && address.zipCode !== '',
                }}
                onBlur={(e) => {
                  // Use the safe comparison helper
                  const inputValue = e.target.value.trim();
                  const currentValue = familyUnit?.mailingAddress?.zipCode;
                  
                  // Only update if the values are truly different
                  if (!areEquivalent(inputValue, currentValue)) {
                    familyActions.updateFamilyAddress({
                      ...address,
                      zipCode: inputValue === '' ? null : inputValue,
                    });
                  }
                }}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 5);
                  setZipCode(value || null);
                }}
              />
            </Box>
            <Button
              disabled={
                familyUnit?.mailingAddress?.uspsVerified ||
                familyActions.patchFamilyMutation.isPending
              }
              variant={familyUnit?.mailingAddress?.uspsVerified ? 'text' : 'outlined'}

              color="secondary"
              onClick={() => {
                if (address !== null) familyActions.validateFamilyAddress.mutate(address);
              }}
              sx={{ display: 'flex', alignItems: 'center', background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(20px)' }}
            >
              {statusIcon}
              {saveAddressState === 'error' && familyActions.patchFamilyMutation.error.description}
            </Button>
          </Box>
        </Box>
      )}

      {/* Show a message if they decline the announcement */}
      {!attendanceState?.atLeastOneAttending && wantsAnnouncement === false && (
        <Box
          sx={{
            mt: 4,
            p: 3,
            textAlign: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(8px)',
            borderRadius: 2,
            maxWidth: rem(500),
          }}
        >
          <StephsActualFavoriteTypography variant="h5">Your loss.</StephsActualFavoriteTypography>
          <Typography sx={{ mt: 2 }}>
            We'll miss having you at our wedding, but we appreciate you letting us know.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default AddressEnvelope;
