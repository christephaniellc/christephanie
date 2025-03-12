import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useRecoilValue, useSetRecoilState, useRecoilState } from 'recoil';
import { familyState, guestSelector, useFamily } from '@/store/family';
import { AgeGroupEnum, FamilyUnitViewModel, GuestViewModel, NotificationPreferenceEnum } from '@/types/api';
import Box from '@mui/material/Box';
import { 
  Avatar, 
  Card, 
  CardActionArea, 
  CardContent, 
  Divider, 
  List, 
  ListItem, 
  ListItemAvatar, 
  ListItemButton, 
  ListItemSecondaryAction, 
  ListItemText, 
  TextField, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Snackbar, 
  Alert, 
  useTheme, 
  alpha, 
  Chip, 
  CircularProgress, 
  Stack,
  Switch
} from '@mui/material';
import { 
  EmailOutlined, 
  PhoneAndroid, 
  Edit, 
  VerifiedUser, 
  NotificationsActive, 
  NotificationsOff, 
  ConstructionOutlined, 
  Warning, 
  ArrowForwardIos
} from '@mui/icons-material';
import { useMemo, useState, useEffect } from 'react';
import { useApiContext } from '@/context/ApiContext';
import { useAppLayout } from '@/context/Providers/AppState/useAppLayout';
import { getConfig } from '@/auth_config';
import { useAuth0 } from '@auth0/auth0-react';
import { isFeatureEnabled } from '@/config';

/**
 * Component for managing communication preferences
 * Redesigned for better mobile experience and modern MUI design
 */
