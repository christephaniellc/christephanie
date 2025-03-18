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
  
  // Use another ref to store the verification result to prevent double-processing
  const verificationProcessedRef = useRef(false);
  const tokenRef = useRef<string | null>(null);
  
  useEffect(() => {
    // Only process the token once per page load
    if (verificationProcessedRef.current) {
      //console.log('Token already processed, skipping');
      return;
    }
    
    // Get token from URL once and store in ref
    const token = searchParams.get('token');
    tokenRef.current = token;
    const email = searchParams.get('email') || '';
    
    if (!token) {
      setIsVerifying(false);
      setErrorMessage('No verification token found in URL. Please check your email link and try again.');
      verificationProcessedRef.current = true;
      return;
    }
    
    // Mark as processed immediately to prevent double-processing
    verificationProcessedRef.current = true;
    
    // Create a flag to track if this effect is still relevant
    let isMounted = true;
    
    // Define verification function
    const verifyEmail = async () => {
      if (!isMounted) return;
      
      try {
        // Call the API to validate the email with the token - only once!
        const result = await validateEmailMutation.mutateAsync({
          email,
          token: token,
          action: 'validate'
        });
        
        if (!isMounted) return;
        
        setVerificationSuccess(true);
        setIsVerifying(false);
        
        // Clear URL parameters to prevent accidental refresh issues
        window.history.replaceState(null, '', window.location.pathname);
        
        // Refresh family data with a single attempt
        setTimeout(() => {
          if (isMounted) {
            familyActions.getFamilyUnitQuery.refetch()
              .catch(err => console.error('Error refreshing family data:', err));
          }
        }, 1000);
      } catch (error) {
        if (!isMounted) return;
        
        console.error('Email verification failed:', error);
        setVerificationSuccess(false);
        setErrorMessage('Email verification failed. The token may be invalid or expired.');
        setIsVerifying(false);
      }
    };

    // Execute verification with a small delay to ensure UI is ready
    setTimeout(verifyEmail, 500);
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Track if navigation has been triggered to prevent double navigation
  const hasNavigatedRef = useRef(false);
  
  const handleContinue = () => {
    // Prevent multiple clicks
    if (hasNavigatedRef.current) {
      return;
    }
    
    // Mark as navigated
    hasNavigatedRef.current = true;
    
    // Cancel any pending API calls
    if (validateEmailMutation.isPending) {
      validateEmailMutation.reset();
    }    
    // Navigate back to the main page with a small delay to let UI updates finish
    setTimeout(() => {
      // Navigate back to the communication preferences page
      if (verificationSuccess) {
        // Add verified=true to ensure proper state update
        navigate(`/save-the-date?step=communicationPreference&verified=true`);
      } else {
        navigate('/save-the-date');
      }
    }, 100);
  };

  return (
    <Container maxWidth="sm" sx={{ py: 5 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          backdropFilter: 'blur(20px)',
          borderRadius: 2,
          backgroundColor: 'rgba(0,0,0,.1)',
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
          <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              py: 2 
            }}>
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
              Your email address has been verified. You will now receive updates and notifications about our wedding!
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