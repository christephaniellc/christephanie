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
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';

/**
 * Dialog shown when payment succeeds
 */
const PaymentSuccessDialog = ({
  open,
  onClose,
  amount,
  category
}: {
  open: boolean;
  onClose: () => void;
  amount: number;
  category: string;
}) => {
  // Add console.log to debug dialog open state
  console.log('PaymentSuccessDialog render:', { open, amount, category });
  
  // Only render if actually open to prevent flash of success dialog
  if (!open) return null;
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Thank You!</DialogTitle>
      <DialogContent>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          my: 2
        }}>
          <CheckCircleOutline 
            color="success" 
            sx={{ fontSize: 64, mb: 2 }} 
          />
          <Typography variant="h6" align="center" gutterBottom>
            Payment Successful
          </Typography>
          <Typography variant="body1" align="center" paragraph>
            Your contribution of ${amount} to our {category.toLowerCase()} has been received.
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary">
            You will receive a confirmation email shortly with the details of your gift.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" color="secondary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentSuccessDialog;