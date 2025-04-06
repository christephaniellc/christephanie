import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
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
  onSuccess: () => void;
  onError: (message: string) => void;
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
      
      console.log('Creating payment intent with email:', email);
      
      // Get the payment intent from our backend
      const { clientSecret: secret, error: paymentError } = await api.createPaymentIntent(
        // Convert dollar amount to cents for Stripe
        Math.round(amount * 100),
        'usd',
        category,
        notes,
        email, // Pass email for receipt
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
        throw new Error("Could not create payment intent");
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
        throw new Error(paymentError.message || 'Payment failed');
      }

      if (paymentIntent.status === 'succeeded') {
        onSuccess();
      } else {
        throw new Error(`Payment status: ${paymentIntent.status}`);
      }
    } catch (err) {
      setProcessing(false);
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(message);
      onError(message);
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
        InputLabelProps={{
          shrink: true,
        }}
      />
      
      {!userHasEmail && (
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
          InputLabelProps={{
            shrink: true,
          }}
        />
      )}
      
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
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 
  // Fallback test key for development
  'pk_test_51OHCKnKsQR10MdgmrKZAh91Ufz6BnXFQBHNsYbVW2uIKmHpWjTq0zJZU9MZ4yVs0g2oXAD9dkSLkPGDfuAqZlMHH00lRQrReDj'
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
  onSuccess: () => void;
  onError: (message: string) => void;
}) {
  // No need for theme here anymore, using hardcoded values in options
  
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
      <DialogTitle>
        Contribute to {category}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          You're contributing ${amount} to help with our {category.toLowerCase()}.
        </Typography>
        <Elements stripe={stripePromise} options={options}>
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