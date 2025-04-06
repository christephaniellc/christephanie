import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import React, { useEffect } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { Button, Card, CardActions, CardContent, CardMedia, Grid, Link, ListSubheader } from '@mui/material';
import { useAppLayout } from '@/context/Providers/AppState/useAppLayout';
import { StephsActualFavoriteTypography, themePaletteToRgba } from '@/components/AttendanceButton/AttendanceButton';
import { useTheme } from '@mui/material/styles';

interface AccommodationsProps {
  handleTabLink: (to: string) => void;
}

function Accommodations({handleTabLink}: AccommodationsProps) {
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

  const accommodationsItems: {
    [key: string]: {
      subheader: string;
      content: { subheader: string; content?: { subheader: string; content: (string | JSX.Element)[] }[] }[];
    };
  } = {
    titleAccommodations: {
      subheader: 'Accommodations',
      content: [
        {
          subheader:
            'We\'ve arranged some convenient lodging options to make your trip to our wedding as comfortable as possible. Below you\'ll find information about our hotel room blocks and other accommodation options in the area.',
        },
      ],
    },
    hotelBlocks: {
      subheader: 'Hotel Room Blocks',
      content: [
        {
          subheader:
            'We\'ve reserved blocks of rooms at the following hotels for our wedding guests. When booking, please mention the "Steph & Topher Wedding" to receive our special group rate.',
        },
      ],
    },
    alternativeOptions: {
      subheader: 'Alternative Accommodations',
      content: [
        {
          subheader: '',
          content: [
            {
              subheader: 'Vacation Rentals:',
              content: [
                'Airbnb and VRBO have many options in Brunswick and surrounding areas.',
                'For larger families or groups, consider booking a house together for a more economical and communal experience.',
                'Most vacation rentals in the area are within a 15-20 minute drive to the wedding venue.'
              ],
            },
            {
              subheader: 'Bed & Breakfasts:',
              content: [
                'The Captain\'s House Inn - A charming historic B&B with excellent breakfast (207-555-1212)',
                'Harborview B&B - Coastal views and walking distance to downtown (207-555-2323)',
                'Brunswick Inn - Historic property in the heart of Brunswick (207-555-3434)'
              ],
            },
            {
              subheader: 'Camping Options:',
              content: [
                'Thomas Point Beach Campground - Beachfront camping with full facilities, 10 minutes from venue',
                'Winslow Memorial Park - Beautiful oceanfront camping, 20 minutes from venue',
                'Bradbury Mountain State Park - For the more adventurous, 30 minutes from venue'
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
            'For those staying at our partner hotels, we\'ll be providing a shuttle service to and from the wedding venue. The shuttle schedule will be posted in the hotel lobbies and included in your welcome packet.',
        },
        {
          subheader: '',
          content: [
            {
              subheader: 'Shuttle Service:',
              content: [
                'Pick-up from Holiday Inn Express Brunswick: 3:30pm and 4:00pm',
                'Pick-up from Holiday Inn Express Charlestown: 3:15pm and 3:45pm',
                'Return shuttles will run at 10:00pm, 10:30pm, and 11:00pm'
              ],
            },
            {
              subheader: 'Local Transportation Options:',
              content: [
                'Uber and Lyft are available in the Brunswick area, but may have limited availability',
                'Brunswick Taxi Service: 207-555-8787',
                'Maine Coastal Limo: 207-555-9898 (advance reservation required)'
              ],
            }
          ],
        }
      ],
    },
    contactInfo: {
      subheader: 'Questions?',
      content: [
        {
          subheader:
            'If you have any questions about accommodations or need assistance with your booking, please don\'t hesitate to contact us:',
        },
        {
          subheader: 'Email',
          content: [
            {
              subheader: '',
              content: [
                'accommodations@wedding.christephanie.com',
              ],
            },
          ],
        },
      ],
    }
  };
  
  // Hotel data
  const hotels = [
    {
      name: 'Holiday Inn Express Brunswick',
      image: '/src/assets/holiday-inn-express-brunswick.jpg',
      address: '185 Park Row, Brunswick, ME 04011',
      phone: '(207) 721-0006',
      price: '$159-189 per night',
      distance: '2 miles from venue',
      amenities: 'Free breakfast, pool, fitness center, free Wi-Fi',
      blockDetails: 'Group rate available until August 15, 2025',
      website: 'https://www.ihg.com/holidayinnexpress/hotels/us/en/brunswick/bwkme/hoteldetail',
      notes: 'This is our primary hotel block with the most rooms available. Located in downtown Brunswick with walking distance to shops and restaurants.',
    },
    {
      name: 'Holiday Inn Express Charlestown',
      image: '/src/assets/holiday-inn-express-charlestown.jpg',
      address: '110 Main Street, Charlestown, ME 04033',
      phone: '(207) 555-1234',
      price: '$139-169 per night',
      distance: '5 miles from venue',
      amenities: 'Free breakfast, indoor pool, fitness center, free Wi-Fi',
      blockDetails: 'Group rate available until August 1, 2025',
      website: 'https://www.ihg.com/holidayinnexpress',
      notes: 'Our secondary hotel option with a slightly lower price point. Newly renovated with comfortable rooms and convenient access to the highway.',
    }
  ];
  
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
          {accommodationsItems.titleAccommodations.subheader}
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
          {accommodationsItems.titleAccommodations.content[0].subheader}
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
        {/* Hotel Room Blocks Section */}
        <Box
          data-testid="list-item-hotelBlocks"
          sx={{ 
            flexWrap: 'wrap', 
            width: '100%',
            backgroundColor: 'rgba(0,0,0,.1)',
            padding: 0,
            mb: 2,
          }}
        >
          <ListSubheader sx={mainHeaderStyle}>
            {accommodationsItems.hotelBlocks.subheader}
          </ListSubheader>
          <Typography sx={{ padding: '16px 16px 0 16px' }}>
            {accommodationsItems.hotelBlocks.content[0].subheader}
          </Typography>
          
          {/* Hotel Cards */}
          <Grid container spacing={2} sx={{ padding: '16px' }}>
            {hotels.map((hotel, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={hotel.image}
                    alt={hotel.name}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="div">
                      {hotel.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {hotel.address}
                    </Typography>
                    <Typography variant="body2" component="div" sx={{ mt: 1 }}>
                      <strong>Price:</strong> {hotel.price}
                    </Typography>
                    <Typography variant="body2" component="div">
                      <strong>Distance:</strong> {hotel.distance}
                    </Typography>
                    <Typography variant="body2" component="div">
                      <strong>Amenities:</strong> {hotel.amenities}
                    </Typography>
                    <Typography variant="body2" component="div">
                      <strong>Block Details:</strong> {hotel.blockDetails}
                    </Typography>
                    <Typography variant="body2" component="div" sx={{ mt: 1 }}>
                      {hotel.notes}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" component="a" href={hotel.website} target="_blank" rel="noopener noreferrer">
                      Book Now
                    </Button>
                    <Button size="small" component="a" href={`tel:${hotel.phone}`}>
                      Call: {hotel.phone}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
        
        {/* Render other sections */}
        {Object.entries(accommodationsItems)
          .filter(([key]) => !['titleAccommodations', 'hotelBlocks'].includes(key))
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

export default Accommodations;