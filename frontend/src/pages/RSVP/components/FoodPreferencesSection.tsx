import React from 'react';
import Box from '@mui/material/Box';
import { alpha, Paper, styled, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useFamily } from '@/store/family';
import { GuestViewModel } from '@/types/api';
import FoodPreferences from '@/components/FoodPreferences/FoodPreferences';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import { StephsActualFavoriteTypographyNoDrop } from '@/components/AttendanceButton/AttendanceButton';

const TitlePaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(3),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  borderRadius: theme.spacing(1),
  textAlign: 'center',
  position: 'relative',
  overflow: 'hidden',
  boxShadow: theme.shadows[5],
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.1) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.1) 75%, transparent 75%, transparent)',
    backgroundSize: '10px 10px',
    zIndex: 1,
  },
}));

export const FoodPreferencesSection: React.FC = () => {
  const [family] = useFamily();
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:375px)'); // iPhone SE size

  if (!family) return null;

  return (
    <><Box
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        mb: 3,
        background: alpha(theme.palette.primary.main, 0.1),
        borderRadius: 1,
        py: 2,
        border: `1px dashed ${alpha(theme.palette.primary.main, 0.5)}`,
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'url("/textures/paper_texture.webp")',
          opacity: 0.1,
          pointerEvents: 'none',
          zIndex: 0,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0) 70%)',
          opacity: 0.2,
          pointerEvents: 'none',
          zIndex: 0,
        }
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 1,
          mb: 1,
        }}
      >
        <RestaurantIcon
          sx={{
            mr: 1.5,
            color: theme.palette.primary.main,
            fontSize: { xs: '1.8rem', sm: '2rem' },
            filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.3))',
          }} />
        <StephsActualFavoriteTypographyNoDrop
          variant="h5"
          //component="h2"
          //textColor={theme.palette.primary.main}
          //shadowSize={1.5}
          fontSize={isMobile ? '1.2rem' : '1.5rem'}
          sx={{
            my: 0,
            textAlign: 'center',
            letterSpacing: '0.05em',
            fontWeight: 500,
          }}
        >
          What&#39;cha eatin&#39;?
        </StephsActualFavoriteTypographyNoDrop>
      </Box>      
    </Box><Box sx={{ width: '100%', maxWidth: 600, mx: 'auto', py: 2 }}>
        {family.guests.map((guest: GuestViewModel) => (
          <Box key={guest.guestId} sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              {guest.firstName}
            </Typography>
            <FoodPreferences guestId={guest.guestId} />
          </Box>
        ))}
      </Box></>
  );
};

export default FoodPreferencesSection;