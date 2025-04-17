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
  Grow
} from '@mui/material';
import { useAppLayout } from '@/context/Providers/AppState/useAppLayout';
import { useTheme } from '@mui/material/styles';
import { StephsActualFavoriteTypography } from '@/components/AttendanceButton/AttendanceButton';
import {
  CalendarToday,
  EmojiEvents,
  Fastfood,
  LocalBar,
  MusicNote,
  Celebration,
  DirectionsBus,
  Hive,
  Hotel,
  Cake,
  FlightTakeoff
} from '@mui/icons-material';
import { useRecoilValue } from 'recoil';
import { userState } from '@/store/user';
import { hasRole, isStaffOrParty } from '@/utils/roles';
import { RoleEnum } from '@/types/api';

interface ScheduleProps {
  handleTabLink: (to: string) => void;
}

interface EventItem {
  id: string;
  name: string;
  time: string;
  location: string;
  description: string;
  details: string[];
  icon: React.ReactNode;
  restricted?: boolean;
}

function Schedule({handleTabLink}: ScheduleProps) {
  const { contentHeight } = useAppLayout();
  const theme = useTheme();
  const [selectedDay, setSelectedDay] = useState('day2');
  const currentUser = useRecoilValue(userState);
  
  // Check if user has staff or party roles
  const canViewRestrictedEvents = useMemo(() => isStaffOrParty(currentUser), [currentUser]);
  
  // Event data
  const events = {
    day1: {
      title: 'Friday, July 4, 2025',
      subtitle: 'Pre-Wedding Events',
      events: [
        {
          id: 'rehearsal-dinner',
          name: 'Wedding Rehearsal',
          time: '5:00 PM - 6:00 PM',
          location: 'Stone Manor Inn, Lovettsville, VA',
          description: 'Rehearsal walkthrough for the bride and groom, and wedding party members.',
          details: ['Officiant and wedding party only', 'Casual attire'],
          icon: <Hive />,
          restricted: true,
          visible: hasRole(RoleEnum.Rehearsal) || hasRole(RoleEnum.Party)
        },
        {
          id: 'welcome-dinner',
          name: 'Fourth of July: BBQ & Fireworks',
          time: '6:00 PM - 9:00 PM',
          location: 'Stone Manor Inn, Lovettsville, VA',
          description: 'Join us for a fourth of July grill. Bring your instruments and (legal in Virginia) fireworks!',
          details: ['Meet other guests', 'Casual attire', 'BBQ foods', 'BYOB', 'Bring your instruments', 'Bring your (legal in Virginia) fireworks!'],
          icon: <Fastfood />
        }
      ]
    },
    day2: {
      title: 'Saturday, July 5, 2025',
      subtitle: 'Wedding Day',
      events: [
        {
          id: 'brunch',
          name: 'Manor Breakfast',
          time: '09:00 AM - 10:00 AM',
          location: 'Stone Manor Inn: Dining Hall',
          description: 'Breakfast for manor guests.',
          details: ['Breakfast', 'Coffee', 'Final farewells'],
          icon: <Hotel />,
          restricted: true,
          visible: hasRole(RoleEnum.Manor)
        },
        {
          id: 'ceremony',
          name: 'Wedding Ceremony',
          time: '4:30 PM - 5:15 PM',
          location: 'Stone Manor Inn (Outdoor Garden)',
          description: 'Topher and Steph exchange vows. Please arrive 15-30 minutes early.',
          details: ['Outdoor ceremony (weather permitting)', 'Seating provided'],
          icon: <EmojiEvents />
        },
        {
          id: 'cocktail',
          name: 'Cocktail Hour',
          time: '5:15 PM - 6:30 PM',
          location: 'Stone Manor Inn (Patio & Lower Level)',
          description: 'Enjoy drinks and appetizers while mingling with other guests.',
          details: ['Hors d\'oeuvres', 'Signature cocktails', 'Live music by The Virginia String Quartet'],
          icon: <LocalBar />
        },
        {
          id: 'reception',
          name: 'Dinner Reception',
          time: '6:30 PM - 8:30 PM',
          location: 'Stone Manor Inn (Main Hall)',
          description: 'Dinner, speeches, toasts, and cake cutting.',
          details: ['Full dinner service', 'Cake', 'Toasts and speeches'],
          icon: <Cake />
        },
        {
          id: 'dancing',
          name: 'Dancing & Celebration',
          time: '8:30 PM - 11:00 PM',
          location: 'Stone Manor Inn (Main Hall)',
          description: 'Dance the night away! Topher and Steph will change into more comfortable attire for this portion.',
          details: ['DJ and dancing', 'Photo booth', 'Dessert table'],
          icon: <MusicNote />
        },
        {
          id: 'after-party',
          name: 'After Party (Optional)',
          time: '11:30 PM - 1:00 AM',
          location: 'Local Brewery & Restaurant (Private Room)',
          description: 'For night owls who want to continue the celebration!',
          details: ['Late night snacks', 'Cash bar', 'Casual atmosphere'],
          icon: <Celebration />
        }
      ]
    },
    day3: {
      title: 'Sunday, July 6, 2025',
      subtitle: 'Post-Wedding Gathering',
      events: [
        {
          id: 'brunch',
          name: 'Manor Breakfast',
          time: '09:00 AM - 10:00 AM',
          location: 'Stone Manor Inn: Dining Hall',
          description: 'Breakfast for manor guests.',
          details: ['Breakfast', 'Coffee', 'Final farewells'],
          icon: <Hotel />,
          restricted: true,
          visible: hasRole(RoleEnum.Manor)
        }
      ]
    }
  };
  
  // Transportation info
  const transportInfo = {
    id: 'transport',
    name: 'Shuttle Information',
    description: 'Shuttle services will be available between the recommended hotels and wedding venue.',
    icon: <DirectionsBus />,
    details: [
      {
        title: 'To the Ceremony',
        schedule: [
          'From Holiday Inn Express Brunswick: 3:30 PM and 4:00 PM',
          'From Holiday Inn Express Charles Town: 3:15 PM and 3:45 PM'
        ]
      },
      {
        title: 'Return Shuttles',
        schedule: [
          'To both hotels: 10:00 PM, 10:30 PM, and 11:00 PM',
          'To After Party location: 11:00 PM and 11:15 PM'
        ]
      },
      {
        title: 'From After Party',
        schedule: [
          'To both hotels: 12:00 AM, 12:30 AM, and 1:00 AM'
        ]
      }
    ]
  };
  
  // Help/support contact info
  const supportContact = {
    name: 'Wedding Day Contact',
    contact: 'Hosts',
    email: 'hosts@wedding.christephanie.com'
  };
  
  // Styled button for day selection
  const DayButton = ({ day, selected, onClick, children }) => (
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
  
  // Event card component
  const EventCard = ({ event, delay = 0 }) => {
    // Add special styling for restricted events
    const isRestricted = event.restricted;
    
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
                {event.icon}
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
            
            <Typography variant="body2" paragraph>
              {event.description}
            </Typography>
            
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
  
  // Transportation info card
  const TransportationCard = () => (
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
              {transportInfo.icon}
            </Box>
            <Box>
              <Typography variant="h6" component="div" gutterBottom sx={{ fontWeight: 'bold' }}>
                {transportInfo.name}
              </Typography>
              <Typography variant="body2">
                {transportInfo.description}
              </Typography>
            </Box>
          </Box>
          
          {transportInfo.details.map((detail, i) => (
            <Box key={i} sx={{ mb: i === transportInfo.details.length - 1 ? 0 : 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold', color: theme.palette.secondary.main }}>
                {detail.title}:
              </Typography>
              <Box component="ul" sx={{ pl: 2, mb: 0, mt: 0.5 }}>
                {detail.schedule.map((item, j) => (
                  <Typography component="li" variant="body2" key={j}>
                    {item}
                  </Typography>
                ))}
              </Box>
            </Box>
          ))}
        </CardContent>
      </Card>
    </Grow>
  );
  
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
            day="day1"
            selected={selectedDay === 'day1'}
            onClick={() => setSelectedDay('day1')}
          >
            <CalendarToday sx={{ mr: 1, fontSize: '1rem' }} />
            Fri, Jul 4
          </DayButton>
          
          <DayButton
            day="day2"
            selected={selectedDay === 'day2'}
            onClick={() => setSelectedDay('day2')}
          >
            <EmojiEvents sx={{ mr: 1, fontSize: '1rem' }} />
            Sat, Jul 5
          </DayButton>
          
          <DayButton
            day="day3"
            selected={selectedDay === 'day3'}
            onClick={() => setSelectedDay('day3')}
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
        
        {/* Event cards - filter based on role access */}
        {events[selectedDay].events
          .filter(event => !event.restricted || canViewRestrictedEvents)
          .map((event, index) => (
            <EventCard key={event.id} event={event} delay={index} />
          ))}
        
        {/* Transportation card - show only on main wedding day */}
        {selectedDay === 'day2' && <TransportationCard />}
        
        {/* Wedding Support Section */}
        <Grow in={true} timeout={1000}>
          <Card sx={{ 
            mt: 3,
            backgroundColor: alpha(theme.palette.background.paper, 0.1),
            backdropFilter: 'blur(5px)',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: theme.palette.secondary.main }}>
                Contact Information
              </Typography>
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

export default Schedule;