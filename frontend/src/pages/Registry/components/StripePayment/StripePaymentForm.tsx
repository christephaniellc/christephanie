import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  InputAdornment,
  Paper,
  TextField,
  Typography,
  styled,
  useTheme
} from '@mui/material';
import {
  CardElement,
  useStripe,
  useElements,
  Elements
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { getConfig } from '@/auth_config';
import { useRecoilValue } from 'recoil';
import { apiState } from '@/context/ApiContext';
import theme from '@/store/theme';
import { StephsActualFavoriteTypography, StephsActualFavoriteTypographyBackNext, StephsActualFavoriteTypographyNoDrop, StephsActualFavoriteTypographyNoDropWhite } from '@/components/AttendanceButton/AttendanceButton';

// Stripe styled components
const CardElementContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  '& .StripeElement': {
    width: '100%',
    padding: theme.spacing(1),
    transition: 'box-shadow 150ms ease, border-color 150ms ease',
  },
  '& .StripeElement--focus': {
    boxShadow: `0 1px 3px 0 ${theme.palette.secondary.light}`,
    borderColor: theme.palette.secondary.main,
  },
  '& .StripeElement--invalid': {
    borderColor: theme.palette.error.main,
  },
  '& .StripeElement--webkit-autofill': {
    backgroundColor: 'transparent !important',
  }
}));

// Stripe branding
const StripeBrandingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  marginTop: theme.spacing(2),
  opacity: 0.7
}));

const StripeLogo = styled('img')({
  height: '24px',
  marginLeft: '8px'
});

