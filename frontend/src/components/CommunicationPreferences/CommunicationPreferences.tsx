/**
 * Component for managing communication preferences
 * Redesigned for better mobile experience and modern MUI design
 * Only displays for the current logged-in user (with matching auth0Id)
 */
import { Snackbar, Alert, Stack } from '@mui/material';
import { NotificationPreferenceEnum } from '@/types/api';
import { 
  useCommunicationPreferences, 
  useContactInformation, 
  useDialogState,
  useVerification 
} from './hooks';
import {
  AgeRestrictionCard,
  BetaTesterCard,
  EmailDialog,
  FeatureDisabledPlaceholder,
  PhoneDialog,
  PreferencesCard,
  PreferencesHeader,
  VerificationDialog
} from './components';

const CommunicationPreferences = ({ guestId }: { guestId: string }) => {
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
    familyActions
  } = useCommunicationPreferences(guestId);

  const {
    emailValue,
    setEmailValue,
    phoneValue,
    setPhoneValue,
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
    fetchMaskedValue,
    showAlertMessage
  } = useContactInformation(guestId);

  const {
    isEmailDialogOpen,
    isPhoneDialogOpen,
    isEmailVerifyDialogOpen,
    isPhoneVerifyDialogOpen,
    handleOpenEmailDialog,
    handleCloseEmailDialog,
    handleOpenEmailVerifyDialog,
    handleCloseEmailVerifyDialog,
    handleOpenPhoneDialog,
    handleClosePhoneDialog,
    handleOpenPhoneVerifyDialog,
    handleClosePhoneVerifyDialog
  } = useDialogState();

  const {
    forceEmailVerified,
    forcePhoneVerified,
    sendEmailVerificationCode,
    resendEmailVerificationCode,
    submitEmailVerificationCode,
    sendPhoneVerificationCode,
    resendPhoneVerificationCode,
    submitPhoneVerificationCode,
    forceUpdateVerificationStatus
  } = useVerification(guest, guestId, showAlertMessage);

  // If not current user, don't show anything
  if (!isCurrentUser) {
    return null;
  }

  // If the Communication Preferences feature is disabled, show a placeholder instead
  if (!isCommunicationPreferencesEnabled) {
    return <FeatureDisabledPlaceholder />;
  }

  // Open dialog handlers with API calls
  const handleEmailDialogOpen = async () => {
    setEmailValue('');
    const data = await fetchMaskedValue('email');
    if (data && data.value) {
      setEmailValue(data.value);
    }
    handleOpenEmailDialog();
  };

  const handlePhoneDialogOpen = async () => {
    setPhoneValue('');
    const data = await fetchMaskedValue('text');
    if (data && data.value) {
      setPhoneValue(data.value);
    }
    handleOpenPhoneDialog();
  };

  // Submit handlers for email and phone
  const onSubmitEmail = () => {
    handleSubmitEmail(
      emailValue, 
      emailResponse, 
      forceUpdateVerificationStatus, 
      showAlertMessage, 
      handleCloseEmailDialog
    );
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

  // Verification handlers
  const handleSendEmailVerificationCode = () => {
    sendEmailVerificationCode(
      emailValue, 
      setIsSendingEmailCode, 
      handleOpenEmailVerifyDialog,
      isEmailVerificationEnabled
    );
  };

  const handleResendEmailVerificationCode = () => {
    resendEmailVerificationCode(
      emailValue, 
      setIsSendingEmailCode,
      isEmailVerificationEnabled
    );
  };

  const handleSubmitEmailVerificationCode = () => {
    submitEmailVerificationCode(
      emailValue, 
      emailVerificationCode,
      handleCloseEmailVerifyDialog,
      isEmailVerificationEnabled
    );
  };

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
    <Stack
      spacing={2}
      width="100%"
      height="auto"
      my="auto"
      p={1}
      px={0}
    >
      {/* Header section */}
      <PreferencesHeader isUnder13={isUnder13} />

      {/* Main content - either Age Restriction card or Preferences */}
      {isUnder13 ? (
        <AgeRestrictionCard />
      ) : (
        <>
          {/* Main preferences card */}
          <PreferencesCard
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
          {hasBetaTesterRole && (
            <BetaTesterCard 
              isOptedIn={isOptedInForBetaTesting || isBetaTesting} 
              onChange={setIsBetaTesting} 
            />
          )}
        </>
      )}

      {/* Dialog components */}
      <EmailDialog
        open={isEmailDialogOpen}
        onClose={handleCloseEmailDialog}
        defaultValue={emailValue}
        onChange={setEmailValue}
        onSubmit={onSubmitEmail}
      />
      
      <PhoneDialog
        open={isPhoneDialogOpen}
        onClose={handleClosePhoneDialog}
        defaultValue={phoneValue}
        onChange={setPhoneValue}
        onSubmit={onSubmitPhone}
        isSmsVerificationEnabled={isSmsVerificationEnabled}
      />
      
      <VerificationDialog
        type="email"
        open={isEmailVerifyDialogOpen}
        onClose={handleCloseEmailVerifyDialog}
        verificationCode={emailVerificationCode}
        onCodeChange={setEmailVerificationCode}
        onResend={handleResendEmailVerificationCode}
        onSubmit={handleSubmitEmailVerificationCode}
        isSending={isSendingEmailCode}
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