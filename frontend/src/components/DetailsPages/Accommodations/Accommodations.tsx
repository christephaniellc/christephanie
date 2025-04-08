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
} from '@mui/material';
import { useAppLayout } from '@/context/Providers/AppState/useAppLayout';
import { StephsActualFavoriteTypography } from '@/components/AttendanceButton/AttendanceButton';
import { DirectionsBus, NoTransfer, OpenInNew, HotelOutlined, Star } from '@mui/icons-material';
import RatingComponent from '@/components/RatingComponent/RatingComponent';

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

  // Hotel data from CampingPreferences
  const hotelOptions = [
    {
      name: 'Holiday Inn Express Suites - Brunswick, MD',
      image: '.../assets/holiday-inn-express-brunswick.jpg',
      googleRating: 4.6,
      phoneNumber: "(301) 969-8020",
      numberOfRatings: 195,
      hotelQuality: 3,
      onShuttleRoute: true,
      driveMinsFromWedding: 18,
      hotelBlock: false,
      bookingNote: "This hotel does not do formal wedding blocks, but they will give you a discount if you ask for the 'wedding rate'"
    },
    {
      name: 'Holiday Inn Express Charles Town, Ranson, WV',
      image: '.../assets/holiday-inn-express-charlestown.jpg',
      googleRating: 4.5,
      phoneNumber: "(304) 725-1330",
      numberOfRatings: 755,
      hotelQuality: 2,
      onShuttleRoute: true,
      driveMinsFromWedding: 23,
      hotelBlock: true,
      bookingNote: "We have reserved a block of hotel rooms here: ask for the 'Stubler Wedding block rate'"
    },
    {
      name: 'Lovettsville Area Hotels',
      image: undefined,
      googleRating: 0,
      phoneNumber: undefined,
      numberOfRatings: 0,
      hotelQuality: 0,
      onShuttleRoute: false,
      driveMinsFromWedding: 0,
      hotelBlock: false,
      bookingNote: "Search for hotels in Lovettsville, VA and surrounding areas like Purcellville and Leesburg"
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
            fontSize: '2rem',
          }}
        >
          Accommodations
        </StephsActualFavoriteTypography>

        <Typography variant="body1" sx={{ mt: 2, textAlign: 'center' }}>
          We've arranged some convenient lodging options to make your trip to our wedding as comfortable as possible. 
          The wedding venue is located in Lovettsville, Virginia.
        </Typography>
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
          <Box sx={{ 
            p: 2, 
            pb: 1, 
            background: alpha(theme.palette.background.paper, 0.9),
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` 
          }}>
            <Typography 
              variant="h6" 
              fontWeight="500" 
              color="secondary"
            >
              Hotel options: click each for more info
            </Typography>
          </Box>    
          
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
                        
                        <Stack spacing={1.5}>
                          {/* Phone number */}
                          {hotel.phoneNumber && (
                            <Typography variant="body2">
                              <strong>Phone:</strong> {hotel.phoneNumber}
                            </Typography>
                          )}
                          
                          {/* Drive time */}
                          {hotel.driveMinsFromWedding > 0 && (
                            <Typography variant="body2">
                              <strong>Drive time to venue:</strong> {hotel.driveMinsFromWedding} minutes
                            </Typography>
                          )}
                          
                          {/* Rate info */}
                          {hotel.bookingNote && (
                            <Typography variant="body2" color="primary.light">
                              <span style={{ color: "#FFFFFF" }}><strong>Booking note:</strong></span><br/>
                              {hotel.bookingNote}
                            </Typography>
                          )}
                          
                          {/* Shuttle info */}
                          {hotel.onShuttleRoute ? (
                            <Chip
                              icon={<DirectionsBus />}
                              label="Shuttle Available"
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
                          
                          {/* Google search button */}
                          <Button
                            variant="outlined"
                            color="secondary"
                            size="small"
                            endIcon={<OpenInNew />}
                            onClick={() => window.open(`https://www.google.com/search?q=${hotel.name}`)}
                            sx={{ mt: 1, alignSelf: 'flex-start' }}
                          >
                            Search on Google
                          </Button>
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
              <li>Pick-up from Holiday Inn Express Brunswick: 3:30pm and 4:00pm</li>
              <li>Pick-up from Holiday Inn Express Charles Town: 3:15pm and 3:45pm</li>
              <li>Return shuttles will run at 10:00pm, 10:30pm, and 11:00pm</li>
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
            <strong>accommodations@wedding.christephanie.com</strong>
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default Accommodations;