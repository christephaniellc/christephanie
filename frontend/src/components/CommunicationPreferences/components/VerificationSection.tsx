import { 
  Box, 
  Card, 
  Typography, 
  Button, 
  CircularProgress, 
  useTheme, 
  alpha 
} from '@mui/material';
import { Warning } from '@mui/icons-material';

interface VerificationSectionProps {
  type: 'email' | 'phone';
  contactValue: string | undefined;
  isSending: boolean;
  onVerify: () => void;
}

export const VerificationSection = ({
  type,
  contactValue,
  isSending,
  onVerify
}: VerificationSectionProps) => {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        width: '100%',
        overflow: 'hidden', 
        transition: 'max-height 0.3s ease-in-out, opacity 0.3s ease-in-out',
        maxHeight: '200px',
        opacity: 1,
        mb: 1
      }}
    >
      <Box 
        sx={{ 
          pl: 8, 
          pr: 2,
          pt: 0.5,
          pb: 1,
          ml: 3,
          mt: -0.5,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            left: -2,
            top: -1,
            width: 16,
            height: 2,
            backgroundColor: alpha(theme.palette.error.main, 0.3)
          }
        }}
      >
        <Card 
          elevation={0} 
          sx={{ 
            bgcolor: alpha(theme.palette.error.main, 0.08),
            border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
            borderRadius: 1.5,
            p: 1,
            animation: 'slideDown 0.3s ease-in-out',
            '@keyframes slideDown': {
              '0%': {
                opacity: 0,
                transform: 'translateY(-10px)'
              },
              '100%': {
                opacity: 1,
                transform: 'translateY(0)'
              }
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Warning fontSize="small" color="error" sx={{ mr: 1 }} />
            <Typography variant="body2" fontWeight={500}>
              Verification required
            </Typography>
          </Box>
          <Typography variant="caption" component="div" sx={{ mb: 1.5 }}>
            We'll send a verification code to {contactValue}
          </Typography>
          <Button
            size="small"
            variant="contained"
            color="primary"
            fullWidth
            onClick={onVerify}
            disabled={isSending}
            startIcon={isSending ? <CircularProgress size={14} color="inherit" /> : null}
          >
            {isSending ? "Sending code..." : `Verify ${type}`}
          </Button>
        </Card>
      </Box>
      {/* Terms note */}
      <Typography variant="caption" color="text.secondary" sx={{ px: 2, mb: 1, pl: 8, display: 'block', mt: 1 }}>
        {type === 'email' 
          ? "By opting in to email, you agree to receive occasional updates about the wedding. You can opt out at any time."
          : "By opting in to texts, you agree to receive occasional SMS updates about the wedding (max 10/month). Message and data rates may apply. Reply STOP to opt out."}
      </Typography>
    </Box>
  );
};