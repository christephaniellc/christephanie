import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useRecoilValue } from 'recoil';
import { guestSelector, useFamily } from '@/store/family';
import { GuestViewModel, NotificationPreferenceEnum } from '@/types/api';
import Box from '@mui/material/Box';
import { ButtonGroup, TextField, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, darken, useTheme, Paper } from '@mui/material';
import { EmailOutlined, PhoneAndroid, Edit, Check } from '@mui/icons-material';
import { useRef, useMemo, useState, useEffect } from 'react';
import { Stack } from '@mui/system';
import { useApiContext } from '@/context/ApiContext';
import { useAppLayout } from '@/context/Providers/AppState/useAppLayout';

const CommunicationPreferences = ({ guestId }: { guestId: string }) => {
  const { screenWidth } = useAppLayout();
  const guest: GuestViewModel | null = useRecoilValue(guestSelector(guestId));
  const [_, familyActions] = useFamily();
  const { getMaskedValueQuery, validatePhoneMutation } = useApiContext();
  
  const contactPreferences = Object.keys(NotificationPreferenceEnum);
  const mousePosition = useRef({ x: 0, y: 0 });
  const theme = useTheme();
  
  const guestCommunicationPreferences = useMemo(() => {
    return guest?.preferences?.notificationPreference || [];
  }, [guest]);
  
  const guestEmailAddress = useMemo(() => {
    return guest?.email?.maskedValue;
  }, [guest]);
  
  const guestPhoneNumber = useMemo(() => {
    return guest?.phone?.maskedValue;
  }, [guest]);
  
  const emailVerified = useMemo(() => {
    return guest?.email?.verified || false;
  }, [guest]);
  
  const phoneVerified = useMemo(() => {
    return guest?.phone?.verified || false;
  }, [guest]);

  // State for dialog control and form values
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [isPhoneDialogOpen, setIsPhoneDialogOpen] = useState(false);
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);
  const [emailValue, setEmailValue] = useState('');
  const [phoneValue, setPhoneValue] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  
  // Fetch unmasked email and phone when dialogs open
  const emailQuery = getMaskedValueQuery(guestId, 'email');
  const phoneQuery = getMaskedValueQuery(guestId, 'text');
  
  // When email dialog opens, fetch the unmasked email
  useEffect(() => {
    if (isEmailDialogOpen && !emailQuery.isFetching && emailQuery.data) {
      setEmailValue(emailQuery.data.value);
    }
  }, [isEmailDialogOpen, emailQuery.data, emailQuery.isFetching]);
  
  // When phone dialog opens, fetch the unmasked phone
  useEffect(() => {
    if (isPhoneDialogOpen && !phoneQuery.isFetching && phoneQuery.data) {
      setPhoneValue(phoneQuery.data.value);
    }
  }, [isPhoneDialogOpen, phoneQuery.data, phoneQuery.isFetching]);

  // Handle dialog open/close
  const handleOpenEmailDialog = () => {
    emailQuery.refetch();
    setIsEmailDialogOpen(true);
  };

  const handleCloseEmailDialog = () => {
    setIsEmailDialogOpen(false);
  };

  const handleOpenPhoneDialog = () => {
    phoneQuery.refetch();
    setIsPhoneDialogOpen(true);
  };

  const handleClosePhoneDialog = () => {
    setIsPhoneDialogOpen(false);
  };
  
  const handleOpenVerifyDialog = () => {
    setIsVerifyDialogOpen(true);
  };
  
  const handleCloseVerifyDialog = () => {
    setIsVerifyDialogOpen(false);
    setVerificationCode('');
  };

  // Handle form submissions
  const handleSubmitEmail = () => {
    if (emailValue && (emailQuery.data?.value !== emailValue)) {
      familyActions.updateFamilyGuestEmail(guestId, emailValue);
      setAlertMessage('Email updated. Please verify your new email.');
      setShowSuccessAlert(true);
    }
    handleCloseEmailDialog();
  };

  const handleSubmitPhone = () => {
    if (phoneValue && (phoneQuery.data?.value !== phoneValue)) {
      familyActions.updateFamilyGuestPhone(guestId, phoneValue);
      // Start verification process
      startPhoneVerification();
      setAlertMessage('Phone updated. Verification code sent.');
      setShowSuccessAlert(true);
    }
    handleClosePhoneDialog();
  };
  
  const startPhoneVerification = () => {
    validatePhoneMutation.mutate(
      { phoneNumber: phoneValue, action: 'send' },
      {
        onSuccess: () => {
          handleOpenVerifyDialog();
        }
      }
    );
  };
  
  const submitVerificationCode = () => {
    validatePhoneMutation.mutate(
      { phoneNumber: phoneValue, code: verificationCode, action: 'verify' },
      {
        onSuccess: () => {
          setAlertMessage('Phone number verified successfully!');
          setShowSuccessAlert(true);
          handleCloseVerifyDialog();
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
  
  const handleVerifyContact = (type: 'email' | 'text') => {
    if (type === 'text') {
      startPhoneVerification();
    } else {
      // Email verification is typically handled through server-sent email
      setAlertMessage('Verification email sent. Please check your inbox.');
      setShowSuccessAlert(true);
    }
  };
  
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
                      handleVerifyContact(value === 'Email' ? 'email' : 'text');
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
      <Dialog open={isEmailDialogOpen} onClose={handleCloseEmailDialog}>
        <DialogTitle>Update Email Address</DialogTitle>
        <DialogContent>
          {emailQuery.isLoading ? (
            <Typography>Loading email...</Typography>
          ) : (
            <TextField
              autoFocus
              margin="dense"
              label="Email Address"
              type="email"
              fullWidth
              variant="outlined"
              value={emailValue}
              onChange={(e) => setEmailValue(e.target.value)}
              helperText="Your email will need to be verified after updating"
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEmailDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmitEmail} 
            disabled={!emailValue || emailQuery.isLoading || emailValue === emailQuery.data?.value}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Phone Update Dialog */}
      <Dialog open={isPhoneDialogOpen} onClose={handleClosePhoneDialog}>
        <DialogTitle>Update Phone Number</DialogTitle>
        <DialogContent>
          {phoneQuery.isLoading ? (
            <Typography>Loading phone number...</Typography>
          ) : (
            <TextField
              autoFocus
              margin="dense"
              label="Phone Number"
              type="tel"
              fullWidth
              variant="outlined"
              value={phoneValue}
              onChange={(e) => setPhoneValue(e.target.value)}
              helperText="Your phone number will need to be verified after updating"
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePhoneDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmitPhone} 
            disabled={!phoneValue || phoneQuery.isLoading || phoneValue === phoneQuery.data?.value}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Verification Dialog */}
      <Dialog open={isVerifyDialogOpen} onClose={handleCloseVerifyDialog}>
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
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseVerifyDialog}>Cancel</Button>
          <Button 
            onClick={submitVerificationCode} 
            disabled={!verificationCode || verificationCode.length < 4}
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