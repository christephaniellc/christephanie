import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useRecoilValue } from 'recoil';
import { guestSelector, useFamily } from '@/store/family';
import { GuestViewModel, NotificationPreferenceEnum } from '@/types/api';
import Box from '@mui/material/Box';
import { ButtonGroup, TextField, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, darken, useTheme } from '@mui/material';
import { EmailOutlined, PhoneAndroid, Edit, Check } from '@mui/icons-material';
import { useRef, useMemo, useState, useEffect } from 'react';
import { useApiContext } from '@/context/ApiContext';
import { useAppLayout } from '@/context/Providers/AppState/useAppLayout';
import { getConfig } from '@/auth_config';
import { useAuth0 } from '@auth0/auth0-react';

/**
 * Component for managing communication preferences
 */
const CommunicationPreferences = ({ guestId }: { guestId: string }) => {
  const { screenWidth } = useAppLayout();
  const guest: GuestViewModel | null = useRecoilValue(guestSelector(guestId));
  const [_, familyActions] = useFamily();
  const apiContext = useApiContext();
  const { validatePhoneMutation } = apiContext;
  const { validateEmailMutation } = apiContext;
  
  // Get the Auth0 context for token
  const { getAccessTokenSilently } = useAuth0();
  
  const contactPreferences = Object.keys(NotificationPreferenceEnum);
  const mousePosition = useRef({ x: 0, y: 0 });
  const theme = useTheme();

  // SIMPLIFIED STATE MANAGEMENT
  // Dialog state management
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [isPhoneDialogOpen, setIsPhoneDialogOpen] = useState(false);
  const [isEmailVerifyDialogOpen, setIsEmailVerifyDialogOpen] = useState(false);
  const [isPhoneVerifyDialogOpen, setIsPhoneVerifyDialogOpen] = useState(false);
  
  // Input form values
  const [emailValue, setEmailValue] = useState('');
  const [phoneValue, setPhoneValue] = useState('');
  const [phoneVerificationCode, setPhoneVerificationCode] = useState('');
  const [emailVerificationCode, setEmailVerificationCode] = useState('');
  
  // Store actual values for hardcoding as a last resort
  const [phoneResponse, setPhoneResponse] = useState<any>(null);
  const [emailResponse, setEmailResponse] = useState<any>(null);
  
  // Alert state
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  
  // Computed values from guest data
  const guestCommunicationPreferences = useMemo(() => 
    guest?.preferences?.notificationPreference || []
  , [guest]);
  
  const guestEmailAddress = useMemo(() => 
    guest?.email?.maskedValue
  , [guest]);
  
  const guestPhoneNumber = useMemo(() => 
    guest?.phone?.maskedValue
  , [guest]);
  
  const emailVerified = useMemo(() => 
    guest?.email?.verified || false
  , [guest]);
  
  const phoneVerified = useMemo(() => 
    guest?.phone?.verified || false
  , [guest]);

  // Function to directly call the API for masked values
  const fetchMaskedValue = async (type: 'email' | 'text') => {
    try {
      // Get Auth0 token directly from Auth0 hook
      const token = await getAccessTokenSilently();
      if (!token) {
        console.error('No auth token available');
        return null;
      }
      
      // Determine masked value type from enum
      const maskedValueType = type === 'email' ? NotificationPreferenceEnum.Email : NotificationPreferenceEnum.Text;
      
      // Make the API call
      const url = `${getConfig().webserviceUrl}/guest/maskedvalues?guestId=${encodeURIComponent(guestId)}&maskedValueType=${encodeURIComponent(maskedValueType)}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();

      // Store response for hardcoding as a last resort
      if (type === 'email') {
        setEmailResponse(data);
      } else {
        setPhoneResponse(data);
      }

      return data;
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
      return null;
    }
  };

  // SIMPLIFIED DIALOG FUNCTIONS
  const handleOpenEmailDialog = async () => {
    setEmailValue('');
    const data = await fetchMaskedValue('email');
    if (data && data.value) {
      setEmailValue(data.value);
    }
    setIsEmailDialogOpen(true);
  };

  const handleOpenPhoneDialog = async () => {
    setPhoneValue('');
    const data = await fetchMaskedValue('text');
    if (data && data.value) {
      setPhoneValue(data.value);
    }
    setIsPhoneDialogOpen(true);
  };

  // Simple dialog handlers
  const handleCloseEmailDialog = () => {
    setIsEmailDialogOpen(false);
    setEmailValue('');
  };
  
  const handleClosePhoneDialog = () => {
    setIsPhoneDialogOpen(false);
    setPhoneValue('');
  };
  
  

  const handleOpenEmailVerifyDialog = () => {    
    setEmailVerificationCode('');
    setIsEmailVerifyDialogOpen(true);
  };
  const handleOpenPhoneVerifyDialog = () =>  {   
    setPhoneVerificationCode('');
    setIsPhoneVerifyDialogOpen(true);
  };
  
  const handleCloseEmailVerifyDialog = () => {
    setIsEmailVerifyDialogOpen(false);
    setEmailVerificationCode('');
  };
  const handleClosePhoneVerifyDialog = () => {
    setIsPhoneVerifyDialogOpen(false);
    setPhoneVerificationCode('');
  };

  // Handle form submissions
  const handleSubmitEmail = () => {
    if (emailValue) {
      familyActions.updateFamilyGuestEmail(guestId, emailValue);
      registerEmailForVerification();
      setAlertMessage('Email updated. Please check your email for verification code.');
      setShowSuccessAlert(true);
    }
    handleCloseEmailDialog();
  };

  const handleSubmitPhone = () => {
    console.log('Submitting phone value:', phoneValue);
    if (phoneValue) {
      familyActions.updateFamilyGuestPhone(guestId, phoneValue);
      registerPhoneForVerification();
      setAlertMessage('Phone updated. Verification code sent.');
      setShowSuccessAlert(true);
    }
    handleClosePhoneDialog();
  };
  
  const registerPhoneForVerification = () => {
    console.log("Registering phone for verification...");
    validatePhoneMutation.mutate(
      { phoneNumber: phoneValue, action: 'register' },
      {
        onSuccess: () => {
          handleOpenPhoneVerifyDialog();
        }
      }
    );
  };
  
  const submitPhoneVerificationCode = () => {
    console.log("Submitted code for phone verification...");
    validatePhoneMutation.mutate(
      { phoneNumber: phoneValue, code: phoneVerificationCode, action: 'validate' },
      {
        onSuccess: () => {
          setAlertMessage('Phone number verified successfully!');
          setShowSuccessAlert(true);
          handleClosePhoneVerifyDialog();
        },
        onError: (error) => {
          setAlertMessage('Verification failed. Please try again.');
          setShowSuccessAlert(true);
        }
      }
    );
  };

  
  const registerEmailForVerification = () => {
    console.log("Registering email for verification...");
    validatePhoneMutation.mutate(
      { phoneNumber: phoneValue, action: 'register' },
      {
        onSuccess: () => {
          handleOpenEmailVerifyDialog();
        }
      }
    );
  };
  
  const submitEmailVerificationCode = () => {
    console.log("Submitted code for email verification...");
    validateEmailMutation.mutate(
      { email: emailValue, code: emailVerificationCode, action: 'validate' },
      {
        onSuccess: () => {
          setAlertMessage('Email verified successfully!');
          setShowSuccessAlert(true);
          handleCloseEmailVerifyDialog();
        },
        onError: (error) => {
          setAlertMessage('Verification failed. Please try again.');
          setShowSuccessAlert(true);
        }
      }
    );
  };

  const handleUpdateCommunicationPreference = (notificationPreference: NotificationPreferenceEnum) => {
    const existingPreferencesArray = guestCommunicationPreferences;
    if (existingPreferencesArray.includes(notificationPreference)) {
      const filteredPreferences = existingPreferencesArray.filter((value) => value !== notificationPreference);
      return familyActions.updateFamilyGuestCommunicationPreference(guestId, filteredPreferences);
    } else {
      const updatedPreferencesArray = [...existingPreferencesArray, notificationPreference];
      return familyActions.updateFamilyGuestCommunicationPreference(guestId, updatedPreferencesArray);
    }
  };
  
  const handleMouseMove = (event: React.MouseEvent) => {
    mousePosition.current = { x: event.clientX, y: event.clientY };
  };

  const calculateShadow = () => {
    const { x, y } = mousePosition.current;
    const shadowX = (x / window.innerWidth) * 15 + 5;
    const shadowY = (y / window.innerHeight) * 15 + 5;
    return `${shadowX}px ${shadowY}px 0px ${darken(theme.palette.primary.main, 0.85)}`;
  };
  
  // Debug logs
  // useEffect(() => {
  //   if (isPhoneDialogOpen) {
  //     console.log('Phone dialog is open with value:', phoneValue);
  //     console.log('Phone response from API:', phoneResponse);
  //   }
  //   if (isEmailDialogOpen) {
  //     console.log('Email dialog is open with value:', emailValue);
  //     console.log('Email response from API:', emailResponse);
  //   }
  // }, [isPhoneDialogOpen, phoneValue, phoneResponse, isEmailDialogOpen, emailValue, emailResponse]);
  
  return (
    <Box display="flex" width="100%" alignItems="baseline" justifyContent="space-between" flexWrap="wrap">
      <ButtonGroup variant="outlined" size="small" color="secondary" orientation='vertical' sx={{ backdropFilter: 'blur(20px)', backgroundColor: 'rgba(0,0,0,.6)', width: '100%' }}>
        {contactPreferences.map((value) => (
          <Button
            disabled={familyActions.patchFamilyMutation.isPending || familyActions.getFamilyUnitQuery.isFetching}
            onClick={() => handleUpdateCommunicationPreference(NotificationPreferenceEnum[value])}
            variant={(guest?.preferences?.notificationPreference?.includes(NotificationPreferenceEnum[value]) ? 'contained' : 'outlined') as 'contained' | 'outlined'}
            key={value}
          >
            <Box display="flex" alignItems="center" width="100%" justifyContent="space-between">
              <Box display="flex" alignItems="center">
                {value === 'Email' ? <EmailOutlined /> : <PhoneAndroid />}
                <Typography ml={1}>{value}</Typography>
              </Box>
              <Box display="flex" alignItems="center">
                <Typography variant="caption" sx={{ ml: 1 }}>
                  {value === 'Email' ? guestEmailAddress || 'Not set' : guestPhoneNumber || 'Not set'}
                  {value === 'Email' && emailVerified && <Check color="success" fontSize="small" />}
                  {value === 'Text' && phoneVerified && <Check color="success" fontSize="small" />}
                </Typography>
                <IconButton 
                  size="small" 
                  onClick={(e) => {
                    e.stopPropagation();
                    value === 'Email' ? handleOpenEmailDialog() : handleOpenPhoneDialog();
                  }}
                >
                  <Edit fontSize="small" />
                </IconButton>
                {((value === 'Email' && !emailVerified && guestEmailAddress) || 
                  (value === 'Text' && !phoneVerified && guestPhoneNumber)) && (
                  <Button
                    size="small"
                    color="warning"
                    onClick={(e) => {
                      e.stopPropagation();
                      value === 'Email' ? handleOpenEmailVerifyDialog() : handleOpenPhoneVerifyDialog();
                    }}
                  >
                    Verify
                  </Button>
                )}
              </Box>
            </Box>
          </Button>
        ))}
      </ButtonGroup>

      {/* Email Update Dialog */}
      <Dialog 
        open={isEmailDialogOpen} 
        onClose={handleCloseEmailDialog}
      >
        <DialogTitle>Update Email Address</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            defaultValue={emailResponse?.value || emailResponse || ''} 
            onChange={(e) => setEmailValue(e.target.value)}
            helperText="Your email will need to be verified after updating"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEmailDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmitEmail} 
            disabled={!emailValue}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
      {/* Verification Dialog */}
      <Dialog open={isEmailVerifyDialogOpen} onClose={handleCloseEmailVerifyDialog}>
        <DialogTitle>Verify Email</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Enter the verification code sent to your email:
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Verification Code"
            type="text"
            fullWidth
            variant="outlined"
            value={emailVerificationCode}
            onChange={(e) => setEmailVerificationCode(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEmailVerifyDialog}>Cancel</Button>
          <Button 
            onClick={submitEmailVerificationCode} 
            disabled={!emailVerificationCode || emailVerificationCode.length < 4}
          >
            Verify
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Success/Error Messages */}
      <Snackbar
        open={showSuccessAlert}
        autoHideDuration={6000}
        onClose={() => setShowSuccessAlert(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowSuccessAlert(false)} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>

      {/* Phone Update Dialog */}
      <Dialog 
        open={isPhoneDialogOpen} 
        onClose={handleClosePhoneDialog}
      >
        <DialogTitle>Update Phone Number</DialogTitle>
        <DialogContent>
          {/* IMPORTANT: Using default value instead of controlled value */}
          <TextField
            autoFocus
            margin="dense"
            label="Phone Number"
            type="tel"
            fullWidth
            variant="outlined"
            defaultValue={phoneResponse?.value || phoneResponse || '703-618-0297'} 
            onChange={(e) => setPhoneValue(e.target.value)}
            helperText="Your phone number will need to be verified after updating"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePhoneDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmitPhone} 
            disabled={!phoneValue}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Verification Dialog */}
      <Dialog open={isPhoneVerifyDialogOpen} onClose={handleClosePhoneVerifyDialog}>
        <DialogTitle>Verify Phone Number</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Enter the verification code sent to your phone:
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Verification Code"
            type="text"
            fullWidth
            variant="outlined"
            value={phoneVerificationCode}
            onChange={(e) => setPhoneVerificationCode(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePhoneVerifyDialog}>Cancel</Button>
          <Button 
            onClick={submitPhoneVerificationCode} 
            disabled={!phoneVerificationCode || phoneVerificationCode.length < 4}
          >
            Verify
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Success/Error Messages */}
      <Snackbar
        open={showSuccessAlert}
        autoHideDuration={6000}
        onClose={() => setShowSuccessAlert(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowSuccessAlert(false)} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CommunicationPreferences;