// The form that collects payment details
// Defined as function to avoid React hook errors
function PaymentForm({ 
  amount, 
  category,
  onSuccess,
  onError,
  onCancel
}: { 
  amount: number;
  category: string;
  onSuccess: (details: { paymentIntentId: string; email: string; notes?: string; timestamp: string }) => void;
  onError: (message: string, errorCode?: string, errorType?: string) => void;
  onCancel: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const api = useRecoilValue(apiState);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userHasEmail, setUserHasEmail] = useState(true);

  // Get theme for the component
  const muiTheme = useTheme();
  
  // Check if the logged-in user has an email
  useEffect(() => {
    const checkUserEmail = async () => {
      try {
        const user = await api.getMe();
        console.log('User data from API:', user);
        
        // Check if user.email is a VerifiedDto with a valid value
        const userEmail = user.email && user.email.value ? user.email.value : '';
        const hasEmail = typeof userEmail === 'string' && userEmail.trim().length > 0;
        
        console.log('User email check:', { userEmail, hasEmail });
        setUserHasEmail(hasEmail);
        
        if (hasEmail) {
          setEmail(userEmail);
        }
        
        // Use proper fallback for name
        if (user.firstName) {
          const guestName = user.firstName + (user.lastName ? ` ${user.lastName}` : '');
          setName(guestName);
          console.log('Setting user name:', guestName);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setUserHasEmail(false);
      }
    };
    
    checkUserEmail();
  }, [api]);

  // Email validation
  const [emailError, setEmailError] = useState<string | null>(null);
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    if (!isValid && email.trim() !== '') {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError(null);
    }
    return isValid;
  };

  // Get a payment intent from our API - but don't call it automatically
  const getPaymentIntent = useCallback(async () => {
    try {
      setProcessing(true);
      
      // Validate email if needed
      if (!userHasEmail && !validateEmail(email)) {
        setProcessing(false);
        return null;
      }
      
      console.log('Creating payment intent with data:', {
        amount: Math.round(amount * 100),
        currency: 'usd',
        category,
        notes,
        email,
        isAnonymous,
        name
      });
      
      // Get the payment intent from our backend
      const { clientSecret: secret, error: paymentError } = await api.createPaymentIntent(
        // Convert dollar amount to cents for Stripe
        Math.round(amount * 100),
        'usd',
        category,
        notes || '', // Ensure notes is never undefined
        email || '', // Ensure email is never undefined
        isAnonymous
      );

      if (paymentError) {
        throw new Error(paymentError.message || 'Error creating payment');
      }

      if (!secret) {
        throw new Error('No client secret returned from the server');
      }

      setClientSecret(secret);
      setProcessing(false);
      return secret;
    } catch (err) {
      setProcessing(false);
      const message = err instanceof Error ? err.message : 'Failed to initialize payment';
      setError(message);
      onError(message);
      return null;
    }
  }, [api, amount, category, notes, email, isAnonymous, onError, userHasEmail, validateEmail]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    // Validate fields
    if (!name) {
      setError("Please enter your name");
      return;
    }

    // Validate email if it's shown
    if (!userHasEmail && !validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // First get the payment intent
      const secret = await getPaymentIntent();
      
      if (!secret) {
        const errorMsg = "Could not create payment intent";
        console.error(errorMsg);
        // Call onError directly to ensure error is shown
        onError(errorMsg);
        // Also throw the error to make sure the payment stops
        throw new Error(errorMsg);
      }
      
      // Then confirm the payment
      const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(secret, {
        payment_method: {
          card: cardElement,
          billing_details: { 
            name, 
            email 
          }
        }
      });

      if (paymentError) {
        setProcessing(false);
        // Pass detailed error information
        onError(
          paymentError.message || 'Payment failed',
          paymentError.code || '',
          paymentError.type || ''
        );
        // Throwing error to break out of the function completely
        throw new Error(paymentError.message || 'Payment failed');
      }

      if (paymentIntent.status === 'succeeded') {
        // Pass payment details to success handler
        onSuccess({
          paymentIntentId: paymentIntent.id,
          email: email,
          notes: notes,
          timestamp: new Date().toISOString()
        });
      } else {
        throw new Error(`Payment status: ${paymentIntent.status}`);
      }
    } catch (err) {
      setProcessing(false);
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(message);
      
      // Extract error details if available (for Stripe errors)
      let errorCode = '';
      let errorType = '';
      
      if (err && typeof err === 'object' && 'code' in err) {
        errorCode = String(err.code || '');
      }
      
      if (err && typeof err === 'object' && 'type' in err) {
        errorType = String(err.type || '');
      }
      
      onError(message, errorCode, errorType);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        fullWidth
        margin="normal"
        required
        placeholder="Your full name"
        variant="outlined"
        disabled={true}
        InputLabelProps={{
          shrink: true,
        }}
      />
      
      <TextField
        label="Email for Receipt"
        type="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          validateEmail(e.target.value);
        }}
        error={!!emailError}
        helperText={emailError || "We'll send your receipt to this email"}
        fullWidth
        margin="normal"
        required
        placeholder="your.email@example.com"
        variant="outlined"
        color={userHasEmail ? "info" : "secondary"}
        disabled={userHasEmail}
        InputLabelProps={{
          shrink: true,
        }}
      />
      
      <TextField
        label="Gift Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        fullWidth
        margin="normal"
        multiline
        rows={2}
        placeholder="Add a personal message or note about your gift..."
        variant="outlined"
        InputLabelProps={{
          shrink: true,
        }}
      />
      
      {/* Amount field */}
      <TextField
        label="Amount"
        value={amount}
        disabled={true}
        fullWidth
        margin="normal"
        variant="outlined"
        helperText={<Typography variant='caption' color='#E9950C'>toward {category}</Typography>}
        InputProps={{
          startAdornment: <InputAdornment position="start">$</InputAdornment>,
          endAdornment: 
          <InputAdornment position="end">
            <Typography variant="body2" sx={{ color: '#E9950C' }}>USD</Typography>
          </InputAdornment>,
          readOnly: true,
        }}
        InputLabelProps={{
          shrink: true,
        }}
        sx={{
          '& .MuiInputBase-input.Mui-disabled': {
            WebkitTextFillColor: muiTheme.palette.secondary.main,
            color: muiTheme.palette.secondary.main,
            fontWeight: 'bold',
          },
          bgcolor: 'rgba(0, 0, 0, 0.03)',
        }}
      />
      
      <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
        Card Information
      </Typography>
      <CardElementContainer>
        <CardElement 
          options={{
            style: {
              base: {
                fontSize: '16px',
                fontFamily: '"Roboto", sans-serif',
                color: '#ff9800',
                '::placeholder': {
                  color: '#aab7c4',
                },
                padding: '10px 0',
              },
              invalid: {
                color: '#9e2146',
                iconColor: '#9e2146',
              },
            },
            hidePostalCode: true, // Hide postal code as we already have the email for receipts
          }}
          onChange={(event) => {
            if (event.error) {
              setError(event.error.message || "Card validation error");
            } else {
              setError(null);
            }
          }}
        />
      </CardElementContainer>
      
      {error && (
        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button 
          onClick={onCancel}
          disabled={processing}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant="contained" 
          color="secondary"
          disabled={!stripe || processing || (!userHasEmail && (!email || !!emailError)) || !name}
        >
          {processing ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            `Pay $${amount}`
          )}
        </Button>
      </Box>
      
      <StripeBrandingContainer>
        <Typography variant="caption" color="text.secondary">
          Powered by
        </Typography>
        <StripeLogo 
          src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" 
          alt="Stripe" 
        />
      </StripeBrandingContainer>
    </form>
  );
};

