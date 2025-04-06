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
            'We\'ve put together this guide to help you plan your trip to our wedding. Below you\'ll find information about getting to Lovettsville, Virginia, navigating the area, and what to expect when you arrive.',
        },
      ],
    },
    gettingThere: {
      subheader: 'Getting to Lovettsville',
      content: [
        {
          subheader: '',
          content: [
            {
              subheader: 'By Air:',
              content: [
                'The closest airport is Dulles International Airport (IAD), about 45 minutes from Lovettsville.',
                'Reagan National Airport (DCA) is about 1.5 hours from Lovettsville.',
                'Baltimore-Washington International Airport (BWI) is about 1.5 hours from Lovettsville.',
                'We recommend renting a car at any of these airports for the most flexibility during your stay.'
              ],
            },
            {
              subheader: 'By Train:',
              content: [
                'Amtrak serves the DC area with stations in Washington DC, Alexandria, and other locations.',
                'The closest Amtrak station is Harpers Ferry, WV, about 20 minutes from Lovettsville.',
                'You will need to arrange transportation from the train station to Lovettsville.'
              ],
            },
            {
              subheader: 'By Car:',
              content: [
                'Lovettsville is located in northern Virginia, about 15 miles north of Leesburg.',
                'From DC: Take Route 7 West to Route 9 North, then to Route 287 North to Lovettsville.',
                'From Baltimore: Take I-70 West to US-340 West, then to Route 17 South to Lovettsville.',
                'Parking is available at all recommended accommodation options and at the venue.'
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
          subheader: 'Stone Manor Inn',
          content: [
            {
              subheader: 'Address:',
              content: [
                '13193 Mountain Rd, Lovettsville, VA 20180'
              ],
            },
            {
              subheader: 'Directions from Leesburg:',
              content: [
                '1. Head north on US-15 N',
                '2. Take Route 690 West to Lovettsville',
                '3. Turn right onto Mountain Road',
                '4. Stone Manor Inn will be on your right',
                'Travel time from Leesburg: Approximately 25-30 minutes'
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
            'Transportation options in Lovettsville and the surrounding area:',
        },
        {
          subheader: '',
          content: [
            {
              subheader: 'Rental Cars:',
              content: [
                'Enterprise Rent-A-Car: Available at all major airports. (1-800-261-7331)',
                'Hertz: Available at all major airports. (1-800-654-3131)',
                'Avis/Budget: Available at all major airports.'
              ],
            },
            {
              subheader: 'Taxis & Ride Services:',
              content: [
                'Uber & Lyft: Available in Leesburg and surrounding areas.',
                'Local taxi services are available but may need to be booked in advance.',
                'We recommend arranging transportation ahead of time if not using the shuttle service.'
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
            'Northern Virginia weather in July is typically warm and humid. Here\'s what to expect:'
        },
        {
          subheader: '',
          content: [
            {
              subheader: 'Typical Conditions:',
              content: [
                'Average high: 87°F (31°C)',
                'Average low: 68°F (20°C)',
                'Humidity: Usually high',
                'Precipitation: Possibility of afternoon thunderstorms',
                'Recommended: Light, breathable clothing and maybe a light jacket for the evening'
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
                'Jordan (Best Man): (703) 555-1234',
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
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12383.86570043533!2d-77.64746721193069!3d39.269444801101574!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89b606193970ec5d%3A0x2c2c11c2aeded12c!2sStone%20Manor%20Boutique%20Inn!5e0!3m2!1sen!2sus!4v1704496957511!5m2!1sen!2sus"
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
                Stone Manor Inn, 13193 Mountain Rd, Lovettsville, VA 20180
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