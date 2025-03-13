import React from 'react';
import { Box, Typography, useMediaQuery, Link, Tooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { CalendarMonth, LocationOn } from '@mui/icons-material';
import { 
  WeddingInfoContainer, 
  WeddingInfoLayout,
  MarriageAnnouncementBox, 
  WeddingDetailsBox, 
  DateBox, 
  LocationBox, 
  CountdownBox,
  SideCountdownContainer,
  LocationText, 
  DateText
} from '../styled';
import Countdowns from '@/components/Countdowns';
import { InvitationResponseEnum } from '@/types/api';
import RollingRingsAnimation from './RollingRingsAnimation';
import { BlockTextTypography } from '@/components/AttendanceButton/AttendanceButton';

interface WeddingInfoSectionProps {
  randomGettingMarriedQuote: string;
  user: any; // Replace with proper type if available
}

const WeddingInfoSection: React.FC<WeddingInfoSectionProps> = ({ 
  randomGettingMarriedQuote,
  user 
}) => {
  const theme = useTheme();
  const isMediumScreen = useMediaQuery(theme.breakpoints.up('md'));
  
  // Function to generate an .ics file calendar link
  const generateCalendarLink = () => {
    const eventDetails = {
      title: "Steph & Topher's Wedding",
      description: "Steph and Topher's Wedding Celebration",
      location: "Lovettsville, VA",
      startDate: "2025-07-05T18:00:00", // Assuming 6 PM start
      endDate: "2025-07-05T23:00:00",   // Assuming 11 PM end
    };
    
    // Format for iCalendar
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      `SUMMARY:${eventDetails.title}`,
      `DESCRIPTION:${eventDetails.description}`,
      `LOCATION:${eventDetails.location}`,
      `DTSTART:${eventDetails.startDate.replace(/[-:]/g, "").replace("T", "")}00Z`,
      `DTEND:${eventDetails.endDate.replace(/[-:]/g, "").replace("T", "")}00Z`,
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");
    
    // Create Blob and return data URL
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    return URL.createObjectURL(blob);
  };
  
  return (
    <WeddingInfoContainer>
      <WeddingInfoLayout>
        {/* Marriage announcement with rolling rings animation */}
        <MarriageAnnouncementBox>
          <BlockTextTypography variant="h6"
          color="secondary"
          sx={{
            fontStyle: 'normal'
          }} shadowColor={'#000000'} maxPx={2}>
            {randomGettingMarriedQuote}!
            {/*<RollingRingsAnimation />*/}
          </BlockTextTypography>
          
          {/* Wedding countdown */}
          <Box sx={{ display: 'flex', alignItems: 'center', paddingBottom: '12px' }}>
            <Typography
              variant="subtitle2"
              color="common.white"
              sx={{ 
                fontSize: { xs: '0.8rem', sm: '0.9rem' }, 
                opacity: 0.9,
                backdropFilter: 'blur(3px)',
                backgroundColor: 'rgba(0, 0, 0, 0.25)',
                padding: '4px 8px',
                borderRadius: '4px',
                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)'
              }}
            >
              <Countdowns
                event="Wedding"
                interested={user.rsvp?.invitationResponse || InvitationResponseEnum.Pending}
              />
            </Typography>
          </Box>
        </MarriageAnnouncementBox>

        {/* Wedding details with date and location */}
        <WeddingDetailsBox>
        <Box>
          {/* Date Section */}
          <DateBox>
            <CalendarMonth 
              sx={{ 
                mr: 1,
                color: theme.palette.secondary.main
              }} 
            />
            <Tooltip title="Add to calendar">
              <Link 
                href={generateCalendarLink()} 
                download="StephAndTopher_Wedding.ics"
                sx={{ 
                  textDecoration: 'none',
                  position: 'relative',
                  display: 'inline-block'
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    overflow: 'visible',
                    // Define keyframes for color animation
                    '@keyframes dateColorPulse': {
                      '0%': { color: theme.palette.common.white },
                      '35%': { color: theme.palette.common.white },
                      '50%': { color: theme.palette.primary.light },
                      '65%': { color: theme.palette.common.white },
                      '100%': { color: theme.palette.common.white }
                    },
                    // Define keyframes for sparkle animation
                    '@keyframes sparkle': {
                      '0%': { opacity: 0, transform: 'scale(0) rotate(0deg)' },
                      '50%': { opacity: 1, transform: 'scale(1) rotate(180deg)' },
                      '100%': { opacity: 0, transform: 'scale(0) rotate(360deg)' }
                    }
                  }}
                >
                  {/* Sparkle elements */}
                  {[...Array(6)].map((_, i) => (
                    <Box
                      key={i}
                      sx={{
                        position: 'absolute',
                        width: '5px',
                        height: '5px',
                        borderRadius: '50%',
                        backgroundColor: theme.palette.secondary.main,
                        boxShadow: `0 0 6px 1px ${theme.palette.secondary.main}`,
                        opacity: 0,
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        animation: `sparkle ${1 + Math.random() * 2}s ${Math.random() * 3}s infinite`,
                        zIndex: -50
                      }}
                    />
                  ))}
                  
                  {/* Star sparkles */}
                  {[...Array(3)].map((_, i) => (
                    <Box
                      key={`star-${i}`}
                      sx={{
                        position: 'absolute',
                        width: '10px',
                        height: '10px',
                        opacity: 0,
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        '&:before': {
                          content: '""',
                          position: 'absolute',
                          width: '100%',
                          height: '100%',
                          transform: 'rotate(45deg)',
                          backgroundColor: theme.palette.secondary.light,
                          boxShadow: `0 0 10px 2px ${theme.palette.secondary.light}`
                        },
                        animation: `sparkle ${2 + Math.random() * 3}s ${Math.random() * 5}s infinite`,
                        zIndex: -50
                      }}
                    />
                  ))}
                  
                  <DateText 
                    variant="h4"
                    sx={{              
                      fontWeight: '1000',  
                      textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7), 2px 2px 2px #000000',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      position: 'relative',
                      animation: 'dateColorPulse 4s infinite ease-in-out',
                      '&:hover': {
                        color: theme.palette.primary.light,
                        textShadow: `1px 1px 2px rgba(0, 0, 0, 0.7), 2px 2px 2px #000000, 0 0 8px ${theme.palette.primary.light}`
                      },
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: -2,
                        left: 0,
                        width: 0,
                        height: '2px',
                        backgroundColor: theme.palette.primary.light,
                        transition: 'width 0.3s ease'
                      },
                      '&:hover::after': {
                        width: '100%'
                      }
                    }}
                  >
                    July 5, 2025
                  </DateText>
                </Box>
              </Link>
            </Tooltip>
          </DateBox>
          
          {/* Location Section */}
          <LocationBox>
            <LocationOn 
              sx={{ 
                mr: 1,
                color: theme.palette.secondary.main
              }} 
            />
            <Link 
              href="https://maps.google.com/?q=Lovettsville,VA" 
              target="_blank" 
              rel="noopener noreferrer"
              sx={{ 
                textDecoration: 'none',
                position: 'relative',
                display: 'inline-block'
              }}
            >
              <LocationText
                sx={{ 
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  '&:hover': {
                    color: theme.palette.primary.light
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: -2,
                    left: 0,
                    width: 0,
                    height: '2px',
                    backgroundColor: theme.palette.primary.light,
                    transition: 'width 0.3s ease'
                  },
                  '&:hover::after': {
                    width: '100%'
                  }
                }}
              >
                Lovettsville, VA
              </LocationText>
            </Link>
          </LocationBox>
          </Box>
        </WeddingDetailsBox>
      </WeddingInfoLayout>
    </WeddingInfoContainer>
  );
};

export default WeddingInfoSection;