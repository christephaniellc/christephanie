import { 
  Box, 
  Card, 
  Typography, 
  useTheme, 
  alpha, 
  FormGroup, 
  FormControlLabel, 
  Switch,
  Paper,
  Divider 
} from '@mui/material';
import { BugReport, ScienceOutlined } from '@mui/icons-material';

interface BetaTesterCardProps {
  isOptedIn: boolean;
  onChange: (value: boolean) => void;
}

export const BetaTesterCard = ({ isOptedIn, onChange }: BetaTesterCardProps) => {
  const theme = useTheme();
  
  return (
    <Card 
      elevation={3}
      sx={{
        background: alpha(theme.palette.background.paper, 0.9),
        backdropFilter: 'blur(10px)',
        borderRadius: 2,
        mt: 3,
        overflow: 'hidden',
        border: `1px solid ${alpha(theme.palette.secondary.main, 0.3)}`
      }}
    >
      <Box 
        sx={{ 
          bgcolor: alpha(theme.palette.secondary.main, 0.08),
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        <ScienceOutlined sx={{ color: 'secondary.main' }} />
        <Typography variant="h6" sx={{ fontWeight: 600, color: 'secondary.main' }}>
          Beta Tester Program
        </Typography>
      </Box>
      
      <Divider />
      
      <Box sx={{ p: 2.5 }}>
        <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.6 }}>
          You've been selected to participate in our beta testing program! Help us improve 
          our website by enabling screen recording, which allows us to understand how 
          guests use our site.
        </Typography>
        
        <Paper 
          elevation={0} 
          sx={{ 
            bgcolor: alpha(theme.palette.background.default, 0.5),
            p: 2,
            borderRadius: 2,
            mb: 2
          }}
        >
          <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 500 }}>
            What you should know:
          </Typography>
          
          <Box component="ul" sx={{ m: 0, pl: 2 }}>
            <Typography component="li" variant="body2" sx={{ mb: 0.75, fontSize: '0.9rem' }}>
              We use Lucky Orange for anonymous session recording
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 0.75, fontSize: '0.9rem' }}>
              Only our wedding website is recorded (no other tabs or browser data)
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 0.75, fontSize: '0.9rem' }}>
              Data helps us optimize for your device and improve user experience
            </Typography>
            <Typography component="li" variant="body2" sx={{ fontSize: '0.9rem' }}>
              You'll get early access to new features before they're officially released
            </Typography>
          </Box>
        </Paper>
        
        <FormGroup>
          <FormControlLabel
            sx={{ 
              bgcolor: isOptedIn ? alpha(theme.palette.secondary.main, 0.08) : 'transparent',
              borderRadius: 2,
              py: 1,
              px: 1.5,
              mx: -1.5,
              transition: 'background-color 0.2s ease',
              border: isOptedIn 
                ? `1px solid ${alpha(theme.palette.secondary.main, 0.2)}` 
                : `1px solid transparent`
            }}
            control={
              <Switch 
                checked={isOptedIn}
                onChange={(e) => onChange(e.target.checked)}
                color="secondary"
                sx={{ mr: 1 }}
              />
            }
            label={
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant="body1" fontWeight={500}>
                  Enable beta testing
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {isOptedIn 
                    ? "Thanks for helping us improve! We owe you a cookie." 
                    : "You can opt out anytime"}
                </Typography>
              </Box>
            }
          />
        </FormGroup>
        
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          bgcolor: alpha(theme.palette.info.main, 0.08),
          borderRadius: 2,
          p: 1.5,
          mt: 2,
          border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
        }}>
          <BugReport fontSize="small" color="info" sx={{ mr: 1.5 }} />
          <Typography variant="body2" color="text.secondary">
            Beta features may contain bugs or incomplete functionality.
          </Typography>
        </Box>
      </Box>
    </Card>
  );
};