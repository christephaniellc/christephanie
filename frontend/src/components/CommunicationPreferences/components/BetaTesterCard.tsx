import { 
  Box, 
  Card, 
  Typography, 
  useTheme, 
  alpha, 
  FormGroup, 
  FormControlLabel, 
  Switch 
} from '@mui/material';
import { Code, BugReport } from '@mui/icons-material';

interface BetaTesterCardProps {
  isOptedIn: boolean;
  onChange: (value: boolean) => void;
}

export const BetaTesterCard = ({ isOptedIn, onChange }: BetaTesterCardProps) => {
  const theme = useTheme();
  
  return (
    <Card 
      elevation={2}
      sx={{
        background: alpha(theme.palette.background.paper, 0.8),
        backdropFilter: 'blur(10px)',
        borderRadius: 2,
        mt: 2,
        overflow: 'visible'
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500, display: 'flex', alignItems: 'center' }}>
          <Code sx={{ fontSize: 20, mr: 1 }} color="secondary" />
          Beta Test Opt-In
        </Typography>
        <Typography variant="caption" color="text.secondary" paragraph>
          You have been selected to help us beta test!  <br/><br/> 
          Should you opt-in, you shall consent to use a screen recording system (Lucky Orange) 
          while using our website. <br/> 
          Lucky Orange only records the page within your current browser window, and no other tabs and/or browser configuration. <br/> 
          We will only see our website and how it's being used for our own analysis.
          This will help us optimize for your screen size, usage, and other tiny things. <br/>
          If you say yes we will owe you a cookie!
        </Typography>
        
        <FormGroup>
          <FormControlLabel
            control={
              <Switch 
                checked={isOptedIn}
                onChange={(e) => onChange(e.target.checked)}
                color="secondary"
              />
            }
            label={
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant="body2">Opt-in to screen recording</Typography>
                <Typography variant="caption" color="text.secondary">
                  Try new features before they're officially released
                </Typography>
              </Box>
            }
          />
        </FormGroup>
        
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          bgcolor: alpha(theme.palette.info.main, 0.1),
          borderRadius: 1,
          p: 1,
          mt: 2
        }}>
          <BugReport fontSize="small" color="info" sx={{ mr: 1 }} />
          <Typography variant="caption" color="text.secondary">
            Beta features may contain bugs or incomplete functionality.
          </Typography>
        </Box>
      </Box>
    </Card>
  );
};