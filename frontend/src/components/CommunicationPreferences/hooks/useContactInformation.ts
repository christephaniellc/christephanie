import { useState } from 'react';
import { useApiContext } from '@/context/ApiContext';
import { getConfig } from '@/auth_config';
import { NotificationPreferenceEnum } from '@/types/api';
import { useAuth0 } from '@auth0/auth0-react';

export const useContactInformation = (guestId: string) => {
  const apiContext = useApiContext();
  const { validatePhoneMutation } = apiContext;
  const { validateEmailMutation } = apiContext;
  const { getAccessTokenSilently } = useAuth0();

  // Input form values
  const [emailValue, setEmailValue] = useState('');
  const [phoneValue, setPhoneValue] = useState('');
  const [phoneVerificationCode, setPhoneVerificationCode] = useState('');
  const [emailVerificationCode, setEmailVerificationCode] = useState('');
  
  // Store actual values from API
  const [phoneResponse, setPhoneResponse] = useState<any>(null);
  const [emailResponse, setEmailResponse] = useState<any>(null);

  // Loading states
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);
  const [isLoadingPhone, setIsLoadingPhone] = useState(false);
  const [isSendingEmailCode, setIsSendingEmailCode] = useState(false);
  const [isSendingPhoneCode, setIsSendingPhoneCode] = useState(false);

  // Alert state
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');

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
        console.error(`API error getting ${type}: ${response.status} ${response.statusText}`);
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();

      // Handle response that might be just a string instead of an object
      const responseData = typeof data === 'string' 
        ? { value: data, verified: false } 
        : data;
      
      // Store response
      if (type === 'email') {
        setEmailResponse(responseData);
      } else {
        setPhoneResponse(responseData);
      }

      // Return the response data, ensuring it has the expected format
      return typeof data === 'string' ? { value: data, verified: false } : data;
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
      return null;
    }
  };

  // Show alert
  const showAlertMessage = (message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setShowAlert(true);
  };

  // Enhanced fetch methods that also update state
  const fetchUnmaskedEmailValue = async () => {
    setIsLoadingEmail(true);
    try {
      const result = await fetchMaskedValue('email');
      if (result) {
        // Handle both string and object responses
        const emailVal = typeof result === 'string' ? result : result.value;
        setEmailValue(emailVal);
      } else {
        console.error('No email value returned from API');
      }
    } catch (error) {
      console.error('Error fetching email:', error);
      showAlertMessage('Could not load email address. Please try again.', 'error');
    } finally {
      setIsLoadingEmail(false);
    }
  };
  
  const fetchUnmaskedPhoneValue = async () => {
    setIsLoadingPhone(true);
    try {
      console.log('Fetching unmasked phone value');
      const result = await fetchMaskedValue('text');
      console.log('Fetch phone result:', result);
      if (result) {
        // Handle both string and object responses
        const phoneVal = typeof result === 'string' ? result : result.value;
        console.log('Setting phone value directly to:', phoneVal);
        setPhoneValue(phoneVal);
      } else {
        console.error('No phone value returned from API');
      }
    } catch (error) {
      console.error('Error fetching phone:', error);
      showAlertMessage('Could not load phone number. Please try again.', 'error');
    } finally {
      setIsLoadingPhone(false);
    }
  };

  return {
    // State values
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
    
    // Query states
    isLoadingEmail,
    isLoadingPhone,
    
    // Methods
    fetchMaskedValue,
    fetchUnmaskedEmailValue,
    fetchUnmaskedPhoneValue,
    showAlertMessage
  };
};