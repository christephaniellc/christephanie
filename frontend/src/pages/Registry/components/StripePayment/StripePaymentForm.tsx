import React, { useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  TextField,
  Typography,
  styled
} from '@mui/material';
import {
  CardElement,
  useStripe,
  useElements,
  Elements,
  StripeElementsOptions
} from '@stripe/react-stripe-js';
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';

// Stripe styled components
const CardElementContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  '& .StripeElement': {
    width: '100%',
    padding: theme.spacing(1),
  }
}));

// The form that collects payment details
const PaymentForm = ({ 
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
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // This would normally create a payment intent on the server
      // For now, we'll simulate success after a short delay
      setTimeout(() => {
        setProcessing(false);
        onSuccess();
      }, 2000);

      // Real implementation would be something like this:
      // const { error, paymentMethod } = await stripe.createPaymentMethod({
      //   type: 'card',
      //   card: cardElement,
      //   billing_details: { name, email }
      // });
      
      // if (error) {
      //   throw new Error(error.message || 'Payment failed');
      // }
      
      // Send paymentMethod.id to your server to create a charge
      // const response = await fetch('/api/payments', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ 
      //     payment_method_id: paymentMethod.id,
      //     amount,
      //     category,
      //     email,
      //     name
      //   })
      // });
      
      // const result = await response.json();
      
      // if (!response.ok) {
      //   throw new Error(result.message || 'Payment processing failed');
      // }
      
      // onSuccess();
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
      />
      <TextField
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        fullWidth
        margin="normal"
        required
      />
      <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
        Card Information
      </Typography>
      <CardElementContainer>
        <CardElement options={{
          style: {
            base: {
              fontSize: '16px',
              fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
              '::placeholder': {
                color: '#aab7c4',
              },
            },
            invalid: {
              color: '#9e2146',
            },
          },
        }} />
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
          color="primary"
          disabled={!stripe || processing}
        >
          {processing ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            `Pay $${amount}`
          )}
        </Button>
      </Box>
    </form>
  );
};

// Dummy promise for now, normally would load from env vars
const stripePromise = loadStripe('pk_test_dummy');

// Main payment dialog component that wraps the form in Stripe Elements
const StripePaymentForm = ({
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
}) => {
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
        <Elements stripe={stripePromise}>
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