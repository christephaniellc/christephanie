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
  errorMessage
}: {
  open: boolean;
  onClose: () => void;
  errorMessage: string;
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
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
            Something went wrong
          </Typography>
          <Typography variant="body1" align="center" paragraph>
            {errorMessage || 'We were unable to process your payment. Please try again.'}
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary">
            If the problem persists, please try a different payment method or contact us.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" color="primary">
          Try Again
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentErrorDialog;