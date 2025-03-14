import { 
  Box, 
  Card, 
  Typography, 
  Button, 
  CircularProgress, 
  useTheme, 
  alpha,
  Paper
} from '@mui/material';
import { VerifiedUser } from '@mui/icons-material';

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
        transition: 'all 0.3s ease-in-out',
        mb: 1
      }}
    >
      <Paper 
        elevation={0} 
        sx={{ 
          mx: 2,
          my: 1.5,
          bgcolor: alpha(theme.palette.primary.main, 0.08),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
          borderRadius: 2,
          p: 2,
          animation: 'fadeIn 0.4s ease-in-out',
          '@keyframes fadeIn': {
            '0%': {
              opacity: 0,
              transform: 'translateY(-8px)'
            },
            '100%': {
              opacity: 1,
              transform: 'translateY(0)'
            }
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
          <VerifiedUser 
            fontSize="small" 
            sx={{ 
              mr: 1.5, 
              color: theme.palette.primary.main 
            }} 
          />
          <Typography variant="body2" fontWeight={500} color="primary.main">
            Verification needed
          </Typography>
        </Box>
        
        <Typography 
          variant="body2" 
          component="div" 
          sx={{ 
            mb: 2,
            color: 'text.primary',
            fontWeight: 400,
            lineHeight: 1.4
          }}
        >
          To ensure delivery to the correct address, we'll send a verification code to:
          <Box 
            component="span" 
            sx={{ 
              display: 'block', 
              mt: 0.5, 
              fontWeight: 500,
              color: 'primary.main'
            }}
          >
            {contactValue}
          </Box>
        </Typography>
        
        <Button
          size="medium"
          variant="contained"
          color="primary"
          fullWidth
          onClick={onVerify}
          disabled={isSending}
          startIcon={isSending ? <CircularProgress size={16} color="inherit" /> : null}
          sx={{ 
            py: 1,
            borderRadius: 1.5,
            textTransform: 'none',
            fontWeight: 500
          }}
        >
          {isSending ? "Sending code..." : `Send verification code`}
        </Button>
        
        {/* Terms note */}
        <Typography 
          variant="caption" 
          color="text.secondary" 
          sx={{ 
            display: 'block', 
            mt: 2,
            textAlign: 'center'
          }}
        >
          {type === 'email' 
            ? "By verifying, you agree to receive occasional updates about the wedding. You can opt out at any time."
            : "By verifying, you agree to receive occasional texts about the wedding (max 10/month). Msg & data rates may apply. Reply STOP to opt out."}
        </Typography>
      </Paper>
    </Box>
  );
};