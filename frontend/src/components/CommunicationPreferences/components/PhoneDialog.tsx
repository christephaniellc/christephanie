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
  alpha 
} from '@mui/material';
import { PhoneAndroid } from '@mui/icons-material';

interface PhoneDialogProps {
  open: boolean;
  onClose: () => void;
  defaultValue: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isSmsVerificationEnabled: boolean;
}

export const PhoneDialog = ({
  open,
  onClose,
  defaultValue,
  onChange,
  onSubmit,
  isSmsVerificationEnabled
}: PhoneDialogProps) => {
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
          <PhoneAndroid sx={{ mr: 1 }} />
          <Typography variant="h6">Update Phone Number</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Phone Number"
          type="tel"
          fullWidth
          variant="outlined"
          defaultValue={defaultValue} 
          onChange={(e) => onChange(e.target.value)}
          helperText={!isSmsVerificationEnabled ? 
            "SMS verification coming soon! You'll be able to verify your phone in a future update." : 
            "Your phone number will need to be verified after updating"}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={onSubmit} 
          disabled={!defaultValue}
          color="secondary"
          variant="contained"
        >
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );
};