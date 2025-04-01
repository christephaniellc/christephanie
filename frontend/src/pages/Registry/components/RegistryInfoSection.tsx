import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import FavoriteIcon from '@mui/icons-material/Favorite';

const InfoBox = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
  backgroundColor: alpha(theme.palette.background.paper, 0.7),
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
}));

const MessageBanner = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(4),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: theme.spacing(1),
  textAlign: 'center',
  '& svg': {
    color: theme.palette.primary.main,
  }
}));

const RegistryInfoSection: React.FC = () => {
  return (
    <>
      <InfoBox elevation={3}>
        <Typography variant="h6" gutterBottom align="center" sx={{ fontWeight: 'bold' }}>
          Thank you for celebrating with us!
        </Typography>
        <Typography paragraph align="center">
          Your presence at our wedding is the greatest gift of all. However, for friends and family who have been asking for gift suggestions,
          we've created this registry. We've been together for many years and are fortunate to already have many of the items we need for our home.
        </Typography>
        <Typography paragraph align="center">
          If you wish to give a gift, we would be grateful for a contribution to our future together through one of the funds below.
          Alternatively, we've included a link to a traditional registry for those who prefer to give a physical gift.
        </Typography>
      </InfoBox>
      
      <MessageBanner>
        <FavoriteIcon />
        <Typography>
          We're excited to celebrate with you on our special day!
        </Typography>
      </MessageBanner>
    </>
  );
};

export default RegistryInfoSection;