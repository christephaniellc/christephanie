import React, { useState, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button,
  Card,
  CardContent,
  Chip,
  alpha,
  Fade,
  Grow,
  Link
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useRecoilValue } from 'recoil';
import { userState } from '@/store/user';
import { isAdmin } from '@/utils/roles';
import { 
  EventNote, 
  CalendarToday, 
  EmojiEvents, 
  FlightTakeoff,
  Forest,
  SupervisorAccount,
  Stream,
  BakeryDining,
  Face4,
  DryCleaning,
  AirportShuttle,
  Liquor,
  Celebration,
  LocalBar,
  Restaurant,
  MusicNote,
  Nightlife,
  CleaningServices,
  CircleNotifications,
  DirectionsBus,
  PhotoCamera
} from '@mui/icons-material';
import { getScheduleEvents, EventItem, IconType } from '@/components/DetailsPages/Schedule/scheduleEvents';

interface HomePageScheduleProps {
  handleTabLink: (to: string) => void;
}

// WelcomeDinnerContent component
const WelcomeDinnerContent: React.FC = () => {
  const theme = useTheme();
  
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      width: '100%'
    }}>
      <Typography variant="body2" 
        sx={{ 
          flex: 1,
          mb: 1.5,
          fontSize: { xs: '0.8rem', sm: '0.85rem' }
         }}>
        Join us for a potluck fourth of July grill!
      </Typography>
      
      <Paper
        id="4th-info"
        sx={{ 
          backgroundColor: alpha(theme.palette.primary.main, 0.2),
          padding: theme.spacing(1),
          borderRadius: 1,
          width: '100%',
          textAlign: 'left',
          boxShadow: theme.shadows[1],
          position: 'relative',
          zIndex: 1,
          mb: 1
        }}
      >
        <Typography
          variant="body2"
          component="p"
          sx={{ 
            color: alpha('#FFFFFF', 0.8),
            position: 'relative',
            zIndex: 1,
            fontSize: { xs: '0.75rem', sm: '0.85rem' },
            mt: 0.5,
          }}
        >
          <span style={{
            color: theme.palette.secondary.main, 
            fontWeight: 'bold'
          }}><strong>Please Bring Potluck Items:</strong></span>
          <ul style={{
            marginTop: '0.3rem',
            marginBottom: '0.5rem',
            paddingLeft: '1.2rem'
          }}>
            <li>Grill items (meat and non-meat)</li>
            <li>Buns</li>
            <li>Sides to share</li>
            <li>BYOB</li>
          </ul>
          
          <Link 
            href="https://docs.google.com/spreadsheets/d/1Wz-5LNN4bGuLc7RERxuTrnMNvvlnVOnLcAe95wJcugc/edit?usp=sharing" 
            target="_blank"
            color="secondary"
            sx={{
              display: 'inline-block',
              mt: 0.5,
              '&:hover': {
                textDecoration: 'underline'
              }
            }}>
              Potluck Signup Sheet
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

// Helper function to render icon based on icon type
const getIconComponent = (iconType: IconType) => {
  switch (iconType) {
    case 'FOREST':
      return <Forest />;
    case 'SUPERVISOR_ACCOUNT':
      return <SupervisorAccount />;
    case 'STREAM':
      return <Stream />;
    case 'BAKERY_DINING':
      return <BakeryDining />;
    case 'FACE4':
      return <Face4 />;
    case 'DRY_CLEANING':
      return <DryCleaning />;
    case 'PHOTOGRAPHY':
      return <PhotoCamera />
    case 'AIRPORT_SHUTTLE':
      return <AirportShuttle />;
    case 'LIQUOR':
      return <Liquor />;
    case 'CELEBRATION':
      return <Celebration />;
    case 'LOCAL_BAR':
      return <LocalBar />;
    case 'RESTAURANT':
      return <Restaurant />;
    case 'MUSIC_NOTE':
      return <MusicNote />;
    case 'NIGHTLIFE':
      return <Nightlife />;
    case 'CLEANING_SERVICES':
      return <CleaningServices />;
    case 'CIRCLE_NOTIFICATIONS':
      return <CircleNotifications />;
    case 'DIRECTIONS_BUS':
      return <DirectionsBus />;
    default:
      return <CalendarToday />;  // Default icon
  }
};

