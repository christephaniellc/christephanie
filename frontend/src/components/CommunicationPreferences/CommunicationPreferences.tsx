import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useRecoilValue } from 'recoil';
import { guestSelector, useFamily } from '@/store/family';
import { GuestViewModel, NotificationPreferenceEnum } from '@/types/api';
import Box from '@mui/material/Box';
import { ButtonGroup, TextField, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, darken, useTheme, Paper, Stack, Chip } from '@mui/material';
import { EmailOutlined, PhoneAndroid, Edit, Check, VerifiedUser, NotificationsActive, NotificationsOff } from '@mui/icons-material';
import { useRef, useMemo, useState, useEffect } from 'react';
import { useApiContext } from '@/context/ApiContext';
import { useAppLayout } from '@/context/Providers/AppState/useAppLayout';
import { getConfig } from '@/auth_config';
import { useAuth0 } from '@auth0/auth0-react';
import { useBoxShadow } from '@/hooks/useBoxShadow';

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
  const { boxShadow, handleMouseMove } = useBoxShadow();
  
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
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedContactType, setSelectedContactType] = useState<'Email' | 'Text' | null>(null);
  
  // Input form values
  const [emailValue, setEmailValue] = useState('');
  const [phoneValue, setPhoneValue] = useState('');
  const [phoneVerificationCode, setPhoneVerificationCode] = useState('');
  const [emailVerificationCode, setEmailVerificationCode] = useState('');
  
  // Store actual values for hardcoding as a last resort
  const [phoneResponse, setPhoneResponse] = useState<any>(null);
  const [emailResponse, setEmailResponse] = useState<any>(null);
  
  // Alert state
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');
  
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

  const isEmailOptedIn = useMemo(() => 
    guestCommunicationPreferences.includes(NotificationPreferenceEnum.Email)
  , [guestCommunicationPreferences]);

  const isTextOptedIn = useMemo(() => 
    guestCommunicationPreferences.includes(NotificationPreferenceEnum.Text)
  , [guestCommunicationPreferences]);

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
  
  const handleOpenPhoneVerifyDialog = () => {   
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
  
  const handleOpenStatusModal = (type: 'Email' | 'Text') => {
    setSelectedContactType(type);
    setIsStatusModalOpen(true);
  };
  
  const handleCloseStatusModal = () => {
    setIsStatusModalOpen(false);
    setSelectedContactType(null);
  };

  // Handle form submissions
  const handleSubmitEmail = () => {
    if (emailValue) {
      familyActions.updateFamilyGuestEmail(guestId, emailValue);
      setAlertMessage('Email updated successfully');
      setAlertSeverity('success');
      setShowAlert(true);
    }
    handleCloseEmailDialog();
  };

  const handleSubmitPhone = () => {
    console.log('Submitting phone value:', phoneValue);
    if (phoneValue) {
      familyActions.updateFamilyGuestPhone(guestId, phoneValue);
      setAlertMessage('Phone number updated successfully');
      setAlertSeverity('success');
      setShowAlert(true);
    }
    handleClosePhoneDialog();
  };
  
  const sendPhoneVerificationCode = () => {
    console.log("Sending phone verification code...");
    validatePhoneMutation.mutate(
      { phoneNumber: phoneValue || guest?.phone?.maskedValue, action: 'register' },
      {
        onSuccess: () => {
          setAlertMessage('Verification code sent to your phone');
          setAlertSeverity('success');
          setShowAlert(true);
          handleOpenPhoneVerifyDialog();
        },
        onError: (error) => {
          setAlertMessage('Failed to send verification code. Please try again.');
          setAlertSeverity('error');
          setShowAlert(true);
        }
      }
    );
  };
  
  const resendPhoneVerificationCode = () => {
    console.log("Resending phone verification code...");
    validatePhoneMutation.mutate(
      { phoneNumber: phoneValue || guest?.phone?.maskedValue, action: 'register' },
      {
        onSuccess: () => {
          setAlertMessage('New verification code sent to your phone');
          setAlertSeverity('success');
          setShowAlert(true);
        },
        onError: (error) => {
          setAlertMessage('Failed to send verification code. Please try again.');
          setAlertSeverity('error');
          setShowAlert(true);
        }
      }
    );
  };
  
  const submitPhoneVerificationCode = () => {
    console.log("Submitted code for phone verification...");
    validatePhoneMutation.mutate(
      { phoneNumber: phoneValue || guest?.phone?.maskedValue, code: phoneVerificationCode, action: 'validate' },
      {
        onSuccess: () => {
          setAlertMessage('Phone number verified successfully!');
          setAlertSeverity('success');
          setShowAlert(true);
          handleClosePhoneVerifyDialog();
        },
        onError: (error) => {
          setAlertMessage('Verification failed. Please try again.');
          setAlertSeverity('error');
          setShowAlert(true);
        }
      }
    );
  };

  const sendEmailVerificationCode = () => {
    console.log("Sending email verification code...");
    validateEmailMutation.mutate(
      { email: emailValue || guest?.email?.maskedValue, action: 'register' },
      {
        onSuccess: () => {
          setAlertMessage('Verification code sent to your email');
          setAlertSeverity('success');
          setShowAlert(true);
          handleOpenEmailVerifyDialog();
        },
        onError: (error) => {
          setAlertMessage('Failed to send verification code. Please try again.');
          setAlertSeverity('error');
          setShowAlert(true);
        }
      }
    );
  };
  
  const resendEmailVerificationCode = () => {
    console.log("Resending email verification code...");
    validateEmailMutation.mutate(
      { email: emailValue || guest?.email?.maskedValue, action: 'register' },
      {
        onSuccess: () => {
          setAlertMessage('New verification code sent to your email');
          setAlertSeverity('success');
          setShowAlert(true);
        },
        onError: (error) => {
          setAlertMessage('Failed to send verification code. Please try again.');
          setAlertSeverity('error');
          setShowAlert(true);
        }
      }
    );
  };
  
  const submitEmailVerificationCode = () => {
    console.log("Submitted code for email verification...");
    validateEmailMutation.mutate(
      { email: emailValue || guest?.email?.maskedValue, code: emailVerificationCode, action: 'validate' },
      {
        onSuccess: () => {
          setAlertMessage('Email verified successfully!');
          setAlertSeverity('success');
          setShowAlert(true);
          handleCloseEmailVerifyDialog();
        },
        onError: (error) => {
          setAlertMessage('Verification failed. Please try again.');
          setAlertSeverity('error');
          setShowAlert(true);
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
  
  return (
    <Stack
      display="flex"
      width="100%"
      height="auto"
      my="auto"
      justifyContent="center"
      alignItems="center"
      px={2}
      onMouseMove={handleMouseMove}
    >
      <Paper
        elevation={5}
        sx={{
          backdropFilter: 'blur(20px)',
          backgroundColor: 'rgba(0,0,0,.1)',
          filter: `drop-shadow(${boxShadow})`,
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
        }}
      >
        <ButtonGroup
          fullWidth
          orientation="vertical"
          sx={{
            backgroundColor: 'rgba(0,0,0,.8)',
          }}
        >
          {contactPreferences.map((value) => {
            const isEnabled = guest?.preferences?.notificationPreference?.includes(NotificationPreferenceEnum[value]);
            const isVerified = value === 'Email' ? emailVerified : (value === 'Text' ? phoneVerified : false);
            
            return (
              <Button
                key={value}
                id={value}
                disabled={familyActions.patchFamilyMutation.isPending || familyActions.getFamilyUnitQuery.isFetching}
                onClick={() => handleUpdateCommunicationPreference(NotificationPreferenceEnum[value])}
                variant={(isEnabled ? 'contained' : 'outlined') as 'contained' | 'outlined'}
                size="large"
                color="secondary"
                sx={{ px: 3 }}
                startIcon={value === 'Email' ? <EmailOutlined /> : <PhoneAndroid />}
              >
                <Box display="flex" alignItems="center" width="100%" justifyContent="space-between">
                  <Typography fontWeight={'bold'}>
                    {value}
                  </Typography>
                    
                  <Box display="flex" alignItems="center">
                    {/* Contact info and edit button */}
                    <Typography variant="caption" sx={{ mr: 1 }}>
                      {value === 'Email' ? guestEmailAddress || 'Not set' : guestPhoneNumber || 'Not set'}
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
                      
                    {/* Status chip */}
                    <Chip 
                      size="small" 
                      label={isVerified ? "Verified" : (isEnabled ? "Active" : "Inactive")}
                      color={isVerified ? "primary" : (isEnabled ? "success" : "default")}
                      icon={isVerified ? <VerifiedUser fontSize="small" /> : 
                           (isEnabled ? <NotificationsActive fontSize="small" /> : <NotificationsOff fontSize="small" />)}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isVerified && isEnabled) {
                          handleOpenStatusModal(value as 'Email' | 'Text');
                        }
                      }}
                      sx={{ 
                        height: 24, 
                        cursor: (!isVerified && isEnabled) ? 'pointer' : 'default',
                        '& .MuiChip-label': { px: 0.5, fontSize: '0.7rem' }
                      }}
                    />
                  </Box>
                </Box>
              </Button>
            );
          })}
        </ButtonGroup>
      
      </Paper>
      
      {/* Status Modal For Verification */}
      <Dialog
        open={isStatusModalOpen}
        onClose={handleCloseStatusModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedContactType === 'Email' ? 'Email Status' : 'Text Message Status'}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2}>
            <Typography variant="subtitle1" gutterBottom>
              Your {selectedContactType?.toLowerCase()} is not verified yet. Verification will allow us to:
            </Typography>
            
            <Box sx={{ pl: 2 }}>
              <Typography variant="body2" gutterBottom>
                • Send you important updates about the wedding
              </Typography>
              <Typography variant="body2" gutterBottom>
                • Make sure you don't miss any critical information
              </Typography>
              {selectedContactType === 'Text' && (
                <Typography variant="body2" gutterBottom>
                  • Send quick reminders closer to the event
                </Typography>
              )}
            </Box>
            
            <Box sx={{ 
              backgroundColor: 'rgba(0,0,0,0.05)', 
              borderRadius: 1, 
              p: 1.5, 
              mt: 1,
              border: '1px solid rgba(0,0,0,0.1)'
            }}>
              {selectedContactType === 'Email' ? (
                <Typography variant="caption" sx={{ fontSize: '0.8rem', display: 'block' }}>
                  By clicking "Send Verification Code", you agree to receive updates via email.
                  You can opt out of these emails at any time.
                </Typography>
              ) : (
                <Typography variant="caption" sx={{ fontSize: '0.8rem', display: 'block' }}>
                  By clicking "Send Verification Code", you agree to receive status update messages at the phone number provided. 
                  You will receive no more than 10 messages a month, data rates may apply, reply STOP to opt out.
                </Typography>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStatusModal}>
            Cancel
          </Button>
          <Button 
            variant="contained"
            color="primary"
            onClick={() => {
              if (selectedContactType === 'Email') {
                sendEmailVerificationCode();
              } else {
                sendPhoneVerificationCode();
              }
              handleCloseStatusModal();
            }}
          >
            Send Verification Code
          </Button>
        </DialogActions>
      </Dialog>

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
            color="secondary"
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Email Verification Dialog */}
      <Dialog 
        open={isEmailVerifyDialogOpen} 
        onClose={handleCloseEmailVerifyDialog}
      >
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
          <Button 
            onClick={resendEmailVerificationCode}
            sx={{ 
              mt: 1,
              fontSize: '0.75rem'
            }}
            color="secondary"
          >
            Resend verification code
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEmailVerifyDialog}>Cancel</Button>
          <Button 
            onClick={submitEmailVerificationCode} 
            disabled={!emailVerificationCode || emailVerificationCode.length < 4}
            color="secondary"
          >
            Verify
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Phone Update Dialog */}
      <Dialog 
        open={isPhoneDialogOpen} 
        onClose={handleClosePhoneDialog}
      >
        <DialogTitle>Update Phone Number</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Phone Number"
            type="tel"
            fullWidth
            variant="outlined"
            defaultValue={phoneResponse?.value || phoneResponse || ''} 
            onChange={(e) => setPhoneValue(e.target.value)}
            helperText="Your phone number will need to be verified after updating"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePhoneDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmitPhone} 
            disabled={!phoneValue}
            color="secondary"
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Phone Verification Dialog */}
      <Dialog 
        open={isPhoneVerifyDialogOpen} 
        onClose={handleClosePhoneVerifyDialog}
      >
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
          <Button 
            onClick={resendPhoneVerificationCode}
            sx={{ 
              mt: 1,
              fontSize: '0.75rem'
            }}
            color="secondary"
          >
            Resend verification code
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePhoneVerifyDialog}>Cancel</Button>
          <Button 
            onClick={submitPhoneVerificationCode} 
            disabled={!phoneVerificationCode || phoneVerificationCode.length < 4}
            color="secondary"
          >
            Verify
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Success/Error Messages */}
      <Snackbar
        open={showAlert}
        autoHideDuration={6000}
        onClose={() => setShowAlert(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowAlert(false)} 
          severity={alertSeverity}
          sx={{ width: '100%' }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </Stack>
  );
};

export default CommunicationPreferences;