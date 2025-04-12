import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import React from 'react';
import { Card, CardContent, Paper, Divider } from '@mui/material';
import { useAppLayout } from '@/context/Providers/AppState/useAppLayout';
import { StephsActualFavoriteTypography } from '@/components/AttendanceButton/AttendanceButton';
import { useTheme } from '@mui/material/styles';
import burnNightImage from '@/assets/engagement-photos/burn_night.jpg';

interface AttireProps {
  handleTabLink: (to: string) => void;
}

function Attire({handleTabLink}: AttireProps) {
  const { contentHeight } = useAppLayout();
  const theme = useTheme();
  
  return (
    <Container
      sx={{
        width: '100%',
        height: contentHeight,
        overflow: 'auto',
        borderRadius: 'sm',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        paddingBottom: '80px', // Added padding to ensure content doesn't get hidden behind BottomNav
        backgroundImage: `url(${burnNightImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(2px)',
          zIndex: 0
        },
      }}
    >
      <Box my={2} sx={{ 
        width: '100%',
        px: 2,
        mt: 2,
        pb: 2,
        position: 'relative',
        zIndex: 1,
      }}>
        <StephsActualFavoriteTypography variant="h4" sx={{ 
          textAlign: 'center',
          mt: 2,
          fontSize: { xs: '1.8rem', sm: '2rem', md: '2.2rem' },
        }}>
          Dress Code: Be Yourself
        </StephsActualFavoriteTypography>
        
        {/* Circular logo with animation */}
        <Box
          sx={{
            width: '100%',
            height: '120px',
            overflow: 'hidden',
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            '@keyframes pulse': {
              '0%': { transform: 'scale(1)' },
              '50%': { transform: 'scale(1.1)' },
              '100%': { transform: 'scale(1)' }
            },
            '& img': {
              height: '120px',
              width: '120px',
              animation: 'pulse 3s infinite ease-in-out',
            }
          }}
        >
          <img 
            src="/favicon_big_art_transparent.png" 
            alt="Wedding Logo" 
          />
        </Box>
      </Box>
      
      {/* Main content */}
      <Paper 
        elevation={3}
        sx={{ 
          mx: 2, 
          p: 3, 
          backgroundColor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(10px)',
          flexGrow: 1,
          overflow: 'auto',
          position: 'relative',
          zIndex: 1
        }}
      >
        <Card sx={{ mb: 3, backgroundColor: 'rgba(0,0,0,0.1)' }}>
          <CardContent>
            <Typography variant="h5" color="secondary" gutterBottom>
              Burn-Style Wedding: Express Yourself
            </Typography>
            <Typography variant="body1" paragraph>
              This is a burn-style wedding where self-expression is celebrated! We want you to come dressed in whatever makes you feel most like yourself and most comfortable.
            </Typography>
            <Typography variant="body1" paragraph>
              Love jeans and a t-shirt? Wear them! Prefer a sundress? Perfect! Want to rock a suit? Go for it! Flippy floppies? Absolutely! The only rule is that there are no rules — just be you.
            </Typography>
          </CardContent>
        </Card>
        
        <Divider sx={{ my: 3, backgroundColor: 'rgba(255,255,255,0.2)' }} />
        
        <Card sx={{ mb: 3, backgroundColor: 'rgba(0,0,0,0.1)' }}>
          <CardContent>
            <Typography variant="h5" color="secondary" gutterBottom>
              What Topher & Steph Are Wearing
            </Typography>
            <Typography variant="body1" paragraph>
              We'll start the day in traditional wedding attire for the ceremony and dinner, but we'll be changing into more comfortable clothes for the party afterward.
            </Typography>
            <Typography variant="body1" paragraph>
              Feel free to bring a change of clothes too if you want to switch into something more dance-floor friendly as the night goes on!
            </Typography>
          </CardContent>
        </Card>
        
        <Divider sx={{ my: 3, backgroundColor: 'rgba(255,255,255,0.2)' }} />
        
        <Card sx={{ mb: 3, backgroundColor: 'rgba(0,0,0,0.1)' }}>
          <CardContent>
            <Typography variant="h5" color="secondary" gutterBottom>
              Weather Considerations
            </Typography>
            <Typography variant="body1" paragraph>
              Virginia in July can be quite hot and humid. The ceremony will be outdoors (weather permitting), and while indoor spaces will be air-conditioned, outdoor areas may be warm.
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Temperature:</strong> Expect daytime highs of 85-95°F (29-35°C) and evening temperatures around 70-80°F (21-27°C).
            </Typography>
            <Typography variant="body1">
              <strong>Tips:</strong> 
              <ul>
                <li>Light, breathable fabrics are recommended</li>
                <li>Some outdoor areas may have uneven terrain - consider appropriate footwear</li>
                <li>You might want to bring a hat or sunglasses for outdoor portions</li>
                <li>Sunscreen is always a good idea!</li>
              </ul>
            </Typography>
          </CardContent>
        </Card>
        
        <Divider sx={{ my: 3, backgroundColor: 'rgba(255,255,255,0.2)' }} />
        
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="h6" gutterBottom color="secondary">
            Questions about attire?
          </Typography>
          <Typography variant="body1">
            Email us at: steph-and-topher@wedding.christephanie.com
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}

export default Attire;