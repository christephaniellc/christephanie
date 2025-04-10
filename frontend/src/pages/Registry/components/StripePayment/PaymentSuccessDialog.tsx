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
  category,
  paymentIntentId = '',
  email = '',
  notes = '',
  timestamp = new Date().toISOString()
}: {
  open: boolean;
  onClose: () => void;
  amount: number;
  category: string;
  paymentIntentId?: string;
  email?: string;
  notes?: string;
  timestamp?: string;
}) => {
  // Add console.log to debug dialog open state
  console.log('PaymentSuccessDialog render:', { open, amount, category, paymentIntentId, email, notes });
  
  // Only render if actually open to prevent flash of success dialog
  if (!open) return null;
  
  // Format timestamp for display
  const formattedDate = new Date(timestamp).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
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
            Your contribution of ${amount} to our {category.toLowerCase()} fund has been received.
          </Typography>
          
          {/* Transaction Details */}
          <Box sx={{ 
            width: '100%', 
            mt: 2, 
            p: 2, 
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1
          }}>
            <Typography variant="subtitle2" gutterBottom>Transaction Details:</Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">Transaction ID:</Typography>
              <Typography variant="body2" fontWeight="medium">
                {paymentIntentId ? paymentIntentId.slice(-8) : 'Processing'}
              </Typography>
            </Box>
            
            {email && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Email receipt:</Typography>
                <Typography variant="body2" fontWeight="medium">{email}</Typography>
              </Box>
            )}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">Date:</Typography>
              <Typography variant="body2" fontWeight="medium">{formattedDate}</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">Amount:</Typography>
              <Typography variant="body2" fontWeight="medium">${amount}</Typography>
            </Box>
            
            {notes && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Notes:</Typography>
                <Typography variant="body2" fontWeight="medium" sx={{ maxWidth: '60%', textAlign: 'right' }}>{notes}</Typography>
              </Box>
            )}
          </Box>
          
          <Typography variant="body2" align="center" color="text.secondary" sx={{ mt: 2 }}>
            {email ? `A confirmation email will be sent to ${email}.` : 'Your contribution has been received and recorded.'}
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