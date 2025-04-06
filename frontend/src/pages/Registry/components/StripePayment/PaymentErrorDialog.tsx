import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Box
} from '@mui/material';
import ErrorOutline from '@mui/icons-material/ErrorOutline';

/**
 * Dialog shown when payment fails
 */
const PaymentErrorDialog = ({
  open,
  onClose,
  errorMessage,
  errorCode = '',
  errorType = ''
}: {
  open: boolean;
  onClose: () => void;
  errorMessage: string;
  errorCode?: string;
  errorType?: string;
}) => {
  // Add console.log to debug dialog open state
  console.log('PaymentErrorDialog render:', { open, errorMessage, errorCode, errorType });
  
  // IMPORTANT: We're removing the conditional rendering that was preventing the dialog
  // from appearing, even when errorMessage is set
  
  // Force the dialog to display if there's an error message, regardless of open state
  const shouldShow = open || (errorMessage && errorMessage.length > 0);
  
  React.useEffect(() => {
    if (errorMessage && errorMessage.length > 0 && !open) {
      console.warn('Error message present but dialog not open! Forcing display...', { errorMessage });
    }
  }, [errorMessage, open]);

  // Format the error message to be more user-friendly
  const getFormattedErrorMessage = () => {
    if (!errorMessage) return 'We were unable to process your payment. Please try again.';
    
    // Common error messages from Stripe that we want to make more user-friendly
    if (errorMessage.includes('card was declined')) {
      return 'Your card was declined. Please try another card or payment method.';
    }
    
    if (errorMessage.includes('expired')) {
      return 'Your card has expired. Please use a different card.';
    }
    
    if (errorMessage.includes('insufficient funds')) {
      return 'Your card has insufficient funds. Please use a different card.';
    }
    
    return errorMessage;
  };
  
  const formattedErrorMessage = getFormattedErrorMessage();
  
  // Get suggested action based on error type
  const getSuggestedAction = () => {
    if (errorType === 'card_error') {
      return 'Please check your card details and try again, or use a different card.';
    }
    
    if (errorType === 'validation_error') {
      return 'Please check your information and try again.';
    }
    
    if (errorType === 'api_error' || errorType === 'rate_limit_error') {
      return 'Please try again in a few minutes.';
    }
    
    return 'If the problem persists, please try a different payment method or contact us.';
  };
  
  return (
    <Dialog
      open={shouldShow} // Use our new condition to determine if dialog should be shown
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      // Prevent closing on backdrop click to ensure user sees error
      disableEscapeKeyDown
      // Make dialog more prominent
      PaperProps={{
        elevation: 24,
        sx: { 
          borderLeft: '4px solid', 
          borderColor: 'error.main', 
          p: 1,
          boxShadow: '0 8px 32px rgba(255, 0, 0, 0.2)'
        }
      }}
    >
      <DialogTitle>Payment Failed</DialogTitle>
      <DialogContent>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          my: 2
        }}>
          <ErrorOutline 
            color="error" 
            sx={{ fontSize: 64, mb: 2 }} 
          />
          <Typography variant="h6" align="center" gutterBottom>
            Payment Unsuccessful
          </Typography>
          
          {/* Error Alert Box */}
          <Box sx={{ 
            width: '100%', 
            p: 2, 
            mb: 2,
            bgcolor: 'error.light',
            color: 'error.contrastText',
            borderRadius: 1
          }}>
            <Typography variant="body1" align="center" paragraph>
              {formattedErrorMessage}
            </Typography>
          </Box>
          
          <Typography variant="body2" align="center" color="text.secondary">
            {getSuggestedAction()}
          </Typography>
          
          {/* Show error details for debugging if available */}
          {(errorCode || errorType) && (
            <Box sx={{ mt: 3, width: '100%', fontSize: '0.75rem', color: 'text.secondary' }}>
              <Typography variant="caption" display="block" align="center">
                Error details (for support): 
                {errorCode && ` Code: ${errorCode}`}
                {errorType && ` Type: ${errorType}`}
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button onClick={onClose} variant="contained" color="secondary">
          Try Again
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentErrorDialog;