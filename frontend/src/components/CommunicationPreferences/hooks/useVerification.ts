import { useState, useEffect } from 'react';
import { FamilyUnitViewModel, GuestViewModel } from '@/types/api';
import { useApiContext } from '@/context/ApiContext';
import { useFamily } from '@/store/family';
import { useRecoilState } from 'recoil';
import { familyState } from '@/store/family';

export const useVerification = (
  guest: GuestViewModel | null, 
  guestId: string,
  showAlertMessage: (message: string, severity: 'success' | 'error' | 'info' | 'warning') => void
) => {
  const apiContext = useApiContext();
  const { validatePhoneMutation, validateEmailMutation } = apiContext;
  const [_, familyActions] = useFamily();
  const [family, setFamily] = useRecoilState(familyState);
  
  // Force component to update verification status
  const [forceEmailVerified, setForceEmailVerified] = useState(false);
  const [forcePhoneVerified, setForcePhoneVerified] = useState(false);

  // Reset forced verification status when guest changes
  useEffect(() => {
    if (guest?.email?.verified) {
      setForceEmailVerified(true);
    }
    if (guest?.phone?.verified) {
      setForcePhoneVerified(true);
    }
  }, [guest]);

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

  // Email verification methods
  // EMERGENCY FIX: Disabled version to prevent infinite API calls
  const sendEmailVerificationCode = (
    emailValue: string | undefined, 
    setIsSendingEmailCode: (value: boolean) => void, 
    handleOpenEmailVerifyDialog: () => void,
    isEmailVerificationEnabled: boolean
  ) => {
    if (!isEmailVerificationEnabled) {
      showAlertMessage('Email verification is not available at this time', 'info');
      return;
    }

    // EMERGENCY FIX: Block all calls
    console.log('EMERGENCY FIX: Email verification temporarily disabled');
    showAlertMessage('Email verification has been temporarily disabled due to maintenance. Please try again later.', 'info');
    setIsSendingEmailCode(false);
    return;

    // Original code left commented out for future reference
    /*
    // Ensure we have an email to verify
    if (!emailValue && !guest?.email?.maskedValue) {
      showAlertMessage('No email address provided', 'error');
      return;
    }

    // Set loading state to true before API call
    setIsSendingEmailCode(true);
    
    // Use mutateAsync to prevent automatic retries
    const emailToVerify = emailValue || guest?.email?.maskedValue;
    console.log(`Sending verification email to: ${emailToVerify}`);
    
    validateEmailMutation.mutateAsync(
      { email: emailToVerify, action: 'register' },
      {
        onSuccess: () => {
          showAlertMessage('Verification email sent! Please check your inbox and click the verification link.', 'success');
          // Set loading state to false after success
          setIsSendingEmailCode(false);
          // No longer open the verification dialog
          // handleOpenEmailVerifyDialog();
        },
        onError: (error) => {
          showAlertMessage('Failed to send verification email. Please try again.', 'error');
          // Set loading state to false after error
          setIsSendingEmailCode(false);
        }
      }
    );
    */
  };

  // EMERGENCY FIX: Disabled version to prevent infinite API calls
  const resendEmailVerificationCode = (
    emailValue: string | undefined, 
    setIsSendingEmailCode: (value: boolean) => void,
    isEmailVerificationEnabled: boolean
  ) => {
    if (!isEmailVerificationEnabled) return;

    // EMERGENCY FIX: Block all calls
    console.log('EMERGENCY FIX: Email verification temporarily disabled');
    showAlertMessage('Email verification has been temporarily disabled due to maintenance. Please try again later.', 'info');
    setIsSendingEmailCode(false);
    return;

    /* Original code commented out
    // Ensure we have an email to verify
    if (!emailValue && !guest?.email?.maskedValue) {
      showAlertMessage('No email address provided', 'error');
      return;
    }

    // Set loading state to true before API call
    setIsSendingEmailCode(true);

    // Use mutateAsync to prevent automatic retries
    const emailToVerify = emailValue || guest?.email?.maskedValue;
    console.log(`Resending verification email to: ${emailToVerify}`);
    
    validateEmailMutation.mutateAsync(
      { email: emailToVerify, action: 'register' },
      {
        onSuccess: () => {
          showAlertMessage('New verification code sent to your email', 'success');
          // Set loading state to false after success
          setIsSendingEmailCode(false);
        },
        onError: (error) => {
          showAlertMessage('Failed to send verification code. Please try again.', 'error');
          // Set loading state to false after error
          setIsSendingEmailCode(false);
        }
      }
    );
    */
  };

  const submitEmailVerificationCode = (
    emailValue: string | undefined, 
    emailVerificationToken: string,
    handleCloseEmailVerifyDialog: () => void,
    isEmailVerificationEnabled: boolean
  ) => {
    if (!isEmailVerificationEnabled) return;

    validateEmailMutation.mutate(
      { email: emailValue || guest?.email?.maskedValue, token: emailVerificationToken, action: 'validate' },
      {
        onSuccess: () => {
          // Force update UI immediately to show verified status
          forceUpdateVerificationStatus('email', true);
          
          // Update UI with success message
          showAlertMessage('Email verified successfully!', 'success');
          handleCloseEmailVerifyDialog();
          
          // Also refetch data
          familyActions.getFamilyUnitQuery.refetch?.();
        },
        onError: (error) => {
          showAlertMessage('Verification failed. Please try again.', 'error');
        }
      }
    );
  };

  // Phone verification methods
  const sendPhoneVerificationCode = (
    phoneValue: string | undefined, 
    setIsSendingPhoneCode: (value: boolean) => void, 
    handleOpenPhoneVerifyDialog: () => void,
    isSmsVerificationEnabled: boolean
  ) => {
    if (!isSmsVerificationEnabled) {
      showAlertMessage('SMS verification is coming soon! Check back later.', 'info');
      return;
    }

    setIsSendingPhoneCode(true);
    validatePhoneMutation.mutate(
      { phoneNumber: phoneValue || guest?.phone?.maskedValue, action: 'register' },
      {
        onSuccess: () => {
          showAlertMessage('Verification SMS sent! Please check your phone for a verification link.', 'success');
          setIsSendingPhoneCode(false);
          handleOpenPhoneVerifyDialog();
        },
        onError: (error) => {
          showAlertMessage('Failed to send verification SMS. Please try again.', 'error');
          setIsSendingPhoneCode(false);
        }
      }
    );
  };

  const resendPhoneVerificationCode = (
    phoneValue: string | undefined, 
    setIsSendingPhoneCode: (value: boolean) => void,
    isSmsVerificationEnabled: boolean
  ) => {
    if (!isSmsVerificationEnabled) return;

    setIsSendingPhoneCode(true);
    validatePhoneMutation.mutate(
      { phoneNumber: phoneValue || guest?.phone?.maskedValue, action: 'register' },
      {
        onSuccess: () => {
          showAlertMessage('New verification code sent to your phone', 'success');
          setIsSendingPhoneCode(false);
        },
        onError: (error) => {
          showAlertMessage('Failed to send verification code. Please try again.', 'error');
          setIsSendingPhoneCode(false);
        }
      }
    );
  };

  const submitPhoneVerificationCode = (
    phoneValue: string | undefined, 
    phoneVerificationCode: string,
    handleClosePhoneVerifyDialog: () => void,
    isSmsVerificationEnabled: boolean
  ) => {
    if (!isSmsVerificationEnabled) return;

    validatePhoneMutation.mutate(
      { phoneNumber: phoneValue || guest?.phone?.maskedValue, code: phoneVerificationCode, action: 'validate' },
      {
        onSuccess: () => {
          // Force update UI immediately to show verified status
          forceUpdateVerificationStatus('phone', true);
          
          // Update UI with success message
          showAlertMessage('Phone number verified successfully!', 'success');
          handleClosePhoneVerifyDialog();
          
          // Also refetch data
          familyActions.getFamilyUnitQuery.refetch?.();
        },
        onError: (error) => {
          showAlertMessage('Verification failed. Please try again.', 'error');
        }
      }
    );
  };

  return {
    // Verification state
    forceEmailVerified,
    forcePhoneVerified,
    
    // Email verification methods
    sendEmailVerificationCode,
    resendEmailVerificationCode,
    submitEmailVerificationCode,
    
    // Phone verification methods
    sendPhoneVerificationCode,
    resendPhoneVerificationCode,
    submitPhoneVerificationCode,
    
    // Helper methods
    forceUpdateVerificationStatus
  };
};