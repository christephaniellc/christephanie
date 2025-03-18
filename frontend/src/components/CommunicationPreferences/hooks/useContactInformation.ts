import { useState, useEffect } from 'react';
import { useApiContext } from '@/context/ApiContext';
import { getConfig } from '@/auth_config';
import { NotificationPreferenceEnum } from '@/types/api';
import { useAuth0 } from '@auth0/auth0-react';
import { useQuery } from '@tanstack/react-query';

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
  
  // Use React Query to fetch unmasked values
  const emailQuery = useQuery({
    queryKey: ['unmaskedEmail', guestId],
    queryFn: () => fetchMaskedValue('email'),
    enabled: false
  });
  
  // Handle email query success manually
  useEffect(() => {
    if (emailQuery.data) {
      const data = emailQuery.data;
      if (data && (typeof data === 'string' || data.value)) {
        const valueToUse = typeof data === 'string' ? data : data.value;
        setEmailValue(valueToUse);
      }
    }
  }, [emailQuery.data]);
  
  const phoneQuery = useQuery({
    queryKey: ['unmaskedPhone', guestId],
    queryFn: () => fetchMaskedValue('text'),
    enabled: false
  });
  
  // Handle phone query success manually
  useEffect(() => {
    if (phoneQuery.data) {
      const data = phoneQuery.data;
      if (data && (typeof data === 'string' || data.value)) {
        const valueToUse = typeof data === 'string' ? data : data.value;
        setPhoneValue(valueToUse);
      }
    }
  }, [phoneQuery.data]);

  // Loading states
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
      
      console.log(`Fetching ${type} value for guest ID: ${guestId}`);
      
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
      console.log(`Received ${type} data:`, data);

      // Handle response that might be just a string instead of an object
      const responseData = typeof data === 'string' 
        ? { value: data, verified: false } 
        : data;
      
      // Store response
      if (type === 'email') {
        setEmailResponse(responseData);
        console.log('Setting email value to:', responseData.value);
      } else {
        setPhoneResponse(responseData);
        console.log('Setting phone value to:', responseData.value);
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

  // Create loading state trackers
  const [isLoadingEmailState, setIsLoadingEmailState] = useState(false);
  const [isLoadingPhoneState, setIsLoadingPhoneState] = useState(false);

  // Enhanced fetch methods that also update state
  const fetchUnmaskedEmailValue = async () => {
    setIsLoadingEmailState(true);
    try {
      console.log('Fetching unmasked email value');
      const result = await fetchMaskedValue('email');
      console.log('Fetch email result:', result);
      if (result) {
        // Handle both string and object responses
        const emailValue = typeof result === 'string' ? result : result.value;
        console.log('Setting email value directly to:', emailValue);
        setEmailValue(emailValue);
      } else {
        console.error('No email value returned from API');
      }
    } catch (error) {
      console.error('Error fetching email:', error);
      showAlertMessage('Could not load email address. Please try again.', 'error');
    } finally {
      setIsLoadingEmailState(false);
    }
  };
  
  const fetchUnmaskedPhoneValue = async () => {
    setIsLoadingPhoneState(true);
    try {
      console.log('Fetching unmasked phone value');
      const result = await fetchMaskedValue('text');
      console.log('Fetch phone result:', result);
      if (result) {
        // Handle both string and object responses
        const phoneValue = typeof result === 'string' ? result : result.value;
        console.log('Setting phone value directly to:', phoneValue);
        setPhoneValue(phoneValue);
      } else {
        console.error('No phone value returned from API');
      }
    } catch (error) {
      console.error('Error fetching phone:', error);
      showAlertMessage('Could not load phone number. Please try again.', 'error');
    } finally {
      setIsLoadingPhoneState(false);
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
    isLoadingEmail: isLoadingEmailState,
    isLoadingPhone: isLoadingPhoneState,
    
    // Methods
    fetchMaskedValue,
    fetchUnmaskedEmailValue,
    fetchUnmaskedPhoneValue,
    showAlertMessage
  };
};