function HomePageSchedule({ handleTabLink }: HomePageScheduleProps) {
  const theme = useTheme();
  
  // Get day parameter from URL if it exists, or default to today's day if it's during the wedding weekend
  const getInitialDayFromUrl = (): string => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const dayParam = params.get('day');
      
      // Check if the day param is valid (friday, saturday, or sunday)
      if (dayParam && ['friday', 'saturday', 'sunday'].includes(dayParam)) {
        return dayParam;
      }
      
      // If no valid day parameter, check if today is one of the wedding days
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth(); // 0-based (6 = July)
      const date = today.getDate();
      
      // Wedding dates: July 4-6, 2025
      if (year === 2025 && month === 6) {
        if (date === 4) return 'friday';
        if (date === 5) return 'saturday';
        if (date === 6) return 'sunday';
      }
    }
    
    // Default to Friday if not wedding weekend and no valid param
    return 'friday';
  };
  
  const [selectedDay, setSelectedDay] = useState(getInitialDayFromUrl());
  const currentUser = useRecoilValue(userState);
  
  // Update URL when selected day changes (but only during wedding weekend)
  const updateDayInUrl = (day: string) => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      
      // Only set the day parameter if we're during the wedding weekend
      // or if there was already a day parameter
      const shouldSetDayParam = (() => {
        // If there's already a day parameter, always update it
        const params = new URLSearchParams(window.location.search);
        if (params.has('day')) return true;
        
        // Check if today is during the wedding weekend
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth(); // 0-based (6 = July)
        const date = today.getDate();
        
        return (year === 2025 && month === 6 && [4, 5, 6].includes(date));
      })();
      
      if (shouldSetDayParam) {
        url.searchParams.set('day', day);
      }
      
      // Update URL without reloading the page
      window.history.pushState({}, '', url.toString());
      
      // Update state
      setSelectedDay(day);
    }
  };
  
  // Listen for popstate event (browser back/forward) and update the selected day
  React.useEffect(() => {
    const handlePopState = () => {
      setSelectedDay(getInitialDayFromUrl());
    };
    
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);
  
  // Check if user has admin role
  const canViewRestrictedEvents = useMemo(() => isAdmin(currentUser), [currentUser]);
  
  // Get events data from shared file
  const events = useMemo(() => getScheduleEvents(currentUser), [currentUser]);
  
  // Styled button for day selection
  const DayButton = ({ day, selected, onClick, children }) => (
    <Button
      variant={selected ? "contained" : "outlined"}
      color={selected ? "secondary" : "primary"}
      onClick={onClick}
      sx={{
        border: selected ? 'none' : '1px solid',
        borderColor: theme.palette.primary.main,
        borderRadius: '4px',
        fontWeight: 'bold',
        px: { xs: 1.5, sm: 2 },
        py: { xs: 0.75, sm: 0.5 },
        mx: { xs: 0.25, sm: 0.5 },
        minWidth: { xs: '80px', sm: 'auto' },
        fontSize: { xs: '0.75rem', sm: '0.85rem' },
        position: 'relative',
        overflow: 'hidden',
        // Add gray background for non-selected state
        backgroundColor: selected 
          ? theme.palette.secondary.main 
          : alpha(theme.palette.common.black, 0.3),
        color: selected 
          ? theme.palette.secondary.contrastText 
          : theme.palette.primary.main,
        boxShadow: selected 
          ? `0 3px 0 ${alpha(theme.palette.secondary.dark, 0.8)}`
          : `0 3px 0 ${alpha(theme.palette.primary.dark, 0.8)}`,
        transform: selected ? 'translateY(1px)' : 'translateY(0)',
        transition: 'transform 0.1s, box-shadow 0.1s, background-color 0.2s',
        backdropFilter: 'blur(2px)',
        '&:hover': {
          backgroundColor: selected 
            ? theme.palette.secondary.main 
            : alpha(theme.palette.common.black, 0.4),
          boxShadow: selected 
            ? `0 1px 0 ${alpha(theme.palette.secondary.dark, 0.8)}`
            : `0 1px 0 ${alpha(theme.palette.primary.dark, 0.8)}`,
          transform: 'translateY(2px)'
        }
      }}
    >
      {children}
    </Button>
  );
  
  // Event card component - more compact version for homepage
  const EventCard = ({ event, delay = 0 }) => {
    // Add special styling for restricted events
    const isRestricted = event.restricted;

    return (
      <Grow in={true} timeout={300 + delay * 100}>
        <Card sx={{ 
          mb: 1.5, 
          backgroundColor: isRestricted 
            ? alpha(theme.palette.secondary.dark, 0.2)
            : alpha(theme.palette.background.paper, 0.15),
          backdropFilter: 'blur(5px)',
          border: isRestricted
            ? `1px solid ${alpha(theme.palette.secondary.main, 0.5)}`
            : `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
          position: 'relative',
          '&:hover': {
            boxShadow: isRestricted
              ? `0 0 10px ${alpha(theme.palette.secondary.main, 0.5)}`
              : `0 0 10px ${alpha(theme.palette.primary.main, 0.4)}`,
          }
        }}>
          <CardContent sx={{ py: 1.5, px: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
              <Box sx={{ 
                backgroundColor: isRestricted
                  ? alpha(theme.palette.secondary.main, 0.3)
                  : alpha(theme.palette.primary.main, 0.2),
                width: 32,
                height: 32,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: '6px',
                mr: 1.5,
                mt: 0.5
              }}>
                {React.cloneElement(getIconComponent(event.icon), { sx: { fontSize: '1.1rem' } })}
              </Box>
              <Box sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography 
                    variant="subtitle1" 
                    component="div" 
                    sx={{ 
                      fontWeight: 'bold',
                      fontSize: { xs: '0.9rem', sm: '1rem' }
                    }}
                  >
                    {event.name}
                  </Typography>
                  {isRestricted && (
                    <Chip 
                      size="small"
                      label="Private" 
                      color="secondary"
                      sx={{ 
                        fontSize: '0.65rem',
                        height: '18px',
                        ml: 1
                      }}
                    />
                  )}
                </Box>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.8rem' } }}
                >
                  {event.time}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.8rem' } }}
                >
                  {event.location}
                </Typography>
              </Box>
            </Box>
            
            {event.id === 'welcome-dinner' ? (
              <WelcomeDinnerContent />
            ) : (
              <Typography 
                variant="body2" 
                paragraph 
                sx={{ 
                  m: 0, 
                  fontSize: { xs: '0.75rem', sm: '0.8rem' },
                  mt: 0.5
                }}
              >
                {event.description}
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grow>
    );
  };

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '800px',
        mx: 'auto',
        px: { xs: 1, sm: 2 },
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      {/* Day selection buttons */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        flexWrap: 'wrap', 
        gap: { xs: 0.5, sm: 1 }, 
        mb: 2,
        mx: { xs: -0.5, sm: 0 }
      }}>
        <DayButton
          day="friday"
          selected={selectedDay === 'friday'}
          onClick={() => updateDayInUrl('friday')}
        >
          <CalendarToday sx={{ mr: 0.5, fontSize: '0.9rem' }} />
          Fri, Jul 4
        </DayButton>
        
        <DayButton
          day="saturday"
          selected={selectedDay === 'saturday'}
          onClick={() => updateDayInUrl('saturday')}
        >
          <EmojiEvents sx={{ mr: 0.5, fontSize: '0.9rem' }} />
          Sat, Jul 5
        </DayButton>
        
        <DayButton
          day="sunday"
          selected={selectedDay === 'sunday'}
          onClick={() => updateDayInUrl('sunday')}
        >
          <FlightTakeoff sx={{ mr: 0.5, fontSize: '0.9rem' }} />
          Sun, Jul 6
        </DayButton>
      </Box>
      
      {/* Day title and subtitle */}
      <Fade in={true} timeout={300}>
        <Paper sx={{ 
          p: 1.5, 
          mb: 2, 
          textAlign: 'center',
          backgroundColor: alpha(theme.palette.background.paper, 0.15),
          backdropFilter: 'blur(5px)',
          border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
        }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 'bold',
              fontSize: { xs: '1rem', sm: '1.1rem' }
            }}
          >
            {events[selectedDay].title}
          </Typography>
          <Typography 
            variant="body2" 
            color="secondary.light"
            sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}
          >
            {events[selectedDay].subtitle}
          </Typography>
        </Paper>
      </Fade>
      
      {/* Event cards - filter based on role access and visibility */}
      <Box sx={{ mb: 2 }}>
        {events[selectedDay].events
          .filter(event => {            
            // Check visibility (if visible property is undefined, treat as visible)
            const isVisible = event.visible === undefined || event.visible === true;
            
            return isVisible;
          })
          .map((event, index) => (
            <EventCard key={event.id} event={event} delay={index} />
          ))}
      </Box>
      
      {/* Link to full schedule */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
        <Button
          variant="outlined"
          color="secondary"
          size="small"
          startIcon={<EventNote />}
          onClick={() => handleTabLink('/details/schedule')}
          sx={{
            borderRadius: '4px',
            fontSize: { xs: '0.75rem', sm: '0.8rem' },
            py: { xs: 0.75, sm: 1 },
            px: { xs: 1.5, sm: 2 },
            textTransform: 'none',
            fontWeight: 'medium',
            '&:hover': {
              backgroundColor: alpha(theme.palette.secondary.main, 0.1)
            }
          }}
        >
          View Full Schedule Details
        </Button>
      </Box>
    </Box>
  );
}

export default HomePageSchedule;