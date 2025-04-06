import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import React, { useEffect } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { 
  Divider, 
  Grid, 
  Link, 
  ListSubheader, 
  Paper, 
  Step, 
  StepContent, 
  StepLabel, 
  Stepper
} from '@mui/material';
import Timeline from '@mui/lab/Timeline';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import { useAppLayout } from '@/context/Providers/AppState/useAppLayout';
import { StephsActualFavoriteTypography, themePaletteToRgba } from '@/components/AttendanceButton/AttendanceButton';
import { useTheme } from '@mui/material/styles';

interface ScheduleProps {
  handleTabLink: (to: string) => void;
}

function Schedule({handleTabLink}: ScheduleProps) {
  const { contentHeight } = useAppLayout();
  const theme = useTheme();
  
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    // Example of an async operation that respects the AbortController
    const fetchData = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
        if (!signal.aborted) {
          // Data fetched successfully
        }
      } catch (error) {
        if (signal.aborted) {
          console.log('Fetch aborted due to navigation.');
        }
      }
    };

    fetchData();

    return () => {
      controller.abort();
    };
  }, []);

  const travelLink = (
    <Link onClick={() => handleTabLink('travel')}>
      Travel page
    </Link>
  );

  const accommodationsLink = (
    <Link onClick={() => handleTabLink('accommodations')}>
      Accommodations page
    </Link>
  );

  const scheduleItems: {
    [key: string]: {
      subheader: string;
      content: { subheader: string; content?: { subheader: string; content: (string | JSX.Element)[] }[] }[];
    };
  } = {
    titleSchedule: {
      subheader: 'Wedding Schedule',
      content: [
        {
          subheader:
            'Here\'s what to expect for our wedding weekend. We\'re so excited to celebrate with you!',
        },
      ],
    },
    fridayEvents: {
      subheader: 'Friday, September 20, 2025',
      content: [
        {
          subheader: 'Welcome Dinner',
          content: [
            {
              subheader: 'Time & Location:',
              content: [
                '6:00 PM - 9:00 PM',
                'Flight Deck Brewing Co.',
                '11 Atlantic Ave, Brunswick, ME 04011'
              ],
            },
            {
              subheader: 'Details:',
              content: [
                'Casual dinner for out-of-town guests and wedding party',
                'Food provided, cash bar available',
                'No need to RSVP - just come if you\'re in town!',
                'Casual attire - jeans welcome'
              ],
            }
          ],
        }
      ],
    },
    saturdayEvents: {
      subheader: 'Saturday, September 21, 2025 - Wedding Day',
      content: [
        {
          subheader: 'Ceremony',
          content: [
            {
              subheader: 'Time & Location:',
              content: [
                '4:30 PM - 5:15 PM',
                'The Barn at Autumn Lane (Outdoor Garden)',
                '155 Autumn Lane, Brunswick, ME 04011'
              ],
            },
            {
              subheader: 'Details:',
              content: [
                'Please arrive 15-30 minutes early for seating',
                'The ceremony will take place outdoors, weather permitting',
                'In case of inclement weather, the ceremony will be moved indoors',
                'Parking attendants will direct you upon arrival'
              ],
            }
          ],
        },
        {
          subheader: 'Cocktail Hour',
          content: [
            {
              subheader: 'Time & Location:',
              content: [
                '5:15 PM - 6:30 PM',
                'The Barn at Autumn Lane (Patio & Lower Level)'
              ],
            },
            {
              subheader: 'Details:',
              content: [
                'Hors d\'oeuvres will be served',
                'Open bar with signature cocktails',
                'Live music by The Maine String Quartet'
              ],
            }
          ],
        },
        {
          subheader: 'Reception',
          content: [
            {
              subheader: 'Time & Location:',
              content: [
                '6:30 PM - 11:00 PM',
                'The Barn at Autumn Lane (Main Hall)'
              ],
            },
            {
              subheader: 'Schedule:',
              content: [
                '6:30 PM - Grand entrance and welcome',
                '7:00 PM - Dinner service begins',
                '8:00 PM - Toasts and cake cutting',
                '8:30 PM - First dance and parent dances',
                '8:45 PM - Dance floor opens',
                '10:45 PM - Last call at the bar',
                '11:00 PM - Reception concludes'
              ],
            }
          ],
        },
        {
          subheader: 'After Party',
          content: [
            {
              subheader: 'Time & Location:',
              content: [
                '11:30 PM - 1:00 AM',
                'Flight Deck Brewing Co. (Private Room)',
                '11 Atlantic Ave, Brunswick, ME 04011'
              ],
            },
            {
              subheader: 'Details:',
              content: [
                'Casual gathering for those who want to continue the celebration',
                'Light late-night snacks provided',
                'Cash bar available',
                'Shuttles will be running between the venue, after party, and hotels'
              ],
            }
          ],
        }
      ],
    },
    sundayEvents: {
      subheader: 'Sunday, September 22, 2025',
      content: [
        {
          subheader: 'Farewell Brunch',
          content: [
            {
              subheader: 'Time & Location:',
              content: [
                '10:00 AM - 12:00 PM',
                'Holiday Inn Express Brunswick (Function Room)',
                '185 Park Row, Brunswick, ME 04011'
              ],
            },
            {
              subheader: 'Details:',
              content: [
                'Casual brunch to say goodbye to out-of-town guests',
                'Continental breakfast and coffee',
                'Drop in anytime between 10:00 AM and 12:00 PM',
                'No RSVP required'
              ],
            }
          ],
        }
      ],
    },
    transportation: {
      subheader: 'Transportation',
      content: [
        {
          subheader:
            'We will be providing shuttle service between our recommended hotels and the wedding venue/after party. For more details, please see the ' + accommodationsLink + ' and ' + travelLink + '.',
        },
        {
          subheader: 'Saturday Shuttle Schedule',
          content: [
            {
              subheader: 'To the Ceremony:',
              content: [
                'From Holiday Inn Express Brunswick: 3:30 PM and 4:00 PM',
                'From Holiday Inn Express Charlestown: 3:15 PM and 3:45 PM'
              ],
            },
            {
              subheader: 'From the Reception:',
              content: [
                'To Holiday Inn Express Brunswick: 10:00 PM, 10:30 PM, and 11:00 PM',
                'To Holiday Inn Express Charlestown: 10:00 PM, 10:30 PM, and 11:00 PM',
                'To After Party: 11:00 PM and 11:15 PM'
              ],
            },
            {
              subheader: 'From the After Party:',
              content: [
                'To Holiday Inn Express Brunswick: 12:00 AM, 12:30 AM, and 1:00 AM',
                'To Holiday Inn Express Charlestown: 12:00 AM, 12:30 AM, and 1:00 AM'
              ],
            }
          ],
        }
      ],
    },
    contact: {
      subheader: 'Day-of Coordination',
      content: [
        {
          subheader:
            'If you have any questions or issues on the wedding day, please contact our day-of coordinator:',
        },
        {
          subheader: 'Jordan (Best Man)',
          content: [
            {
              subheader: '',
              content: [
                'Cell: (207) 555-1234',
                'Email: jordan@wedding.christephanie.com'
              ],
            },
          ],
        },
      ],
    }
  };
  
  // Get the semi-transparent background color like in AttendanceButton
  const semiTransparentBackgroundColor = themePaletteToRgba(theme.palette.primary.main, 0.1);
  
  // Common styles for all headers to mimic the "Interested" box styling
  const commonHeaderStyle = {
    width: '100%',
    maxWidth: '100%',
    position: 'sticky' as const,
    backdropFilter: 'blur(16px)',
    border: `2px solid ${semiTransparentBackgroundColor}`,
    backgroundColor: semiTransparentBackgroundColor,
    color: theme.palette.primary.contrastText,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
    left: 0,
    right: 0,
    top: 0, // Ensure headers stick to top
  };
  
  // Styles for subheaders with different z-index values - lower level headers have higher z-index
  const mainHeaderStyle = {
    ...commonHeaderStyle,
    zIndex: 10,
  };
  
  const subHeaderStyle = {
    ...commonHeaderStyle,
    zIndex: 11,
  };
  
  const subSubHeaderStyle = {
    ...commonHeaderStyle,
    zIndex: 12,
  };
  
  // Wedding day timeline events for visual representation
  const timelineEvents = [
    { time: '4:30 PM', event: 'Ceremony', description: 'Outdoor Garden' },
    { time: '5:15 PM', event: 'Cocktail Hour', description: 'Patio & Lower Level' },
    { time: '6:30 PM', event: 'Dinner Reception', description: 'Main Hall' },
    { time: '8:00 PM', event: 'Toasts & Cake Cutting', description: '' },
    { time: '8:45 PM', event: 'Dancing Begins', description: '' },
    { time: '11:00 PM', event: 'Reception Ends', description: '' },
    { time: '11:30 PM', event: 'After Party', description: 'Flight Deck Brewing' },
  ];
  
  return (
    <Container
      sx={{
        width: '100%',
        height: contentHeight,
        overflow: 'hidden',
        borderRadius: 'sm',
        display: 'flex',
        flexWrap: 'wrap',
        position: 'relative',
        paddingBottom: '80px', // Added padding to ensure content doesn't get hidden behind BottomNav
      }}
    >
      <Box my={2} sx={{ 
        backdropFilter: 'blur(16px)',
        width: '100%',
        px: 2,
        mt: 2,
        pb: 2,
        zIndex: 5, // Lower z-index than headers
      }}>
        <StephsActualFavoriteTypography variant="h4" sx={{ textAlign: 'center',
            mt: 2,
            fontSize: '2rem'}}>
          {scheduleItems.titleSchedule.subheader}
        </StephsActualFavoriteTypography>
        
        <Box
          sx={{
            width: '100%',
            height: '120px',
            overflow: 'hidden',
            position: 'relative',
            '@keyframes rollLogo': {
              '0%, 10%': { left: 0, transform: 'rotate(0deg)' },
              '30%': { left: 'calc(100% - 120px)', transform: 'rotate(360deg)' },
              '50%, 60%': { left: 0, transform: 'rotate(0deg)' },
              '80%': { left: 'calc(100% - 120px)', transform: 'rotate(-360deg)' },
              '100%': { left: 0, transform: 'rotate(0deg)' }
            },
            '& img': {
              position: 'absolute',
              height: '120px',
              width: '120px',
              animation: 'rollLogo 8s infinite',
            }
          }}
        >
          <img 
            src="/favicon_big_art_transparent.png" 
            alt="Wedding Logo" 
          />
        </Box>

        <Typography variant="body1" 
          sx={{ mt: 2, fontSize: '0.9rem' }}>
          {scheduleItems.titleSchedule.content[0].subheader}
        </Typography>
      </Box>
      <List sx={{ 
        overflow: 'auto', 
        pt: 0,
        my: 2, 
        height: 'calc(100% - 300px)', 
        backgroundColor: 'rgba(0,0,0,.1)', 
        width: '100%',
        pb: 16, // Increased padding at bottom to avoid content being cut off behind BottomNav
        position: 'relative',
        zIndex: 1, // Lower z-index than headers
      }}>
        {/* Regular Schedule Sections */}
        {Object.entries(scheduleItems)
          .slice(1, 4) // Friday, Saturday, Sunday events
          .map(([key, value]) => (
            <Box
              data-testid={`list-item-${key}`}
              key={key}
              sx={{ flexWrap: 'wrap', width: '100%',
                backgroundColor: 'rgba(0,0,0,.1)',
                padding: 0,
                mb: 2, // Add margin between sections
            }}
            >
              <ListSubheader sx={mainHeaderStyle}>
                {value.subheader}
              </ListSubheader>
              <List sx={{ position: 'relative', width: '100%', padding: 0 }}>
                {value.content.map((content, index) => (
                  <Box key={index} sx={{ flexWrap: 'wrap', width: '100%', padding: 0, mt: 1 }}>
                    {content.subheader && !content.content && (
                      <Typography sx={{ padding: '8px 16px' }}>
                        {content.subheader}
                      </Typography>
                    )}
                    {content.content && (
                      <>
                        {content.subheader && (
                          <ListSubheader disableSticky={false} key={index} sx={subHeaderStyle}>
                            {content.subheader}
                          </ListSubheader>
                        )}
                        <List sx={{ position: 'relative', width: '100%', padding: 0 }}>
                          {content.content.map((subContent, index) => (
                            <Box key={index} sx={{ flexWrap: 'wrap', width: '100%', padding: 0, mt: 1 }}>
                              {subContent.subheader && (
                                <ListSubheader sx={subSubHeaderStyle}>
                                  {subContent.subheader}
                                </ListSubheader>
                              )}
                              <List sx={{ width: '100%', padding: '8px 16px' }}>
                                {subContent.content?.map((paragraph, pIndex) => (
                                  <ListItem key={pIndex} sx={{ padding: '4px 0' }}>{paragraph}</ListItem>
                                ))}
                              </List>
                            </Box>
                          ))}
                        </List>
                      </>
                    )}
                  </Box>
                ))}
              </List>
            </Box>
          ))}
          
        {/* Visual Timeline */}
        <Box
          sx={{ 
            flexWrap: 'wrap', 
            width: '100%',
            backgroundColor: 'rgba(0,0,0,.1)',
            padding: 0,
            mb: 2,
          }}
        >
          <ListSubheader sx={mainHeaderStyle}>
            Wedding Day Timeline
          </ListSubheader>
          <Paper 
            elevation={0}
            sx={{ 
              padding: 2, 
              margin: 2, 
              backgroundColor: 'rgba(255,255,255,0.9)',
              maxWidth: '100%',
              overflowX: 'auto'
            }}
          >
            <Timeline position="alternate">
              {timelineEvents.map((event, index) => (
                <TimelineItem key={index}>
                  <TimelineOppositeContent color="text.secondary">
                    {event.time}
                  </TimelineOppositeContent>
                  <TimelineSeparator>
                    <TimelineDot color={index === 0 ? "secondary" : "primary"} />
                    {index < timelineEvents.length - 1 && <TimelineConnector />}
                  </TimelineSeparator>
                  <TimelineContent>
                    <Typography variant="h6" component="span">
                      {event.event}
                    </Typography>
                    <Typography>{event.description}</Typography>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          </Paper>
        </Box>
        
        {/* Remaining Sections */}
        {Object.entries(scheduleItems)
          .slice(4) // Transportation and Contact
          .map(([key, value]) => (
            <Box
              data-testid={`list-item-${key}`}
              key={key}
              sx={{ flexWrap: 'wrap', width: '100%',
                backgroundColor: 'rgba(0,0,0,.1)',
                padding: 0,
                mb: 2, // Add margin between sections
            }}
            >
              <ListSubheader sx={mainHeaderStyle}>
                {value.subheader}
              </ListSubheader>
              <List sx={{ position: 'relative', width: '100%', padding: 0 }}>
                {value.content.map((content, index) => (
                  <Box key={index} sx={{ flexWrap: 'wrap', width: '100%', padding: 0, mt: 1 }}>
                    {content.subheader && !content.content && (
                      <Typography sx={{ padding: '8px 16px' }}>
                        {content.subheader}
                      </Typography>
                    )}
                    {content.content && (
                      <>
                        {content.subheader && (
                          <ListSubheader disableSticky={false} key={index} sx={subHeaderStyle}>
                            {content.subheader}
                          </ListSubheader>
                        )}
                        <List sx={{ position: 'relative', width: '100%', padding: 0 }}>
                          {content.content.map((subContent, index) => (
                            <Box key={index} sx={{ flexWrap: 'wrap', width: '100%', padding: 0, mt: 1 }}>
                              {subContent.subheader && (
                                <ListSubheader sx={subSubHeaderStyle}>
                                  {subContent.subheader}
                                </ListSubheader>
                              )}
                              <List sx={{ width: '100%', padding: '8px 16px' }}>
                                {subContent.content?.map((paragraph, pIndex) => (
                                  <ListItem key={pIndex} sx={{ padding: '4px 0' }}>{paragraph}</ListItem>
                                ))}
                              </List>
                            </Box>
                          ))}
                        </List>
                      </>
                    )}
                  </Box>
                ))}
              </List>
            </Box>
          ))}
      </List>
    </Container>
  );
}

export default Schedule;