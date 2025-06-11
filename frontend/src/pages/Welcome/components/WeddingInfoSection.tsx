import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  useMediaQuery, 
  Link, 
  Tooltip, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  alpha
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { CalendarMonth, LocationOn, Google, Apple, Event, CardGiftcard, EventNote } from '@mui/icons-material';
import isMobile from 'is-mobile';
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
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  
  // State for calendar dialog
  const [calendarDialogOpen, setCalendarDialogOpen] = useState(false);
  
  // Handler for navigation
  const handleTabLink = (to: string) => {
    navigate(to);
  };
  
  // Function to generate a properly formatted .ics file calendar link
  const generateCalendarLink = () => {
    const eventDetails = {
      title: "Steph & Topher's Wedding",
      description: "Steph and Topher's Wedding Celebration",
      location: "Lovettsville, VA",
      // Use UTC format with explicit timezone designator
      startDate: "2025-07-05T18:00:00Z", // Assuming 6 PM UTC start
      endDate: "2025-07-05T23:00:00Z",   // Assuming 11 PM UTC end
    };
    
    // Format dates for iCalendar standard - should be in UTC format without separators
    // YYYYMMDDTHHMMSSZ format for iCalendar
    const formatDate = (dateString: string) => {
      // Remove separators and ensure Z at the end
      return dateString.replace(/[-:]/g, "").replace("T", "T").replace("Z", "Z");
    };
    
    // Format for iCalendar
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Christephanie//Wedding Calendar//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `SUMMARY:${eventDetails.title}`,
      `DESCRIPTION:${eventDetails.description}`,
      `LOCATION:${eventDetails.location}`,
      // Add proper date formatting with UTC indicator
      `DTSTART:${formatDate(eventDetails.startDate)}`,
      `DTEND:${formatDate(eventDetails.endDate)}`,
      // Add UID for uniqueness
      `UID:${Math.random().toString(36).substring(2)}@christephanie.com`,
      // Add timestamp
      `DTSTAMP:${formatDate(new Date().toISOString())}`,
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");
    
    // Create Blob and return data URL
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    return URL.createObjectURL(blob);
  };
  
  // Function to handle calendar button click
  const handleCalendarClick = (event: React.MouseEvent) => {
    event.preventDefault(); // Prevent default link behavior
    setCalendarDialogOpen(true);
  };
  
  return (
    <WeddingInfoContainer>
      <WeddingInfoLayout>
        {/* Left Side: Marriage announcement, date, and location */}
        <Box sx={{ 
          width: { xs: '100%', md: 'auto' }, 
          flexGrow: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          {/* Marriage announcement with rolling rings animation */}
          <MarriageAnnouncementBox>
            <BlockTextTypography variant="h6"
            color="secondary"
            sx={{
              fontStyle: 'normal',
              lineHeight: '1.4rem',
            }} shadowcolor={'#000000'} maxpx={2}>
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
            <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* Date Section */}
              <DateBox
              sx={{
                display: 'flex',
                justifyContent: 'center', // Ensure content is centered
                width: '100%',
                maxWidth: '100%'
              }}>
                <CalendarMonth 
                  sx={{ 
                    mr: 1,
                    color: theme.palette.secondary.main
                  }} 
                />
                <Tooltip title="Click to add to calendar">
                  <Link 
                    href="#"
                    onClick={handleCalendarClick}
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
                        // Add padding to create larger container area for sparkles
                        padding: '20px',
                        margin: '-20px', // Negative margin to keep the date in the same position
                        // We now define the animation in the DateText component
                        // Define keyframes for sparkle animation
                        '@keyframes sparkle': {
                          '0%': { opacity: 0, transform: 'scale(0) rotate(0deg)' },
                          '50%': { opacity: 1, transform: 'scale(1) rotate(180deg)' },
                          '100%': { opacity: 0, transform: 'scale(0) rotate(360deg)' }
                        }
                      }}
                    >
                      {/* Sparkle elements - increased from 6 to 10 */}
                      {[...Array(10)].map((_, i) => (
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
                            // Better distribution around the container with extended area
                            top: `${10 + Math.random() * 80}%`, // Slightly more concentrated around the text
                            left: `${10 + Math.random() * 80}%`, 
                            animation: `sparkle ${1 + Math.random() * 2}s ${Math.random() * 3}s infinite`,
                            zIndex: -50
                          }}
                        />
                      ))}
                      
                      {/* Star sparkles - increased from 3 to 6 */}
                      {[...Array(6)].map((_, i) => (
                        <Box
                          key={`star-${i}`}
                          sx={{
                            position: 'absolute',
                            width: '10px',
                            height: '10px',
                            opacity: 0,
                            // Better distribution with extended area
                            top: `${10 + Math.random() * 80}%`,
                            left: `${10 + Math.random() * 80}%`,
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
                          fontWeight: 'bold',  
                          transition: 'all 0.3s ease',
                          cursor: 'pointer',
                          position: 'relative',
                          zIndex: 1, // Ensure text stays in front of sparkles
                          width: '100%',
                          textAlign: 'center', // Explicitly center the text
                          // Enhanced for better visibility
                          backgroundColor: 'rgba(0,0,0,0.25)',
                          backdropFilter: 'blur(2px)',
                          borderRadius: '6px',
                          padding: '2px 8px',
                          boxShadow: '0 0 8px rgba(0,0,0,0.4)',
                          // Define bounce animation keyframes
                          '@keyframes dateBounce': {
                            '0%': { transform: 'translateY(0)' },
                            '50%': { transform: 'translateY(-4px)' },
                            '100%': { transform: 'translateY(0)' }
                          },
                          // Apply bounce animation instead of color animation
                          animation: 'dateBounce 2s infinite ease-in-out',
                          '&:hover': {
                            color: theme.palette.primary.light,
                            backgroundColor: 'rgba(0,0,0,0.35)',
                            boxShadow: `0 0 12px ${theme.palette.primary.light}`
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
                        July 5, 2025 at 6:00pm
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
                {/* Use Google Maps as the default for all platforms */}
                <Link 
                  // Show specific venue if user is logged in, otherwise general location
                  href={user?.auth0Id 
                    ? (
                      // For mobile, try native apps with fallback to Google Maps website
                      // On desktop, always use Google Maps website
                      isMobile ? (
                        navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad')
                          ? "maps://maps.google.com/?q=Stone+Manor+Inn+Lovettsville+VA"
                          : navigator.userAgent.includes('Android')
                            ? "https://www.google.com/maps/search/?api=1&query=Stone+Manor+Inn+Lovettsville+VA"
                            : "https://www.google.com/maps/search/?api=1&query=Stone+Manor+Inn+Lovettsville+VA"
                      ) : "https://www.google.com/maps/search/?api=1&query=Stone+Manor+Inn+Lovettsville+VA"
                    )
                    : (
                      // Same structure for non-logged in users
                      isMobile ? (
                        navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad')
                          ? "maps://maps.google.com/?q=Lovettsville+VA"
                          : navigator.userAgent.includes('Android')
                            ? "https://www.google.com/maps/search/?api=1&query=Lovettsville+VA"
                            : "https://www.google.com/maps/search/?api=1&query=Lovettsville+VA"
                      ) : "https://www.google.com/maps/search/?api=1&query=Lovettsville+VA"
                    )
                  }
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
                    {user?.auth0Id ? "Stone Manor, Lovettsville, VA" : "Lovettsville, VA"}
                  </LocationText>
                </Link>
              </LocationBox>
            </Box>
          </WeddingDetailsBox>
        </Box>

        {/* Right Side: Wedding Info Links - Only show on medium screens and up */}
        <Box 
          sx={{ 
            display: { xs: 'none', md: 'block' },
            width: { md: '250px' },
            alignSelf: 'center',
            ml: { md: 2, lg: 3 }
          }}
        >
          <Paper
            elevation={3}
            sx={{
              backgroundColor: alpha(theme.palette.background.paper, 0.2),
              backdropFilter: 'blur(10px)',
              padding: theme.spacing(2),
              borderRadius: theme.shape.borderRadius,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 1.5,
                fontWeight: 'bold',
                color: theme.palette.secondary.main,
                fontSize: '1rem'
              }}
            >
              More Wedding Information
            </Typography>
            
            <Box sx={{ 
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5
            }}>
              <Button 
                variant="contained" 
                color="secondary"
                size="small"
                startIcon={<EventNote />}
                onClick={() => handleTabLink('/details')}
                sx={{
                  py: 1,
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  boxShadow: `0 4px 8px ${alpha(theme.palette.secondary.main, 0.4)}`,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 6px 12px ${alpha(theme.palette.secondary.main, 0.5)}`,
                  },
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
              >
                Wedding Details
              </Button>
              
              <Button 
                variant="contained" 
                color="secondary"
                size="small"
                startIcon={<CardGiftcard />}
                onClick={() => handleTabLink('/registry')}
                sx={{
                  py: 1,
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  boxShadow: `0 4px 8px ${alpha(theme.palette.secondary.main, 0.4)}`,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 6px 12px ${alpha(theme.palette.secondary.main, 0.5)}`,
                  },
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
              >
                Registry
              </Button>
            </Box>
          </Paper>
        </Box>
      </WeddingInfoLayout>
      
      {/* Calendar Dialog */}
      <Dialog
        open={calendarDialogOpen}
        onClose={() => setCalendarDialogOpen(false)}
        aria-labelledby="calendar-dialog-title"
        PaperProps={{
          sx: {
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            p: 1,
          }
        }}
      >
        <DialogTitle id="calendar-dialog-title" sx={{ textAlign: 'center' }}>
          Add to Calendar
        </DialogTitle>
        <DialogContent>
          <List>
            {/* Google Calendar Option */}
            <ListItem 
              button 
              component="a" 
              href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=Steph+%26+Topher%27s+Wedding&dates=20250705T180000Z/20250705T230000Z&details=Steph+and+Topher%27s+Wedding+Celebration&location=Lovettsville,+VA`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ListItemIcon>
                <Google />
              </ListItemIcon>
              <ListItemText primary="Google Calendar" />
            </ListItem>
            
            {/* Apple Calendar Option (iCal) */}
            <ListItem 
              button 
              component="a" 
              href={generateCalendarLink()}
              download="StephAndTopher_Wedding.ics"
            >
              <ListItemIcon>
                <Apple />
              </ListItemIcon>
              <ListItemText primary="Apple Calendar (iCal)" />
            </ListItem>
            
            {/* Generic Option (iCal) */}
            <ListItem 
              button
              component="a" 
              href={generateCalendarLink()}
              download="StephAndTopher_Wedding.ics"
            >
              <ListItemIcon>
                <Event />
              </ListItemIcon>
              <ListItemText primary="Other Calendar (iCal)" />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCalendarDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </WeddingInfoContainer>
  );
};

export default WeddingInfoSection;