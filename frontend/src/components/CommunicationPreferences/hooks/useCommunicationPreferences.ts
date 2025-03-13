import { useMemo, useState } from 'react';
import { useRecoilValue, useSetRecoilState, useRecoilState } from 'recoil';
import { familyState, guestSelector, useFamily } from '@/store/family';
import { GuestViewModel, NotificationPreferenceEnum, AgeGroupEnum } from '@/types/api';
import { useAuth0 } from '@auth0/auth0-react';
import { isFeatureEnabled } from '@/config';
import { isBetaTester } from '@/utils/roles';

export const useCommunicationPreferences = (guestId: string) => {
  const [family, setFamily] = useRecoilState(familyState);
  const guest: GuestViewModel | null = useRecoilValue(guestSelector(guestId));
  const [_, familyActions] = useFamily();
  const { user } = useAuth0();

  // Check if current guest is the logged-in user (matching auth0Id)
  const isCurrentUser = useMemo(() => 
    guest?.auth0Id !== null && guest?.auth0Id !== undefined && guest?.auth0Id !== ""
    && guest?.auth0Id === user?.sub
  , [guest?.auth0Id, user?.sub]);
  
  // Check if user has BetaTester role
  const hasBetaTesterRole = useMemo(() => 
    isBetaTester(guest)
  , [guest?.roles]);

  const isOptedInForBetaTesting = useMemo(() =>
    guest?.allowBetaScreenRecordings !== null && guest?.allowBetaScreenRecordings === true
  , [guest?.allowBetaScreenRecordings]);
  
  // Beta tester state
  const [isBetaTesting, setIsBetaTesting] = useState(false);
  
  // Check if specific verification features are enabled
  const isEmailVerificationEnabled = isFeatureEnabled('ENABLE_EMAIL_VERIFICATION');
  const isSmsVerificationEnabled = isFeatureEnabled('ENABLE_SMS_VERIFICATION');
  const isCommunicationPreferencesEnabled = isFeatureEnabled('ENABLE_COMMUNICATION_PREFERENCES');
  
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
    guest?.email?.verified ?? false
  , [guest]);
  
  const phoneVerified = useMemo(() => 
    guest?.phone?.verified ?? false
  , [guest]);

  const isEmailOptedIn = useMemo(() => 
    guestCommunicationPreferences.includes(NotificationPreferenceEnum.Email)
  , [guestCommunicationPreferences]);

  const isTextOptedIn = useMemo(() => 
    guestCommunicationPreferences.includes(NotificationPreferenceEnum.Text)
  , [guestCommunicationPreferences]);
  
  // Need verification indicators
  const needsEmailVerification = isEmailOptedIn && !emailVerified && isEmailVerificationEnabled;
  const needsPhoneVerification = isTextOptedIn && !phoneVerified && isSmsVerificationEnabled;

  // Check if user is under 13
  const isUnder13 = useMemo(() => 
    guest?.ageGroup === AgeGroupEnum.Baby || guest?.ageGroup === AgeGroupEnum.Under13
  , [guest?.ageGroup]);

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

  const handleSubmitEmail = (emailValue: string, emailResponse: any, forceUpdateVerificationStatus: (type: 'email' | 'phone', verified: boolean) => void, showAlertMessage: (message: string, severity: 'success' | 'error' | 'info' | 'warning') => void, handleCloseEmailDialog: () => void) => {
    if (emailValue) {
      // Check if email is different from current email
      const currentEmail = emailResponse?.value || '';
      const emailChanged = currentEmail !== emailValue;
      
      // Update the email
      familyActions.updateFamilyGuestEmail(guestId, emailValue);
      
      // If email changed, force the verification status to false
      if (emailChanged) {
        forceUpdateVerificationStatus('email', false);
        showAlertMessage('Email updated successfully - verification required', 'success');
      } else {
        showAlertMessage('Email updated successfully', 'success');
      }
    }
    handleCloseEmailDialog();
  };

  const handleSubmitPhone = (phoneValue: string, phoneResponse: any, forceUpdateVerificationStatus: (type: 'email' | 'phone', verified: boolean) => void, showAlertMessage: (message: string, severity: 'success' | 'error' | 'info' | 'warning') => void, handleClosePhoneDialog: () => void) => {
    if (phoneValue) {
      // Check if phone is different from current phone
      const currentPhone = phoneResponse?.value || '';
      const phoneChanged = currentPhone !== phoneValue;
      
      // Update the phone
      familyActions.updateFamilyGuestPhone(guestId, phoneValue);
      
      // If phone changed, force the verification status to false
      if (phoneChanged) {
        forceUpdateVerificationStatus('phone', false);
        showAlertMessage('Phone number updated successfully - verification required', 'success');
      } else {
        showAlertMessage('Phone number updated successfully', 'success');
      }
    }
    handleClosePhoneDialog();
  };

  return {
    // User state
    guest,
    family,
    isCurrentUser,
    isUnder13,
    user, // Include the Auth0 user
    
    // Beta tester state
    hasBetaTesterRole,
    isOptedInForBetaTesting,
    isBetaTesting,
    setIsBetaTesting,
    
    // Feature flags
    isEmailVerificationEnabled,
    isSmsVerificationEnabled,
    isCommunicationPreferencesEnabled,
    
    // Guest communication state
    guestCommunicationPreferences,
    guestEmailAddress,
    guestPhoneNumber,
    emailVerified,
    phoneVerified,
    isEmailOptedIn,
    isTextOptedIn,
    needsEmailVerification,
    needsPhoneVerification,
    
    // ENUM values
    contactPreferences: Object.keys(NotificationPreferenceEnum),
    
    // Actions
    handleUpdateCommunicationPreference,
    handleSubmitEmail,
    handleSubmitPhone,
    familyActions
  };
};