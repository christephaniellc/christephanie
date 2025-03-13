import { Box, Card, Typography, useTheme, alpha } from '@mui/material';
import { Warning } from '@mui/icons-material';

export const AgeRestrictionCard = () => {
  const theme = useTheme();
  
  return (
    <Card 
      elevation={2}
      sx={{
        background: alpha(theme.palette.background.paper, 0.8),
        backdropFilter: 'blur(10px)',
        borderRadius: 2,
        p: 3,
        textAlign: 'center'
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        gap: 2
      }}>
        <Box sx={{ 
          bgcolor: alpha(theme.palette.info.main, 0.1),
          borderRadius: '50%',
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Warning 
            color="info" 
            sx={{ fontSize: 42 }} 
          />
        </Box>
        <Typography variant="h6" color="primary">
          Age Restricted
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          For privacy reasons, guests under 13 years old cannot receive direct communications from us.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Updates will be sent to your family's primary contact instead.
        </Typography>
      </Box>
    </Card>
  );
};