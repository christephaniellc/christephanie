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
  Tooltip,
  IconButton,
  Stack,
  SelectChangeEvent,
} from '@mui/material';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { guestSelector, useFamily, familyGuestsStates, familyGuestsRsvpStates } from '@/store/family';
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
import { CheckCircleOutline, ErrorOutline, Language, Public } from '@mui/icons-material';
import FlagUS from '@/assets/flags/us.svg';
import FlagCA from '@/assets/flags/ca.svg';
import FlagDE from '@/assets/flags/de.svg';
import FlagNO from '@/assets/flags/no.svg';
import FlagMX from '@/assets/flags/mx.svg';
import FlagTH from '@/assets/flags/th.svg';
import { isFeatureEnabled } from '@/config';

// SVG data for the flags
const FLAGS = {
  US: FlagUS,
  CA: FlagCA, 
  DE: FlagDE,
  NO: FlagNO,
  MX: FlagMX,
  TH: FlagTH
};

// Country options
type CountryOption = {
  value: string | null;
  label: string;
  postalLabel: string;
  provinceLabel: string;
  postalFormat: (value: string) => string;
  postalRegex: RegExp;
  postalLength: number;
  flag: string;
};

const COUNTRIES: CountryOption[] = [
  {
    value: null, // null value for USA indicates USPS validation
    label: 'United States',
    postalLabel: 'ZIP Code',
    provinceLabel: 'State',
    postalFormat: (value: string) => value.replace(/\D/g, '').slice(0, 5),
    postalRegex: /^\d{5}$/,
    postalLength: 5,
    flag: FLAGS.US,
  },
  {
    value: 'Canada',
    label: 'Canada',
    postalLabel: 'Postal Code',
    provinceLabel: 'Province',
    postalFormat: (value: string) => {
      // Format Canadian postal code (A1A 1A1)
      const cleaned = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6);
      if (cleaned.length > 3) {
        return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
      }
      return cleaned;
    },
    postalRegex: /^[A-Z]\d[A-Z] \d[A-Z]\d$/,
    postalLength: 7, // Including the space
    flag: FLAGS.CA,
  },
  {
    value: 'Germany',
    label: 'Germany',
    postalLabel: 'Postal Code',
    provinceLabel: 'Province', // Not commonly used in German addresses
    postalFormat: (value: string) => value.replace(/\D/g, '').slice(0, 5),
    postalRegex: /^\d{5}$/,
    postalLength: 5,
    flag: FLAGS.DE,
  },
  {
    value: 'Norway',
    label: 'Norway',
    postalLabel: 'Postal Code',
    provinceLabel: 'Province', // Not commonly used in Norwegian addresses
    postalFormat: (value: string) => value.replace(/\D/g, '').slice(0, 4),
    postalRegex: /^\d{4}$/,
    postalLength: 4,
    flag: FLAGS.NO,
  },
  {
    value: 'Mexico',
    label: 'Mexico',
    postalLabel: 'Postal Code',
    provinceLabel: 'State',
    postalFormat: (value: string) => value.replace(/\D/g, '').slice(0, 5),
    postalRegex: /^\d{5}$/,
    postalLength: 5,
    flag: FLAGS.MX,
  },
  {
    value: 'Thailand',
    label: 'Thailand',
    postalLabel: 'Postal Code',
    provinceLabel: 'Province',
    postalFormat: (value: string) => value.replace(/\D/g, '').slice(0, 5),
    postalRegex: /^\d{5}$/,
    postalLength: 5,
    flag: FLAGS.TH,
  },
];