const CommunicationPreferences = ({ guestId }: { guestId: string }) => {
  const { screenWidth } = useAppLayout();
  const [family, setFamily] = useRecoilState(familyState);
  const guest: GuestViewModel | null = useRecoilValue(guestSelector(guestId));
  const [_, familyActions] = useFamily();
  const apiContext = useApiContext();
  const { validatePhoneMutation } = apiContext;
  const { validateEmailMutation } = apiContext;
  
  // Get the Auth0 context for token
  const { getAccessTokenSilently } = useAuth0();
  
  const contactPreferences = Object.keys(NotificationPreferenceEnum);
  const theme = useTheme();

  // Dialog state management
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [isPhoneDialogOpen, setIsPhoneDialogOpen] = useState(false);
  const [isEmailVerifyDialogOpen, setIsEmailVerifyDialogOpen] = useState(false);
  const [isPhoneVerifyDialogOpen, setIsPhoneVerifyDialogOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [selectedContactType, setSelectedContactType] = useState<'Email' | 'Text' | null>(null);
  
  // Input form values
  const [emailValue, setEmailValue] = useState('');
  const [phoneValue, setPhoneValue] = useState('');
  const [phoneVerificationCode, setPhoneVerificationCode] = useState('');
  const [emailVerificationCode, setEmailVerificationCode] = useState('');
  
  // Store actual values from API
  const [phoneResponse, setPhoneResponse] = useState<any>(null);
  const [emailResponse, setEmailResponse] = useState<any>(null);

  // Loading states
  const [isSendingEmailCode, setIsSendingEmailCode] = useState(false);
  const [isSendingPhoneCode, setIsSendingPhoneCode] = useState(false);
  
  // Force component to update verification status
  const [forceEmailVerified, setForceEmailVerified] = useState(false);
  const [forcePhoneVerified, setForcePhoneVerified] = useState(false);
  
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
    forceEmailVerified || (guest?.email?.verified ?? false)
  , [guest, forceEmailVerified]);
  
  const phoneVerified = useMemo(() => 
    forcePhoneVerified || (guest?.phone?.verified ?? false)
  , [guest, forcePhoneVerified]);

  const isEmailOptedIn = useMemo(() => 
    guestCommunicationPreferences.includes(NotificationPreferenceEnum.Email)
  , [guestCommunicationPreferences]);

  const isTextOptedIn = useMemo(() => 
    guestCommunicationPreferences.includes(NotificationPreferenceEnum.Text)
  , [guestCommunicationPreferences]);

  // Check if specific verification features are enabled
  const isEmailVerificationEnabled = isFeatureEnabled('ENABLE_EMAIL_VERIFICATION');
  const isSmsVerificationEnabled = isFeatureEnabled('ENABLE_SMS_VERIFICATION');
  
  // Need verification indicators
  const needsEmailVerification = isEmailOptedIn && !emailVerified && isEmailVerificationEnabled;
  const needsPhoneVerification = isTextOptedIn && !phoneVerified && isSmsVerificationEnabled;

  // Reset forced verification status when guest changes
  useEffect(() => {
    if (guest?.email?.verified) {
      setForceEmailVerified(true);
    }
    if (guest?.phone?.verified) {
      setForcePhoneVerified(true);
    }
  }, [guest]);

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

      // Store response
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

  // Function to forcefully update the verification status in the family data
  const forceUpdateVerificationStatus = (type: 'email' | 'phone', verified: boolean) => {
    if (!family || !family.guests || !guest) return;

    // Create a deep copy of the family data
    const updatedFamily = JSON.parse(JSON.stringify(family)) as FamilyUnitViewModel;
    
    // Update the verification status for the specific guest
    const updatedGuests = updatedFamily.guests.map(g => {
      if (g.guestId === guestId) {
        if (type === 'email') {
          if (!g.email) g.email = {};
          g.email.verified = verified;
        } else if (type === 'phone') {
          if (!g.phone) g.phone = {};
          g.phone.verified = verified;
        }
      }
      return g;
    });
    
    updatedFamily.guests = updatedGuests;
    setFamily(updatedFamily);
    
    // Also update the force state for immediate UI update
    if (type === 'email') {
      setForceEmailVerified(verified);
    } else {
      setForcePhoneVerified(verified);
    }
  };

  // Dialog handlers
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
  
  const handleOpenVerificationModal = (type: 'Email' | 'Text') => {
    setSelectedContactType(type);
    setIsVerificationModalOpen(true);
  };
  
  const handleCloseVerificationModal = () => {
    setIsVerificationModalOpen(false);
    setSelectedContactType(null);
  };

  // Handle form submissions
  const handleSubmitEmail = () => {
    if (emailValue) {
      // Check if email is different from current email
      const currentEmail = emailResponse?.value || '';
      const emailChanged = currentEmail !== emailValue;
      
      // Update the email
      familyActions.updateFamilyGuestEmail(guestId, emailValue);
      
      // If email changed, force the verification status to false
      if (emailChanged) {
        forceUpdateVerificationStatus('email', false);
        setAlertMessage('Email updated successfully - verification required');
      } else {
        setAlertMessage('Email updated successfully');
      }
      
      setAlertSeverity('success');
      setShowAlert(true);
    }
    handleCloseEmailDialog();
  };

  const handleSubmitPhone = () => {
    if (phoneValue) {
      // Check if phone is different from current phone
      const currentPhone = phoneResponse?.value || '';
      const phoneChanged = currentPhone !== phoneValue;
      
      // Update the phone
      familyActions.updateFamilyGuestPhone(guestId, phoneValue);
      
      // If phone changed, force the verification status to false
      if (phoneChanged) {
        forceUpdateVerificationStatus('phone', false);
        setAlertMessage('Phone number updated successfully - verification required');
      } else {
        setAlertMessage('Phone number updated successfully');
      }
      
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

    setIsSendingPhoneCode(true);
    validatePhoneMutation.mutate(
      { phoneNumber: phoneValue || guest?.phone?.maskedValue, action: 'register' },
      {
        onSuccess: () => {
          setAlertMessage('Verification code sent to your phone');
          setAlertSeverity('success');
          setShowAlert(true);
          setIsSendingPhoneCode(false);
          handleOpenPhoneVerifyDialog();
        },
        onError: (error) => {
          setAlertMessage('Failed to send verification code. Please try again.');
          setAlertSeverity('error');
          setShowAlert(true);
          setIsSendingPhoneCode(false);
        }
      }
    );
  };
  
  const resendPhoneVerificationCode = () => {
    if (!isSmsVerificationEnabled) return;

    setIsSendingPhoneCode(true);
    validatePhoneMutation.mutate(
      { phoneNumber: phoneValue || guest?.phone?.maskedValue, action: 'register' },
      {
        onSuccess: () => {
          setAlertMessage('New verification code sent to your phone');
          setAlertSeverity('success');
          setShowAlert(true);
          setIsSendingPhoneCode(false);
        },
        onError: (error) => {
          setAlertMessage('Failed to send verification code. Please try again.');
          setAlertSeverity('error');
          setShowAlert(true);
          setIsSendingPhoneCode(false);
        }
      }
    );
  };
  
  const submitPhoneVerificationCode = () => {
    if (!isSmsVerificationEnabled) return;

    validatePhoneMutation.mutate(
      { phoneNumber: phoneValue || guest?.phone?.maskedValue, code: phoneVerificationCode, action: 'validate' },
      {
        onSuccess: () => {
          // Force update UI immediately to show verified status
          forceUpdateVerificationStatus('phone', true);
          
          // Update UI with success message
          setAlertMessage('Phone number verified successfully!');
          setAlertSeverity('success');
          setShowAlert(true);
          handleClosePhoneVerifyDialog();
          
          // Also refetch data
          familyActions.getFamilyUnitQuery.refetch?.();
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

    // Set loading state to true before API call
    setIsSendingEmailCode(true);
    
    validateEmailMutation.mutate(
      { email: emailValue || guest?.email?.maskedValue, action: 'register' },
      {
        onSuccess: () => {
          setAlertMessage('Verification code sent to your email');
          setAlertSeverity('success');
          setShowAlert(true);
          // Set loading state to false after success
          setIsSendingEmailCode(false);
          handleOpenEmailVerifyDialog();
        },
        onError: (error) => {
          setAlertMessage('Failed to send verification code. Please try again.');
          setAlertSeverity('error');
          setShowAlert(true);
          // Set loading state to false after error
          setIsSendingEmailCode(false);
        }
      }
    );
  };
  
  const resendEmailVerificationCode = () => {
    if (!isEmailVerificationEnabled) return;

    // Set loading state to true before API call
    setIsSendingEmailCode(true);

    validateEmailMutation.mutate(
      { email: emailValue || guest?.email?.maskedValue, action: 'register' },
      {
        onSuccess: () => {
          setAlertMessage('New verification code sent to your email');
          setAlertSeverity('success');
          setShowAlert(true);
          // Set loading state to false after success
          setIsSendingEmailCode(false);
        },
        onError: (error) => {
          setAlertMessage('Failed to send verification code. Please try again.');
          setAlertSeverity('error');
          setShowAlert(true);
          // Set loading state to false after error
          setIsSendingEmailCode(false);
        }
      }
    );
  };
  
  const submitEmailVerificationCode = () => {
    if (!isEmailVerificationEnabled) return;

    validateEmailMutation.mutate(
      { email: emailValue || guest?.email?.maskedValue, code: emailVerificationCode, action: 'validate' },
      {
        onSuccess: () => {
          // Force update UI immediately to show verified status
          forceUpdateVerificationStatus('email', true);
          
          // Update UI with success message
          setAlertMessage('Email verified successfully!');
          setAlertSeverity('success');
          setShowAlert(true);
          handleCloseEmailVerifyDialog();
          
          // Also refetch data
          familyActions.getFamilyUnitQuery.refetch?.();
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
  
  // Check if user is under 13
  const isUnder13 = useMemo(() => 
    guest?.ageGroup === AgeGroupEnum.Baby || guest?.ageGroup === AgeGroupEnum.Under13
  , [guest?.ageGroup]);

  // Modern redesigned component
  return (
    <Stack
      spacing={2}
      width="100%"
      height="auto"
      my="auto"
      p={1}
      px={0}
    >
      {/* Header section */}
      <Box sx={{ px: 2, pt: 1, pb: 2 }}>
        <Typography variant="h6" fontWeight="500" gutterBottom>
          Communication Preferences
        </Typography>
        {isUnder13 ? (
          <Typography variant="body2" color="text.secondary">
            Communication preferences are not available for guests under 13 years old.
          </Typography>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Choose how you'd like to receive updates about the wedding.
          </Typography>
        )}
      </Box>

      {/* Age Restriction Message */}
      {isUnder13 ? (
        <Card 
          elevation={2}
          sx={{
            background: alpha(theme.palette.background.paper, 0.8),
            backdropFilter: 'blur(10px)',
            borderRadius: 2,
            p: 3,
            textAlign: 'center'
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            gap: 2
          }}>
            <Box sx={{ 
              bgcolor: alpha(theme.palette.info.main, 0.1),
              borderRadius: '50%',
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Warning 
                color="info" 
                sx={{ fontSize: 42 }} 
              />
            </Box>
            <Typography variant="h6" color="primary">
              Age Restricted
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              For privacy reasons, guests under 13 years old cannot receive direct communications from us.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Updates will be sent to your family's primary contact instead.
            </Typography>
          </Box>
        </Card>
      ) : (
        <>
          {/* Main preferences card */}
          <Card 
            elevation={2}
            sx={{
              background: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(10px)',
              borderRadius: 2,
              overflow: 'visible'
            }}
          >
            <List disablePadding>
              {contactPreferences.map((value, index) => {
                const isEnabled = guestCommunicationPreferences.includes(NotificationPreferenceEnum[value]);
                const isVerified = value === 'Email' ? emailVerified : (value === 'Text' ? phoneVerified : false);
                const needsVerification = isEnabled && !isVerified && 
                  ((value === 'Email' && isEmailVerificationEnabled) || 
                  (value === 'Text' && isSmsVerificationEnabled));
                const isComingSoon = value === 'Text' && !isSmsVerificationEnabled;
                
                return (
                  <>
                    <ListItem 
                      disablePadding
                      key={value}
                      secondaryAction={
                        <Switch
                          edge="end"
                          checked={isEnabled}
                          disabled={familyActions.patchFamilyMutation.isPending || familyActions.getFamilyUnitQuery.isFetching}
                          onChange={() => handleUpdateCommunicationPreference(NotificationPreferenceEnum[value])}
                          color="secondary"
                        />
                      }
                    >
                      <ListItemButton
                        onClick={() => {
                          if (value === 'Email') {
                            handleOpenEmailDialog();
                          } else {
                            handleOpenPhoneDialog();
                          }
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar 
                            sx={{ 
                              bgcolor: isEnabled 
                                ? alpha(theme.palette.secondary.main, 0.15)
                                : alpha(theme.palette.text.secondary, 0.1),
                              color: isEnabled 
                                ? theme.palette.secondary.main
                                : theme.palette.text.secondary
                            }}
                          >
                            {value === 'Email' ? <EmailOutlined /> : <PhoneAndroid />}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <Typography fontWeight={500}>
                                {value}
                              </Typography>
                              {isComingSoon && (
                                <Chip
                                  label="Coming Soon"
                                  size="small"
                                  color="info"
                                  icon={<ConstructionOutlined sx={{ fontSize: '0.7rem !important' }} />}
                                  sx={{ 
                                    height: 20, 
                                    '& .MuiChip-label': { 
                                      px: 0.5, 
                                      fontSize: '0.65rem' 
                                    }
                                  }}
                                />
                              )}
                              {isEnabled && isVerified && (
                                <Chip
                                  label="Verified"
                                  size="small"
                                  color="success"
                                  icon={<VerifiedUser sx={{ fontSize: '0.7rem !important' }} />}
                                  sx={{ 
                                    height: 20, 
                                    '& .MuiChip-label': { 
                                      px: 0.5, 
                                      fontSize: '0.65rem' 
                                    }
                                  }}
                                />
                              )}
                              {needsVerification && (
                                <Chip
                                  label="Unverified"
                                  size="small"
                                  color="error"
                                  icon={<Warning sx={{ fontSize: '0.7rem !important' }} />}
                                  sx={{ 
                                    height: 20, 
                                    '& .MuiChip-label': { 
                                      px: 0.5, 
                                      fontSize: '0.65rem' 
                                    }
                                  }}
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box component="span" sx={{ fontSize: '0.75rem' }}>
                              {value === 'Email' ? guestEmailAddress || 'Not set' : guestPhoneNumber || 'Not set'}
                            </Box>
                          }
                        />
                        <ArrowForwardIos fontSize="small" sx={{ color: alpha(theme.palette.text.primary, 0.3), fontSize: 14 }} />
                      </ListItemButton>
                    </ListItem>
                    {index < contactPreferences.length - 1 && <Divider variant="inset" component="li" />}
                  </>
                );
              })}
            </List>

            {/* Verification status section */}
            {(needsEmailVerification || needsPhoneVerification) && (
              <Box sx={{ p: 2, pt: 1 }}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                  Verification needed
                </Typography>
                
                <Stack spacing={2}>
                  {needsEmailVerification && (
                    <Card 
                      elevation={0} 
                      sx={{ 
                        bgcolor: alpha(theme.palette.error.main, 0.08),
                        border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                        borderRadius: 1.5,
                        p: 1
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Warning fontSize="small" color="error" sx={{ mr: 1 }} />
                        <Typography variant="body2" fontWeight={500}>
                          Email needs verification
                        </Typography>
                      </Box>
                      <Typography variant="caption" component="div" sx={{ mb: 1.5 }}>
                        We'll send a verification code to {guestEmailAddress}
                      </Typography>
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={sendEmailVerificationCode}
                        disabled={isSendingEmailCode}
                        startIcon={isSendingEmailCode ? <CircularProgress size={14} color="inherit" /> : null}
                      >
                        {isSendingEmailCode ? "Sending code..." : "Verify email"}
                      </Button>
                    </Card>
                  )}
                  
                  {needsPhoneVerification && (
                    <Card 
                      elevation={0} 
                      sx={{ 
                        bgcolor: alpha(theme.palette.error.main, 0.08),
                        border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                        borderRadius: 1.5,
                        p: 1
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Warning fontSize="small" color="error" sx={{ mr: 1 }} />
                        <Typography variant="body2" fontWeight={500}>
                          Phone needs verification
                        </Typography>
                      </Box>
                      <Typography variant="caption" component="div" sx={{ mb: 1.5 }}>
                        We'll send a verification code to {guestPhoneNumber}
                      </Typography>
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={sendPhoneVerificationCode}
                        disabled={isSendingPhoneCode}
                        startIcon={isSendingPhoneCode ? <CircularProgress size={14} color="inherit" /> : null}
                      >
                        {isSendingPhoneCode ? "Sending code..." : "Verify phone"}
                      </Button>
                    </Card>
                  )}
                </Stack>
              </Box>
            )}

            {/* SMS Verification Coming Soon Banner - when verification isn't enabled but opted in */}
            {isTextOptedIn && !phoneVerified && !isSmsVerificationEnabled && (
              <Box sx={{ p: 2, bgcolor: alpha(theme.palette.info.main, 0.08) }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <ConstructionOutlined color="info" sx={{ mr: 1, fontSize: '1.1rem' }} />
                    <Typography variant="subtitle2" color="info.main" fontWeight="bold">
                      SMS Verification Coming Soon
                    </Typography>
                  </Box>
                  <Typography variant="caption">
                    We're still working on our SMS verification system. You'll be able to verify your phone number in a future update.
                  </Typography>
                </Box>
              </Box>
            )}
          </Card>

          {/* Email terms note */}
          {isEmailOptedIn && (
            <Typography variant="caption" color="text.secondary" sx={{ px: 2, mb: 1 }}>
              By opting in to email, you agree to receive occasional updates about the wedding. You can opt out at any time.
            </Typography>
          )}
          
          {/* SMS terms note */}
          {isTextOptedIn && (
            <Typography variant="caption" color="text.secondary" sx={{ px: 2 }}>
              By opting in to texts, you agree to receive occasional SMS updates about the wedding (max 10/month). Message and data rates may apply. Reply STOP to opt out.
            </Typography>
          )}
        </>
      )}

      {/* Email Update Dialog */}
      <Dialog 
        open={isEmailDialogOpen} 
        onClose={handleCloseEmailDialog}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            borderRadius: 2,
            backdropFilter: 'blur(10px)',
            bgcolor: alpha(theme.palette.background.paper, 0.9),
          }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <EmailOutlined sx={{ mr: 1 }} />
            <Typography variant="h6">Update Email Address</Typography>
          </Box>
        </DialogTitle>
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
            variant="contained"
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Email Verification Dialog */}
      <Dialog 
        open={isEmailVerifyDialogOpen} 
        onClose={handleCloseEmailVerifyDialog}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            borderRadius: 2,
            backdropFilter: 'blur(10px)',
            bgcolor: alpha(theme.palette.background.paper, 0.9),
          }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <VerifiedUser sx={{ mr: 1 }} />
            <Typography variant="h6">Verify Email</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" paragraph>
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
            disabled={isSendingEmailCode}
            startIcon={isSendingEmailCode ? <CircularProgress size={14} color="inherit" /> : null}
          >
            {isSendingEmailCode ? "Sending..." : "Resend verification code"}
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEmailVerifyDialog}>Cancel</Button>
          <Button 
            onClick={submitEmailVerificationCode} 
            disabled={!emailVerificationCode || emailVerificationCode.length < 4}
            color="secondary"
            variant="contained"
          >
            Verify
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Phone Update Dialog */}
      <Dialog 
        open={isPhoneDialogOpen} 
        onClose={handleClosePhoneDialog}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            borderRadius: 2,
            backdropFilter: 'blur(10px)',
            bgcolor: alpha(theme.palette.background.paper, 0.9),
          }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <PhoneAndroid sx={{ mr: 1 }} />
            <Typography variant="h6">Update Phone Number</Typography>
          </Box>
        </DialogTitle>
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
            variant="contained"
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Phone Verification Dialog */}
      <Dialog 
        open={isPhoneVerifyDialogOpen} 
        onClose={handleClosePhoneVerifyDialog}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            borderRadius: 2,
            backdropFilter: 'blur(10px)',
            bgcolor: alpha(theme.palette.background.paper, 0.9),
          }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <VerifiedUser sx={{ mr: 1 }} />
            <Typography variant="h6">Verify Phone Number</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" paragraph>
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
            disabled={isSendingPhoneCode}
            startIcon={isSendingPhoneCode ? <CircularProgress size={14} color="inherit" /> : null}
          >
            {isSendingPhoneCode ? "Sending..." : "Resend verification code"}
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePhoneVerifyDialog}>Cancel</Button>
          <Button 
            onClick={submitPhoneVerificationCode} 
            disabled={!phoneVerificationCode || phoneVerificationCode.length < 4}
            color="secondary"
            variant="contained"
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
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </Stack>
  );
};

export default CommunicationPreferences;