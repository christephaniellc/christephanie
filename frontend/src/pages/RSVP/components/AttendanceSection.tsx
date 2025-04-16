import React from 'react';
import Box from '@mui/material/Box';
import { Typography, useTheme } from '@mui/material';
import { useFamily } from '@/store/family';
import { GuestViewModel } from '@/types/api';
import WeddingAttendanceSlider from '@/components/WeddingAttendanceSlider';
import AttendanceButton from '@/components/AttendanceButton';
import { isFeatureEnabled } from '@/config/feature-flags';

export const AttendanceSection: React.FC = () => {
  const [family] = useFamily();
  const theme = useTheme();

  if (!family) return null;

  if (isFeatureEnabled('ENABLE_RSVP_PHASE')) {
    return (
      <Box sx={{ mb: 4, width: '100%' }}>
        <Box
          sx={{
            width: '100%',
            maxWidth: 600,
            mx: 'auto',
            p: 3,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 3,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Typography variant="h6" align="center" gutterBottom>
            Wedding Attendance
          </Typography>

          {/* Background with color splits */}
          <Box
            sx={{
              position: 'absolute',
              height: '100%',
              width: '100%',
              top: 0,
              left: 0,
              zIndex: 0,
              display: 'flex',
            }}
          >
            {/* Add keyframes for glowing effect */}
            <style>{`
              @keyframes glowPulse {
                0% {
                  box-shadow: 0 0 5px #FFD700, 0 0 10px #FFD700, 0 0 15px #FFD700;
                  background-color: #FFD700;
                }
                50% {
                  box-shadow: 0 0 10px #FFD700, 0 0 20px #FFD700, 0 0 30px #FFD700;
                  background-color: #FFC500;
                }
                100% {
                  box-shadow: 0 0 5px #FFD700, 0 0 10px #FFD700, 0 0 15px #FFD700;
                  background-color: #FFD700;
                }
              }
            `}</style>
            <Box sx={{ flex: 1, bgcolor: 'rgba(161, 168, 194, 0.8)' }} /> {/* Pending */}
            <Box sx={{ flex: 1, bgcolor: theme.palette.error.main }} /> {/* Declined */}
            <Box sx={{ flex: 1, bgcolor: theme.palette.secondary.main }} /> {/* Interested */}
            <Box sx={{ 
              flex: 1, 
              bgcolor: '#FFD700',
              animation: 'glowPulse 2s infinite',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'radial-gradient(circle, rgba(255,215,0,0.8) 0%, rgba(255,215,0,0.6) 50%, rgba(255,215,0,0.4) 100%)',
                pointerEvents: 'none',
              }
            }} /> {/* Attending - with glow effect */}
          </Box>

          {/* Status labels */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              px: 2,
              mb: 2,
              position: 'relative',
              zIndex: 1,
            }}
          >
            <Typography
              variant="caption"
              color="white"
              sx={{ textShadow: '0px 1px 2px rgba(0,0,0,0.5)' }}
            >
              Pending
            </Typography>
            <Typography
              variant="caption"
              color="white"
              sx={{ textShadow: '0px 1px 2px rgba(0,0,0,0.5)' }}
            >
              Declined
            </Typography>
            <Typography
              variant="caption"
              color="white"
              sx={{ textShadow: '0px 1px 2px rgba(0,0,0,0.5)' }}
            >
              Interested
            </Typography>
            <Typography
              variant="caption"
              color="white"
              sx={{ textShadow: '0px 1px 2px rgba(0,0,0,0.5)' }}
            >
              Attending
            </Typography>
          </Box>

          {/* Guest sliders */}
          <Box sx={{ position: 'relative', zIndex: 1, py: 2 }}>
            {family.guests && family.guests.length > 0 ? (
              family.guests.map((guest: GuestViewModel) => (
                <Box key={guest.guestId} sx={{ mb: 3, width: '100%' }}>
                  <WeddingAttendanceSlider guestId={guest.guestId} />
                </Box>
              ))
            ) : (
              <WeddingAttendanceSlider guestId={'0'} />
            )}
          </Box>
        </Box>
      </Box>
    );
  } else {
    return (
      <>
        {family?.guests.map((guest: GuestViewModel) => (
          <AttendanceButton guestId={guest.guestId} key={guest.guestId} />
        ))}
      </>
    );
  }
};

export default AttendanceSection;