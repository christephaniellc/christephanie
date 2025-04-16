import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Stack,
  useTheme,
  Card,
  CardMedia,
  CardContent,
  Button,
  Chip,
  ButtonBase,
  Tabs,
  Tab,
} from '@mui/material';
import { useAppLayout } from '@/context/Providers/AppState/useAppLayout';
import { StephsActualFavoriteTypography, StephsActualFavoriteTypographyNoDrop } from '@/components/AttendanceButton/AttendanceButton';
import { DirectionsBus, NoTransfer, OpenInNew, HotelOutlined, Star, Apartment, CabinOutlined, BedroomParentOutlined } from '@mui/icons-material';
import RatingComponent from '@/components/RatingComponent/RatingComponent';
import PlaceIcon from '@mui/icons-material/Place';

// Import images directly
import brunswickHotel from '@/assets/holiday-inn-express-brunswick.jpg';
import charlestownHotel from '@/assets/holiday-inn-express-charlestown.jpg';
import camping from '@/assets/camping.jpg';

interface AccommodationsProps {
  handleTabLink: (to: string) => void;
}

// Interface for TabPanel props
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// TabPanel component for displaying tab content
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`accommodations-tabpanel-${index}`}
      aria-labelledby={`accommodations-tab-${index}`}
      {...other}
      style={{ width: '100%' }}
    >
      {value === index && (
        <Box sx={{ width: '100%', pt: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Helper function for tab accessibility props
function a11yProps(index: number) {
  return {
    id: `accommodations-tab-${index}`,
    'aria-controls': `accommodations-tabpanel-${index}`,
  };
}

const Accommodations: React.FC<AccommodationsProps> = ({ handleTabLink }) => {
  const { contentHeight } = useAppLayout();
  const theme = useTheme();
  const [tabIndex, setTabIndex] = React.useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  const handleMapNewWindow = (locationKey: string) => {
    const addressMap: Record<string, string> = {
      venue: 'Stone Manor Boutique Inn, Lovettsville, VA',
      hotelBrunswick: '1501 Village Green Way, Brunswick, MD 21716',
      hotelCharlestown: '681 Flowing Springs Rd, Ranson, WV 25438',
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

  const getImageSrc = (imagePath: string | undefined) => {
    if (!imagePath) return '';
    
    // Use the imported images based on the path
    if (imagePath.includes('brunswick')) {
      return brunswickHotel;
    } else if (imagePath.includes('charlestown')) {
      return charlestownHotel;
    } else if (imagePath.includes('camping')) {
      return camping;
    }
    
    return imagePath;
  };

  // Categorized hotels
  const partneredHotels = [
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
    }
  ];

  const alternativeAccommodations = [
    {
      name: 'Camping at the Wedding Venue',
      image: '.../assets/camping.jpg',
      address: '13193 Mountain Rd, Lovettsville, VA 20180',
      googleRating: 5,
      numberOfRatings: 0,
      driveMinsFromWedding: 0,
      onShuttleRoute: undefined,
      hotelBlock: false,
      bookingNotes: [
        "Camp with Steph, Topher, and other camping enthusiasts at our venue!",
        "We will have campsite space for you and your gear.",
        "(RV hookups not available, unfortunately)"
      ]
    }
  ];

  const otherOptions = [
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
        "Search for hotels in Lovettsville, VA and surrounding areas, like Purcellville and Leesburg"
      ]
    },
    {
      name: 'Lovettsville Area Airbnbs',
      image: undefined,
      url: 'https://www.airbnb.com/s/Lovettsville--VA/homes?refinement_paths%5B%5D=%2Fhomes&place_id=ChIJZeY72Y4etokRVVMaH1j87vo&location_bb=Qh0klMKbQp9CHQbywptMOw%3D%3D&acp_id=b1c524a2-360c-48a3-a81f-666d70428308&date_picker_type=calendar&checkin=2025-07-05&checkout=2025-07-06&search_type=autocomplete_click',
      urlText: 'Airbnb Search',
      googleRating: 0,
      phoneNumber: undefined,
      onShuttleRoute: false,
      hotelBlock: false,
      bookingNotes: 
      [
        "Search for AirBnbs in Lovettsville, VA and surrounding areas, like Purcellville and Leesburg"
      ]
    }
  ];

  // Helper function to render hotel card
  const renderHotelCard = (hotel: any) => (
    <Card sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      backgroundColor: 'rgba(0,0,0,0.4)',
      borderRadius: 2,
      mb: 2,
      height: '100%',
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
        {/* Hotel name and rating */}
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            mb: 1,
          }}
        >
          <Typography variant="h6" component="h2" sx={{ mr: 1 }}>
            {hotel.name}
          </Typography>
          
          {/* Rating */}
          {hotel.googleRating > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <RatingComponent
                score={hotel.googleRating}
                numberOfRatings={hotel.numberOfRatings}
              />
            </Box>
          )}
        </Box>

        {/* Address as clickable map link */}
        {hotel.address && (
          <Button
            variant="text"
            color="secondary"
            startIcon={<PlaceIcon />}
            size="small"
            onClick={() => {
              const query = encodeURIComponent(hotel.address);
              window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
            }}
            sx={{ mb: 1, textAlign: 'left', textTransform: 'none' }}
          >
            {hotel.address}
          </Button>
        )}
        
        {/* Phone number */}
        {hotel.phoneNumber && (
          <StephsActualFavoriteTypographyNoDrop variant="body2" sx={{ mb: 1 }}>
            <Box component="span" 
            sx={{ 
              color: theme.palette.primary.light, 
              fontWeight: 'bold',
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
          <StephsActualFavoriteTypographyNoDrop variant="body2" sx={{ mb: 1 }}>
            <Box component="span" 
            sx={{ 
              color: theme.palette.primary.light, 
              fontWeight: 'bold',
              }}>
              Drive time to venue:
            </Box>{' '}
            <Box component="span" sx={{ color: '#FFFFFF' }}>
            {hotel.driveMinsFromWedding} minutes
            </Box>
          </StephsActualFavoriteTypographyNoDrop>
        )}
        
        {/* Booking notes */}
        {hotel.bookingNotes && hotel.bookingNotes.length > 0 && (
          <Box sx={{ mt: 1, mb: 2 }}>
            <StephsActualFavoriteTypographyNoDrop variant="body2">
              <Box
                component="span"
                sx={{
                  color: theme.palette.primary.light,
                  fontWeight: 'bold',
                }}
              >
                Booking notes:
              </Box>
            </StephsActualFavoriteTypographyNoDrop>

            <Box sx={{ ml: 2, mt: 0.5 }}>
              {hotel.bookingNotes.map((note: string, idx: number) => (
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
        
        {/* Bottom section: Link button and Shuttle info */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mt: 'auto',
          pt: 1
        }}>
          {/* Website Link */}
          {hotel.url && (
            <Button
              variant="outlined"
              color="secondary"
              size="small"
              endIcon={<OpenInNew />}
              onClick={() => window.open(`${hotel.url}`)}
            >
              {hotel.urlText}
            </Button>
          )}
          
          {/* Shuttle info */}
          {hotel.onShuttleRoute ? (
            <Chip
              icon={<DirectionsBus />}
              label="Shuttle Available"
              color="primary"
              size="small"
            />
          ) : hotel.onShuttleRoute === undefined ? (
            <></>
          ) : (
            <Chip
              icon={<NoTransfer />}
              label="No Shuttle"
              color="error"
              variant="outlined"
              size="small"
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );

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
            <Box sx={{ mt: 1 }}>
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

      {/* Tabbed accommodation section */}
      <Box sx={{ 
        width: '100%', 
        px: { xs: 0, md: 2 }  // Remove padding on small and medium screens
      }}>
        <Paper
          elevation={5}
          sx={{
            backdropFilter: 'blur(20px)',
            backgroundColor: 'rgba(0,0,0,.2)',
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            overflow: 'hidden',
            borderRadius: { xs: 0, md: 2 }, // Remove border radius on small and medium screens
          }}
        >
          {/* Tabs navigation */}
          <Box sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            backgroundColor: 'rgba(0,0,0,.3)',
          }}>
            <Tabs
              value={tabIndex}
              onChange={handleTabChange}
              variant="fullWidth"
              textColor="secondary"
              indicatorColor="secondary"
              aria-label="Accommodation options tabs"
            >
              <Tab 
                icon={<HotelOutlined />} 
                label="Partner Hotels" 
                {...a11yProps(0)} 
                sx={{ 
                  fontWeight: 'bold',
                  '&.Mui-selected': {
                    color: theme.palette.secondary.main,
                  }
                }}
              />
              <Tab 
                icon={<CabinOutlined />} 
                label="Camping" 
                {...a11yProps(1)}
                sx={{ 
                  fontWeight: 'bold',
                  '&.Mui-selected': {
                    color: theme.palette.secondary.main,
                  }
                }}
              />
              <Tab 
                icon={<Apartment />} 
                label="Other Options" 
                {...a11yProps(2)}
                sx={{ 
                  fontWeight: 'bold', 
                  '&.Mui-selected': {
                    color: theme.palette.secondary.main,
                  }
                }}
              />
            </Tabs>
          </Box>

          {/* Tab content */}
          <Box sx={{ p: { xs: 1, md: 2 } }}>
            {/* Partner Hotels Tab */}
            <TabPanel value={tabIndex} index={0}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                These hotels provide special rates for our wedding guests and include shuttle service to and from the venue.
              </Typography>
              <Stack spacing={2}>
                {partneredHotels.map((hotel, index) => (
                  <Paper
                    key={`partner-${index}`}
                    elevation={1}
                    sx={{
                      overflow: 'hidden',
                      backgroundColor: 'rgba(0,0,0,.4)',
                    }}
                  >
                    {renderHotelCard(hotel)}
                  </Paper>
                ))}
              </Stack>
            </TabPanel>

            {/* Camping Tab */}
            <TabPanel value={tabIndex} index={1}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                For the adventurous souls, we're offering camping options right at the wedding venue!
              </Typography>
              <Stack spacing={2}>
                {alternativeAccommodations.map((option, index) => (
                  <Paper
                    key={`camping-${index}`}
                    elevation={1}
                    sx={{
                      overflow: 'hidden',
                      backgroundColor: 'rgba(0,0,0,.4)',
                    }}
                  >
                    {renderHotelCard(option)}
                  </Paper>
                ))}
              </Stack>
            </TabPanel>

            {/* Other Options Tab */}
            <TabPanel value={tabIndex} index={2}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                The Lovettsville area offers many other accommodation options within easy driving distance.
              </Typography>
              <Stack spacing={2}>
                {otherOptions.map((option, index) => (
                  <Paper
                    key={`other-${index}`}
                    elevation={1}
                    sx={{
                      overflow: 'hidden',
                      backgroundColor: 'rgba(0,0,0,.4)',
                    }}
                  >
                    {renderHotelCard(option)}
                  </Paper>
                ))}
              </Stack>
            </TabPanel>
          </Box>
        </Paper>
      </Box>

      {/* Transportation Information Section */}
      <Box mt={4} mb={8} px={{ xs: 0, md: 2 }}>
        <Paper
          elevation={5}
          sx={{
            backdropFilter: 'blur(20px)',
            backgroundColor: 'rgba(0,0,0,.1)',
            p: { xs: 2, md: 3 },
            borderRadius: { xs: 0, md: 2 },
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