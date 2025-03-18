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
import { EmailOutlined } from '@mui/icons-material';

interface EmailDialogProps {
  open: boolean;
  onClose: () => void;
  defaultValue: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
}

export const EmailDialog = ({
  open,
  onClose,
  defaultValue,
  onChange,
  onSubmit,
  isLoading = false
}: EmailDialogProps) => {
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
          <EmailOutlined sx={{ mr: 1 }} />
          <Typography variant="h6">Update Email Address</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        {isLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" py={2}>
            <CircularProgress size={24} color="secondary" />
            <Typography variant="body2" color="textSecondary" sx={{ ml: 2 }}>
              Loading your email address...
            </Typography>
          </Box>
        ) : (
          <TextField
            autoFocus
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={defaultValue || ''}
            onChange={(e) => onChange(e.target.value)}
            helperText="Your email will need to be verified after updating"
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={onSubmit} 
          disabled={(!defaultValue && !isLoading) || isLoading}
          color="secondary"
          variant="contained"
        >
          {isLoading ? 'Loading...' : 'Update'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};