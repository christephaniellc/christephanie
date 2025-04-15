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
import { StephsActualFavoriteTypography, StephsActualFavoriteTypographyBackNext, StephsActualFavoriteTypographyNoDrop, StephsActualFavoriteTypographyStyleDrop } from '@/components/AttendanceButton/AttendanceButton';
import { DirectionsBus, NoTransfer, OpenInNew, HotelOutlined, Star } from '@mui/icons-material';
import RatingComponent from '@/components/RatingComponent/RatingComponent';
import PlaceIcon from '@mui/icons-material/Place';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

// Import images directly
import brunswickHotel from '@/assets/holiday-inn-express-brunswick.jpg';
import charlestownHotel from '@/assets/holiday-inn-express-charlestown.jpg';
import camping from '@/assets/camping.jpg';
import hotelIcon from '@/assets/holiday-inn-express-brunswick.jpg';
import airbnbIcon from '@/assets/airbnb.svg';
import otherHotelsIcon from '@/assets/pulpo_2rings.png';
import campingIcon from '@/assets/camping.svg';

interface AccommodationsProps {
  handleTabLink: (to: string) => void;
}

const Accommodations: React.FC<AccommodationsProps> = ({ handleTabLink }) => {
  const { contentHeight } = useAppLayout();
  const theme = useTheme();
  // Create an array to track expanded state of each hotel
  const [expandedHotels, setExpandedHotels] = React.useState<boolean[]>([true, true, true, true]);
  
  // Track which category of accommodations is selected
  const [selectedCategory, setSelectedCategory] = React.useState<string>('hotels');

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
  
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
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
        "This hotel does not do formal wedding blocks, but they will give you a discount if you call and ask for the \"wedding rate.\"",
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
        "We have reserved a block of hotel rooms here: call and ask for the \"Stubler Wedding block rate.\"",
        "Pet friendly."
      ]
    },
    {
      name: 'Camping at the Wedding Venue',
      image: '.../assets/camping.jpg',
      address: '13193 Mountain Rd, Lovettsville, VA 20180',
      driveMinsFromWedding: 0,
      onShuttleRoute: undefined,
      hotelBlock: false,
      bookingNotes: [
        "Camp (/glamp) with Steph, Topher, and other camping enthusiasts at our venue!",
        "We will have campsite space for you and your gear",
        "Fancy portable and indoor facilities on site",
        "Come early, celebrate Friday the 4th with fireworks and a BBQ dinner! (BYO booze, and wedding day camp breakfast)",
        "(RV hookups not available, unfortunately)"
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
        "Search for hotels in Lovettsville, VA and surrounding areas, like Purcellville and Leesburg"
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
        paddingBottom: { xs: '100px', sm: '80px' }, // Added more padding for mobile to ensure content doesn't get hidden behind BottomNav
        paddingX: { xs: 0, sm: 2 }, // Remove horizontal padding on mobile
      }}
    >
      <Box
        my={{ xs: 1, sm: 2 }}
        sx={{
          width: '100%',
          px: { xs: 1, sm: 2 },
          mt: { xs: 1, sm: 2 },
          pb: { xs: 1, sm: 2 },
          zIndex: 5,
        }}
      >
        <StephsActualFavoriteTypography
          variant="h4"
          sx={{
            textAlign: 'center',
            mt: { xs: 1, sm: 2 },
            fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2.2rem' },
          }}
        >
          Accommodations
        </StephsActualFavoriteTypography>

        <Box sx={{
                width: '100%',
                display: 'flex',
                textAlign: 'center',
              }}>
              <Typography 
                variant="body1" 
                sx={{ 
                  mt: { xs: 1, sm: 2 }, 
                  textAlign: 'center',
                  width: '100%',
                  fontSize: { xs: '0.9rem', sm: '1rem' }
                }}
              >
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
                    px: { xs: 1, sm: 2 },
                    pb: { xs: 1, sm: 1.5 },
                    borderRadius: 2,
                    fontSize: { xs: '0.9rem', sm: '1.1rem' },
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.05)',
                    },
                    width: { xs: '100%', sm: 'auto' }
                  }}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 0.5,
                    flexWrap: { xs: 'wrap', sm: 'nowrap' },
                    justifyContent: 'center'
                  }}>
                    <PlaceIcon fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography 
                      variant="h6" 
                      component="span" 
                      sx={{ 
                        fontWeight: 'bold', 
                        color: 'inherit',
                        fontSize: { xs: '1rem', sm: '1.15rem', md: '1.25rem' }
                      }}
                    >
                      Stone Manor Boutique Inn
                    </Typography>
                    <OpenInNew fontSize="small" sx={{ ml: 0.5 }} />
                  </Box>
                  <Typography 
                    variant="body2" 
                    component="span" 
                    sx={{ 
                      color: 'inherit',
                      fontSize: { xs: '0.8rem', sm: '0.9rem' } 
                    }}
                  >
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
        px={{ xs: 1, sm: 2 }}
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
          
          {/* Accommodation Category Selection */}
          <Box 
            sx={{ 
              p: { xs: 1, sm: 2 }, 
              display: 'flex', 
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: { xs: 1, sm: 2 },
              backgroundColor: 'rgba(0,0,0,.3)',
              borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <Paper
              elevation={3}
              onClick={() => handleCategoryChange('hotels')}
              sx={{
                width: { xs: '80px', sm: '120px', md: '150px' },
                height: { xs: '80px', sm: '120px', md: '150px' },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                backgroundColor: selectedCategory === 'hotels' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.5)',
                border: selectedCategory === 'hotels' ? `2px solid ${theme.palette.secondary.main}` : '2px solid transparent',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  transform: 'scale(1.05)'
                }
              }}
            >
             <HotelOutlined sx={{
              fontSize: { xs: '40px', sm: '54px', md: '64px' },
              color: theme.palette.primary.main
             }}/>
              <Typography variant="subtitle1" 
                align="center"
                color="secondary" 
                sx={{ 
                  fontWeight: 'bold',
                  lineHeight: '1.1rem',
                  mb: -2,
                  fontSize: { xs: '0.7rem', sm: '0.85rem', md: '1rem' }
                }}>
                Recommended Hotels
              </Typography>
            </Paper>

            <Paper
              elevation={3}
              onClick={() => handleCategoryChange('camping')}
              sx={{
                width: { xs: '80px', sm: '120px', md: '150px' },
                height: { xs: '80px', sm: '120px', md: '150px' },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                backgroundColor: selectedCategory === 'camping' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.5)',
                border: selectedCategory === 'camping' ? `2px solid ${theme.palette.secondary.main}` : '2px solid transparent',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  transform: 'scale(1.05)'
                }
              }}
            >
              <Box
                component="img"
                src={campingIcon}
                alt="Camping Icon"
                sx={{
                  width: { xs: '60px', sm: '80px', md: '100px' },
                  height: 'auto',
                  filter: 'invert(1)',
                }}
              />
              <Typography variant="subtitle1" 
                align="center" 
                color="secondary" 
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: { xs: '0.7rem', sm: '0.85rem', md: '1rem' }
                }}>
                Camping
              </Typography>
            </Paper>
            
            <Paper
              elevation={3}
              onClick={() => handleCategoryChange('airbnb')}
              sx={{
                width: { xs: '80px', sm: '120px', md: '150px' },
                height: { xs: '80px', sm: '120px', md: '150px' },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                backgroundColor: selectedCategory === 'airbnb' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.5)',
                border: selectedCategory === 'airbnb' ? `2px solid ${theme.palette.secondary.main}` : '2px solid transparent',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  transform: 'scale(1.05)'
                }
              }}
            >
              <Box
                component="img"
                src={airbnbIcon}
                alt="AirBnb Icon"
                sx={{
                  width: { xs: '40px', sm: '54px', md: '64px' },
                  height: { xs: '40px', sm: '54px', md: '64px' },
                  mb: 1
                }}
              />
              <Typography variant="subtitle1" 
                align="center" 
                color="secondary" 
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: { xs: '0.7rem', sm: '0.85rem', md: '1rem' }
                }}>
                AirBnb
              </Typography>
            </Paper>

            <Paper
              elevation={3}
              onClick={() => handleCategoryChange('other')}
              sx={{
                width: { xs: '80px', sm: '120px', md: '150px' },
                height: { xs: '80px', sm: '120px', md: '150px' },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                backgroundColor: selectedCategory === 'other' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.5)',
                border: selectedCategory === 'other' ? `2px solid ${theme.palette.secondary.main}` : '2px solid transparent',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  transform: 'scale(1.05)'
                }
              }}
            >
              <Box
                component="img"
                src={otherHotelsIcon}
                alt="Other Hotels Icon"
                sx={{
                  width: { xs: '40px', sm: '54px', md: '64px' },
                  height: { xs: '40px', sm: '54px', md: '64px' },
                  mb: 1
                }}
              />
              <Typography variant="subtitle1" 
                align="center" 
                color="secondary" 
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: { xs: '0.7rem', sm: '0.85rem', md: '1rem' }
                }}>
                Other Hotels
              </Typography>
            </Paper>
          </Box>
          
          {/* Hotel options list */}
          <Stack
            spacing={1}
            sx={{
              p: { xs: 1, sm: 1 },
              width: '100%',
            }}
          >
            {/* Filter accommodations based on selected category */}
          {(selectedCategory === 'hotels' ? hotelOptions.filter(h => h.name.includes('Holiday Inn')) :
            selectedCategory === 'camping' ? hotelOptions.filter(h => h.name.includes('Camping')) :
            selectedCategory === 'other' ? hotelOptions.filter(h => h.name.includes('Lovettsville Area Hotels')) :
            selectedCategory === 'airbnb' ? hotelOptions.filter(h => h.name.includes('Airbnb')) :
            hotelOptions).map((hotel, index) => (
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
                    py: { xs: 0.75, sm: 1 },
                    px: { xs: 1, sm: 2 },
                    borderRadius: 0,
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,.05)',
                    }
                  }}
                  endIcon={expandedHotels[index] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  startIcon={<HotelOutlined />}
                  onClick={() => handleToggleHotelDetails(index)}
                >
                  <Box display="flex" alignItems="center" justifyContent="space-between" width="1" flexWrap="wrap">
                    <Box display="flex" alignItems="center" width={{ xs: '100%', sm: 'auto' }} mb={{ xs: 0.5, sm: 0 }}>
                      <Typography
                        component="span"
                        variant="subtitle1"
                        sx={{
                          fontWeight: 'bold',
                          textAlign: 'left',
                          mr: 1,
                          fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
                        }}
                      >
                        {hotel.name}
                      </Typography>
                    </Box>
                    
                    {hotel.onShuttleRoute && (
                      <Chip
                        icon={<DirectionsBus sx={{ color: 'primary.contrastText', fontSize: { xs: '0.7rem', sm: '1rem' } }} />}
                        label="Shuttle"
                        size="small"
                        sx={{ 
                          backgroundColor: 'primary.main', 
                          color: 'primary.contrastText', 
                          fontWeight: 'bold',
                          fontSize: { xs: '0.65rem', sm: '0.75rem' },
                          height: { xs: '24px', sm: '32px' },
                        }}
                      />
                    )}
                  </Box>
                </Button>
                
                {/* Expanded hotel details */}
                {expandedHotels[index] && (
                  <Box sx={{ p: { xs: 1, sm: 2 } }}>
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
                            height: { xs: 100, sm: 140 }, 
                            objectFit: 'cover',
                          }}
                        />
                      )}
                      
                      <CardContent sx={{ flex: 1, p: { xs: 1.5, sm: 2 } }}>
                        {/* Hotel name and details - responsive layout */}
                        <Box
                          sx={{
                            width: '100%',
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            justifyContent: 'space-between',
                            alignItems: { xs: 'flex-start', sm: 'center' },
                            gap: { xs: 1, sm: 2 }
                          }}
                        >
                          <Typography 
                            variant="h6" 
                            component="h2" 
                            gutterBottom
                            sx={{
                              fontSize: { xs: '1rem', sm: '1.15rem', md: '1.25rem' },
                              mb: { xs: 0.5, sm: 1 }
                            }}
                          >
                            {hotel.name}
                          </Typography>
                          
                          <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                            {/* Rating */}
                            {hotel.googleRating > 0 && (
                              <Box sx={{ mb: { xs: 0.5, sm: 1 } }}>
                                <RatingComponent
                                  score={hotel.googleRating}
                                  numberOfRatings={hotel.numberOfRatings}
                                />
                              </Box>
                            )}

                            {/* Link */}
                            {hotel.url && (
                            <Button
                              variant="outlined"
                              color="secondary"
                              size="small"
                              endIcon={<OpenInNew />}
                              onClick={() => window.open(`${hotel.url}`)}
                              sx={{ 
                                mt: { xs: 0, sm: 1 }, 
                                fontSize: { xs: '0.7rem', sm: '0.8rem' },
                                padding: { xs: '2px 8px', sm: '6px 16px' }
                              }}
                            >
                              {hotel.urlText}
                            </Button>
                            )}
                          </Box>
                        </Box>
                        
                        <Stack spacing={0.4} mt={1}>
                          {/* Phone number */}
                          {hotel.phoneNumber && (
                            <StephsActualFavoriteTypographyNoDrop variant="body2">
                              <Box component="span" 
                              sx={{ 
                                color: theme.palette.primary.light, 
                                fontWeight: 'bold', 
                                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' }
                                }}>
                                Phone:
                              </Box>{' '}
                              <Box 
                                component="span" 
                                sx={{ 
                                  color: '#FFFFFF',
                                  fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' }
                                }}>
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
                                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' }
                                }}>
                                Drive time to venue:
                              </Box>{' '}
                              <Box 
                                component="span" 
                                sx={{ 
                                  color: '#FFFFFF',
                                  fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' }
                                }}>
                                {hotel.driveMinsFromWedding} minutes
                              </Box>
                            </StephsActualFavoriteTypographyNoDrop>
                          )}
                          
                          {/* Notes */}
                          {hotel.bookingNotes && hotel.bookingNotes.length > 0 && (
                            <Box sx={{ mt: 2 }}>
                              <StephsActualFavoriteTypographyNoDrop 
                                variant="body2" 
                                color={theme.palette.primary.dark}>
                                <Box
                                  component="span"
                                  sx={{
                                    color: theme.palette.secondary.main,
                                    fontWeight: 'bold',
                                    fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' }
                                  }}
                                >
                                  Notes:
                                </Box>
                              </StephsActualFavoriteTypographyNoDrop>

                              <Box sx={{ ml: 2, mt: 0.5, mb: 3 }}>
                                <ul>
                                {hotel.bookingNotes.map((note, idx) => (
                                  <Box
                                    key={idx}
                                    sx={{
                                      color: '#FFFFFF',
                                      fontFamily: 'Arial',
                                      fontSize: { xs: '0.8rem', sm: '0.9rem', md: '0.95rem' },
                                      mb: 0.5,
                                    }}
                                  >
                                    <li>{note}</li>
                                  </Box>
                                ))}
                                </ul>
                              </Box>
                            </Box>
                          )}
                          
                          {/* Shuttle info */}
                          {hotel.onShuttleRoute ? (
                            <Chip
                              icon={<DirectionsBus sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }} />}
                              label={
                                <Typography 
                                  variant="caption" 
                                  sx={{ 
                                    fontSize: { xs: '0.65rem', sm: '0.75rem' },
                                    whiteSpace: 'normal' 
                                  }}
                                >
                                  Shuttle to Venue Available, see schedule below
                                </Typography>
                              }
                              color="primary"
                              size="small"
                              sx={{ 
                                alignSelf: 'flex-start', 
                                mt: 1,
                                height: 'auto',
                                py: 0.5
                              }}
                            />
                          ) : hotel.onShuttleRoute === undefined ? (
                            <></>
                          )
                          :(
                            <Chip
                              icon={<NoTransfer sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }} />}
                              label={
                                <Typography 
                                  variant="caption" 
                                  sx={{ 
                                    fontSize: { xs: '0.65rem', sm: '0.75rem' } 
                                  }}
                                >
                                  No Shuttle Service
                                </Typography>
                              }
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
      <Box 
        mt={{ xs: 3, sm: 4 }} 
        mb={{ xs: 6, sm: 8 }} 
        px={{ xs: 1, sm: 2 }}
      >
        <Paper
          elevation={5}
          sx={{
            backdropFilter: 'blur(20px)',
            backgroundColor: 'rgba(0,0,0,.1)',
            p: { xs: 2, sm: 3 },
          }}
        >
          <StephsActualFavoriteTypographyNoDrop 
            variant="h5" 
            color="secondary" 
            gutterBottom
            sx={{
              fontSize: { xs: '1.25rem', sm: '1.5rem' }
            }}
          >
            Transportation Information
          </StephsActualFavoriteTypographyNoDrop>
          
          <Typography 
            variant="body1" 
            paragraph
            sx={{
              fontSize: { xs: '0.9rem', sm: '1rem' },
              mb: { xs: 1, sm: 2 }
            }}
          >
            For those staying at our partner hotels, we'll be providing a shuttle service to and from the wedding venue.
          </Typography>
          
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
              mt: { xs: 2, sm: 2 },
              mb: { xs: 0.5, sm: 1 }
            }}
          >
            Shuttle Schedule:
          </Typography>
          
          <Typography 
            component="div" 
            variant="body2"
            sx={{
              fontSize: { xs: '0.85rem', sm: '0.9rem' },
              '& ul': {
                pl: { xs: 2.5, sm: 4 },
                mb: { xs: 1.5, sm: 2 }
              },
              '& li': {
                mb: { xs: 1, sm: 0.5 }
              }
            }}
          >
            <ul>
              <li>Pick-up from Holiday Inn Express Brunswick:
                <Box component="span" 
                  sx={{ fontWeight: 'bold', 
                  color: theme.palette.secondary.main 
                }}> 4:00pm</Box> and 
                <Box component="span" 
                  sx={{ fontWeight: 'bold', 
                  color: theme.palette.secondary.main 
                }}> 5:00pm</Box>
              </li>
              <li>Pick-up from Holiday Inn Express Charles Town:
                <Box component="span" 
                  sx={{ fontWeight: 'bold', 
                  color: theme.palette.secondary.main 
                }}> 4:00pm</Box> and 
                <Box component="span" 
                  sx={{ fontWeight: 'bold', 
                  color: theme.palette.secondary.main 
                }}> 5:00pm</Box>
              </li>
              <li>Return shuttles (to both hotels) will run at 
                <Box component="span" 
                  sx={{ fontWeight: 'bold', 
                  color: theme.palette.secondary.main 
                }}> 10:00pm</Box> and 
                <Box component="span" 
                  sx={{ fontWeight: 'bold', 
                  color: theme.palette.secondary.main 
                }}> 11:00pm</Box>
              </li>
            </ul>
          </Typography>
          
          <Typography 
            variant="h6" 
            gutterBottom 
            sx={{ 
              mt: { xs: 2, sm: 2 },
              mb: { xs: 0.5, sm: 1 },
              fontSize: { xs: '1.1rem', sm: '1.25rem' }
            }}
          >
            Alternative Transportation Options:
          </Typography>
          
          <Typography 
            component="div" 
            variant="body2"
            sx={{
              fontSize: { xs: '0.85rem', sm: '0.9rem' },
              '& ul': {
                pl: { xs: 2.5, sm: 4 },
                mb: { xs: 1.5, sm: 2 }
              },
              '& li': {
                mb: { xs: 1, sm: 0.5 }
              }
            }}
          >
            <ul>
              <li>Uber and Lyft are available in the area, but availability may be limited</li>
              <li>Local taxi services are available (we recommend booking in advance)</li>
              <li>
                <Box component="span" 
                  sx={{ fontWeight: 'bold', 
                  color: theme.palette.secondary.main 
                }}>Venue parking is limited: We encourage carpooling with other guests when possible</Box>
              </li>
            </ul>
          </Typography>
          
          <Typography 
            variant="h6" 
            gutterBottom 
            sx={{ 
              mt: { xs: 2, sm: 2 },
              mb: { xs: 0.5, sm: 1 },
              fontSize: { xs: '1.1rem', sm: '1.25rem' }
            }}
          >
            Questions?
          </Typography>
          
          <Typography 
            variant="body2"
            sx={{
              fontSize: { xs: '0.85rem', sm: '0.9rem' },
              wordBreak: 'break-word'
            }}
          >
            If you have any questions about accommodations or transportation, please contact us at:<br />
            <Box component="span"
              sx={{
                color: theme.palette.secondary.main
              }}
            >
              <strong>hosts@wedding.christephanie.com</strong>
            </Box>
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default Accommodations;