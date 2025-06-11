import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  Button, 
  Link, 
  Paper, 
  Grid, 
  IconButton, 
  Fade,
  alpha,
  Stack,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  CardMedia,
  Chip,
  Divider,
  useMediaQuery,
  ButtonGroup,
  ToggleButton,
  ToggleButtonGroup,
  MobileStepper,
} from '@mui/material';
import { useAppLayout } from '@/context/Providers/AppState/useAppLayout';
import { StephsActualFavoriteTypography } from '@/components/AttendanceButton/AttendanceButton';
import { useTheme } from '@mui/material/styles';
import { 
  FlightTakeoff, 
  DirectionsCar, 
  DirectionsBus,
  DirectionsWalk, 
  Train, 
  LocationOn, 
  PinDrop,
  Hotel, 
  LocalTaxi,
  Info,
  Navigation,
  OpenInNew,
  HotelOutlined,
  Star,
  NoTransfer,
  ArrowForward,
  ArrowBack,
  KeyboardArrowRight,
  KeyboardArrowLeft,
  Done,
} from '@mui/icons-material';
import RatingComponent from '@/components/RatingComponent/RatingComponent';

// Import images directly
import brunswickHotel from '@/assets/holiday-inn-express-brunswick.jpg';
import charlestownHotel from '@/assets/holiday-inn-express-charlestown.jpg';

interface TravelProps {
  handleTabLink: (to: string) => void;
}

