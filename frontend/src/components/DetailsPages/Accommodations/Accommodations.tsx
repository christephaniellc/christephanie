import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Stack,
  alpha,
  useTheme,
  Card,
  CardMedia,
  CardContent,
  Button,
  Chip,
  Grid,
  ButtonBase,
  Link,
} from '@mui/material';
import { useAppLayout } from '@/context/Providers/AppState/useAppLayout';
import { StephsActualFavoriteTypography, StephsActualFavoriteTypographyBackNext, StephsActualFavoriteTypographyNoDrop } from '@/components/AttendanceButton/AttendanceButton';
import { DirectionsBus, NoTransfer, OpenInNew, HotelOutlined, Star } from '@mui/icons-material';
import RatingComponent from '@/components/RatingComponent/RatingComponent';
import PlaceIcon from '@mui/icons-material/Place';

// Import images directly
import brunswickHotel from '@/assets/holiday-inn-express-brunswick.jpg';
import charlestownHotel from '@/assets/holiday-inn-express-charlestown.jpg';

interface AccommodationsProps {
  handleTabLink: (to: string) => void;
}

const Accommodations: React.FC<AccommodationsProps> = ({ handleTabLink }) => {
  const { contentHeight } = useAppLayout();
  const theme = useTheme();
  // Create an array to track expanded state of each hotel
  const [expandedHotels, setExpandedHotels] = React.useState<boolean[]>([true, true, true]);

  const handleMapNewWindow = (locationKey: string) => {
    const addressMap: Record<string, string> = {
      venue: 'Stone Manor Boutique Inn, Lovettsville, VA',
      hotelBrunswick: '1501 Village Green Way, Brunswick, MD 21716',
      hotelCharlestown: '681 Flowing Springs Rd, Ranson, WV 25438',
      //airport: 'PDX, Portland International Airport',
    };

      const address = addressMap[locationKey];
      if (!address) {
        console.error(`Unknown location key: ${locationKey}`);
        return;
      }
    
      const query = encodeURIComponent(address);
      const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
      window.open(url, '_blank');
    };

  const handleToggleHotelDetails = (index: number) => {
    const newExpandedHotels = [...expandedHotels];
    newExpandedHotels[index] = !newExpandedHotels[index];
    setExpandedHotels(newExpandedHotels);
  };

  const getImageSrc = (imagePath: string | undefined) => {
    if (!imagePath) return '';
    
    // Use the imported images based on the path
    if (imagePath.includes('brunswick')) {
      return brunswickHotel;
    } else if (imagePath.includes('charlestown')) {
      return charlestownHotel;
    }
    
    return imagePath;
  };

  const hotelOptions = [
    {
      name: 'Holiday Inn Express Suites - Brunswick, MD',
      image: '.../assets/holiday-inn-express-brunswick.jpg',
      address: '1501 Village Green Way, Brunswick, MD 21716',
      url: 'https://www.ihg.com/holidayinnexpress/hotels/us/en/brunswick/hgrbw/hoteldetail',
      urlText: 'Hotel Website',
      googleRating: 4.6,
      phoneNumber: "(301) 969-8020",
      numberOfRatings: 195,
      hotelQuality: 3,
      onShuttleRoute: true,
      driveMinsFromWedding: 18,
      hotelBlock: false,
      bookingNotes: [
        "This hotel does not do formal wedding blocks, but they will give you a discount if you call and ask for the 'wedding rate.'",
        "No pets allowed."
      ]
    },
    {
      name: 'Holiday Inn Express Charles Town, Ranson, WV',
      image: '.../assets/holiday-inn-express-charlestown.jpg',
      address: '681 Flowing Springs Rd, Ranson, WV 25438',
      url: 'https://www.ihg.com/holidayinnexpress/hotels/us/en/ranson/cwvsr/hoteldetail',
      urlText: 'Hotel Website',
      googleRating: 4.5,
      phoneNumber: "(304) 725-1330",
      numberOfRatings: 755,
      hotelQuality: 2,
      onShuttleRoute: true,
      driveMinsFromWedding: 23,
      hotelBlock: true,
      bookingNotes: [
        "We have reserved a block of hotel rooms here: call and ask for the 'Stubler Wedding block rate.'",
        "Pet friendly."
      ]
    },
    {
      name: 'Lovettsville Area Hotels',
      image: undefined,
      url: 'https://www.google.com/search?q=hotels+near+stone+manor+inn+lovettsville+va',
      urlText: 'Google Search',
      googleRating: 0,
      phoneNumber: undefined,
      numberOfRatings: 0,
      hotelQuality: 0,
      onShuttleRoute: false,
      driveMinsFromWedding: 0,
      hotelBlock: false,
      bookingNotes: 
      [
        "Search for hotels in Lovettsville, VA and surrounding areas like Purcellville and Leesburg"
      ]
    },
  ];

  return (
    <Container
      sx={{
        width: '100%',
        height: contentHeight,
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        paddingBottom: '80px', // Added padding to ensure content doesn't get hidden behind BottomNav
      }}
    >
      <Box
        my={2}
        sx={{
          width: '100%',
          px: 2,
          mt: 2,
          pb: 2,
          zIndex: 5,
        }}
      >
        <StephsActualFavoriteTypography
          variant="h4"
          sx={{
            textAlign: 'center',
            mt: 2,
            fontSize: { xs: '1.8rem', sm: '2rem', md: '2.2rem' },
          }}
        >
          Accommodations
        </StephsActualFavoriteTypography>

        <Box sx={{
                width: '100%',
                display: 'flex',
                textAlign: 'center',
                border: '1px dotted orange'
              }}>
              <Typography variant="body1" sx={{ 
                mt: 2, 
                textAlign: 'center',
                width: '100%'
                }}>
              We've partnered with some convenient lodging options to make your trip to our wedding as comfortable as possible. 
              <br />
              <br />
              Our wedding venue:
              <Box sx={{ mt: 2 }}>
                <ButtonBase
                  onClick={() => handleMapNewWindow('venue')}
                  sx={{
                    color: theme.palette.secondary.main,
                    display: 'inline-flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    px: 2,
                    pb: 1.5,
                    borderRadius: 2,
                    fontSize: '1.1rem',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.05)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <PlaceIcon fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography variant="h6" component="span" sx={{ fontWeight: 'bold', color: 'inherit' }}>
                      Stone Manor Boutique Inn
                    </Typography>
                    <OpenInNew fontSize="small" sx={{ ml: 0.5 }} />
                  </Box>
                  <Typography variant="body2" component="span" sx={{ color: 'inherit' }}>
                    13193 Mountain Rd, Lovettsville, VA 20180
                  </Typography>
                </ButtonBase>
              </Box>
          </Typography>
        </Box>
      </Box>

      <Stack
        display="flex"
        width="100%"
        my="auto"
        justifyContent="center"
        alignItems="center"
        px={2}
      >
        <Paper
          elevation={5}
          sx={{
            backdropFilter: 'blur(20px)',
            backgroundColor: 'rgba(0,0,0,.1)',
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            overflow: 'hidden',
          }}
        >     
          
          {/* Hotel options list */}
          <Stack
            spacing={1}
            sx={{
              p: 1,
              width: '100%',
            }}
          >
            {hotelOptions.map((hotel, index) => (
              <Paper
                key={index}
                elevation={1}
                sx={{
                  overflow: 'hidden',
                  backgroundColor: 'rgba(0,0,0,.4)',
                  width: '100%',
                }}
              >
                <Button
                  fullWidth
                  variant="text"
                  color="secondary"
                  sx={{
                    justifyContent: 'space-between',
                    textAlign: 'left',
                    py: 1,
                    px: 2,
                    borderRadius: 0,
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,.05)',
                    }
                  }}
                  endIcon={<OpenInNew />}
                  startIcon={<HotelOutlined />}
                  onClick={() => handleToggleHotelDetails(index)}
                >
                  <Box display="flex" alignItems="center" justifyContent="space-between" width="1">
                    <Box display="flex" alignItems="center">
                      <Typography
                        component="span"
                        variant="subtitle1"
                        sx={{
                          fontWeight: 'bold',
                          textAlign: 'left',
                          mr: 1,
                        }}
                      >
                        {hotel.name}
                      </Typography>
                      {hotel.googleRating > 0 && (
                        <Box display="flex" alignItems="center">
                          <Star sx={{ color: 'secondary.main', fontSize: '1rem', mr: 0.3 }} />
                          <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                            {hotel.googleRating}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    
                    {hotel.onShuttleRoute && (
                      <Chip
                        icon={<DirectionsBus sx={{ color: 'primary.contrastText', fontSize: '1rem' }} />}
                        label="Shuttle"
                        size="small"
                        sx={{ backgroundColor: 'primary.main', color: 'primary.contrastText', fontWeight: 'bold' }}
                      />
                    )}
                  </Box>
                </Button>
                
                {/* Expanded hotel details */}
                {expandedHotels[index] && (
                  <Box sx={{ p: 2 }}>
                    <Card sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      backgroundColor: 'rgba(0,0,0,0.4)',
                      borderRadius: 2,
                    }}>
                      {/* Hotel Image */}
                      {hotel.image && (
                        <CardMedia
                          component="img"
                          image={getImageSrc(hotel.image)}
                          alt={hotel.name}
                          sx={{ 
                            height: 140, 
                            objectFit: 'cover',
                          }}
                        />
                      )}
                      
                      <CardContent sx={{ flex: 1, p: 2 }}>
                        {/* Hotel name */}
                        <Box
                          sx={{
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'space-between'
                          }}
                          >
                          <Typography variant="h6" component="h2" gutterBottom>
                            {hotel.name}
                          </Typography>
                          
                          {/* Rating */}
                          {hotel.googleRating > 0 && (
                            <Box sx={{ mb: 2 }}>
                              <RatingComponent
                                score={hotel.googleRating}
                                numberOfRatings={hotel.numberOfRatings}
                              />
                            </Box>
                          )}

                          {/* Link */}
                          <Button
                            variant="outlined"
                            color="secondary"
                            size="small"
                            endIcon={<OpenInNew />}
                            onClick={() => window.open(`${hotel.url}`)}
                            sx={{ mt: 1, alignSelf: 'flex-start' }}
                          >
                            {hotel.urlText}
                          </Button>
                        </Box>
                        
                        <Stack spacing={0.4}>
                          {/* Phone number */}
                          {hotel.phoneNumber && (
                            <StephsActualFavoriteTypographyNoDrop variant="body2">
                              <Box component="span" 
                              sx={{ 
                                color: theme.palette.primary.light, 
                                fontWeight: 'bold', 
                                fontSize: '1.2rem' 
                                }}>
                                Phone:
                              </Box>{' '}
                              <Box component="span" sx={{ color: '#FFFFFF' }}>
                                {hotel.phoneNumber}
                              </Box>
                            </StephsActualFavoriteTypographyNoDrop>
                          )}
                          
                          {/* Drive time */}
                          {hotel.driveMinsFromWedding > 0 && (                            
                            <StephsActualFavoriteTypographyNoDrop variant="body2">
                              <Box component="span" 
                              sx={{ 
                                color: theme.palette.primary.light, 
                                fontWeight: 'bold', 
                                fontSize: '1.2rem' 
                                }}>
                                Drive time to venue:
                              </Box>{' '}
                              <Box component="span" sx={{ color: '#FFFFFF' }}>
                              {hotel.driveMinsFromWedding} minutes
                              </Box>
                            </StephsActualFavoriteTypographyNoDrop>
                          )}
                          
                          {/* Notes */}
                          {hotel.bookingNotes && hotel.bookingNotes.length > 0 && (
                            <Box sx={{ mt: 2 }}>
                              <StephsActualFavoriteTypographyNoDrop variant="body2">
                                <Box
                                  component="span"
                                  sx={{
                                    color: theme.palette.primary.light,
                                    fontWeight: 'bold',
                                    fontSize: '1.2rem',
                                  }}
                                >
                                  Booking notes:
                                </Box>
                              </StephsActualFavoriteTypographyNoDrop>

                              <Box sx={{ ml: 2, mt: 0.5, mb: 5 }}>
                                {hotel.bookingNotes.map((note, idx) => (
                                  <Box
                                    key={idx}
                                    sx={{
                                      color: '#FFFFFF',
                                      fontFamily: 'Arial',
                                      fontSize: '0.95rem',
                                      mb: 0.5,
                                    }}
                                  >
                                    {note}
                                  </Box>
                                ))}
                              </Box>
                            </Box>
                          )}
                          
                          {/* Shuttle info */}
                          {hotel.onShuttleRoute ? (
                            <Chip
                              icon={<DirectionsBus />}
                              label="Shuttle to Venue Available"
                              color="primary"
                              size="small"
                              sx={{ alignSelf: 'flex-start', mt: 1 }}
                            />
                          ) : (
                            <Chip
                              icon={<NoTransfer />}
                              label="No Shuttle Service"
                              color="error"
                              variant="outlined"
                              size="small"
                              sx={{ alignSelf: 'flex-start', mt: 1 }}
                            />
                          )}                         
                          
                        </Stack>
                      </CardContent>
                    </Card>
                  </Box>
                )}
              </Paper>
            ))}
          </Stack>
        </Paper>
      </Stack>

      {/* Additional Information Section */}
      <Box mt={4} mb={8} px={2}>
        <Paper
          elevation={5}
          sx={{
            backdropFilter: 'blur(20px)',
            backgroundColor: 'rgba(0,0,0,.1)',
            p: 3,
          }}
        >
          <Typography variant="h5" color="secondary" gutterBottom>
            Transportation Information
          </Typography>
          
          <Typography variant="body1" paragraph>
            For those staying at our partner hotels, we'll be providing a shuttle service to and from the wedding venue.
          </Typography>
          
          <Typography variant="h6" gutterBottom>
            Shuttle Schedule:
          </Typography>
          
          <Typography component="div" variant="body2">
            <ul>
              <li>Pick-up from Holiday Inn Express Brunswick: 4:00pm and 5:00pm</li>
              <li>Pick-up from Holiday Inn Express Charles Town: 4:00pm and 5:00pm</li>
              <li>Return shuttles will run at 10:00pm and 11:00pm</li>
            </ul>
          </Typography>
          
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Alternative Transportation Options:
          </Typography>
          
          <Typography component="div" variant="body2">
            <ul>
              <li>Uber and Lyft are available in the area, but availability may be limited</li>
              <li>Local taxi services are available (we recommend booking in advance)</li>
              <li>We encourage carpooling with other guests when possible</li>
            </ul>
          </Typography>
          
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Questions?
          </Typography>
          
          <Typography variant="body2">
            If you have any questions about accommodations or transportation, please contact us at:<br />
            <strong>hosts@wedding.christephanie.com</strong>
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default Accommodations;