import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Button, 
  Link, 
  Paper, 
  Grid, 
  IconButton, 
  Collapse, 
  Fade, 
  Zoom, 
  Grow,
  Tooltip,
  alpha,
  Stack,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Chip
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
  Home, 
  Person, 
  Groups,
  LocalTaxi,
  Check,
  ArrowForward,
  Info,
  SportsScore,
  Navigation,
  Celebration,
  FormatListBulleted,
  Luggage
} from '@mui/icons-material';

interface TravelProps {
  handleTabLink: (to: string) => void;
}

function Travel({handleTabLink}: TravelProps) {
  const { contentHeight } = useAppLayout();
  const theme = useTheme();
  
  // Game state
  const [activeStep, setActiveStep] = useState(0);
  const [selectedPiece, setSelectedPiece] = useState<string | null>(null);
  const [selectedOrigin, setSelectedOrigin] = useState<string | null>(null);
  const [selectedAirport, setSelectedAirport] = useState<string | null>(null);
  const [selectedTransport, setSelectedTransport] = useState<string | null>(null);
  const [showTransportDialog, setShowTransportDialog] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  
  // Reset game if the user goes back to step 0
  useEffect(() => {
    if (activeStep === 0) {
      setSelectedPiece(null);
      setSelectedOrigin(null);
      setSelectedAirport(null);
      setSelectedTransport(null);
      setShowSummary(false);
    }
  }, [activeStep]);

  // Accommodate a direct link to the accommodations page
  const accommodationsLink = (
    <Link 
      onClick={() => handleTabLink('accommodations')}
      sx={{ color: theme.palette.secondary.main, fontWeight: 'bold', textDecoration: 'underline' }}
    >
      accommodations page
    </Link>
  );

  // Game pieces for selection
  const gamePieces = [
    { id: 'plane', name: 'Airplane', icon: <FlightTakeoff fontSize="large" />, desc: 'For guests flying in' },
    { id: 'car', name: 'Car', icon: <DirectionsCar fontSize="large" />, desc: 'For guests driving' },
    { id: 'train', name: 'Train', icon: <Train fontSize="large" />, desc: 'For guests taking Amtrak' }
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

  // Transport options
  const transportOptions = [
    { id: 'rental', name: 'Rental Car', icon: <DirectionsCar />, desc: 'Freedom to explore the area' },
    { id: 'taxi', name: 'Taxi/Rideshare', icon: <LocalTaxi />, desc: 'Easy point-to-point travel' },
    { id: 'shuttle', name: 'Wedding Shuttle', icon: <DirectionsBus />, desc: 'Available on wedding day only' },
    { id: 'family', name: 'Ride with Family', icon: <Groups />, desc: 'Coordinate with relatives' }
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
        'See the ' + accommodationsLink + ' for detailed schedule',
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

  // Board component styling
  const boardCellStyle = {
    border: `2px solid ${alpha(theme.palette.primary.main, 0.5)}`,
    backgroundColor: alpha(theme.palette.background.paper, 0.1),
    backdropFilter: 'blur(5px)',
    borderRadius: '8px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: '100px',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: `0 4px 8px ${alpha(theme.palette.primary.main, 0.4)}`,
    }
  };

  const activeCellStyle = {
    ...boardCellStyle,
    borderColor: theme.palette.secondary.main,
    backgroundColor: alpha(theme.palette.secondary.main, 0.15),
    boxShadow: `0 0 12px ${alpha(theme.palette.secondary.main, 0.6)}`,
  };

  // Path connector line
  const pathStyle = {
    position: 'absolute',
    height: '2px',
    backgroundColor: alpha(theme.palette.primary.main, 0.7),
    top: '50%',
    left: '100%',
    transform: 'translateY(-50%)',
    zIndex: 0
  };

  // Board game marker/piece styling
  interface GamePieceProps {
    icon: React.ReactNode;
    selected: boolean;
  }
  
  const GamePiece: React.FC<GamePieceProps> = ({ icon, selected }) => (
    <Box
      sx={{
        width: 50,
        height: 50,
        borderRadius: '50%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: selected 
          ? alpha(theme.palette.secondary.main, 0.3) 
          : alpha(theme.palette.primary.main, 0.2),
        border: `2px solid ${selected ? theme.palette.secondary.main : alpha(theme.palette.primary.main, 0.8)}`,
        color: selected ? theme.palette.secondary.main : theme.palette.primary.main,
        boxShadow: selected 
          ? `0 0 12px ${alpha(theme.palette.secondary.main, 0.6)}` 
          : `0 0 6px ${alpha(theme.palette.primary.main, 0.4)}`,
        transition: 'all 0.3s ease',
      }}
    >
      {icon}
    </Box>
  );
  
  // Journey summary card component
  const JourneySummary = () => {
    let originName = "Unknown";
    let routeInfo = [];
    
    if (selectedPiece === 'plane' && selectedAirport) {
      originName = airportInfo[selectedAirport].name;
      routeInfo = airportInfo[selectedAirport].tips;
    } else if (selectedPiece === 'car' && selectedOrigin) {
      originName = originOptions.car.find(o => o.id === selectedOrigin)?.name || "Unknown";
      routeInfo = drivingDirections[selectedOrigin];
    } else if (selectedPiece === 'train' && selectedOrigin) {
      originName = trainInfo[selectedOrigin].name;
      routeInfo = trainInfo[selectedOrigin].tips;
    }
    
    return (
      <Fade in={showSummary} timeout={800}>
        <Card sx={{ 
          mt: 4, 
          mb: 4,
          backgroundColor: alpha(theme.palette.background.paper, 0.25),
          backdropFilter: 'blur(8px)',
          border: `1px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
          boxShadow: `0 4px 12px ${alpha(theme.palette.primary.dark, 0.4)}`,
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SportsScore color="secondary" sx={{ mr: 1 }} />
              <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                Your Travel Plan
              </Typography>
            </Box>
            
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <GamePiece icon={gamePieces.find(p => p.id === selectedPiece)?.icon} selected={true} />
                <Box sx={{ ml: 2 }}>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {selectedPiece === 'plane' ? 'Flying' : selectedPiece === 'car' ? 'Driving' : 'Taking Train'} from {originName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedPiece === 'plane' ? airportInfo[selectedAirport].distance : ''}
                  </Typography>
                </Box>
              </Box>
              
              {selectedTransport && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ 
                    width: 40, 
                    height: 40, 
                    borderRadius: '50%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: alpha(theme.palette.primary.main, 0.2),
                    color: theme.palette.primary.main,
                  }}>
                    {transportOptions.find(t => t.id === selectedTransport)?.icon}
                  </Box>
                  <Box sx={{ ml: 2 }}>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      Local Transportation: {transportOptions.find(t => t.id === selectedTransport)?.name}
                    </Typography>
                  </Box>
                </Box>
              )}
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: theme.palette.secondary.main }}>
                  Directions & Tips:
                </Typography>
                <Box component="ul" sx={{ pl: 3, mt: 1 }}>
                  {routeInfo.map((tip, i) => (
                    <Typography component="li" variant="body2" key={i} sx={{ mb: 0.5 }}>
                      {tip}
                    </Typography>
                  ))}
                </Box>
                
                {selectedTransport && (
                  <>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: theme.palette.secondary.main, mt: 2 }}>
                      Transportation Tips:
                    </Typography>
                    <Box component="ul" sx={{ pl: 3, mt: 1 }}>
                      {transportInfo[selectedTransport].tips.map((tip, i) => (
                        <Typography component="li" variant="body2" key={i} sx={{ mb: 0.5 }}>
                          {tip}
                        </Typography>
                      ))}
                    </Box>
                  </>
                )}
              </Box>
              
              <Box sx={{ 
                p: 2, 
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                borderRadius: '8px',
                mt: 2 
              }}>
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                  <Info fontSize="small" sx={{ mr: 1, color: theme.palette.secondary.main }} />
                  Need help with your travel plans? Email us at travel@wedding.christephanie.com
                </Typography>
              </Box>
            </Stack>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
              <Button 
                variant="outlined" 
                color="primary" 
                onClick={() => setActiveStep(0)}
                startIcon={<Navigation />}
                sx={{ mr: 2 }}
              >
                Plan New Route
              </Button>
              <Button 
                variant="contained" 
                color="secondary" 
                onClick={() => handleTabLink('accommodations')}
                endIcon={<Hotel />}
              >
                View Accommodations
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Fade>
    );
  };

  // Transportation selection dialog
  const TransportSelectionDialog = () => (
    <Dialog 
      open={showTransportDialog} 
      onClose={() => setShowTransportDialog(false)}
      PaperProps={{
        sx: {
          backgroundColor: alpha(theme.palette.background.paper, 0.95),
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
        }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', color: theme.palette.secondary.main }}>
        Choose Your Local Transportation
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" paragraph>
          How will you get around Lovettsville and to the wedding venue?
        </Typography>
        
        <FormControl component="fieldset">
          <RadioGroup value={selectedTransport || ''} onChange={(e) => setSelectedTransport(e.target.value)}>
            {transportOptions.map((option) => (
              <FormControlLabel 
                key={option.id}
                value={option.id}
                control={<Radio color="secondary" />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ 
                      mr: 1, 
                      p: 1, 
                      borderRadius: '50%', 
                      backgroundColor: alpha(theme.palette.primary.main, 0.1) 
                    }}>
                      {option.icon}
                    </Box>
                    <Box>
                      <Typography variant="body1">{option.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {option.desc}
                      </Typography>
                    </Box>
                  </Box>
                }
                sx={{ 
                  mb: 2, 
                  p: 1,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  borderRadius: '8px',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.05)
                  }
                }}
              />
            ))}
          </RadioGroup>
        </FormControl>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={() => setShowTransportDialog(false)}>Cancel</Button>
        <Button 
          variant="contained" 
          color="secondary"
          disabled={!selectedTransport}
          onClick={() => {
            setShowTransportDialog(false);
            setShowSummary(true);
          }}
        >
          Complete Journey
        </Button>
      </DialogActions>
    </Dialog>
  );

  // The game board stepper
  const renderGameBoard = () => (
    <Box sx={{ width: '100%', mt: 3 }}>
      <Stepper activeStep={activeStep} orientation="vertical">
        {/* Step 1: Choose your game piece (transportation method) */}
        <Step>
          <StepLabel>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Choose Your Travel Method</Typography>
          </StepLabel>
          <StepContent>
            <Typography variant="body2" paragraph>
              How will you be traveling to our wedding? Select your preferred method:
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 2 }}>
              {gamePieces.map((piece, index) => (
                <Grid item xs={12} sm={4} key={piece.id}>
                  <Zoom in={true} style={{ transitionDelay: `${index * 150}ms` }}>
                    <Paper
                      sx={{
                        p: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        cursor: 'pointer',
                        backgroundColor: selectedPiece === piece.id
                          ? alpha(theme.palette.secondary.main, 0.15)
                          : alpha(theme.palette.background.paper, 0.2),
                        border: `2px solid ${selectedPiece === piece.id 
                          ? theme.palette.secondary.main
                          : alpha(theme.palette.primary.main, 0.3)}`,
                        borderRadius: '12px',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: selectedPiece === piece.id
                            ? alpha(theme.palette.secondary.main, 0.2)
                            : alpha(theme.palette.primary.main, 0.1),
                          transform: 'translateY(-4px)',
                        }
                      }}
                      onClick={() => setSelectedPiece(piece.id)}
                    >
                      <GamePiece icon={piece.icon} selected={selectedPiece === piece.id} />
                      <Typography variant="body1" sx={{ mt: 2, fontWeight: 'bold' }}>
                        {piece.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 1 }}>
                        {piece.desc}
                      </Typography>
                    </Paper>
                  </Zoom>
                </Grid>
              ))}
            </Grid>
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => setActiveStep(1)}
                disabled={!selectedPiece}
                endIcon={<ArrowForward />}
              >
                Continue
              </Button>
            </Box>
          </StepContent>
        </Step>
        
        {/* Step 2: Choose your starting point */}
        <Step>
          <StepLabel>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              {selectedPiece === 'plane' ? 'Select Airport' : selectedPiece === 'car' ? 'Select Starting Point' : 'Select Train Station'}
            </Typography>
          </StepLabel>
          <StepContent>
            <Typography variant="body2" paragraph>
              {selectedPiece === 'plane' 
                ? 'Which airport will you fly into?' 
                : selectedPiece === 'car' 
                  ? 'Where will you be driving from?' 
                  : 'Which station will you arrive at?'}
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 2 }}>
              {selectedPiece && originOptions[selectedPiece].map((origin, index) => (
                <Grid item xs={12} sm={4} key={origin.id}>
                  <Grow in={true} timeout={800} style={{ transitionDelay: `${index * 150}ms` }}>
                    <Paper
                      sx={{
                        p: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        cursor: 'pointer',
                        backgroundColor: (selectedOrigin === origin.id || selectedAirport === origin.id)
                          ? alpha(theme.palette.secondary.main, 0.15)
                          : alpha(theme.palette.background.paper, 0.2),
                        border: `2px solid ${(selectedOrigin === origin.id || selectedAirport === origin.id)
                          ? theme.palette.secondary.main
                          : alpha(theme.palette.primary.main, 0.3)}`,
                        borderRadius: '12px',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: (selectedOrigin === origin.id || selectedAirport === origin.id)
                            ? alpha(theme.palette.secondary.main, 0.2)
                            : alpha(theme.palette.primary.main, 0.1),
                          transform: 'translateY(-4px)',
                        }
                      }}
                      onClick={() => {
                        if (selectedPiece === 'plane') {
                          setSelectedAirport(origin.id);
                        } else {
                          setSelectedOrigin(origin.id);
                        }
                      }}
                    >
                      <Box sx={{ 
                        width: 40, 
                        height: 40, 
                        borderRadius: '50%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: (selectedOrigin === origin.id || selectedAirport === origin.id)
                          ? alpha(theme.palette.secondary.main, 0.3)
                          : alpha(theme.palette.primary.main, 0.2),
                        color: (selectedOrigin === origin.id || selectedAirport === origin.id)
                          ? theme.palette.secondary.main
                          : theme.palette.primary.main,
                      }}>
                        {selectedPiece === 'plane' ? <FlightTakeoff /> : selectedPiece === 'car' ? <LocationOn /> : <Train />}
                      </Box>
                      <Typography variant="body1" sx={{ mt: 2, fontWeight: 'bold', textAlign: 'center' }}>
                        {origin.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 1 }}>
                        {origin.desc}
                      </Typography>
                    </Paper>
                  </Grow>
                </Grid>
              ))}
            </Grid>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={() => setActiveStep(0)}>Back</Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => setActiveStep(2)}
                disabled={!(selectedOrigin || selectedAirport)}
                endIcon={<ArrowForward />}
              >
                Continue
              </Button>
            </Box>
          </StepContent>
        </Step>
        
        {/* Step 3: Choose local transportation */}
        <Step>
          <StepLabel>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Local Transportation</Typography>
          </StepLabel>
          <StepContent>
            <Typography variant="body2" paragraph>
              How will you get around Lovettsville and to the wedding venue?
            </Typography>
            
            <Box sx={{ mb: 3, p: 2, backgroundColor: alpha(theme.palette.info.main, 0.1), borderRadius: '8px' }}>
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <Info fontSize="small" sx={{ mr: 1, mt: '3px', color: theme.palette.info.main }} />
                Lovettsville is a rural area with limited public transportation. Most guests will need a car or arranged transportation.
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setShowTransportDialog(true)}
                startIcon={<Luggage />}
              >
                Choose Local Transportation
              </Button>
            </Box>
            
            {selectedTransport && (
              <Paper sx={{ 
                p: 2, 
                mb: 2, 
                backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                border: `1px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
                borderRadius: '8px',
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Check color="secondary" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    Selected: <b>{transportOptions.find(t => t.id === selectedTransport)?.name}</b>
                  </Typography>
                </Box>
              </Paper>
            )}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={() => setActiveStep(1)}>Back</Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => setShowSummary(true)}
                disabled={!selectedTransport}
                endIcon={<SportsScore />}
              >
                Complete Journey
              </Button>
            </Box>
          </StepContent>
        </Step>
      </Stepper>
    </Box>
  );

  // Visual game board that shows as you progress
  const renderVisualBoard = () => {
    // Only show when at least one selection has been made
    if (!selectedPiece) return null;
    
    return (
      <Box sx={{ mt: 4, mb: 2, px: 2 }}>
        <Paper sx={{ 
          p: 2, 
          backgroundColor: alpha(theme.palette.background.paper, 0.1),
          backdropFilter: 'blur(5px)',
          borderRadius: '12px',
        }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <Navigation sx={{ mr: 1, color: theme.palette.secondary.main }} />
            Your Journey Map
          </Typography>
          
          <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
            {/* Starting point */}
            <Grid item xs={3}>
              <Box sx={activeStep >= 1 && selectedPiece ? activeCellStyle : boardCellStyle}>
                <Box sx={{ 
                  width: 36, 
                  height: 36, 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  color: theme.palette.primary.main
                }}>
                  {selectedPiece === 'plane' ? <FlightTakeoff /> : selectedPiece === 'car' ? <Home /> : <Train />}
                </Box>
                <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
                  {selectedPiece === 'plane' ? 'Airport' : selectedPiece === 'car' ? 'Starting Point' : 'Train Station'}
                </Typography>
                {activeStep >= 1 && (selectedOrigin || selectedAirport) && (
                  <Tooltip title={selectedPiece === 'plane' && selectedAirport 
                    ? airportInfo[selectedAirport].name 
                    : selectedPiece === 'train' && selectedOrigin 
                      ? trainInfo[selectedOrigin].name 
                      : selectedOrigin === 'dc' 
                        ? 'Washington DC' 
                        : selectedOrigin === 'baltimore' 
                          ? 'Baltimore' 
                          : 'Custom Location'}>
                    <Chip 
                      label={selectedPiece === 'plane' && selectedAirport 
                        ? selectedAirport.toUpperCase() 
                        : selectedOrigin 
                          ? selectedOrigin.substring(0, 3).toUpperCase() 
                          : '???'} 
                      size="small" 
                      color="secondary"
                      sx={{ position: 'absolute', top: -10, right: -10 }}
                    />
                  </Tooltip>
                )}
                {/* Connection line */}
                <Box sx={{ ...pathStyle, width: '80%' }} />
              </Box>
            </Grid>
            
            {/* Local transportation */}
            <Grid item xs={3}>
              <Box sx={activeStep >= 2 && selectedTransport ? activeCellStyle : boardCellStyle}>
                <Box sx={{ 
                  width: 36, 
                  height: 36, 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  color: theme.palette.primary.main
                }}>
                  {selectedTransport === 'rental' ? <DirectionsCar /> : 
                   selectedTransport === 'taxi' ? <LocalTaxi /> :
                   selectedTransport === 'shuttle' ? <DirectionsBus /> :
                   selectedTransport === 'family' ? <Groups /> : <DirectionsCar />}
                </Box>
                <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
                  Local Transport
                </Typography>
                {selectedTransport && (
                  <Tooltip title={transportOptions.find(t => t.id === selectedTransport)?.name || ''}>
                    <Chip 
                      label={selectedTransport.substring(0, 4).toUpperCase()} 
                      size="small" 
                      color="secondary"
                      sx={{ position: 'absolute', top: -10, right: -10 }}
                    />
                  </Tooltip>
                )}
                {/* Connection line */}
                <Box sx={{ ...pathStyle, width: '80%' }} />
              </Box>
            </Grid>
            
            {/* Accommodation */}
            <Grid item xs={3}>
              <Box sx={showSummary ? activeCellStyle : boardCellStyle}>
                <Box sx={{ 
                  width: 36, 
                  height: 36, 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  color: theme.palette.primary.main
                }}>
                  <Hotel />
                </Box>
                <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
                  Accommodation
                </Typography>
                {/* Connection line */}
                <Box sx={{ ...pathStyle, width: '80%' }} />
              </Box>
            </Grid>
            
            {/* Venue destination */}
            <Grid item xs={3}>
              <Box sx={showSummary ? activeCellStyle : boardCellStyle}>
                <Box sx={{ 
                  width: 36, 
                  height: 36, 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  color: theme.palette.primary.main
                }}>
                  <Celebration />
                </Box>
                <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
                  Wedding Venue
                </Typography>
                <Tooltip title="Stone Manor Inn">
                  <Chip 
                    label="VENUE" 
                    size="small" 
                    color={showSummary ? "secondary" : "primary"}
                    sx={{ position: 'absolute', top: -10, right: -10 }}
                  />
                </Tooltip>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    );
  };

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
          TRAVEL PLANNER
        </StephsActualFavoriteTypography>
        
        <Typography variant="body1" sx={{ mb: 2 }}>
          Plan your journey to our wedding with this interactive travel guide.
        </Typography>
      </Box>
      
      {/* Alternative view button */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1, mb: 2 }}>
        <Button 
          variant="outlined" 
          color="primary" 
          startIcon={<FormatListBulleted />}
          onClick={() => handleTabLink('accommodations')}
          size="small"
        >
          View Traditional Travel Info
        </Button>
      </Box>
      
      {/* Main content */}
      <Box sx={{ p: 2, flexGrow: 1, overflow: 'auto' }}>
        {/* Interactive game board */}
        {renderGameBoard()}
        
        {/* Visual board representation */}
        {renderVisualBoard()}
        
        {/* Summary card once journey is complete */}
        {showSummary && <JourneySummary />}
        
        {/* Venue map card */}
        <Grow in={true} timeout={800}>
          <Card sx={{ 
            mb: 4, 
            backgroundColor: alpha(theme.palette.background.paper, 0.15),
            backdropFilter: 'blur(5px)',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <PinDrop sx={{ mr: 1, color: theme.palette.secondary.main }} />
                Wedding Venue Location
              </Typography>
              
              <Box
                component="iframe"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12383.86570043533!2d-77.64746721193069!3d39.269444801101574!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89b606193970ec5d%3A0x2c2c11c2aeded12c!2sStone%20Manor%20Boutique%20Inn!5e0!3m2!1sen!2sus!4v1704496957511!5m2!1sen!2sus"
                width="100%"
                height="250"
                style={{
                  border: 0,
                  borderRadius: '8px',
                  marginBottom: '16px',
                }}
                allowFullScreen
                loading="lazy"
                title="Venue Location Map"
              />
              
              <Typography variant="body2">
                <strong>Stone Manor Inn</strong><br />
                13193 Mountain Rd, Lovettsville, VA 20180<br />
                Phone: (540) 822-3032
              </Typography>
            </CardContent>
          </Card>
        </Grow>
      </Box>
      
      {/* Transport selection dialog */}
      <TransportSelectionDialog />
    </Container>
  );
}

export default Travel;