function Travel({handleTabLink}: TravelProps) {
  const { contentHeight } = useAppLayout();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Current active step
  const [activeStep, setActiveStep] = useState(0);
  
  // Selected options state
  const [selectedTransportType, setSelectedTransportType] = useState<string | null>(null);
  const [selectedOrigin, setSelectedOrigin] = useState<string | null>(null);
  const [selectedLocalTransport, setSelectedLocalTransport] = useState<string | null>(null);
  const [selectedHotel, setSelectedHotel] = useState<number | null>(null);
  
  // Step completion state
  const [stepsCompleted, setStepsCompleted] = useState<boolean[]>([false, false, false, false]);
  
  // Hotel options
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
  
  // Transportation options
  const transportOptions = [
    { id: 'plane', name: 'Airplane', icon: <FlightTakeoff />, desc: 'For guests flying in' },
    { id: 'car', name: 'Car', icon: <DirectionsCar />, desc: 'For guests driving' },
    { id: 'train', name: 'Train', icon: <Train />, desc: 'For guests taking Amtrak' }
  ];

  // Origins based on selected transportation method
  const originOptions = {
    plane: [
      { id: 'iad', name: 'Dulles (IAD)', desc: 'Closest to venue (45 min)' },
      { id: 'dca', name: 'Reagan (DCA)', desc: 'In DC (1.5 hours)' },
      { id: 'bwi', name: 'Baltimore (BWI)', desc: 'Also 1.5 hours away' }
    ],
    car: [
      { id: 'dc', name: 'Washington DC', desc: 'About 1.5 hours' },
      { id: 'baltimore', name: 'Baltimore', desc: 'About 1.5 hours' },
      { id: 'other', name: 'Other Location', desc: 'Custom directions' }
    ],
    train: [
      { id: 'harpers', name: 'Harpers Ferry', desc: '20 min from venue' },
      { id: 'dc', name: 'Washington DC', desc: '1.5 hours from venue' }
    ]
  };

  // Local transport options
  const localTransportOptions = [
    { id: 'rental', name: 'Rental Car', icon: <DirectionsCar />, desc: 'Freedom to explore the area' },
    { id: 'taxi', name: 'Taxi/Rideshare', icon: <LocalTaxi />, desc: 'Easy point-to-point travel' },
    { id: 'shuttle', name: 'Wedding Shuttle', icon: <DirectionsBus />, desc: 'Available on wedding day only' },
    { id: 'family', name: 'Ride with Family', icon: <DirectionsWalk />, desc: 'Coordinate with relatives' }
  ];

  // Information about selected options
  const airportInfo = {
    iad: {
      name: 'Dulles International Airport (IAD)',
      distance: '45 minutes from venue',
      tips: [
        'Most convenient option with multiple rental car companies on-site',
        'Shuttle services available to Leesburg where you can get a taxi',
        'Best airport for international arrivals'
      ]
    },
    dca: {
      name: 'Reagan National Airport (DCA)',
      distance: '1.5 hours from venue',
      tips: [
        'Closest to downtown DC attractions if you plan to visit before/after',
        'Metro accessible but you\'ll still need a car to reach Lovettsville',
        'Smaller airport with fewer international flights'
      ]
    },
    bwi: {
      name: 'Baltimore-Washington International (BWI)',
      distance: '1.5 hours from venue',
      tips: [
        'Often has cheaper flights than the other options',
        'Good rental car availability and rates',
        'Consider traffic when planning your trip to the venue'
      ]
    }
  };

  const drivingDirections = {
    dc: [
      '1. Take Route 7 West from the DC area',
      '2. Continue to Route 9 North',
      '3. Take Route 287 North to Lovettsville',
      '4. Follow signs to Stone Manor Inn'
    ],
    baltimore: [
      '1. Take I-70 West from Baltimore',
      '2. Continue to US-340 West',
      '3. Take Route 17 South to Lovettsville',
      '4. Follow signs to Stone Manor Inn'
    ],
    other: [
      'Use your preferred navigation app to Stone Manor Inn',
      'Address: 13193 Mountain Rd, Lovettsville, VA 20180',
      'Call venue for assistance: (540) 822-3032'
    ]
  };

  const trainInfo = {
    harpers: {
      name: 'Harpers Ferry Station',
      tips: [
        'You will need transportation from Harpers Ferry to Lovettsville (20 min)',
        'Limited taxi service - arrange in advance',
        'Consider asking family members for pickup'
      ]
    },
    dc: {
      name: 'Washington DC Union Station',
      tips: [
        'You will need to arrange transportation to Lovettsville (1.5 hours)',
        'Rental cars available at Union Station',
        'Consider visiting DC attractions before heading to the wedding'
      ]
    }
  };

  const transportInfo = {
    rental: {
      tips: [
        'Enterprise, Hertz, Avis/Budget all available at airports',
        'Reservations recommended, especially during summer',
        'Provides flexibility to explore the area at your own pace',
        'Parking available at all hotels and the venue'
      ]
    },
    taxi: {
      tips: [
        'Uber & Lyft available in the region but can be limited in rural areas',
        'Consider scheduling pickup times in advance',
        'Local taxi services: Loudoun Yellow Cab (571) 321-0202',
        'More expensive option for the entire stay'
      ]
    },
    shuttle: {
      tips: [
        'Free shuttle service between recommended hotels and venue',
        'Saturday only: Shuttles run 3:00 PM - 11:30 PM',
        'See shuttle schedule below for detailed schedule',
        'You\'ll need alternative transportation for other days'
      ]
    },
    family: {
      tips: [
        'Coordinate with family members who have rental cars',
        'Great option for groups staying at the same hotel',
        'Share contact info with your ride in case plans change',
        'Consider a backup option just in case'
      ]
    }
  };

  // Handle option selection
  const handleTransportTypeChange = (event: React.MouseEvent<HTMLElement>, newType: string | null) => {
    setSelectedTransportType(newType);
    setSelectedOrigin(null); // Reset subsequent selections
    
    // Mark step as incomplete if selection is cleared
    const newStepsCompleted = [...stepsCompleted];
    newStepsCompleted[0] = !!newType;
    setStepsCompleted(newStepsCompleted);
  };

  const handleOriginChange = (event: React.MouseEvent<HTMLElement>, newOrigin: string | null) => {
    setSelectedOrigin(newOrigin);
    
    // Mark step as complete if both transport type and origin are selected
    const newStepsCompleted = [...stepsCompleted];
    newStepsCompleted[0] = !!(selectedTransportType && newOrigin);
    setStepsCompleted(newStepsCompleted);
  };

  const handleLocalTransportChange = (event: React.MouseEvent<HTMLElement>, newTransport: string | null) => {
    setSelectedLocalTransport(newTransport);
    
    // Mark step as complete when local transport is selected
    const newStepsCompleted = [...stepsCompleted];
    newStepsCompleted[1] = !!newTransport;
    setStepsCompleted(newStepsCompleted);
  };

  const handleHotelChange = (index: number) => {
    const newHotelSelection = selectedHotel === index ? null : index;
    setSelectedHotel(newHotelSelection);
    
    // Mark step as complete when hotel is selected
    const newStepsCompleted = [...stepsCompleted];
    newStepsCompleted[2] = newHotelSelection !== null;
    setStepsCompleted(newStepsCompleted);
  };

  // Handle step navigation
  const handleNext = () => {
    // Mark the current step as reviewed if it's the venue info step
    if (activeStep === 3) {
      const newStepsCompleted = [...stepsCompleted];
      newStepsCompleted[3] = true;
      setStepsCompleted(newStepsCompleted);
    }
    
    setActiveStep((prevActiveStep) => Math.min(prevActiveStep + 1, 3));
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => Math.max(prevActiveStep - 1, 0));
  };

  const handleStepChange = (step: number) => {
    setActiveStep(step);
  };

  // Render transport type details
  const renderTransportTypeDetails = () => {
    if (!selectedTransportType) return null;

    let details = null;
    if (selectedTransportType === 'plane') {
      details = (
        <Box>
          <Typography variant="h6" sx={{ mt: 2, mb: 1, color: theme.palette.secondary.main }}>Recommended Airports</Typography>
          <ToggleButtonGroup
            exclusive
            value={selectedOrigin}
            onChange={handleOriginChange}
            aria-label="airport selection"
            sx={{ flexWrap: 'wrap', mb: 2 }}
          >
            {originOptions.plane.map((airport) => (
              <ToggleButton 
                key={airport.id} 
                value={airport.id}
                aria-label={airport.name}
                sx={{
                  px: 2,
                  py: 1.5,
                  mr: 1,
                  mb: 1,
                  display: 'flex',
                  alignItems: 'center',
                  borderColor: alpha(theme.palette.primary.main, 0.3),
                  '&.Mui-selected': {
                    backgroundColor: alpha(theme.palette.secondary.main, 0.15),
                    borderColor: theme.palette.secondary.main,
                    color: theme.palette.secondary.main,
                  },
                }}
              >
                <Box>
                  <Typography variant="body1" fontWeight="bold">{airport.name}</Typography>
                  <Typography variant="body2">{airport.desc}</Typography>
                </Box>
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          
          {selectedOrigin && (
            <Fade in={true}>
              <Box sx={{ 
                mt: 2, 
                p: 2, 
                backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                borderRadius: '8px',
                border: `1px solid ${alpha(theme.palette.secondary.main, 0.3)}` 
              }}>
                <Typography variant="h6" gutterBottom>
                  {airportInfo[selectedOrigin].name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {airportInfo[selectedOrigin].distance}
                </Typography>
                <Typography variant="body2" fontWeight="bold" sx={{ mt: 1 }}>
                  Travel Tips:
                </Typography>
                <Box component="ul" sx={{ mt: 0.5, pl: 2 }}>
                  {airportInfo[selectedOrigin].tips.map((tip, i) => (
                    <Typography component="li" variant="body2" key={i} sx={{ mb: 0.5 }}>
                      {tip}
                    </Typography>
                  ))}
                </Box>
              </Box>
            </Fade>
          )}
        </Box>
      );
    } else if (selectedTransportType === 'car') {
      details = (
        <Box>
          <Typography variant="h6" sx={{ mt: 2, mb: 1, color: theme.palette.secondary.main }}>Driving From</Typography>
          <ToggleButtonGroup
            exclusive
            value={selectedOrigin}
            onChange={handleOriginChange}
            aria-label="driving origin selection"
            sx={{ flexWrap: 'wrap', mb: 2 }}
          >
            {originOptions.car.map((origin) => (
              <ToggleButton 
                key={origin.id} 
                value={origin.id}
                aria-label={origin.name}
                sx={{
                  px: 2,
                  py: 1.5,
                  mr: 1,
                  mb: 1,
                  display: 'flex',
                  alignItems: 'center',
                  borderColor: alpha(theme.palette.primary.main, 0.3),
                  '&.Mui-selected': {
                    backgroundColor: alpha(theme.palette.secondary.main, 0.15),
                    borderColor: theme.palette.secondary.main,
                    color: theme.palette.secondary.main,
                  },
                }}
              >
                <Box>
                  <Typography variant="body1" fontWeight="bold">{origin.name}</Typography>
                  <Typography variant="body2">{origin.desc}</Typography>
                </Box>
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          
          {selectedOrigin && (
            <Fade in={true}>
              <Box sx={{ 
                mt: 2, 
                p: 2, 
                backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                borderRadius: '8px',
                border: `1px solid ${alpha(theme.palette.secondary.main, 0.3)}` 
              }}>
                <Typography variant="h6" gutterBottom>
                  Driving Directions from {originOptions.car.find(o => o.id === selectedOrigin)?.name}
                </Typography>
                <Box component="ol" sx={{ mt: 1, pl: 3 }}>
                  {drivingDirections[selectedOrigin].map((direction, i) => (
                    <Typography component="li" variant="body2" key={i} sx={{ mb: 0.5 }}>
                      {direction}
                    </Typography>
                  ))}
                </Box>
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<Navigation />}
                  size="small"
                  sx={{ mt: 2 }}
                  onClick={() => window.open('https://www.google.com/maps/dir//Stone+Manor+Boutique+Inn,+13193+Mountain+Rd,+Lovettsville,+VA+20180/@39.2694448,-77.6474672,14z/data=!4m9!4m8!1m0!1m5!1m1!1s0x89b606193970ec5d:0x2c2c11c2aeded12c!2m2!1d-77.6257573!2d39.2725608!3e0')}
                >
                  Get Google Maps Directions
                </Button>
              </Box>
            </Fade>
          )}
        </Box>
      );
    } else if (selectedTransportType === 'train') {
      details = (
        <Box>
          <Typography variant="h6" sx={{ mt: 2, mb: 1, color: theme.palette.secondary.main }}>Train Stations</Typography>
          <ToggleButtonGroup
            exclusive
            value={selectedOrigin}
            onChange={handleOriginChange}
            aria-label="train station selection"
            sx={{ flexWrap: 'wrap', mb: 2 }}
          >
            {originOptions.train.map((station) => (
              <ToggleButton 
                key={station.id} 
                value={station.id}
                aria-label={station.name}
                sx={{
                  px: 2,
                  py: 1.5,
                  mr: 1,
                  mb: 1,
                  display: 'flex',
                  alignItems: 'center',
                  borderColor: alpha(theme.palette.primary.main, 0.3),
                  '&.Mui-selected': {
                    backgroundColor: alpha(theme.palette.secondary.main, 0.15),
                    borderColor: theme.palette.secondary.main,
                    color: theme.palette.secondary.main,
                  },
                }}
              >
                <Box>
                  <Typography variant="body1" fontWeight="bold">{station.name}</Typography>
                  <Typography variant="body2">{station.desc}</Typography>
                </Box>
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          
          {selectedOrigin && (
            <Fade in={true}>
              <Box sx={{ 
                mt: 2, 
                p: 2, 
                backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                borderRadius: '8px',
                border: `1px solid ${alpha(theme.palette.secondary.main, 0.3)}` 
              }}>
                <Typography variant="h6" gutterBottom>
                  {trainInfo[selectedOrigin].name}
                </Typography>
                <Typography variant="body2" fontWeight="bold" sx={{ mt: 1 }}>
                  Travel Tips:
                </Typography>
                <Box component="ul" sx={{ mt: 0.5, pl: 2 }}>
                  {trainInfo[selectedOrigin].tips.map((tip, i) => (
                    <Typography component="li" variant="body2" key={i} sx={{ mb: 0.5 }}>
                      {tip}
                    </Typography>
                  ))}
                </Box>
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<Train />}
                  size="small"
                  sx={{ mt: 2 }}
                  onClick={() => window.open('https://www.amtrak.com/stations/hrp')}
                >
                  Amtrak Information
                </Button>
              </Box>
            </Fade>
          )}
        </Box>
      );
    }
    
    return details;
  };

  // Render local transport details
  const renderLocalTransportDetails = () => {
    if (!selectedLocalTransport) return null;
    
    return (
      <Fade in={true}>
        <Box sx={{ 
          mt: 2, 
          p: 2, 
          backgroundColor: alpha(theme.palette.secondary.main, 0.1),
          borderRadius: '8px',
          border: `1px solid ${alpha(theme.palette.secondary.main, 0.3)}` 
        }}>
          <Typography variant="h6" gutterBottom>
            {localTransportOptions.find(opt => opt.id === selectedLocalTransport)?.name}
          </Typography>
          <Typography variant="body2" fontWeight="bold" sx={{ mt: 1 }}>
            Tips:
          </Typography>
          <Box component="ul" sx={{ mt: 0.5, pl: 2 }}>
            {transportInfo[selectedLocalTransport].tips.map((tip, i) => (
              <Typography component="li" variant="body2" key={i} sx={{ mb: 0.5 }}>
                {tip}
              </Typography>
            ))}
          </Box>
        </Box>
      </Fade>
    );
  };

  // Render hotel details
  const renderHotelDetails = (hotel, index) => {
    if (selectedHotel !== index) return null;
    
    return (
      <Fade in={true}>
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
                  height: 160, 
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
      </Fade>
    );
  };

  // The steps and their content
  const steps = [
    {
      label: 'Getting to the Area',
      description: 'How to get to Lovettsville, VA',
      content: (
        <>
          <Typography variant="body1" paragraph>
            Our wedding is in Lovettsville, Virginia - a charming rural area near the Maryland and West Virginia borders, about 1.5 hours from Washington DC.
          </Typography>
          
          <Typography variant="h6" sx={{ mb: 1, color: theme.palette.secondary.main }}>How will you get to the area?</Typography>
          <ToggleButtonGroup
            exclusive
            value={selectedTransportType}
            onChange={handleTransportTypeChange}
            aria-label="transport type"
            sx={{ flexWrap: 'wrap' }}
          >
            {transportOptions.map((option) => (
              <ToggleButton 
                key={option.id} 
                value={option.id}
                aria-label={option.name}
                sx={{
                  px: 2,
                  py: 1.5,
                  mr: 1,
                  mb: 1,
                  display: 'flex',
                  alignItems: 'center',
                  borderColor: alpha(theme.palette.primary.main, 0.3),
                  '&.Mui-selected': {
                    backgroundColor: alpha(theme.palette.secondary.main, 0.15),
                    borderColor: theme.palette.secondary.main,
                    color: theme.palette.secondary.main,
                  },
                }}
              >
                <Box sx={{ 
                  mr: 1.5, 
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  {option.icon}
                </Box>
                <Box>
                  <Typography variant="body1" fontWeight="bold">{option.name}</Typography>
                  <Typography variant="body2">{option.desc}</Typography>
                </Box>
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          
          {/* Details based on selection */}
          {renderTransportTypeDetails()}
          
          <Box sx={{ mt: 4, mb: 3, p: 3, backgroundColor: alpha(theme.palette.info.main, 0.1), borderRadius: '8px' }}>
            <Typography variant="body1" sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
              <Info fontSize="small" sx={{ mr: 1, mt: '3px', color: theme.palette.info.main }} />
              <strong>Important Travel Tips:</strong>
            </Typography>
            <Box component="ul" sx={{ pl: 3, mb: 0 }}>
              <Typography component="li" variant="body2" gutterBottom>
                Lovettsville is a rural area with limited public transportation.
              </Typography>
              <Typography component="li" variant="body2" gutterBottom>
                Most guests will need a rental car or arranged transportation to reach the venue.
              </Typography>
              <Typography component="li" variant="body2" gutterBottom>
                Consider sharing rides or coordinating with other guests when possible.
              </Typography>
              <Typography component="li" variant="body2">
                Plan your trip well in advance, especially if flying into the area.
              </Typography>
            </Box>
          </Box>
          
          <Typography variant="body2" paragraph>
            For personalized travel assistance or questions, contact us at <strong>travel@wedding.christephanie.com</strong>
          </Typography>
        </>
      )
    },
    {
      label: 'Local Transportation',
      description: 'How to get around once you\'re here',
      content: (
        <>
          <Typography variant="body1" paragraph>
            Once you've arrived in the area, you'll need transportation to get around. Here are your options:
          </Typography>
          
          <Typography variant="h6" sx={{ mb: 1, color: theme.palette.secondary.main }}>Local Transportation Options</Typography>
          <ToggleButtonGroup
            exclusive
            value={selectedLocalTransport}
            onChange={handleLocalTransportChange}
            aria-label="local transport options"
            sx={{ flexWrap: 'wrap' }}
          >
            {localTransportOptions.map((option) => (
              <ToggleButton 
                key={option.id} 
                value={option.id}
                aria-label={option.name}
                sx={{
                  px: 2,
                  py: 1.5,
                  mr: 1,
                  mb: 1,
                  display: 'flex',
                  alignItems: 'center',
                  borderColor: alpha(theme.palette.primary.main, 0.3),
                  '&.Mui-selected': {
                    backgroundColor: alpha(theme.palette.secondary.main, 0.15),
                    borderColor: theme.palette.secondary.main,
                    color: theme.palette.secondary.main,
                  },
                }}
              >
                <Box sx={{ 
                  mr: 1.5, 
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  {option.icon}
                </Box>
                <Box>
                  <Typography variant="body1" fontWeight="bold">{option.name}</Typography>
                  <Typography variant="body2">{option.desc}</Typography>
                </Box>
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          
          {/* Details based on selection */}
          {renderLocalTransportDetails()}
          
          <Box sx={{ mt: 4, mb: 2, p: 3, backgroundColor: alpha(theme.palette.secondary.main, 0.1), borderRadius: '8px' }}>
            <Typography variant="h6" gutterBottom color="secondary">
              Wedding Day Shuttle Service
            </Typography>
            <Typography variant="body2" paragraph>
              For your convenience, we've arranged shuttle transportation between our partner hotels and the wedding venue on the wedding day (Saturday).
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" fontWeight="bold">
                  Departure Times from Hotels:
                </Typography>
                <Box component="ul" sx={{ pl: 3 }}>
                  <Typography component="li" variant="body2">Holiday Inn Express Brunswick: 4:00pm and 5:00pm</Typography>
                  <Typography component="li" variant="body2">Holiday Inn Express Charles Town: 4:00pm and 5:00pm</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" fontWeight="bold">
                  Return Times to Hotels:
                </Typography>
                <Box component="ul" sx={{ pl: 3 }}>
                  <Typography component="li" variant="body2">10:00pm</Typography>
                  <Typography component="li" variant="body2">11:00pm</Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </>
      )
    },
    {
      label: 'Accommodation Options',
      description: 'Where to stay for our wedding',
      content: (
        <>
          <Typography variant="body1" paragraph>
            We've arranged some convenient lodging options to make your trip to our wedding as comfortable as possible.
          </Typography>
          
          <Typography variant="h6" sx={{ mb: 1, color: theme.palette.secondary.main }}>Hotel Options</Typography>
          <ButtonGroup orientation="vertical" variant="outlined" fullWidth sx={{ mb: 2 }}>
            {hotelOptions.map((hotel, index) => (
              <Button
                key={index}
                onClick={() => handleHotelChange(index)}
                sx={{
                  justifyContent: 'space-between',
                  textAlign: 'left',
                  py: 1.5,
                  px: 2,
                  borderColor: selectedHotel === index ? theme.palette.secondary.main : alpha(theme.palette.primary.main, 0.3),
                  backgroundColor: selectedHotel === index ? alpha(theme.palette.secondary.main, 0.1) : 'transparent',
                  '&:hover': {
                    backgroundColor: selectedHotel === index ? alpha(theme.palette.secondary.main, 0.15) : alpha(theme.palette.primary.main, 0.05),
                  },
                  '&.MuiButtonGroup-grouped:not(:last-of-type)': {
                    borderBottomColor: selectedHotel === index ? theme.palette.secondary.main : alpha(theme.palette.primary.main, 0.3),
                  }
                }}
                startIcon={<HotelOutlined />}
              >
                <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
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
                      <Box display="flex" alignItems="center" ml={1}>
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
            ))}
          </ButtonGroup>
          
          {hotelOptions.map((hotel, index) => renderHotelDetails(hotel, index))}
          
          <Typography variant="body2" paragraph>
            If you have any questions about accommodations, please contact us at <strong>accommodations@wedding.christephanie.com</strong>
          </Typography>
        </>
      )
    },
    {
      label: 'Venue Information',
      description: 'Details about our wedding venue',
      content: (
        <>
          <Typography variant="body1" paragraph>
            Our wedding will be held at Stone Manor Inn, a picturesque estate venue located in Lovettsville, Virginia.
          </Typography>
          
          <Box
            component="iframe"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12383.86570043533!2d-77.64746721193069!3d39.269444801101574!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89b606193970ec5d%3A0x2c2c11c2aeded12c!2sStone%20Manor%20Boutique%20Inn!5e0!3m2!1sen!2sus!4v1704496957511!5m2!1sen!2sus"
            width="100%"
            height="300"
            style={{
              border: 0,
              borderRadius: '8px',
              marginBottom: '16px',
            }}
            allowFullScreen
            loading="lazy"
            title="Venue Location Map"
          />
          
          <Box sx={{ 
            p: 3, 
            borderRadius: '8px', 
            backgroundColor: alpha(theme.palette.background.paper, 0.15),
            backdropFilter: 'blur(5px)',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
            mb: 3,
          }}>
            <Typography variant="h6" gutterBottom>Venue Details</Typography>
            <Typography variant="body2" paragraph>
              <strong>Stone Manor Inn</strong><br />
              13193 Mountain Rd, Lovettsville, VA 20180<br />
              Phone: (540) 822-3032
            </Typography>
            
            <Typography variant="body2" paragraph>
              <strong>About the Venue:</strong> Stone Manor is a boutique inn situated on 25 acres of countryside in the heart of Virginia wine country. The venue offers beautiful gardens, historic architecture, and stunning views of the Blue Ridge Mountains.
            </Typography>
          </Box>
          
          <Box sx={{ mb: 3, p: 2, backgroundColor: alpha(theme.palette.warning.main, 0.1), borderRadius: '8px' }}>
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <Info fontSize="small" sx={{ mr: 1, mt: '3px', color: theme.palette.warning.main }} />
              <strong>Note:</strong> Stone Manor Inn is in a rural area with limited cell reception. We recommend downloading offline maps and saving the venue address before your trip.
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<Navigation />}
            onClick={() => window.open('https://www.google.com/maps/dir//Stone+Manor+Boutique+Inn,+13193+Mountain+Rd,+Lovettsville,+VA+20180/@39.2694448,-77.6474672,14z/data=!4m9!4m8!1m0!1m5!1m1!1s0x89b606193970ec5d:0x2c2c11c2aeded12c!2m2!1d-77.6257573!2d39.2725608!3e0')}
            sx={{ mt: 2 }}
          >
            Get Directions to Venue
          </Button>
        </>
      )
    }
  ];

  // Step progress indicator
  const StepProgressIndicator = () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
      <Stack direction="row" spacing={2} sx={{ width: '100%', maxWidth: 400 }}>
        {steps.map((step, idx) => (
          <Button
            key={idx}
            variant={activeStep === idx ? "contained" : "outlined"}
            color={stepsCompleted[idx] ? "success" : activeStep === idx ? "primary" : "inherit"}
            onClick={() => handleStepChange(idx)}
            sx={{ 
              minWidth: 0, 
              flex: 1,
              borderRadius: '50%',
              width: 40,
              height: 40,
              p: 0,
              fontSize: '1rem',
            }}
            disabled={!stepsCompleted.slice(0, idx).every(Boolean) && idx !== 0}
          >
            {stepsCompleted[idx] ? <Done /> : (idx + 1)}
          </Button>
        ))}
      </Stack>
    </Box>
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
          TRAVEL & ACCOMMODATIONS
        </StephsActualFavoriteTypography>
        
        <Typography variant="body1" sx={{ mb: 2 }}>
          Plan your journey to our wedding with this interactive travel guide
        </Typography>
        
        {/* Step Progress Indicator */}
        <StepProgressIndicator />
      </Box>
      
      {/* Main content */}
      <Box sx={{ p: 2, flexGrow: 1, overflow: 'auto' }}>
        <Paper
          elevation={3}
          sx={{
            p: { xs: 2, sm: 3 },
            backgroundColor: alpha(theme.palette.background.paper, 0.15),
            backdropFilter: 'blur(5px)',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            borderRadius: '12px',
          }}
        >
          {/* Step Title and Description */}
          <Box sx={{ mb: 3 }}>
            <Typography 
              variant="h5" 
              color="secondary" 
              fontWeight="bold"
              sx={{ mb: 1 }}
            >
              Step {activeStep + 1}: {steps[activeStep].label}
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ borderLeft: `3px solid ${alpha(theme.palette.secondary.main, 0.5)}`, pl: 2 }}
            >
              {steps[activeStep].description}
            </Typography>
          </Box>
          
          {/* Step Content */}
          <Box sx={{ mb: 4 }}>
            {steps[activeStep].content}
          </Box>
          
          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              startIcon={<ArrowBack />}
              sx={{ visibility: activeStep === 0 ? 'hidden' : 'visible' }}
            >
              Back
            </Button>
            
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
              endIcon={activeStep < steps.length - 1 ? <ArrowForward /> : undefined}
              disabled={
                (activeStep === 0 && !stepsCompleted[0]) || 
                (activeStep === 1 && !stepsCompleted[1]) ||
                (activeStep === 2 && !stepsCompleted[2])
              }
            >
              {activeStep < steps.length - 1 ? 'Continue' : 'Finish'}
            </Button>
          </Box>
          
          {/* Mobile Stepper (Alternative for smaller screens) */}
          {isMobile && (
            <MobileStepper
              variant="dots"
              steps={steps.length}
              position="static"
              activeStep={activeStep}
              sx={{ 
                mt: 4,
                backgroundColor: 'transparent',
                '& .MuiMobileStepper-dot': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.3),
                },
                '& .MuiMobileStepper-dotActive': {
                  backgroundColor: theme.palette.secondary.main,
                }
              }}
              nextButton={
                <Button 
                  size="small" 
                  onClick={handleNext}
                  disabled={
                    activeStep === steps.length - 1 ||
                    (activeStep === 0 && !stepsCompleted[0]) || 
                    (activeStep === 1 && !stepsCompleted[1]) ||
                    (activeStep === 2 && !stepsCompleted[2])
                  }
                >
                  Next
                  <KeyboardArrowRight />
                </Button>
              }
              backButton={
                <Button size="small" onClick={handleBack} disabled={activeStep === 0}>
                  <KeyboardArrowLeft />
                  Back
                </Button>
              }
            />
          )}
        </Paper>
      </Box>
    </Container>
  );
}

export default Travel;