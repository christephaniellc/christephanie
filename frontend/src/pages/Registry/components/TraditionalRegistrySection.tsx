import React from 'react';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Box,
  Button,
  Link
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

// Types
interface TraditionalRegistryProps {
  title: string;
  description: string;
  url: string;
  icon: React.ComponentType;
}

// Styled components
const RegistryCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.2)}`,
  },
  background: theme.palette.mode === 'dark' 
    ? `linear-gradient(145deg, ${alpha('#191919', 0.9)}, ${alpha('#111', 0.9)})` 
    : `linear-gradient(145deg, ${alpha('#fff', 0.9)}, ${alpha('#f5f5f5', 0.9)})`,
  backdropFilter: 'blur(10px)',
  borderRadius: theme.shape.borderRadius * 2,
  overflow: 'hidden',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
}));

const CardContentStyled = styled(CardContent)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  marginBottom: theme.spacing(1.5),
  '& > svg': {
    fontSize: '3rem',
    color: theme.palette.primary.main,
  },
}));

const CardDescription = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  textAlign: 'center',
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  fontFamily: 'Snowstorm, sans-serif',
  fontSize: '1.8rem',
  color: theme.palette.mode === 'dark' ? theme.palette.primary.main : theme.palette.primary.dark,
  textAlign: 'center',
  marginTop: theme.spacing(4),
}));

const TraditionalRegistrySection: React.FC<TraditionalRegistryProps> = ({
  title,
  description,
  url,
  icon: IconComponent
}) => {
  return (
    <>
      <SectionTitle variant="h2">Traditional Registry</SectionTitle>
      
      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} sm={6} md={4}>
          <RegistryCard elevation={4}>
            <CardContentStyled>
              <IconWrapper>
                <IconComponent />
              </IconWrapper>
              <Typography variant="h5" component="h3" align="center" gutterBottom>
                {title}
              </Typography>
              <CardDescription variant="body2" color="textSecondary">
                {description}
              </CardDescription>
            </CardContentStyled>
            <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
              <Button 
                variant="outlined" 
                color="primary"
                endIcon={<OpenInNewIcon />}
                component={Link}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Registry
              </Button>
            </CardActions>
          </RegistryCard>
        </Grid>
      </Grid>
    </>
  );
};

export default TraditionalRegistrySection;