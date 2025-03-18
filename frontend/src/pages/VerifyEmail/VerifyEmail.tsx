import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Paper, 
  Typography, 
  Box, 
  CircularProgress, 
  Button, 
  Alert
} from '@mui/material';
import { EmailOutlined, CheckCircleOutline, ErrorOutline } from '@mui/icons-material';
import { useApiContext } from '@/context/ApiContext';
import { useFamily } from '@/store/family';

/**
 * VerifyEmail page component
 * 
 * This page handles email verification via a token received in the URL.
 * It automatically submits the token to the API and shows the verification result.
 */
const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const apiContext = useApiContext();
  const { validateEmailMutation } = apiContext;
  const [_, familyActions] = useFamily();

  // State for verification process
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Use ref to ensure we only run the verification once
  const hasRunRef = useRef(false);
  
  useEffect(() => {
    // Skip rerunning verification if we already completed it
    if (!isVerifying && (verificationSuccess || errorMessage)) {
      return;
    }
    
    // EMERGENCY FIX: Use ref to ensure this only runs once per component lifecycle
    if (hasRunRef.current) {
      console.log('Verification already attempted, skipping');
      return;
    }
    hasRunRef.current = true;
    
    const token = searchParams.get('token');
    const email = searchParams.get('email') || '';
    
    if (!token) {
      setIsVerifying(false);
      setErrorMessage('No verification token found in URL. Please check your email link and try again.');
      return;
    }

    // Create a flag to track if this effect is still relevant
    let isMounted = true;
    
    // Verify the email using the token
    const verifyEmail = async () => {
      // Guard against duplicate execution
      if (!isMounted || !isVerifying) return;
      
      try {
        console.log(`Verifying email token: ${token.substring(0, 8)}... for email: ${email}`);
        
        // Call the API to validate the email with the token
        const result = await validateEmailMutation.mutateAsync({
          email,
          token: token,
          action: 'validate'
        });
        
        // Only update state if the component is still mounted
        if (isMounted) {
          console.log('Email verification result:', result);
          // If validation is successful
          setVerificationSuccess(true);
          
          // Refresh family data to get updated verification status - with delay
          setTimeout(() => {
            if (isMounted) {
              familyActions.getFamilyUnitQuery.refetch();
            }
          }, 1000);
        }
        
      } catch (error) {
        // Only update state if the component is still mounted
        if (isMounted) {
          console.error('Email verification failed:', error);
          setVerificationSuccess(false);
          setErrorMessage('Email verification failed. The token may be invalid or expired.');
        }
      } finally {
        // Only update state if the component is still mounted
        if (isMounted) {
          setIsVerifying(false);
        }
      }
    };

    // Add a small delay to avoid racing conditions
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        verifyEmail();
      }
    }, 500);
    
    // Cleanup function to prevent state updates if the component unmounts
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [searchParams]);

  const handleContinue = () => {
    // Navigate back to the communication preferences page
    if (verificationSuccess) {
      navigate('/save-the-date?verified=true');
    } else {
      navigate('/save-the-date');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 5 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          borderRadius: 2,
          backdropFilter: 'blur(10px)',
          bgcolor: 'rgba(255, 255, 255, 0.9)',
          textAlign: 'center'
        }}
      >
        {/* Verifying state */}
        {isVerifying ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
            <CircularProgress size={60} color="secondary" sx={{ mb: 3 }} />
            <Typography variant="h5" gutterBottom>
              Verifying Your Email
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Please wait while we verify your email address...
            </Typography>
          </Box>
        ) : verificationSuccess ? (
          // Success state
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
            <CheckCircleOutline 
              sx={{ 
                fontSize: 80, 
                color: 'success.main',
                mb: 2
              }} 
            />
            <Typography variant="h5" gutterBottom>
              Email Verified Successfully!
            </Typography>
            <Typography variant="body1" sx={{ mb: 4 }}>
              Your email address has been verified. You will now receive updates and notifications about our wedding.
            </Typography>
            <Button 
              variant="contained" 
              color="secondary" 
              size="large"
              onClick={handleContinue}
              startIcon={<EmailOutlined />}
            >
              Continue
            </Button>
          </Box>
        ) : (
          // Error state
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
            <ErrorOutline 
              sx={{ 
                fontSize: 80, 
                color: 'error.main',
                mb: 2
              }} 
            />
            <Typography variant="h5" gutterBottom>
              Verification Failed
            </Typography>
            
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3, 
                width: '100%',
                textAlign: 'left'
              }}
            >
              {errorMessage || 'There was a problem verifying your email.'}
            </Alert>
            
            <Typography variant="body2" sx={{ mb: 4 }}>
              You can close this page and try again with a new verification link.
            </Typography>
            
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              onClick={handleContinue}
            >
              Return to Wedding Site
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default VerifyEmail;