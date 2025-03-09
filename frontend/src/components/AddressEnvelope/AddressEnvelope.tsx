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
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { guestSelector, useFamily } from '@/store/family';
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
import { StephsActualFavoriteTypography } from '@/components/AttendanceButton/AttendanceButton';

const AddressEnvelope: React.FC = () => {
  const [familyUnit, familyActions] = useFamily();
  const address = useRecoilValue(addressState);
  const setStreetAddress = useSetRecoilState(streetAddressState);
  const setSecondaryAddress = useSetRecoilState(secondaryAddressState);
  const setCity = useSetRecoilState(cityAddressState);
  const setState = useSetRecoilState(stateAddressState);
  const setZipCode = useSetRecoilState(zipCodeAddressState);

  // State for announcement preference (for declined/pending users)
  const [wantsAnnouncement, setWantsAnnouncement] = useState<boolean | null>(null);

  // Check if all family members are declined or pending
  const areAllGuestsDeclinedOrPending = useMemo(() => {
    if (!familyUnit?.guests) return false;

    return familyUnit.guests.every(
      (guest) =>
        guest.rsvp.invitationResponse === InvitationResponseEnum.Declined ||
        guest.rsvp.invitationResponse === InvitationResponseEnum.Pending,
    );
  }, [familyUnit?.guests]);

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

      // If they already have a mailing address, that implies
      // they want an announcement
      if (areAllGuestsDeclinedOrPending) {
        setWantsAnnouncement(familyUnit.mailingAddress.uspsVerified);
      }
    }
  }, [familyUnit, areAllGuestsDeclinedOrPending]);

  const saveAddressState = useMemo(() => {
    return familyActions.validateFamilyAddress.status;
  }, [familyActions.patchFamilyMutation]);

  const disabled = useMemo(
    () =>
      familyActions.patchFamilyMutation.status === 'pending' ||
      familyActions.getFamilyUnitQuery.isFetching ||
      familyActions.validateFamilyAddress.status === 'pending',
    [
      familyActions.patchFamilyMutation.status,
      familyActions.getFamilyUnitQuery.isFetching,
      familyActions.validateFamilyAddress.status,
    ],
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
    <Box display="flex" flexDirection="column" alignItems="center">
      {areAllGuestsDeclinedOrPending && (
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
              Would you like to receive an announcement celebrating how great and perfect our lives
              are in every way, with pictures of us laughing in different directions at real life
              amazing stuff?
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
      {(!areAllGuestsDeclinedOrPending || wantsAnnouncement === true) && (
        <Box
          sx={{
            minWidth: '100%',
            width: rem(400),
            maxWidth: '100%',
            height: '350px',
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
            {/*The {callByLastNames}*/}
          </Typography>
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
              value={address.streetAddress}
              onChange={(e) => {
                setStreetAddress(e.target.value);
              }}
              error={!!familyActions.validateFamilyAddress.error}
              size="small"
            />
            <TextField
              disabled={disabled}
              value={address.secondaryAddress}
              color="secondary"
              label="Apt/Unit"
              variant="standard"
              fullWidth
              size="small"
              onChange={(e) => setSecondaryAddress(e.target.value)}
            />
            <TextField
              disabled={disabled}
              value={address.city}
              color="secondary"
              label="City"
              variant="standard"
              fullWidth
              size="small"
              onChange={(e) => setCity(e.target.value)}
            />
            <Box width="100%" textAlign="start">
              <TextField
                disabled={disabled}
                value={address?.state}
                sx={{ width: '100px', display: 'inline-flex' }}
                color="secondary"
                label="State"
                variant="standard"
                size="small"
                onChange={(e) => {
                  const value = e.target.value.toUpperCase().slice(0, 2);
                  setState(value);
                }}
              />
              <TextField
                disabled={disabled}
                sx={{ width: '100px', display: 'inline-flex' }}
                value={address.zipCode}
                color="secondary"
                label="Zip Code"
                variant="standard"
                size="small"
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 5);
                  setZipCode(value);
                }}
              />
            </Box>
            <Button
              disabled={disabled}
              variant="contained"
              color="secondary"
              onClick={() => {
                if (address !== null) familyActions.validateFamilyAddress.mutate(address);
              }}
            >
              {saveAddressState === 'idle' && 'Save'}
              {saveAddressState === 'pending' && 'Saving...'}
              {saveAddressState === 'success' && 'Saved'}
              {saveAddressState === 'error' && 'Please enter a valid address'}
            </Button>
          </Box>
        </Box>
      )}

      {/* Show a message if they decline the announcement */}
      {areAllGuestsDeclinedOrPending && wantsAnnouncement === false && (
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
          <StephsActualFavoriteTypography
            variant="h5"
          >
            Your loss.
          </StephsActualFavoriteTypography>
          <Typography sx={{ mt: 2 }}>
            We'll miss having you at our wedding, but we appreciate you letting us know.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default AddressEnvelope;
