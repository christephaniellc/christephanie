import { Box, Typography, useTheme, alpha } from '@mui/material';
import { ConstructionOutlined } from '@mui/icons-material';

interface ComingSoonBannerProps {
  feature: string;
}

export const ComingSoonBanner = ({ feature }: ComingSoonBannerProps) => {
  const theme = useTheme();
  
  return (
    <Box sx={{ p: 2, bgcolor: alpha(theme.palette.info.main, 0.08) }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <ConstructionOutlined color="info" sx={{ mr: 1, fontSize: '1.1rem' }} />
          <Typography variant="subtitle2" color="info.main" fontWeight="bold">
            {feature} Coming Soon
          </Typography>
        </Box>
        <Typography variant="caption">
          We're still working on our {feature.toLowerCase()} verification system. You'll be able to verify your {feature === 'SMS' ? 'phone number' : 'email'} in a future update.
        </Typography>
      </Box>
    </Box>
  );
};