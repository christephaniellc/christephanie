import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useRecoilValue } from 'recoil';
import { guestSelector, useFamily } from '@/store/family';
import { GuestViewModel, NotificationPreferenceEnum } from '@/types/api';
import Box from '@mui/material/Box';
import { ButtonGroup, TextField, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, darken, useTheme, Paper, Stack, Chip } from '@mui/material';
import { EmailOutlined, PhoneAndroid, Edit, Check, VerifiedUser, NotificationsActive, NotificationsOff, ConstructionOutlined, Warning } from '@mui/icons-material';
import { useRef, useMemo, useState, useEffect } from 'react';
import { useApiContext } from '@/context/ApiContext';
import { useAppLayout } from '@/context/Providers/AppState/useAppLayout';
import { getConfig } from '@/auth_config';
import { useAuth0 } from '@auth0/auth0-react';
import { useBoxShadow } from '@/hooks/useBoxShadow';
import { isFeatureEnabled, FeatureFlags } from '@/config';

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

  // Check if specific verification features are enabled
  const isEmailVerificationEnabled = isFeatureEnabled('ENABLE_EMAIL_VERIFICATION');
  const isSmsVerificationEnabled = isFeatureEnabled('ENABLE_SMS_VERIFICATION');

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
    if (!isSmsVerificationEnabled) {
      setAlertMessage('SMS verification is coming soon! Check back later.');
      setAlertSeverity('info');
      setShowAlert(true);
      return;
    }

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
    if (!isSmsVerificationEnabled) return;

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
    if (!isSmsVerificationEnabled) return;

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
    if (!isEmailVerificationEnabled) {
      setAlertMessage('Email verification is not available at this time');
      setAlertSeverity('info');
      setShowAlert(true);
      return;
    }

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
    if (!isEmailVerificationEnabled) return;

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
    if (!isEmailVerificationEnabled) return;

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

  // If the Communication Preferences feature is disabled, show a placeholder instead
  if (!isFeatureEnabled('ENABLE_COMMUNICATION_PREFERENCES')) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        p={4}
        textAlign="center"
        sx={{
          backgroundColor: 'rgba(0,0,0,0.3)',
          borderRadius: 2,
          border: '1px dashed rgba(255,255,255,0.2)',
          width: '100%',
          height: '100%'
        }}
      >
        <ConstructionOutlined sx={{ fontSize: 60, color: 'warning.main', mb: 2 }} />
        <Typography variant="h6" color="warning.main" gutterBottom>
          Coming Soon
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Communication preferences will be available in the next release.
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
          We're working on connecting with our communication services to provide you with email and SMS updates.
        </Typography>
      </Box>
    );
  }
  
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
                  <Box display="flex" alignItems="center">
                    <Box display="flex" alignItems="center">
                      <Typography fontWeight={'bold'}>
                        {value}
                      </Typography>
                      
                      {/* Show "Coming Soon" for Text option when SMS verification is disabled */}
                      {value === 'Text' && !isSmsVerificationEnabled && (
                        <Chip 
                          size="small"
                          label="Coming Soon"
                          color="info"
                          icon={<ConstructionOutlined fontSize="small" />}
                          sx={{ ml: 1, height: 20, '& .MuiChip-label': { px: 0.5, fontSize: '0.7rem' } }}
                        />
                      )}
                    </Box>
                    
                    {/* Status indicators */}
                    <Box ml={1} display="flex" alignItems="center">
                      {isEnabled ? (
                        <Chip 
                          size="small" 
                          label="Opted In" 
                          color="success" 
                          icon={<NotificationsActive fontSize="small" />} 
                          sx={{ height: 20, '& .MuiChip-label': { px: 0.5, fontSize: '0.7rem' } }}
                        />
                      ) : (
                        <Chip 
                          size="small" 
                          label="" 
                          color="default" 
                          icon={<NotificationsOff fontSize="small" />} 
                          sx={{ height: 20, '& .MuiChip-label': { px: 0.5, fontSize: '0.7rem' } }}
                        />
                      )}
                      
                      {isVerified ? (
                        <Chip 
                          size="small" 
                          label="Verified" 
                          color="primary" 
                          icon={<VerifiedUser fontSize="small" />} 
                          sx={{ height: 20, ml: 0.5, '& .MuiChip-label': { px: 0.5, fontSize: '0.7rem' } }}
                        />
                      ) : isEnabled && (
                        <Chip 
                          size="small" 
                          label="Unverified" 
                          color="error" 
                          icon={<Warning fontSize="small" />} 
                          sx={{ height: 20, ml: 0.5, '& .MuiChip-label': { px: 0.5, fontSize: '0.7rem' } }}
                        />
                      )}
                    </Box>
                  </Box>
                  
                  <Box display="flex" alignItems="center">
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
                  </Box>
                </Box>
              </Button>
            );
          })}
        </ButtonGroup>
      
        {/* SMS Verification Coming Soon Banner - shown when text opted in but SMS verification disabled */}
        {isTextOptedIn && !phoneVerified && !isSmsVerificationEnabled && (
          <Box p={2} sx={{ backgroundColor: 'rgba(0,0,0,.4)' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ConstructionOutlined color="info" sx={{ mr: 1 }} />
                <Typography variant="subtitle1" color="info.main" fontWeight="bold">
                  SMS Verification Coming Soon!
                </Typography>
              </Box>
              <Typography variant="body2" textAlign="center">
                We're still working on our SMS verification system. You'll be able to verify your phone number in a future update.
              </Typography>
            </Box>
          </Box>
        )}
      
        {/* Verification buttons and disclaimers outside the communication preference buttons */}
        {((isTextOptedIn && !phoneVerified && isSmsVerificationEnabled) || 
           (isEmailOptedIn && !emailVerified && isEmailVerificationEnabled)) && (
        <Box p={2} sx={{ backgroundColor: 'rgba(0,0,0,.4)' }}>
          {contactPreferences.map((value) => (
            ((value === 'Email' && isEmailOptedIn && !emailVerified && guestEmailAddress && isEmailVerificationEnabled) || 
            (value === 'Text' && isTextOptedIn && !phoneVerified && guestPhoneNumber && isSmsVerificationEnabled)) && (
              <Box key={`verify-${value}`} sx={{ mb: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Button
                  size="small"
                  variant="contained"
                  color="secondary"
                  sx={{ mb: 1, width: 'fit-content', fontWeight: 'bold' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    value === 'Email' ? sendEmailVerificationCode() : sendPhoneVerificationCode();
                  }}
                >
                  SEND VERIFY CODE TO {value === 'Email' ? "EMAIL" : "PHONE" } 
                </Button>
                
                {/* Disclaimer text - explicitly remove all shadows and set a background to ensure no text shadow */}
                <Box sx={{ 
                  backgroundColor: 'rgba(0,0,0,0.2)', 
                  borderRadius: 1, 
                  p: 1, 
                  mt: 1, 
                  width: '100%', 
                  boxShadow: 'none'
                }}>
                  {isTextOptedIn && value === 'Text' && (
                    <Typography variant="caption" sx={{ 
                      fontSize: '0.7rem', 
                      textAlign: 'center', 
                      display: 'block',
                      color: theme.palette.text.secondary,
                      textShadow: 'none !important',
                      boxShadow: 'none',
                      filter: 'none'
                    }}>
                      By clicking SEND VERIFY CODE, I agree to receive status update messages at the phone number provided. 
                      I understand I will receive no more than 10 messages a month, data rates may apply, reply STOP to opt out.
                    </Typography>
                  )}
                  
                  {isEmailOptedIn && value === 'Email' && (
                    <Typography variant="caption" sx={{ 
                      fontSize: '0.7rem', 
                      textAlign: 'center', 
                      display: 'block',
                      color: theme.palette.text.secondary,
                      textShadow: 'none !important',
                      boxShadow: 'none',
                      filter: 'none'
                    }}>
                      By clicking SEND VERIFY CODE, I agree to receive updates via email.
                      You can opt out of these emails at any time.
                    </Typography>
                  )}
                </Box>
              </Box>
            )
          ))}
        </Box>
        )}
      </Paper>

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
            helperText={!isSmsVerificationEnabled ? 
              "SMS verification coming soon! You'll be able to verify your phone in a future update." : 
              "Your phone number will need to be verified after updating"}
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