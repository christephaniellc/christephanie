import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  useTheme,
  alpha,
  CircularProgress
} from '@mui/material';
import { VerifiedUser } from '@mui/icons-material';

interface VerificationDialogProps {
  type: 'email' | 'phone';
  open: boolean;
  onClose: () => void;
  verificationCode: string;
  onCodeChange: (value: string) => void;
  onResend: () => void;
  onSubmit: () => void;
  isSending: boolean;
}

export const VerificationDialog = ({
  type,
  open,
  onClose,
  verificationCode,
  onCodeChange,
  onResend,
  onSubmit,
  isSending
}: VerificationDialogProps) => {
  const theme = useTheme();
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          borderRadius: 2,
          backdropFilter: 'blur(10px)',
          bgcolor: alpha(theme.palette.background.paper, 0.9),
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <VerifiedUser sx={{ mr: 1 }} />
          <Typography variant="h6">
            Verify {type === 'email' ? 'Email' : 'Phone Number'}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" paragraph>
          Enter the verification code sent to your {type === 'email' ? 'email' : 'phone'}:
        </Typography>
        <TextField
          autoFocus
          margin="dense"
          label="Verification Code"
          type="text"
          fullWidth
          variant="outlined"
          value={verificationCode}
          onChange={(e) => onCodeChange(e.target.value)}
        />
        <Button 
          onClick={onResend}
          sx={{ 
            mt: 1,
            fontSize: '0.75rem'
          }}
          color="secondary"
          disabled={isSending}
          startIcon={isSending ? <CircularProgress size={14} color="inherit" /> : null}
        >
          {isSending ? "Sending..." : "Resend verification code"}
        </Button>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={onSubmit} 
          disabled={!verificationCode || verificationCode.length < 4}
          color="secondary"
          variant="contained"
        >
          Verify
        </Button>
      </DialogActions>
    </Dialog>
  );
};