// Load Stripe with publishable key from environment
// In development, this will use the test key
const stripePromise = loadStripe(
  import.meta.env.STRIPE_PUBLIC_KEY || 
  // Fallback test key for development
  'pk_test_51R9Ynf2fLHdiDfDYE4j29s49kjr6g5JOcF6qTUH29dBM4iTAck7k7HasED7jwXxzp2URulNwV3sRaBtDu3VRpge400EVCA9Mno'
);

// Main payment dialog component that wraps the form in Stripe Elements
function StripePaymentForm({
  open,
  amount,
  category,
  onClose,
  onSuccess,
  onError
}: {
  open: boolean;
  amount: number;
  category: string;
  onClose: () => void;
  onSuccess: (details: { paymentIntentId: string; email: string; notes?: string; timestamp: string }) => void;
  onError: (message: string, errorCode?: string, errorType?: string) => void;
}) {
  // Reset Elements when component re-renders to avoid stale state issues
  // Adding a unique key forces React to recreate the Elements component
  const elementsKey = React.useMemo(() => `stripe-elements-${Date.now()}`, [open]);
  const theme = useTheme();
  
  // Options for Stripe Elements that match the expected StripeElementsOptions type
  // Simplified options to avoid potential theme-related errors
  const options = {
    appearance: {
      theme: 'stripe' as 'stripe',
      variables: {
        colorPrimary: '#6B21A8', // purple.800 - secondary color
        colorText: '#1F2937', // gray.800
        colorBackground: '#FFFFFF', // white
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      },
    },
    fonts: [{
      cssSrc: 'https://fonts.googleapis.com/css?family=Roboto'
    }]
  };

  // Don't render the dialog if it's not open
  if (!open) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >
      <StephsActualFavoriteTypographyNoDrop  
        color={theme.palette.primary.main}
        sx={{
          textAlign: 'center',
          fontSize: '1.8rem',
          pt: 2
        }}
        >
        Complete Your Contribution
      </StephsActualFavoriteTypographyNoDrop>
      <DialogContent>
        <Elements stripe={stripePromise} options={options} key={elementsKey}>
          <PaymentForm 
            amount={amount}
            category={category}
            onSuccess={onSuccess}
            onError={onError}
            onCancel={onClose}
          />
        </Elements>
      </DialogContent>
    </Dialog>
  );
};

export default StripePaymentForm;