import { Box, Paper, Typography, Chip, Stack, useTheme } from '@mui/material';
import { rgba } from 'polished';
import FaceIcon from '@mui/icons-material/Face';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import CampaignIcon from '@mui/icons-material/Campaign';
import AllergyIcon from '@mui/icons-material/HealthAndSafety';
import CampingIcon from '@mui/icons-material/Campaign';

import { AgeGroupEnum } from '@/types/api';
import { useAppLayout } from '@/context/Providers/AppState/useAppLayout';
import { getFoodPreferenceDetails, getSleepPreferenceDetails, getRandomNarrative } from './AdminHelpers';

interface GuestDetailCardProps {
  guest: any;
  flipped: boolean;
  flipAxis: string;
}

const GuestDetailCard = ({ guest, flipped, flipAxis }: GuestDetailCardProps) => {
  const theme = useTheme();
  const { contentHeight } = useAppLayout();
  
  const foodPreference = getFoodPreferenceDetails(guest.preferences?.foodPreference);
  const sleepPreference = getSleepPreferenceDetails(guest.preferences?.sleepPreference);
  
  return (
    <Box
      sx={{
        height: contentHeight,
        overflow: 'hidden',
        position: 'relative',
        width: '100%',
        perspective: '1000px',
        transformStyle: 'preserve-3d',
      }}
    >
      <Paper
        sx={{
          p: 2,
          width: '100%',
          backgroundColor: theme.palette.mode === 'dark' 
            ? rgba(theme.palette.background.paper, 0.9) 
            : rgba(theme.palette.background.paper, 0.95),
          backdropFilter: 'blur(20px)',
          borderRadius: 1,
          position: 'relative',
          transition: 'transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          transform: flipped ? `rotate${flipAxis}(180deg)` : 'none',
          transformStyle: 'preserve-3d',
          boxShadow: theme.shadows[5],
          color: theme.palette.text.primary,
        }}
      >
        {/* Front side */}
        <Box
          sx={{
            display: flipped ? 'none' : 'block',
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            top: 0,
            left: 0,
            p: 2,
          }}
        >
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              {guest.firstName} {guest.lastName}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <FaceIcon fontSize="small" color="action" />
              <Typography variant="body2">
                {AgeGroupEnum[guest.ageGroup]}
              </Typography>
            </Box>
          </Box>
          
          <Stack spacing={1.5}>
            {/* Food Preferences */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <RestaurantIcon fontSize="small" color="action" />
              <Box>
                <Typography variant="caption" color="text.secondary">Food Preference</Typography>
                <Chip 
                  size="small" 
                  label={foodPreference.label} 
                  sx={{ 
                    ml: 1,
                    backgroundColor: `${foodPreference.color}20`,
                    color: foodPreference.color,
                  }} 
                />
              </Box>
            </Box>
            
            {/* Allergies */}
            {guest.preferences?.foodAllergies && guest.preferences.foodAllergies.length > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <AllergyIcon fontSize="small" color="action" />
                <Box>
                  <Typography variant="caption" color="text.secondary">Allergies</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                    {guest.preferences.foodAllergies.map((allergy: string, index: number) => (
                      <Chip 
                        key={index}
                        size="small" 
                        label={allergy} 
                        sx={{ backgroundColor: 'error.light', color: 'error.contrastText' }} 
                      />
                    ))}
                  </Box>
                </Box>
              </Box>
            )}
            
            {/* Sleep Preference */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CampingIcon fontSize="small" color="action" />
              <Box>
                <Typography variant="caption" color="text.secondary">Accommodation</Typography>
                <Chip 
                  size="small" 
                  label={sleepPreference.label} 
                  sx={{ 
                    ml: 1,
                    backgroundColor: `${sleepPreference.color}20`,
                    color: sleepPreference.color,
                  }} 
                />
              </Box>
            </Box>
            
            {/* Communication Preference */}
            {guest.preferences?.notificationPreference && guest.preferences.notificationPreference.length > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CampaignIcon fontSize="small" color="action" />
                <Box>
                  <Typography variant="caption" color="text.secondary">Communication</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                    {guest.preferences.notificationPreference.map((pref: string, index: number) => (
                      <Chip 
                        key={index}
                        size="small" 
                        label={pref} 
                        sx={{ backgroundColor: 'info.light', color: 'info.contrastText' }} 
                      />
                    ))}
                  </Box>
                </Box>
              </Box>
            )}
          </Stack>
        </Box>
        
        {/* Back side - Burning Man style narrative */}
        <Box
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            top: 0,
            left: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 3,
            backgroundImage: `linear-gradient(135deg, ${rgba('#FF9800', 0.9)}, ${rgba('#9C27B0', 0.9)})`,
            backdropFilter: 'blur(8px)',
            color: 'white',
            borderRadius: 1,
            boxShadow: 'inset 0 0 15px rgba(255,255,255,0.3)',
          }}
        >
          <Typography 
            variant="h6" 
            fontFamily="Snowstorm, sans-serif"
            sx={{ 
              textAlign: 'center',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              fontWeight: 'bold',
              letterSpacing: '0.03em'
            }}
          >
            {getRandomNarrative(guest)}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default GuestDetailCard;