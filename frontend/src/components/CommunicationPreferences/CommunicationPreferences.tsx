/**
 * Component for managing communication preferences
 * Redesigned for better mobile experience and modern MUI design
 * Only displays for the current logged-in user (with matching auth0Id)
 */
import { useEffect, useState, useRef } from 'react';
import { Snackbar, Alert, Stack, Box, Paper, Container } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { NotificationPreferenceEnum } from '@/types/api';
import { 
  useCommunicationPreferences, 
  useContactInformation, 
  useDialogState,
  useVerification 
} from './hooks';
import {
  AgeRestrictionCard,
  AuthMismatchPlaceholder,
  BetaTesterCard,
  EmailDialog,
  FeatureDisabledPlaceholder,
  PhoneDialog,
  PreferencesCard,
  PreferencesHeader,
  VerificationDialog
} from './components';

const CommunicationPreferences = ({ guestId, showTitle = true }: { guestId: string, showTitle?: boolean }) => {
  const [searchParams] = useSearchParams();
  const [showVerificationSuccess, setShowVerificationSuccess] = useState(false);
  
  // Custom hooks for component state and logic
  const {
    guest,
    isCurrentUser,
    isUnder13,
    hasBetaTesterRole,
    isOptedInForBetaTesting,
    isBetaTesting,
    setIsBetaTesting,
    isEmailVerificationEnabled,
    isSmsVerificationEnabled,
    isCommunicationPreferencesEnabled,
    guestCommunicationPreferences,
    guestEmailAddress,
    guestPhoneNumber,
    emailVerified,
    phoneVerified,
    isEmailOptedIn,
    isTextOptedIn,
    needsEmailVerification,
    needsPhoneVerification,
    contactPreferences,
    handleUpdateCommunicationPreference,
    handleSubmitEmail,
    handleSubmitPhone,
    familyActions,
    user // Get the Auth0 user
  } = useCommunicationPreferences(guestId);

  const {
    emailValue,
    setEmailValue,
    phoneValue,
    setPhoneValue,
    // We're still destructuring these but not using them directly
    phoneVerificationCode,
    setPhoneVerificationCode,
    emailVerificationCode,
    setEmailVerificationCode,
    phoneResponse,
    emailResponse,
    isSendingEmailCode,
    setIsSendingEmailCode,
    isSendingPhoneCode,
    setIsSendingPhoneCode,
    showAlert,
    setShowAlert,
    alertMessage,
    alertSeverity,
    isLoadingEmail,
    isLoadingPhone,
    fetchMaskedValue,
    fetchUnmaskedEmailValue,
    fetchUnmaskedPhoneValue,
    showAlertMessage
  } = useContactInformation(guestId);

  const {
    isEmailDialogOpen,
    isPhoneDialogOpen,
    isPhoneVerifyDialogOpen,
    handleOpenEmailDialog,
    handleCloseEmailDialog,
    handleOpenPhoneDialog,
    handleClosePhoneDialog,
    // We're keeping the references but not using them
    handleOpenEmailVerifyDialog,
    handleCloseEmailVerifyDialog,
    handleOpenPhoneVerifyDialog,
    handleClosePhoneVerifyDialog
  } = useDialogState();

  const {
    forceEmailVerified,
    forcePhoneVerified,
    sendEmailVerificationCode,
    sendPhoneVerificationCode,
    resendPhoneVerificationCode,
    submitPhoneVerificationCode,
    forceUpdateVerificationStatus
    // No longer using these since verification is now done via email link
    // resendEmailVerificationCode,
    // submitEmailVerificationCode,
  } = useVerification(guest, guestId, showAlertMessage);

  // Check if redirected from successful verification - use a ref to prevent multiple executions
  const processedVerificationRef = useRef(false);
  
  useEffect(() => {
    const verified = searchParams.get('verified');
    
    // Only process verification parameter once to prevent multiple API calls
    if (verified === 'true' && !processedVerificationRef.current) {
      // Mark as processed immediately
      processedVerificationRef.current = true;
      
      // Update UI
      setShowVerificationSuccess(true);
      showAlertMessage('Email verified successfully!', 'success');
      
      // Force update the verification status in the UI
      forceUpdateVerificationStatus('email', true);
      
      // Clear the params after showing the message and updating state
      window.history.replaceState(null, '', window.location.pathname + window.location.search.replace(/[&?]verified=true/, ''));
      
      // Refresh family data exactly once with 500ms delay to ensure UI updates first
      const timeoutId = setTimeout(() => {
        familyActions.getFamilyUnitQuery.refetch()
          .catch(err => console.error('Error refreshing family data after verification:', err));
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  // Empty dependency array - this effect should run exactly once after mount
  }, []);

  // Check if guest.auth0Id is valid but doesn't match the current user
  const hasAuthMismatch = guest?.auth0Id && guest.auth0Id !== "" && guest.auth0Id !== user?.sub;
  
  // If guest has auth0Id that doesn't match current user, show auth mismatch message
  if (hasAuthMismatch) {
    return <AuthMismatchPlaceholder guest={guest} />;
  }

  // If not current user, don't show anything
  // This handles cases where the guest doesn't have an auth0Id assigned yet
  if (!isCurrentUser) {
    return null;
  }

  // If the Communication Preferences feature is disabled, show a placeholder instead
  if (!isCommunicationPreferencesEnabled) {
    return <FeatureDisabledPlaceholder />;
  }

  // Open dialog handlers with API calls
  const handleEmailDialogOpen = async () => {
    // Reset value first to avoid showing old value
    setEmailValue('');
    
    // Then open the dialog (will show loading state)
    handleOpenEmailDialog();
    
    // Fetch the unmasked value from API
    fetchUnmaskedEmailValue();
  };

  const handlePhoneDialogOpen = async () => {
    // Reset value first to avoid showing old value
    setPhoneValue('');
    
    // Then open the dialog (will show loading state)
    handleOpenPhoneDialog();
    
    // Fetch the unmasked value from API
    //console.log('Opening phone dialog and fetching phone');
    fetchUnmaskedPhoneValue();
  };

  // Submit handlers for email and phone
  const onSubmitEmail = () => {    
    // First submit the email update
    handleSubmitEmail(
      emailValue, 
      emailResponse, 
      forceUpdateVerificationStatus, 
      showAlertMessage, 
      handleCloseEmailDialog
    );
    
    // Then trigger verification for the new email (after a short delay to ensure patch completes)
    setTimeout(() => {
      if (emailValue && isEmailVerificationEnabled) {
        sendEmailVerificationCode(
          emailValue,
          setIsSendingEmailCode,
          handleOpenEmailVerifyDialog,
          isEmailVerificationEnabled
        );
      }
    }, 500);
  };

  const onSubmitPhone = () => {
    handleSubmitPhone(
      phoneValue, 
      phoneResponse, 
      forceUpdateVerificationStatus, 
      showAlertMessage, 
      handleClosePhoneDialog
    );
  };

  // Reference to track last click time to prevent double-clicks
  const lastClickTimeRef = useRef<number>(0);
  
  // Verification handlers
  const handleSendEmailVerificationCode = () => {
    // Throttle UI-triggered email verification to prevent accidental rapid clicks
    const now = Date.now();
    
    // Don't allow more than one click every 3 seconds
    if (now - lastClickTimeRef.current < 3000) {
      showAlertMessage('Please wait before requesting another email', 'info');
      return;
    }
    
    // Update last click time
    lastClickTimeRef.current = now;
    
    // Process the verification request
    sendEmailVerificationCode(
      emailValue, 
      setIsSendingEmailCode, 
      handleOpenEmailVerifyDialog,
      isEmailVerificationEnabled
    );
  };

  // These handlers are no longer used with the dialog-free verification approach
  
  // const handleResendEmailVerificationCode = () => {
  //   resendEmailVerificationCode(
  //     emailValue, 
  //     setIsSendingEmailCode,
  //     isEmailVerificationEnabled
  //   );
  // };

  // const handleSubmitEmailVerificationCode = () => {
  //   submitEmailVerificationCode(
  //     emailValue, 
  //     emailVerificationCode,
  //     handleCloseEmailVerifyDialog,
  //     isEmailVerificationEnabled
  //   );
  // };

  const handleSendPhoneVerificationCode = () => {
    sendPhoneVerificationCode(
      phoneValue, 
      setIsSendingPhoneCode, 
      handleOpenPhoneVerifyDialog,
      isSmsVerificationEnabled
    );
  };

  const handleResendPhoneVerificationCode = () => {
    resendPhoneVerificationCode(
      phoneValue, 
      setIsSendingPhoneCode,
      isSmsVerificationEnabled
    );
  };

  const handleSubmitPhoneVerificationCode = () => {
    submitPhoneVerificationCode(
      phoneValue, 
      phoneVerificationCode,
      handleClosePhoneVerifyDialog,
      isSmsVerificationEnabled
    );
  };

  // Toggle handlers for communication preferences
  const handleToggleEmail = () => {
    handleUpdateCommunicationPreference(NotificationPreferenceEnum.Email);
  };

  const handleToggleText = () => {
    handleUpdateCommunicationPreference(NotificationPreferenceEnum.Text);
  };
  
  // Component rendering
  return (
    <Container maxWidth="lg" disableGutters>
      <Paper 
        elevation={0}
        sx={{ 
          borderRadius: 3, 
          overflow: 'hidden',
          background: 'transparent'
        }}
      >
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack spacing={3}>
            {/* Header section */}
            {/*<PreferencesHeader isUnder13={isUnder13} />*/}

            {/* Main content - either Age Restriction card or Preferences */}
            {isUnder13 ? (
              <AgeRestrictionCard />
            ) : (
              <>
                {/* Main preferences card */}
                <PreferencesCard
                  showTitle={showTitle}
                  contactPreferences={contactPreferences}
                  isEmailOptedIn={isEmailOptedIn}
                  isTextOptedIn={isTextOptedIn}
                  emailVerified={emailVerified || forceEmailVerified}
                  phoneVerified={phoneVerified || forcePhoneVerified}
                  isEmailVerificationEnabled={isEmailVerificationEnabled}
                  isSmsVerificationEnabled={isSmsVerificationEnabled}
                  guestEmailAddress={guestEmailAddress}
                  guestPhoneNumber={guestPhoneNumber}
                  needsEmailVerification={needsEmailVerification && !forceEmailVerified}
                  needsPhoneVerification={needsPhoneVerification && !forcePhoneVerified}
                  isSendingEmailCode={isSendingEmailCode}
                  isSendingPhoneCode={isSendingPhoneCode}
                  isPending={familyActions.patchFamilyMutation.isPending || familyActions.getFamilyUnitQuery.isFetching}
                  onToggleEmail={handleToggleEmail}
                  onToggleText={handleToggleText}
                  onEditEmail={handleEmailDialogOpen}
                  onEditPhone={handlePhoneDialogOpen}
                  onVerifyEmail={handleSendEmailVerificationCode}
                  onVerifyPhone={handleSendPhoneVerificationCode}
                />
                
                {/* Beta Tester Section - Only show for users with BetaTester role */}
                {/* {hasBetaTesterRole && (
                  <BetaTesterCard 
                    isOptedIn={isOptedInForBetaTesting || isBetaTesting} 
                    onChange={setIsBetaTesting} 
                  />
                )} */}
              </>
            )}
          </Stack>
        </Box>
      </Paper>

      {/* Dialog components */}
      <EmailDialog
        open={isEmailDialogOpen}
        onClose={handleCloseEmailDialog}
        defaultValue={emailValue}
        onChange={setEmailValue}
        onSubmit={onSubmitEmail}
        isLoading={isLoadingEmail}
      />
      
      <PhoneDialog
        open={isPhoneDialogOpen}
        onClose={handleClosePhoneDialog}
        defaultValue={phoneValue}
        onChange={setPhoneValue}
        onSubmit={onSubmitPhone}
        isSmsVerificationEnabled={isSmsVerificationEnabled}
        isLoading={isLoadingPhone}
      />
      
      <VerificationDialog
        type="phone"
        open={isPhoneVerifyDialogOpen}
        onClose={handleClosePhoneVerifyDialog}
        verificationCode={phoneVerificationCode}
        onCodeChange={setPhoneVerificationCode}
        onResend={handleResendPhoneVerificationCode}
        onSubmit={handleSubmitPhoneVerificationCode}
        isSending={isSendingPhoneCode}
      />
      
      {/* Success/Error Messages */}
      <Snackbar
        open={showAlert}
        autoHideDuration={6000}
        onClose={() => setShowAlert(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowAlert(false)} 
          severity={alertSeverity}
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CommunicationPreferences;