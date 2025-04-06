import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import React, { useEffect } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { Card, CardContent, Divider, Link, ListSubheader } from '@mui/material';
import { useAppLayout } from '@/context/Providers/AppState/useAppLayout';
import { StephsActualFavoriteTypography, themePaletteToRgba } from '@/components/AttendanceButton/AttendanceButton';
import { useTheme } from '@mui/material/styles';

interface TravelProps {
  handleTabLink: (to: string) => void;
}

function Travel({handleTabLink}: TravelProps) {
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

  const accommodationsLink = (
    <Link onClick={() => handleTabLink('accommodations')}>
      accommodations page
    </Link>
  );

  const travelItems: {
    [key: string]: {
      subheader: string;
      content: { subheader: string; content?: { subheader: string; content: (string | JSX.Element)[] }[] }[];
    };
  } = {
    titleTravel: {
      subheader: 'Travel Information',
      content: [
        {
          subheader:
            'We\'ve put together this guide to help you plan your trip to our wedding. Below you\'ll find information about getting to Brunswick, Maine, navigating the area, and what to expect when you arrive.',
        },
      ],
    },
    gettingThere: {
      subheader: 'Getting to Brunswick',
      content: [
        {
          subheader: '',
          content: [
            {
              subheader: 'By Air:',
              content: [
                'The closest airport is Portland International Jetport (PWM), about 30 minutes from Brunswick.',
                'Boston Logan International Airport (BOS) is about 2.5 hours from Brunswick and typically offers more flight options.',
                'We recommend renting a car at either airport for the most flexibility during your stay.'
              ],
            },
            {
              subheader: 'By Train:',
              content: [
                'Amtrak\'s Downeaster train serves Brunswick directly, with several daily trips from Boston.',
                'The Brunswick train station is located in downtown Brunswick, within walking distance of many restaurants and shops.',
                'Travel time from Boston is approximately 3 hours.'
              ],
            },
            {
              subheader: 'By Car:',
              content: [
                'Brunswick is located just off Interstate 295, about 30 minutes north of Portland, Maine.',
                'From Boston: Take I-95 North to I-295 North. Follow I-295 to Brunswick (Exit 28).',
                'From NYC: Take I-95 North through Connecticut, Rhode Island, Massachusetts and into Maine. Expect 6-7 hours of driving time.',
                'Parking is available at all recommended accommodation options.'
              ],
            }
          ],
        }
      ],
    },
    venueDirections: {
      subheader: 'Wedding Venue Information',
      content: [
        {
          subheader: 'The Barn at Autumn Lane',
          content: [
            {
              subheader: 'Address:',
              content: [
                '155 Autumn Lane, Brunswick, ME 04011'
              ],
            },
            {
              subheader: 'Directions from Downtown Brunswick:',
              content: [
                '1. Head east on Maine Street toward Bath Road',
                '2. Turn right onto Bath Road/Route 24',
                '3. After 3.5 miles, turn left onto Autumn Lane',
                '4. Continue to the end of the road where you\'ll find the venue',
                'Travel time from downtown: Approximately 10-12 minutes'
              ],
            }
          ],
        }
      ],
    },
    localTransportation: {
      subheader: 'Local Transportation',
      content: [
        {
          subheader:
            'Transportation options in Brunswick and the surrounding area:',
        },
        {
          subheader: '',
          content: [
            {
              subheader: 'Rental Cars:',
              content: [
                'Enterprise Rent-A-Car: Located in downtown Brunswick. (207-729-6464)',
                'Hertz: Available at Portland Jetport. (207-774-6364)',
                'Avis/Budget: Available at Portland Jetport. (207-775-5434)'
              ],
            },
            {
              subheader: 'Taxis & Ride Services:',
              content: [
                'Brunswick Taxi: Local taxi service. (207-729-3688)',
                'Uber & Lyft: Limited availability in Brunswick, more reliable in Portland.',
                'Mid Coast Limousine: For pre-arranged transportation. (207-443-8210)'
              ],
            },
            {
              subheader: 'Wedding Day Shuttle:',
              content: [
                'We will provide shuttle service between our recommended hotels and the venue. See the ' + accommodationsLink + ' for details.',
                'Shuttles will run from 3:00 PM until 11:30 PM on the wedding day.',
                'If you plan to drive yourself, please consider designating a driver or arranging transportation back to your accommodations.'
              ],
            }
          ],
        }
      ],
    },
    weatherInfo: {
      subheader: 'Weather Information',
      content: [
        {
          subheader:
            'Maine weather in September is typically very pleasant, but can be variable. Here\'s what to expect:',
        },
        {
          subheader: '',
          content: [
            {
              subheader: 'Typical Conditions:',
              content: [
                'Average high: 70°F (21°C)',
                'Average low: 50°F (10°C)',
                'Precipitation: Moderate chance of light rain',
                'Recommended: Bring layers, as evenings can be cool, and a light raincoat just in case'
              ],
            }
          ],
        }
      ],
    },
    contactInfo: {
      subheader: 'Travel Assistance',
      content: [
        {
          subheader:
            'If you need any assistance with your travel plans or have questions, please don\'t hesitate to reach out:',
        },
        {
          subheader: 'Email',
          content: [
            {
              subheader: '',
              content: [
                'travel@wedding.christephanie.com',
              ],
            },
          ],
        },
        {
          subheader: 'Emergency Contact (Day of Wedding)',
          content: [
            {
              subheader: '',
              content: [
                'Jordan (Best Man): (207) 555-1234',
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
          {travelItems.titleTravel.subheader}
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
          {travelItems.titleTravel.content[0].subheader}
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
        {/* Map Embed */}
        <Box
          sx={{ 
            flexWrap: 'wrap', 
            width: '100%',
            backgroundColor: 'rgba(0,0,0,.1)',
            padding: '16px',
            mb: 2,
          }}
        >
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Venue Location
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box
                component="iframe"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d11381.307986356357!2d-69.95323513238347!3d43.910803135726685!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4cb28a1b4d493e97%3A0x8fbea66e5fa60cbb!2sBrunswick%2C%20ME!5e0!3m2!1sen!2sus!4v1617391369978!5m2!1sen!2sus"
                width="100%"
                height="300"
                style={{
                  border: 0,
                  borderRadius: '4px',
                  marginBottom: '16px',
                }}
                allowFullScreen
                loading="lazy"
                title="Venue Location Map"
              />
              <Typography variant="body2" color="text.secondary">
                The Barn at Autumn Lane, 155 Autumn Lane, Brunswick, ME 04011
              </Typography>
            </CardContent>
          </Card>
        </Box>
        
        {/* Other Sections */}
        {Object.entries(travelItems)
          .slice(1)
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

export default Travel;