const AddressEnvelope: React.FC = () => {
  const [familyUnit, familyActions] = useFamily();
  const attendanceState = useRecoilValue(familyGuestsStates);
  const attendanceRsvpState = useRecoilValue(familyGuestsRsvpStates);
  const { contentHeight } = useAppLayout();
  const address = useRecoilValue(addressState);
  const setStreetAddress = useSetRecoilState(streetAddressState);
  const setSecondaryAddress = useSetRecoilState(secondaryAddressState);
  const setCity = useSetRecoilState(cityAddressState);
  const setState = useSetRecoilState(stateAddressState);
  const setZipCode = useSetRecoilState(zipCodeAddressState);

  // State for selected country
  const [country, setCountry] = useState<string | null>(null);
  
  // Find the selected country config
  const selectedCountry = useMemo(() => 
    COUNTRIES.find(c => c.value === country) || COUNTRIES[0], 
    [country]
  );

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
      
      // Set country if it exists, otherwise default to USA (null)
      setCountry((familyUnit.mailingAddress as any)?.country ?? null);

      // If they already have a mailing address, that implies
      // they want an announcement
      const areAllGuestsDeclinedOrPending = !attendanceState.atLeastOneAttending;
      if (areAllGuestsDeclinedOrPending) {
        setWantsAnnouncement(true);
      }
    }
  }, [familyUnit, attendanceState]);

  useEffect(() => {
    if (familyUnit && familyUnit.mailingAddress) {
      // Use nullish coalescing operator to only convert undefined to empty string,
      // but keep null values as null
      setStreetAddress(familyUnit.mailingAddress.streetAddress ?? null);
      setSecondaryAddress(familyUnit.mailingAddress.secondaryAddress ?? null);
      setCity(familyUnit.mailingAddress.city ?? null);
      setState(familyUnit.mailingAddress.state ?? null);
      setZipCode(familyUnit.mailingAddress.zipCode ?? null);
      
      // Set country if it exists, otherwise default to USA (null)
      setCountry((familyUnit.mailingAddress as any)?.country ?? null);
    }
    if (familyUnit && isFeatureEnabled('ENABLE_RSVP_PHASE')) {
      setWantsAnnouncement(false);
    }
  }, [familyUnit, attendanceRsvpState]);

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
    setWantsAnnouncement(true);

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
      {(!isFeatureEnabled('ENABLE_RSVP_PHASE') &&
        !attendanceState?.atLeastOneAttending) && (
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
              sx={{ 
                mb: 0,
                fontFamily: 'Snowstorm, sans-serif'
              }}
            >
              <Box sx={{
              }}>
                <span style={{ 
                  color: theme.palette.secondary.main
                 }}>
                Would you like to receive a wedding announcement in the mail celebrating how great and
                perfect our lives are in every way, with pictures of us laughing in different
                directions at real life amazing stuff?
                </span>
              </Box>
              <Box sx={{ fontColor: '#FFF' }}>
                <br/>If so, please enter your address below:
              </Box>
            </Typography>
          </Paper>
        </Fade>
      )}

      {/* Only show the address form if the user wants an announcement or not declined/pending */}
      {(attendanceState?.atLeastOneAttending || true) && (
        <Box
          sx={{
            minWidth: '100%',
            width: rem(300),
            maxWidth: '100%',
            height: '420px', // Increased height to accommodate country selector
            minHeight: '420px',
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
              gap: '5px',
              //border: '1px dashed orange'
            }}
          >
            {/* Country selector with flag icons */}
            <Box 
              sx={{ mb: 1 }}
            >
              <Stack 
                direction="row" 
                spacing={1} 
                sx={{ 
                  flexWrap: 'wrap', 
                  justifyContent: 'center',
                  '& > *': { mb: 0 }
                }}
              >
                {COUNTRIES.map((countryOption) => (
                  <Tooltip 
                    key={countryOption.value === null ? "usa" : countryOption.value} 
                    title={countryOption.label}
                    arrow
                  >
                    <Box
                      component="button"
                      type="button"
                      onClick={() => {
                        const newCountry = countryOption.value;
                        setCountry(newCountry);
                        
                        // Update the family address with the new country
                        familyActions.updateFamilyAddress({
                          ...address,
                          country: newCountry,
                          // Reset USPS verification when changing country
                          uspsVerified: newCountry !== null ? false : address.uspsVerified,
                        });
                      }}
                      sx={{
                        width: 32,
                        height: 20,
                        p: 0,
                        border: '3px solid',
                        borderColor: countryOption.value === country ? 'secondary.main' : 'transparent',
                        borderRadius: 1,
                        boxShadow: countryOption.value === country ? 'none' : '2px 2px 0px secondary.main',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        opacity: countryOption.value === country ? 1 : 0.5,
                        transition: 'all 0.2s ease',
                        background: 'transparent',
                        '&:hover': {
                          opacity: 1,
                          borderColor: 'rgba(255, 255, 255, 0.5)'
                        },
                        '&:disabled': {
                          opacity: 0.5,
                          cursor: 'not-allowed'
                        },
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      disabled={disabled}
                    >
                      <Box 
                        component="img" 
                        src={countryOption.flag} 
                        alt={countryOption.label}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    </Box>
                  </Tooltip>
                ))}
              </Stack>
            </Box>

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
                    country: country, // Include country in updates
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
                  familyActions.updateFamilyAddress({
                    ...address,
                    secondaryAddress: inputValue === '' ? null : inputValue,
                    country: country, // Include country in updates
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
                    country: country, // Include country in updates
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
                label={selectedCountry.provinceLabel}
                variant="standard"
                size="small"
                InputLabelProps={{
                  shrink: address.state !== null && address.state !== '',
                }}
                onChange={(e) => {
                  // Allow uppercase letters for provinces/states in all countries
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
                      country: country, // Include country in updates
                    });
                  }
                }}
              />
              <TextField
                disabled={disabled}
                sx={{ width: '100px', display: 'inline-flex' }}
                value={address.zipCode || ''}
                color="secondary"
                label={selectedCountry.postalLabel}
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
                      country: country, // Include country in updates
                    });
                  }
                }}
                onChange={(e) => {
                  // Use the format function from the selected country
                  const value = selectedCountry.postalFormat(e.target.value);
                  setZipCode(value || null);
                }}
              />
            </Box>
            
            {/* Only show USPS Verification button for US addresses */}
            {country === null && (
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
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default AddressEnvelope;
