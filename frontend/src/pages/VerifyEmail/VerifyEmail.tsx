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
import { useAuth0 } from '@auth0/auth0-react';

/**
 * VerifyEmail page component
 * 
 * This page handles email verification via a token received in the URL.
 * It automatically submits the token to the API and shows the verification result.
 * Works for both authenticated and unauthenticated users.
 */
const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const apiContext = useApiContext();
  const { validateEmailMutation } = apiContext;
  const [_, familyActions] = useFamily();
  const { isAuthenticated, isLoading } = useAuth0();

  // State for verification process
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Use ref to ensure we only run the verification once
  const hasRunRef = useRef(false);
  
  // Use another ref to store the verification result to prevent double-processing
  const verificationProcessedRef = useRef(false);
  const tokenRef = useRef<string | null>(null);
  
  // Detect if we should automatically redirect to home when not authenticated
  useEffect(() => {
    // Wait for Auth0 to finish its loading process
    if (isLoading) return;

    // If Auth0 is loaded and the user is not authenticated, then we should
    // process the verification without requiring login
  }, [isLoading, isAuthenticated]);
  
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
        // Using the new verifyEmail endpoint through validateEmailMutation
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
        
        // Only refresh family data if the user is authenticated
        if (isAuthenticated) {
          setTimeout(() => {
            if (isMounted) {
              familyActions.getFamilyUnitQuery.refetch()
                .catch(err => console.error('Error refreshing family data:', err));
            }
          }, 1000);
        }
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
  }, [isAuthenticated, isLoading]); // Add authentication state as dependencies

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
      // If user is not authenticated, always go to home page
      if (!isAuthenticated) {
        navigate('/');
        return;
      }
      
      // For authenticated users, always go to the communicationPreference step
      // Add verified=true parameter if verification was successful
      navigate(`/save-the-date?step=communicationPreference${verificationSuccess ? '&verified=true' : ''}`);
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
              Your email address has been verified. {isAuthenticated 
                ? "You will now receive updates and notifications about our wedding!" 
                : "You can now return to the wedding site."}
            </Typography>
            <Button 
              variant="contained" 
              color="secondary" 
              size="large"
              onClick={handleContinue}
              startIcon={<EmailOutlined />}
            >
              {isAuthenticated ? "Continue" : "Return to Wedding Site"}
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
              {isAuthenticated ? "Continue" : "Go to Homepage"}
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default VerifyEmail;