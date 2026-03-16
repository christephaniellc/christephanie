import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import React, { useState, useMemo } from 'react';
import { 
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
import { useAppLayout } from '@/context/Providers/AppState/useAppLayout';
import { useTheme } from '@mui/material/styles';
import { StephsActualFavoriteTypography, StephsActualFavoriteTypographyNoDrop, StephsActualFavoriteTypographyNoDropWhite } from '@/components/AttendanceButton/AttendanceButton';
import { 
  CalendarToday, 
  EmojiEvents, 
  FlightTakeoff, 
  DirectionsBus,
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
  PhotoCamera
} from '@mui/icons-material';
import { useRecoilValue } from 'recoil';
import { userState } from '@/store/user';
import { isAdmin } from '@/utils/roles';
import { getScheduleEvents, supportContact, transportInfo, EventItem, IconType } from './scheduleEvents';

interface ScheduleProps {
  handleTabLink: (to: string) => void;
}

// WelcomeDinnerContent component
const WelcomeDinnerContent: React.FC = () => {
  const theme = useTheme();
  
  return (
    <Box sx={{ display: 'flex', flexDirection: { 
      xs: 'column', 
      sm: 'column' }, 
      alignItems: { sm: 'flex-start' } }}>
      <Typography variant="body2" 
        sx={{ 
          flex: 1,
          mb: 2
         }}>
        Join us for a potluck fourth of July grill!
      </Typography>
      
      <Paper
        id="4th-info"
        sx={{ 
          backgroundColor: alpha(theme.palette.primary.main, 0.2),
          padding: theme.spacing(1.5),
          borderRadius: 1,
          maxWidth: { xs: '100%', sm: '100%' },
          textAlign: 'left',
          boxShadow: theme.shadows[1],
          position: 'relative',
          zIndex: 1,
          ml: { sm: 2 },
          mt: { xs: 2, sm: 0 },
          mb: 2,
          alignSelf: { sm: 'stretch' },
        }}
      >
        <Typography
          variant="body2"
          component="p"
          sx={{ 
            color: alpha('#FFFFFF', 0.8),
            //opacity: 0.8,
            position: 'relative',
            zIndex: 1,
            fontSize: { xs: '0.8rem', sm: '0.9rem' },
            mt: 0.5,
          }}
        >
          <span style={{
            color: theme.palette.secondary.main, 
            fontWeight: 'bold'
          }}><strong>Please Bring Potluck Items:</strong></span>
          <ul>
            <li>Grill items (meat and non-meat)</li>
            <li>Buns</li>
            <li>Sides to share</li>
            <li>BYOB</li>
          </ul>
          
          <Link 
            href="https://docs.google.com/spreadsheets/d/1Wz-5LNN4bGuLc7RERxuTrnMNvvlnVOnLcAe95wJcugc/edit?usp=sharing" 
            target="_blank"
            color="secondary">
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

function Schedule({handleTabLink}: ScheduleProps) {
  const { contentHeight } = useAppLayout();
  const theme = useTheme();
  
  // Get day parameter from URL if it exists
  const getInitialDayFromUrl = (): string => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const dayParam = params.get('day');
      
      // Check if the day param is valid (friday, saturday, or sunday)
      if (dayParam && ['friday', 'saturday', 'sunday'].includes(dayParam)) {
        return dayParam;
      }
    }
    // Default to Friday (friday) if no valid param
    return 'friday';
  };
  
  const [selectedDay, setSelectedDay] = useState(getInitialDayFromUrl());
  const currentUser = useRecoilValue(userState);
  
  // Update URL when selected day changes
  const updateDayInUrl = (day: string) => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('day', day);
      
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
  
  // Get events data from the shared file
  const events = useMemo(() => getScheduleEvents(currentUser), [currentUser]);
  
  // Create a component for schedule item with rich formatting
  const ScheduleItem = ({ from, times }) => {
    const formattedTimes = times.map((time, index) => (
      <React.Fragment key={index}>
        {index > 0 && " and "}
        <Box 
          component="span" 
          sx={{ 
            fontWeight: 'bold',
            color: theme.palette.secondary.main,
            display: 'inline-block'
          }}
        >
          {time}
        </Box>
      </React.Fragment>
    ));
    
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', mb: 1 }}>
        <Typography variant="body2">
          {from}: {formattedTimes}
        </Typography>
      </Box>
    );
  };
  
  // Event card component
  const EventCard = ({ event, delay = 0 }) => {
    // Add special styling for restricted events
    const isRestricted = event.restricted;
    if (event.comingSoon) {
      return <ComingSoonCard />;
    }

    return (
      <Grow in={true} timeout={500 + delay * 200}>
        <Card sx={{ 
          mb: 2, 
          backgroundColor: isRestricted 
            ? alpha(theme.palette.secondary.dark, 0.2)  // Darker background for restricted events
            : alpha(theme.palette.background.paper, 0.15),
          backdropFilter: 'blur(5px)',
          border: isRestricted
            ? `1px solid ${alpha(theme.palette.secondary.main, 0.5)}` // Highlight border for restricted events
            : `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
          position: 'relative',
          '&:hover': {
            boxShadow: isRestricted
              ? `0 0 20px ${alpha(theme.palette.secondary.main, 0.5)}`
              : `0 0 20px ${alpha(theme.palette.primary.main, 0.4)}`,
          }
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
              <Box sx={{ 
                backgroundColor: isRestricted
                  ? alpha(theme.palette.secondary.main, 0.3)
                  : alpha(theme.palette.primary.main, 0.2),
                width: 40,
                height: 40,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: '8px',
                mr: 2
              }}>
                {getIconComponent(event.icon)}
              </Box>
              <Box sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" component="div" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {event.name}
                  </Typography>
                  {isRestricted && (
                    <Chip 
                      size="small"
                      label="Private Event" 
                      color="secondary"
                      sx={{ 
                        fontSize: '0.7rem',
                        height: '20px',
                        ml: 1
                      }}
                    />
                  )}
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {event.time}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {event.location}
                </Typography>
              </Box>
            </Box>
            
            {event.id === 'welcome-dinner' ? (
              <WelcomeDinnerContent />
            ) : (
              <Typography variant="body2" paragraph>
                {event.description}
              </Typography>
            )}
            
            {event.details && (
              <>
                <Typography variant="body2" sx={{ 
                  fontWeight: 'bold', 
                  mt: 1, 
                  color: isRestricted ? theme.palette.secondary.light : theme.palette.secondary.main 
                }}>
                  Details:
                </Typography>
                <Box component="ul" sx={{ pl: 2, mb: 0, mt: 0.5 }}>
                  {event.details.map((detail, i) => (
                    <Typography component="li" variant="body2" key={i}>
                      {detail}
                    </Typography>
                  ))}
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      </Grow>
    );
  };
  
  const ComingSoonCard = () => (
    <Box sx={{ 
      width: '100%',
      mt: 4,
      pb: 2,
      position: 'relative',
      zIndex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      <StephsActualFavoriteTypography variant="h4" sx={{ 
        textAlign: 'center',
        fontSize: { xs: '1.8rem', sm: '2rem', md: '2.2rem' },
      }}>
      COMING SOON
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

      <Typography
        variant="body1"
        sx={{
          textAlign: 'center',
          maxWidth: '600px',
          mt: 2,
          mb: 4,
          px: 2,
        }}
      >
        We are currently working on this section. Please check back later for updates!
      </Typography>
    </Box>
  );

  // Transportation card
  const TransportationCard = () => {
    // Format the schedule items for each section
    const formatScheduleItems = (scheduleData) => {
      return scheduleData.map((item, index) => (
        <ScheduleItem 
          key={index} 
          from={item.from} 
          times={item.times} 
        />
      ));
    };

    return (
      <Grow in={true} timeout={800}>
        <Card sx={{ 
          mb: 2, 
          backgroundColor: alpha(theme.palette.primary.dark, 0.25),
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(theme.palette.primary.main, 0.5)}`,
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
              <Box sx={{ 
                backgroundColor: alpha(theme.palette.primary.main, 0.3),
                width: 40,
                height: 40,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: '8px',
                mr: 2
              }}>
                {getIconComponent(transportInfo.icon)}
              </Box>
              <Box>
                <Typography variant="h6" component="div" gutterBottom sx={{ fontWeight: 'bold' }}>
                  {transportInfo.name}
                </Typography>
                <Typography
                  dangerouslySetInnerHTML={{ __html: transportInfo.description }}>
                </Typography>
              </Box>
            </Box>
            
            {transportInfo.details.map((detail, i) => (
              <Box key={i} sx={{ mb: i === transportInfo.details.length - 1 ? 0 : 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: theme.palette.secondary.main }}>
                  {detail.title}:
                </Typography>
                <Box component="ul" sx={{ pl: 2, mb: 0, mt: 0.5 }}>
                  {formatScheduleItems(detail.schedule).map((item, j) => (
                    <Box component="li" key={j}>
                      {item}
                    </Box>
                  ))}
                </Box>
              </Box>
            ))}
          </CardContent>
        </Card>
      </Grow>
    );
  };
  
  return (
    <Container
      sx={{
        width: '100%',
        height: contentHeight * 0.9,
        overflow: 'auto',
        borderRadius: 'sm',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        paddingBottom: '80px',
        background: 'radial-gradient(circle, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.8) 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Header Section */}
      <Box sx={{ 
        width: '100%', 
        pt: 2, 
        pb: 1,
        px: 2,
        textAlign: 'center',
        background: `linear-gradient(to bottom, ${alpha(theme.palette.background.paper, 0)}, ${alpha(theme.palette.background.paper, 0.1)})`
      }}>
        {/* Title */}
        <StephsActualFavoriteTypography 
          variant="h4" 
          sx={{ 
            textAlign: 'center',
            fontSize: { xs: '1.8rem', sm: '2rem', md: '2.2rem' },
            textShadow: `0 0 10px ${theme.palette.primary.main}`,
            mb: 2
          }}
        >
          WEDDING SCHEDULE
        </StephsActualFavoriteTypography>
        
        {/* Day selection buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 1, mt: 2 }}>
          <DayButton
            day="friday"
            selected={selectedDay === 'friday'}
            onClick={() => updateDayInUrl('friday')}
          >
            <CalendarToday sx={{ mr: 1, fontSize: '1rem' }} />
            Fri, Jul 4
          </DayButton>
          
          <DayButton
            day="saturday"
            selected={selectedDay === 'saturday'}
            onClick={() => updateDayInUrl('saturday')}
          >
            <EmojiEvents sx={{ mr: 1, fontSize: '1rem' }} />
            Sat, Jul 5
          </DayButton>
          
          <DayButton
            day="sunday"
            selected={selectedDay === 'sunday'}
            onClick={() => updateDayInUrl('sunday')}
          >
            <FlightTakeoff sx={{ mr: 1, fontSize: '1rem' }} />
            Sun, Jul 6
          </DayButton>
        </Box>
      </Box>
      
      {/* Main content area */}
      <Box sx={{ p: 2, flexGrow: 1, overflow: 'auto' }}>
        {/* Day title and subtitle */}
        <Fade in={true} timeout={500}>
          <Paper sx={{ 
            p: 2, 
            mb: 3, 
            textAlign: 'center',
            backgroundColor: alpha(theme.palette.background.paper, 0.15),
            backdropFilter: 'blur(5px)',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
          }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
              {events[selectedDay].title}
            </Typography>
            <Typography variant="body1" color="secondary.light">
              {events[selectedDay].subtitle}
            </Typography>
          </Paper>
        </Fade>
        
        {/* Event cards - filter based on role access and visibility */}
        {events[selectedDay].events
          .filter(event => {            
            // Check visibility (if visible property is undefined, treat as visible)
            const isVisible = event.visible === undefined || event.visible === true;
            
            return isVisible;
          })
          .map((event, index) => (
            <EventCard key={event.id} event={event} delay={index} />
          ))}
        
        {/* Transportation card - show only on main wedding day */}
        {selectedDay === 'saturday' && <TransportationCard />}
        
        {/* Wedding Support Section */}
        <Grow in={true} timeout={1000}>
          <Card sx={{ 
            mt: 3,
            backgroundColor: alpha(theme.palette.background.paper, 0.1),
            backdropFilter: 'blur(5px)',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
          }}>
            <CardContent>
              <StephsActualFavoriteTypographyNoDrop variant="h6" 
              gutterBottom 
              sx={{ 
                color: theme.palette.secondary.main,                
                fontSize: { xs: '1.0rem', sm: '1.3rem' },
                wordBreak: 'break-word'
                }}>
                Contact Information
              </StephsActualFavoriteTypographyNoDrop>
              <Typography variant="body2" paragraph>
                If you need assistance with wedding details, please contact:
              </Typography>
              <Typography variant="body2">
                <strong>{supportContact.contact}</strong><br />
                Email: {supportContact.email}
              </Typography>
            </CardContent>
          </Card>
        </Grow>
      </Box>
    </Container>
  );
}

// Styled button for day selection
const DayButton = ({ day, selected, onClick, children }) => {
  const theme = useTheme();
  return (
    <Button
      variant={selected ? "contained" : "outlined"}
      color={selected ? "secondary" : "primary"}
      onClick={onClick}
      sx={{
        border: selected ? 'none' : '2px solid',
        borderColor: theme.palette.primary.main,
        borderRadius: '4px',
        fontWeight: 'bold',
        px: 2,
        py: 1,
        mx: 0.5,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: selected 
          ? `0 4px 0 ${alpha(theme.palette.secondary.dark, 0.8)}`
          : `0 4px 0 ${alpha(theme.palette.primary.dark, 0.8)}`,
        transform: selected ? 'translateY(2px)' : 'translateY(0)',
        transition: 'transform 0.1s, box-shadow 0.1s',
        '&:hover': {
          boxShadow: selected 
            ? `0 2px 0 ${alpha(theme.palette.secondary.dark, 0.8)}`
            : `0 2px 0 ${alpha(theme.palette.primary.dark, 0.8)}`,
          transform: 'translateY(2px)'
        },
        '&::after': selected ? {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: `linear-gradient(45deg, ${alpha(theme.palette.secondary.main, 0)} 85%, ${alpha(theme.palette.secondary.light, 0.3)} 90%, ${alpha(theme.palette.secondary.main, 0)} 95%)`,
        } : {}
      }}
    >
      {children}
    </Button>
  );
};

export default Schedule;