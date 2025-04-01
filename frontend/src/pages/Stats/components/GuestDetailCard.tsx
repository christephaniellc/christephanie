import { Box, Paper, Typography, Chip, Stack, useTheme, Tooltip, IconButton, Dialog, DialogContent, Button } from '@mui/material';
import { rgba } from 'polished';
import FaceIcon from '@mui/icons-material/Face';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import CampaignIcon from '@mui/icons-material/Campaign';
import AllergyIcon from '@mui/icons-material/HealthAndSafety';
import HotelIcon from '@mui/icons-material/Hotel';
import DevicesIcon from '@mui/icons-material/Devices';
import VerifiedIcon from '@mui/icons-material/Verified';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import EmailIcon from '@mui/icons-material/Email';
import { useState, useEffect, useCallback } from 'react';

import { AgeGroupEnum, ClientInfoDto, GuestViewModel, NotificationPreferenceEnum } from '@/types/api';
import { useAppLayout } from '@/context/Providers/AppState/useAppLayout';
import { getFoodPreferenceDetails, getSleepPreferenceDetails, getRandomNarrative } from './StatsHelpers';

interface GuestDetailCardProps {
  guest: GuestViewModel & { clientInfos?: ClientInfoDto[] };
  flipped: boolean;
  flipAxis: string;
}

const GuestDetailCard = ({ guest, flipped, flipAxis }: GuestDetailCardProps) => {
  const theme = useTheme();
  const { contentHeight } = useAppLayout();
  
  // No need for lifecycle logging in production
   
  // If guest is null or undefined, return null
  if (!guest) return null;
  
  const foodPreference = getFoodPreferenceDetails(guest.preferences?.foodPreference);
  const sleepPreference = getSleepPreferenceDetails(guest.preferences?.sleepPreference);
  
  return (
    <>
      
      <Box
        data-guest-id={guest.guestId}
        sx={{
          height: '300px',
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
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {guest.firstName} {guest.lastName}
                </Typography>
              </Box>
              
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
                <HotelIcon fontSize="small" color="action" />
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
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <CampaignIcon fontSize="small" color="action" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Communication</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                      {guest.preferences.notificationPreference.map((pref: string, index: number) => {
                        const isEmail = pref === NotificationPreferenceEnum.Email;
                        const isText = pref === NotificationPreferenceEnum.Text;
                        const isEmailVerified = isEmail && guest.email?.verified;
                        const isPhoneVerified = isText && guest.phone?.verified;
                        const isVerified = isEmailVerified || isPhoneVerified;
                        
                        return (
                          <Tooltip 
                            key={index}
                            title={isVerified ? `Verified ${pref.toLowerCase()}` : `Unverified ${pref.toLowerCase()}`}
                          >
                            <Chip 
                              size="small" 
                              label={pref} 
                              icon={isVerified ? <VerifiedIcon fontSize="small" /> : undefined}
                              sx={{ 
                                backgroundColor: isVerified ? 'success.light' : 'info.light', 
                                color: isVerified ? 'success.contrastText' : 'info.contrastText',
                                '& .MuiChip-icon': {
                                  color: 'inherit',
                                }
                              }} 
                            />
                          </Tooltip>
                        );
                      })}
                    </Box>
                  </Box>
                </Box>
              )}

              {/* Client Infos */}
              {guest.clientInfos && guest.clientInfos.length > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <DevicesIcon fontSize="small" color="action" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Client Info ({guest.clientInfos.length} session{guest.clientInfos.length > 1 ? 's' : ''})</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
                      {guest.clientInfos.map((clientInfo, index) => (
                        <Box key={index} sx={{ 
                          backgroundColor: `rgba(25, 118, 210, 0.08)`, 
                          borderRadius: 1, 
                          p: 1, 
                          mb: 0.5,
                          fontSize: '0.8rem'
                        }}>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {/* Device Info */}
                            {clientInfo.device && (
                              <Chip
                                size="small"
                                label={`${clientInfo.device.type || 'Unknown device'}${clientInfo.os ? ` (${clientInfo.os})` : ''}`}
                                sx={{ backgroundColor: 'info.light', color: 'info.contrastText' }}
                              />
                            )}
                            
                            {/* Browser Info */}
                            {clientInfo.browser && (
                              <Chip
                                size="small"
                                label={`${clientInfo.browser.name || 'Unknown'} ${clientInfo.browser.version || ''}`}
                                sx={{ backgroundColor: 'secondary.light', color: 'secondary.contrastText' }}
                              />
                            )}
                            
                            {/* Date Info */}
                            {clientInfo.dateRecorded && (
                              <Chip
                                size="small"
                                label={new Date(clientInfo.dateRecorded).toLocaleDateString()}
                                sx={{ backgroundColor: 'success.light', color: 'success.contrastText' }}
                              />
                            )}
                          </Box>
                          
                          {/* Additional Details */}
                          <Box sx={{ mt: 0.5, fontSize: '0.75rem', color: 'text.secondary' }}>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                              {/* IP & Location */}
                              {clientInfo.ipAddress && (
                                <Typography variant="caption">
                                  IP: {clientInfo.ipAddress}
                                </Typography>
                              )}
                              
                              {/* Screen Info */}
                              {clientInfo.screen && clientInfo.screen.width && clientInfo.screen.height && (
                                <Typography variant="caption">
                                  Screen: {clientInfo.screen.width}×{clientInfo.screen.height}
                                </Typography>
                              )}
                              
                              {/* Language & Timezone */}
                              {(clientInfo.language || clientInfo.timeZone) && (
                                <Typography variant="caption">
                                  {clientInfo.language && `Lang: ${clientInfo.language}`}
                                  {clientInfo.language && clientInfo.timeZone && ' | '}
                                  {clientInfo.timeZone && `TZ: ${clientInfo.timeZone}`}
                                </Typography>
                              )}
                            </Box>
                            
                            {/* Geolocation if available */}
                            {clientInfo.geolocation && clientInfo.geolocation.latitude && clientInfo.geolocation.longitude && (
                              <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                                Location: {clientInfo.geolocation.latitude.toFixed(2)}, {clientInfo.geolocation.longitude.toFixed(2)}
                              </Typography>
                            )}
                            
                            {/* Connection Info */}
                            {clientInfo.connection && clientInfo.connection.effectiveType && (
                              <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                                Connection: {clientInfo.connection.effectiveType}
                                {clientInfo.connection.downlink && ` (${clientInfo.connection.downlink} Mbps)`}
                              </Typography>
                            )}
                          </Box>
                        </Box>
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
    </>
  );
};

export default GuestDetailCard;