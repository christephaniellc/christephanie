import React, { useEffect, useState, useRef, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  useTheme, 
  useMediaQuery, 
  Grid, 
  ToggleButtonGroup, 
  ToggleButton,
  Fade,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  CircularProgress,
  Badge,
  Avatar,
  InputAdornment,
  TextField,
  Button,
  Menu,
  MenuItem,
  LinearProgress,
  Tooltip,
  IconButton,
  SelectChangeEvent,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import { StephsActualFavoriteTypography, StephsActualFavoriteTypographyNoDrop } from '@/components/AttendanceButton/AttendanceButton';
import isMobile from '@/utils/is-mobile';
import EmailIcon from '@mui/icons-material/Email';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import { QRCodeSVG } from 'qrcode.react';
import FavoriteIcon from '@mui/icons-material/Favorite';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import HotelIcon from '@mui/icons-material/Hotel';
import ReplyIcon from '@mui/icons-material/Reply';
import SearchIcon from '@mui/icons-material/Search';
import FaceIcon from '@mui/icons-material/Face';
import NotificationsIcon from '@mui/icons-material/Notifications';
import HomeIcon from '@mui/icons-material/Home';
import CommentIcon from '@mui/icons-material/Comment';
import NoMealsIcon from '@mui/icons-material/NoMeals';
import PrintIcon from '@mui/icons-material/Print';
import SortIcon from '@mui/icons-material/Sort';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoIcon from '@mui/icons-material/Info';
import { useFamily } from '@/store/family';
import { FamilyUnitDto, FoodPreferenceEnum, SleepPreferenceEnum, InvitationResponseEnum } from '@/types/api';
import { useAdminQueries } from '@/hooks/useAdminQueries';
import EngagementPhoto1 from '@/assets/engagement-photos/topher_and_steph_rsvp1.jpg';
import EngagementPhoto2 from '@/assets/engagement-photos/topher_and_steph_rsvp2.jpg';
import EngagementPhoto3 from '@/assets/engagement-photos/topher_and_steph_rsvp3.jpg';
import EngagementPhoto4 from '@/assets/engagement-photos/topher_and_steph_rsvp4.jpg';

// Card dimensions in inches (standard 4x6 postcard size)
const CARD_WIDTH_INCHES = 6.0;
const CARD_HEIGHT_INCHES = 4.0;

type CardSide = 'front' | 'back';
type SortOption = 'name' | 'invitationCode' | 'guestCount' | 'responseStatus' | 'completionStatus';
type StepCompletion = {
  hasGuests: boolean;
  hasAgeGroups: boolean;
  hasNotificationPrefs: boolean;
  hasFoodPrefs: boolean;
  hasAccommodation: boolean;
  hasMailingAddress: boolean;
  hasComments: boolean;
};

const PrintedRsvp: React.FC = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [pixelsPerInch, setPixelsPerInch] = useState(96); // Default PPI estimate
  const [cardSide, setCardSide] = useState<CardSide>('front');
  const [cardScale, setCardScale] = useState(1.0);
  const [userFamily] = useFamily(); // Get current user's family data from store
  
  // Admin data for all families
  const { getAllFamiliesQuery } = useAdminQueries();
  const [allFamilies, setAllFamilies] = useState<FamilyUnitDto[]>([]);
  const [selectedFamily, setSelectedFamily] = useState<FamilyUnitDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('name');
  const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  // Calculate dimensions and PPI on mount and window resize
  useEffect(() => {
    const calculateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
        
        // Estimate PPI based on device pixel ratio and adjust for browser zoom
        const estimatedPPI = 96 * (window.devicePixelRatio || 1);
        setPixelsPerInch(estimatedPPI);
        
        // Calculate a scale factor to ensure card fits in the viewport
        const maxCardWidth = width * 0.7;
        const maxCardHeight = height * 0.7;
        
        const cardWidthPixels = CARD_WIDTH_INCHES * estimatedPPI;
        const cardHeightPixels = CARD_HEIGHT_INCHES * estimatedPPI;
        
        const scaleWidth = maxCardWidth / cardWidthPixels;
        const scaleHeight = maxCardHeight / cardHeightPixels;
        
        // Use the smaller scale to make sure card fits completely
        const newScale = Math.min(scaleWidth, scaleHeight, 1.0);
        setCardScale(newScale);
      }
    };

    calculateDimensions();
    window.addEventListener('resize', calculateDimensions);
    
    return () => {
      window.removeEventListener('resize', calculateDimensions);
    };
  }, []);

  // Get inches from pixels
  const getInches = (pixels: number) => {
    return pixels / pixelsPerInch;
  };

  // Showing inches with two decimal points
  const formatInches = (inches: number) => {
    return `${inches.toFixed(2)}"`;
  };

  // Handle card side toggle
  const handleCardSideToggle = (
    _event: React.MouseEvent<HTMLElement>,
    newSide: CardSide | null
  ) => {
    if (newSide !== null) {
      setCardSide(newSide);
    }
  };
  
  // Create ruler marks
  const createRulerMarks = (size: number, horizontal = true) => {
    const marks = [];
    const inches = getInches(size);
    const step = pixelsPerInch / 4; // Quarter-inch marks
    
    for (let i = 0; i <= size; i += step) {
      const position = (i / size) * 100;
      const isMajorMark = i % pixelsPerInch < 1; // Major mark at each inch
      const isHalfInchMark = i % (pixelsPerInch / 2) < 1 && !isMajorMark; // Half-inch mark
      
      const markStyle = {
        position: 'absolute',
        backgroundColor: isMajorMark ? theme.palette.primary.main : 
                        isHalfInchMark ? theme.palette.secondary.main : 
                        'rgba(255, 255, 255, 0.7)',
        ...(horizontal 
          ? { 
              left: `${position}%`,
              top: 0,
              width: isMajorMark ? 3 : isHalfInchMark ? 2 : 1,
              height: isMajorMark ? 16 : isHalfInchMark ? 12 : 8 
            }
          : {
              top: `${position}%`,
              left: 0,
              height: isMajorMark ? 3 : isHalfInchMark ? 2 : 1,
              width: isMajorMark ? 16 : isHalfInchMark ? 12 : 8
            }
        )
      };
      
      // Add inch number label for major marks
      const label = isMajorMark ? (
        <Typography
          variant="caption"
          sx={{
            position: 'absolute',
            ...(horizontal 
              ? { left: `${position}%`, top: 16, transform: 'translateX(-50%)' }
              : { top: `${position}%`, left: 16, transform: 'translateY(-50%)' }
            ),
            fontSize: '0.7rem',
            color: theme.palette.primary.contrastText
          }}
        >
          {Math.round(i / pixelsPerInch)}
        </Typography>
      ) : null;
      
      marks.push(
        <React.Fragment key={i}>
          <Box sx={markStyle} />
          {label}
        </React.Fragment>
      );
    }
    
    return marks;
  };

  // Get actual card size in CSS pixels after scaling
  const actualCardWidth = CARD_WIDTH_INCHES * pixelsPerInch * cardScale;
  const actualCardHeight = CARD_HEIGHT_INCHES * pixelsPerInch * cardScale;

  // Effect to fetch all families
  useEffect(() => {
    const fetchFamilies = async () => {
      try {
        setLoading(true);
        
        // Fetch data
        const response = await getAllFamiliesQuery.refetch();
        
        if (response.data) {
          const excludedCodes = ["BAAAD", "BAAAA", "BAAAB"]; // Exclude test codes
          
          // Filter out test families
          const filteredFamilies = response.data.filter(
            family => !excludedCodes.includes(family.invitationCode || '')
          );
          
          // Sort alphabetically by family name
          const sortedFamilies = filteredFamilies.sort((a, b) => {
            const aName = a.unitName?.toLowerCase() || '';
            const bName = b.unitName?.toLowerCase() || '';
            return aName.localeCompare(bName);
          });
          
          setAllFamilies(sortedFamilies);
          
          // Set initial selected family (either user's family or first in list)
          if (userFamily && userFamily.invitationCode) {
            const userFamilyFromList = sortedFamilies.find(f => 
              f.invitationCode === userFamily.invitationCode
            );
            if (userFamilyFromList) {
              setSelectedFamily(userFamilyFromList);
            } else if (sortedFamilies.length > 0) {
              setSelectedFamily(sortedFamilies[0]);
            }
          } else if (sortedFamilies.length > 0) {
            setSelectedFamily(sortedFamilies[0]);
          }
        } else if (response.error) {
          setError('Failed to fetch families');
        }
      } catch (err) {
        setError('An error occurred while fetching families');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFamilies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Calculate completion status for a family
  const calculateCompletionStatus = (family: FamilyUnitDto): StepCompletion => {
    return {
      hasGuests: Boolean(family.guests?.length),
      hasAgeGroups: Boolean(family.guests?.some(guest => guest.ageGroup)),
      hasNotificationPrefs: Boolean(family.guests?.some(guest => 
        guest.preferences?.notificationPreference?.length
      )),
      hasFoodPrefs: Boolean(family.guests?.some(guest => 
        guest.preferences?.foodPreference || 
        (guest.preferences?.foodAllergies && guest.preferences?.foodAllergies.length > 0)
      )),
      hasAccommodation: Boolean(family.guests?.some(guest => 
        guest.preferences?.sleepPreference
      )),
      hasMailingAddress: Boolean(family.mailingAddress?.streetAddress),
      hasComments: Boolean(family.invitationResponseNotes)
    };
  };

  const calculateLastNames = (family: FamilyUnitDto): string => {
    const lastNames = Array.from(new Set(family.guests?.map((user) => user.lastName)))
    .map((lastName) => `${lastName}`)
    .join(' & ');
    return lastNames;
  };

  // Calculate overall completion percentage
  const calculateCompletionPercentage = (family: FamilyUnitDto): number => {
    const completion = calculateCompletionStatus(family);
    const steps = Object.values(completion);
    const completedSteps = steps.filter(step => step).length;
    return Math.round((completedSteps / steps.length) * 100);
  };
  
  // Sort families based on selected option
  const sortFamilies = (families: FamilyUnitDto[], option: SortOption): FamilyUnitDto[] => {
    return [...families].sort((a, b) => {
      switch (option) {
        case 'name':
          return (a.unitName?.toLowerCase() || '').localeCompare(b.unitName?.toLowerCase() || '');
        case 'invitationCode':
          return (a.invitationCode || '').localeCompare(b.invitationCode || '');
        case 'guestCount':
          return (b.guests?.length || 0) - (a.guests?.length || 0);
        case 'responseStatus':
          const aInterested = a.guests?.filter(g => 
            g.rsvp?.invitationResponse === InvitationResponseEnum.Interested
          ).length || 0;
          const bInterested = b.guests?.filter(g => 
            g.rsvp?.invitationResponse === InvitationResponseEnum.Interested
          ).length || 0;
          return bInterested - aInterested;
        case 'completionStatus':
          return calculateCompletionPercentage(b) - calculateCompletionPercentage(a);
        default:
          return 0;
      }
    });
  };

  // Handle sort menu open
  const handleSortClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setSortAnchorEl(event.currentTarget);
  };

  // Handle sort menu close and selection
  const handleSortClose = (option?: SortOption) => {
    setSortAnchorEl(null);
    if (option) {
      setSortOption(option);
    }
  };
  
  // Handle print button click
  const handlePrint = () => {
    setIsPrinting(true);
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow pop-ups to print the card');
      setIsPrinting(false);
      return;
    }
    
    // Get the card element
    const cardElement = document.querySelector(
      cardSide === 'front' ? '.front-card' : '.back-card'
    );
    
    if (!cardElement) {
      printWindow.close();
      setIsPrinting(false);
      return;
    }
    
    // Set up the print window content
    printWindow.document.write(`
      <html>
        <head>
          <title>Print RSVP Card - ${selectedFamily?.unitName || 'Family'}</title>
          <style>
            @page {
              size: ${CARD_WIDTH_INCHES}in ${CARD_HEIGHT_INCHES}in;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              background-color: white;
            }
            .card-container {
              width: ${CARD_WIDTH_INCHES}in;
              height: ${CARD_HEIGHT_INCHES}in;
              overflow: hidden;
            }
            .card-content {
              transform-origin: top left;
              transform: scale(1);
            }
          </style>
        </head>
        <body>
          <div class="card-container">
            <div class="card-content">
              ${cardElement.outerHTML}
            </div>
          </div>
          <script>
            // Print and close after a short delay to ensure styles are applied
            setTimeout(() => {
              window.print();
              window.close();
            }, 500);
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    
    // Reset printing state after a short delay
    setTimeout(() => setIsPrinting(false), 1000);
  };

  // Calculate aggregate statistics for all families
  const familyStats = useMemo(() => {
    const totalFamilies = allFamilies.length;
    const totalGuests = allFamilies.reduce((total, family) => total + (family.guests?.length || 0), 0);
    const interestedGuests = allFamilies.reduce((total, family) => 
      total + (family.guests?.filter(g => 
        g.rsvp?.invitationResponse === InvitationResponseEnum.Interested
      ).length || 0), 0);
    const declinedGuests = allFamilies.reduce((total, family) => 
      total + (family.guests?.filter(g => 
        g.rsvp?.invitationResponse === InvitationResponseEnum.Declined
      ).length || 0), 0);
    const pendingGuests = totalGuests - interestedGuests - declinedGuests;
    
    return {
      totalFamilies,
      totalGuests,
      interestedGuests,
      declinedGuests,
      pendingGuests,
      interestedPercentage: totalGuests > 0 ? Math.round((interestedGuests / totalGuests) * 100) : 0,
      declinedPercentage: totalGuests > 0 ? Math.round((declinedGuests / totalGuests) * 100) : 0,
      pendingPercentage: totalGuests > 0 ? Math.round((pendingGuests / totalGuests) * 100) : 0
    };
  }, [allFamilies]);
  
  // Filter families based on search query
  const filteredFamilies = useMemo(() => {
    // First filter by search query
    const filtered = allFamilies.filter(family => {
      if (!searchQuery) return true;
      
      const searchLower = searchQuery.toLowerCase();
      
      // Search by family name
      if (family.unitName?.toLowerCase().includes(searchLower)) {
        return true;
      }
      
      // Search by invitation code
      if (family.invitationCode?.toLowerCase().includes(searchLower)) {
        return true;
      }
      
      // Search by guest names
      if (family.guests?.some(guest => 
        guest.firstName?.toLowerCase().includes(searchLower) || 
        guest.lastName?.toLowerCase().includes(searchLower)
      )) {
        return true;
      }
      
      return false;
    });
    
    // Then sort by selected option
    return sortFamilies(filtered, sortOption);
  }, [allFamilies, searchQuery, sortOption]);
  
  // Handle family selection
  const handleFamilySelect = (family: FamilyUnitDto) => {
    setSelectedFamily(family);
    setCardSide('back'); // Switch to back side to show RSVP info
  };
  
  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };
  
  // Handle refresh button click
  const handleRefresh = () => {
    getAllFamiliesQuery.refetch();
  };
  
  // QR code URL for the selected family's invitation code
  const qrCodeUrl = selectedFamily?.invitationCode 
    ? `https://christephanie.com/rsvp?invitationCode=${selectedFamily.invitationCode}`
    : "https://christephanie.com/rsvp?invitationCode=DEMO";

  // RSVP Front (Address Side with Artistic Elements)
  const renderFrontSide = () => {
    // Create a fancy border style matching the AddressEnvelope component
    const gradientBorder = `
      repeating-linear-gradient(
        45deg,
        ${theme.palette.primary.main}, 
        ${theme.palette.primary.main} 5%,
        #121212 5%, 
        #121212 10%,
        ${theme.palette.secondary.main} 10%, 
        ${theme.palette.secondary.main} 15%
      )
    `;
    
    // Calculate if family has individual guests or just a family unit
    const hasIndividualGuests = selectedFamily?.guests?.some(
      guest => guest.firstName && guest.lastName
    );
    
    return (
      <Paper 
        elevation={8}
        className="front-card"
        sx={{
          width: `${actualCardWidth}px`,
          height: `${actualCardHeight}px`,
          backgroundColor: '#121212', // Dark background matching the back side
          backgroundImage: `radial-gradient(ellipse at 30% 40%, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.2) 70%)`,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          transform: `scale(${cardScale})`,
          transformOrigin: 'top left',
          border: '10px solid transparent',
          borderImageSource: gradientBorder,
          borderImageSlice: 1,
          boxSizing: 'border-box',
          color: 'white'
        }}
      >
        {/* Background enhancement elements */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%)',
          zIndex: 0
        }} />
        
        {/* Subtle corner glow */}
        <Box sx={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 150,
          height: 150,
          background: `radial-gradient(circle, ${theme.palette.primary.main}30 0%, transparent 70%)`,
          opacity: 0.5,
          zIndex: 0
        }} />
        
        {/* Ornamental Header */}
        <Box sx={{
          position: 'relative',
          top: 10,
          left: 0,
          right: 0,
          textAlign: 'center',
          zIndex: 1
        }}>
          <StephsActualFavoriteTypographyNoDrop 
            variant="h5" 
            sx={{ 
              fontSize: '1.3rem', 
              color: theme.palette.secondary.main,
              mb: 0.5
            }}
          >
            RSVP
          </StephsActualFavoriteTypographyNoDrop>
          
          {/* Decorative divider */}
          <Box sx={{
            margin: '0 auto',
            width: '80%',
            height: '2px',
            background: `linear-gradient(to right, transparent, ${theme.palette.primary.main}, transparent)`,
            mb: 1
          }} />
        </Box>

        {/* Sender Address & Wedding Details */}
        <Box sx={{ 
          position: 'relative',
          textAlign: 'center',
          mt: 1,
          zIndex: 1
        }}>
          <Typography 
            variant="body1" 
            sx={{ 
              fontFamily: 'Snowstorm, serif',
              color: theme.palette.primary.light,
              fontWeight: 600,
              fontSize: '1rem',
              mb: 0.5,
              letterSpacing: '0.05em'
            }}
          >
            Christopher & Stephanie
          </Typography>
          
          <Typography 
            variant="h6" 
            sx={{ 
              fontFamily: 'Snowstorm, serif',
              color: theme.palette.secondary.light,
              fontWeight: 500,
              fontSize: '0.85rem',
              mb: 0.25,
              fontStyle: 'italic'
            }}
          >
            July 5, 2025 at 6:00pm
          </Typography>
          
          <Typography 
            variant="body2" 
            sx={{ 
              fontFamily: 'Snowstorm, serif',
              color: '#aaa',
              fontSize: '0.7rem'
            }}
          >
            Stone Manor Inn • Lovettsville, Virginia
          </Typography>
        </Box>
        
        {/* Guest Address Block */}
        <Box sx={{ 
          position: 'relative',
          mx: 'auto',
          mt: 2,
          width: '85%',
          p: 2,
          pt: 1.5,
          pb: 1.5,
          textAlign: 'center',
          borderRadius: '4px',
          border: `1px solid ${theme.palette.primary.main}`,
          backgroundColor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          boxShadow: `0 0 10px ${theme.palette.primary.dark}`,
          zIndex: 1
        }}>
          {/* First line - Family/Guest Name(s) */}
          <Typography 
            variant="body1" 
            sx={{ 
              fontFamily: 'Snowstorm, serif', 
              mb: 0.5, 
              fontWeight: 600,
              fontSize: '1.1rem',
              color: theme.palette.secondary.main,
              textShadow: '1px 1px 0px rgba(0,0,0,0.5)'
            }}
          >
            {calculateLastNames(selectedFamily || {}) || 'The Demo Family'} Family
          </Typography>
          
          {/* Individual guest names if available */}
          {hasIndividualGuests && (
            <Box sx={{ mb: 0.75 }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontFamily: 'Snowstorm, serif', 
                    fontSize: '0.8rem',
                    color: '#ddd',
                  }}
                > 
                  {selectedFamily?.guests
                    ?.sort((a, b) => (a.guestNumber || 0) - (b.guestNumber || 0))
                    .map(guest => guest.firstName)
                    .reduce((result, name, index, array) => {
                      if (array.length === 1) return name;
                      if (index === 0) return name;
                      if (index ===   array.length - 1) return `${result} and ${name}`;
                      return `${result}, ${name}`;
                    }, '')}
                </Typography>
            </Box>
          )}
          
          {/* Street Address */}
          {selectedFamily?.mailingAddress ? (
            <>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontFamily: 'Snowstorm, serif', 
                  lineHeight: 1.3,
                  mb: 0.25,
                  color: 'rgba(255,255,255,0.85)'
                }}
              >
                {selectedFamily.mailingAddress.streetAddress}
              </Typography>
              
              {selectedFamily.mailingAddress.secondaryAddress && (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontFamily: 'Snowstorm, serif', 
                    lineHeight: 1.3,
                    mb: 0.25,
                    color: 'rgba(255,255,255,0.85)'
                  }}
                >
                  {selectedFamily.mailingAddress.secondaryAddress}
                </Typography>
              )}
              
              {/* City, State ZIP */}
              <Typography 
                variant="body2" 
                sx={{ 
                  fontFamily: 'Snowstorm, serif', 
                  lineHeight: 1.3,
                  color: 'rgba(255,255,255,0.85)'
                }}
              >
                {selectedFamily.mailingAddress.city}, {selectedFamily.mailingAddress.state} {selectedFamily.mailingAddress.postalCode || selectedFamily.mailingAddress.zipCode}
              </Typography>
            </>
          ) : (
            <>
              {/* Address placeholder with prompt */}
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'rgba(255,255,255,0.5)',
                  fontStyle: 'italic',
                  fontSize: '0.75rem'
                }}
              >
                Please complete your mailing address in the RSVP form
              </Typography>
            </>
          )}
        </Box>
        
        {/* QR code stamp - now in stamp position */}
        <Box 
          sx={{ 
            position: 'absolute', 
            top: 15, 
            right: 15, 
            width: '80px', 
            height: '80px', 
            border: `1px solid ${theme.palette.secondary.main}`,
            borderRadius: '4px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            color: theme.palette.secondary.main,
            backgroundColor: 'rgba(0,0,0,0.7)',
            transform: 'rotate(3deg)',
            boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
            p: 0.5
          }}
        >
          <QRCodeSVG 
            value={qrCodeUrl}
            size={50}
            level="M"
            includeMargin={false}
            bgColor="rgba(0,0,0,0.5)"
            fgColor={theme.palette.primary.main}
            style={{
              borderRadius: '2px',
              padding: '2px',
              marginBottom: '2px'
            }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 0.25 }}>
            <Box 
              component="img" 
              src="/favicon_big_art_transparent.png" 
              alt="Logo" 
              sx={{ 
                width: '16px', 
                height: '16px', 
                objectFit: 'contain',
                mr: 0.5,
                filter: 'brightness(1.2)'
              }} 
            />
            <Typography variant="caption" sx={{ fontSize: '0.45rem', textAlign: 'center' }}>
              SCAN ME
            </Typography>
          </Box>
        </Box>
        
        {/* Decorative RSVP Circular Seal */}
        <Box 
          sx={{
            position: 'absolute',
            bottom: 25,
            left: '80%',
            transform: 'translateX(-50%) rotate(-3deg)',
            width: 130,
            height: 130,
            zIndex: 1
          }}
        >
          {/* Outer ring */}
          <Box 
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: 'transparent',
              border: `2px dashed ${theme.palette.secondary.main}`,
              opacity: 0.7,
              animation: 'rotation 30s linear infinite'
            }}
          />
          
          {/* Middle ring with text */}
          <Box 
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '85%',
              height: '85%',
              borderRadius: '50%',
              backgroundColor: 'rgba(0,0,0,0.6)',
              border: `2px solid ${theme.palette.primary.main}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column'
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                fontFamily: 'Snowstorm, serif',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                color: theme.palette.secondary.main,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                textAlign: 'center',
                lineHeight: 1.2,
                mb: 0.5
              }}
            >
              RSVP
            </Typography>
            
            <Typography 
              variant="body2" 
              sx={{ 
                fontFamily: 'Snowstorm, serif',
                fontSize: '0.7rem',
                color: '#FFFFFF',
                textAlign: 'center'
              }}
            >
              by May 19, 2025
            </Typography>
          </Box>
          
          {/* Inner decorative element */}
          <Box 
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '40%',
              height: '40%',
              borderRadius: '50%',
              border: `1px solid ${theme.palette.primary.main}`,
              opacity: 0.5
            }}
          />
        </Box>
        
        {/* Neon corner elements with heart shapes */}
        <Box 
          sx={{
            position: 'absolute',
            bottom: 15,
            left: 15,
            color: theme.palette.secondary.main,
            fontSize: '1.2rem',
            filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.5))',
            textShadow: '0 0 5px rgba(255,255,255,0.5)'
          }}
        >
          ♥
        </Box>
        
        <Box 
          sx={{
            position: 'absolute',
            bottom: 15,
            right: 15,
            color: theme.palette.secondary.main,
            fontSize: '1.2rem',
            filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.5))',
            textShadow: '0 0 5px rgba(255,255,255,0.5)'
          }}
        >
          ♥
        </Box>
        
        {/* Decorative corner elements */}
        <Box sx={{ 
          position: 'absolute', 
          top: 10, 
          left: 10, 
          width: 15, 
          height: 15, 
          borderTop: `1px solid ${theme.palette.primary.main}`, 
          borderLeft: `1px solid ${theme.palette.primary.main}` 
        }} />
        <Box sx={{ 
          position: 'absolute', 
          top: 10, 
          right: 10, 
          width: 15, 
          height: 15, 
          borderTop: `1px solid ${theme.palette.primary.main}`, 
          borderRight: `1px solid ${theme.palette.primary.main}` 
        }} />
        <Box sx={{ 
          position: 'absolute', 
          bottom: 10, 
          left: 10, 
          width: 15, 
          height: 15, 
          borderBottom: `1px solid ${theme.palette.primary.main}`, 
          borderLeft: `1px solid ${theme.palette.primary.main}` 
        }} />
        <Box sx={{ 
          position: 'absolute', 
          bottom: 10, 
          right: 10, 
          width: 15, 
          height: 15, 
          borderBottom: `1px solid ${theme.palette.primary.main}`, 
          borderRight: `1px solid ${theme.palette.primary.main}` 
        }} />
      </Paper>
    );
  };

  // Picture Side - Styled to match website
  const renderBackSide = () => (
    <Paper 
      elevation={8}
      className="back-card"
      sx={{
        width: `${actualCardWidth}px`,
        height: `${actualCardHeight}px`,
        backgroundColor: '#121212', // Dark background like the website
        overflow: 'hidden',
        position: 'relative',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        transform: `scale(${cardScale})`,
        transformOrigin: 'top left'
      }}
    >
      {/* Grid layout for photos */}
      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: '3fr 2fr',
        gridTemplateRows: '1fr 1fr',
        gap: '4px',
        width: '100%',
        height: '100%',
        padding: '4px',
        boxSizing: 'border-box'
      }}>
        {/* Main featured photo - EngagementPhoto2 (Landscape) */}
        <Box 
          component="img" 
          src={`${EngagementPhoto2}`}
          alt="Engagement Photo 2" 
          sx={{ 
            gridColumn: '1',
            gridRow: '1 / span 2',
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            objectPosition: 'center',
            borderRadius: '4px'
          }} 
        />
        
        {/* Portrait photo in top right */}
        <Box 
          component="img" 
          src={`${EngagementPhoto1}`}
          alt="Engagement Photo 1" 
          sx={{ 
            gridColumn: '2',
            gridRow: '1',
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            objectPosition: 'center top',
            borderRadius: '4px'
          }} 
        />
        
        {/* Two smaller photos in bottom right */}
        <Box sx={{
          gridColumn: '2',
          gridRow: '2',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '4px'
        }}>
          <Box 
            component="img" 
            src={`${EngagementPhoto3}`}
            alt="Engagement Photo 3" 
            sx={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover',
              objectPosition: 'center 30%',
              borderRadius: '4px'
            }} 
          />
          
          <Box 
            component="img" 
            src={`${EngagementPhoto4}`}
            alt="Engagement Photo 4" 
            sx={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover',
              objectPosition: 'center 40%',
              borderRadius: '4px'
            }} 
          />
        </Box>
      </Box>
      
      {/* Subtle branding overlay */}
      <Box sx={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '30%',
        background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
        pointerEvents: 'none'
      }} />
      
      {/* Decorative element - Heart icon */}
      <Box 
        sx={{
          position: 'absolute',
          bottom: 15,
          right: 15,
          color: theme.palette.secondary.main,
          fontSize: '1.5rem',
          filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.7))',
          opacity: 0.8
        }}
      >
        July 5, 2025
      </Box>
      
      {/* Subtle branding */}
      <Typography
        variant="body2"
        sx={{
          position: 'absolute',
          bottom: 10,
          left: 15,
          fontFamily: 'Snowstorm, serif',
          fontSize: '0.9rem',
          color: 'rgba(255,255,255,0.7)',
          textShadow: '1px 1px 3px rgba(0,0,0,0.8)'
        }}
      >
        Christopher & Stephanie
      </Typography>
    </Paper>
  );

  // Mobile view message
  if (isMobile && isSmallScreen) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center',
          height: '100vh',
          p: 3,
          textAlign: 'center',
          bgcolor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)'
        }}
      >
        <StephsActualFavoriteTypography variant="h5" gutterBottom>
          Printed RSVP Preview
        </StephsActualFavoriteTypography>
        <Typography variant="body1">
          Please use a larger screen or desktop device to view the printed RSVP template.
          This page is designed to show accurate physical dimensions of our printed materials.
        </Typography>
      </Box>
    );
  }

  // Main view
  return (
    <Box 
      sx={{ 
        p: 4, 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        bgcolor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)'
      }}
      ref={containerRef}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <StephsActualFavoriteTypography variant="h3" sx={{ flexGrow: 1 }}>
          Printed RSVP Card Preview
        </StephsActualFavoriteTypography>
        
        {/* Action buttons */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh data">
            <IconButton 
              color="primary"
              onClick={handleRefresh}
              disabled={getAllFamiliesQuery.isFetching}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Print current card">
            <span>
              <IconButton 
                color="primary"
                onClick={handlePrint}
                disabled={!selectedFamily || isPrinting}
              >
                <PrintIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>
      
      {/* Simplified info bar */}
      <Box 
        sx={{ 
          mb: 2, 
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip 
            icon={<FavoriteIcon />} 
            label={`${familyStats.interestedGuests} Interested`} 
            color="success"
            variant="outlined"
            size="small"
          />
          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
            Showing {filteredFamilies.length} of {familyStats.totalFamilies} families
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
            Card size: {CARD_WIDTH_INCHES}" × {CARD_HEIGHT_INCHES}"
          </Typography>
        </Box>
      </Box>
      
      {/* Main content area with families list on left and card preview on right */}
      <Box sx={{ display: 'flex', flexGrow: 1, gap: 3, height: `calc(100vh - 350px)` }}>
        {/* Left side - Families List */}
        <Box sx={{ 
          width: 350, 
          bgcolor: 'rgba(0, 0, 0, 0.5)',
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Search and sort controls */}
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                placeholder="Search families..."
                value={searchQuery}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
              
              <Button 
                variant="outlined" 
                size="small" 
                startIcon={<SortIcon />}
                onClick={handleSortClick}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Sort
              </Button>
              <Menu
                anchorEl={sortAnchorEl}
                open={Boolean(sortAnchorEl)}
                onClose={() => handleSortClose()}
              >
                <MenuItem 
                  onClick={() => handleSortClose('name')}
                  selected={sortOption === 'name'}
                >
                  Sort by Family Name
                </MenuItem>
                <MenuItem 
                  onClick={() => handleSortClose('invitationCode')}
                  selected={sortOption === 'invitationCode'}
                >
                  Sort by Invitation Code
                </MenuItem>
                <MenuItem 
                  onClick={() => handleSortClose('guestCount')}
                  selected={sortOption === 'guestCount'}
                >
                  Sort by Guest Count
                </MenuItem>
                <MenuItem 
                  onClick={() => handleSortClose('responseStatus')}
                  selected={sortOption === 'responseStatus'}
                >
                  Sort by Response Status
                </MenuItem>
                <MenuItem 
                  onClick={() => handleSortClose('completionStatus')}
                  selected={sortOption === 'completionStatus'}
                >
                  Sort by Completion Status
                </MenuItem>
              </Menu>
            </Box>
            
            <Typography variant="caption" color="text.secondary">
              Currently sorting by: <strong>
                {sortOption === 'name' ? 'Family Name' : 
                 sortOption === 'invitationCode' ? 'Invitation Code' :
                 sortOption === 'guestCount' ? 'Guest Count' :
                 sortOption === 'responseStatus' ? 'Response Status' :
                 'Completion Status'}
              </strong>
            </Typography>
          </Box>
          
          {/* Families list */}
          {loading || getAllFamiliesQuery.isFetching ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', flexGrow: 1, p: 3 }}>
              <CircularProgress size={40} sx={{ mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Loading families...
              </Typography>
            </Box>
          ) : error ? (
            <Box sx={{ p: 3, color: 'error.main', textAlign: 'center' }}>
              <Typography variant="body2" color="error" gutterBottom>{error}</Typography>
              <Button 
                variant="outlined" 
                color="error" 
                size="small"
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
              >
                Try Again
              </Button>
            </Box>
          ) : (
            <List sx={{ flexGrow: 1, overflow: 'auto' }}>
              {filteredFamilies.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>No families found</Typography>
                  {searchQuery && (
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => setSearchQuery('')}
                    >
                      Clear Search
                    </Button>
                  )}
                </Box>
              ) : (
                filteredFamilies.map((family) => {
                  const completionPercent = calculateCompletionPercentage(family);
                  const completionStatus = calculateCompletionStatus(family);
                  
                  // Calculate how many guests have responded as interested
                  const interestedCount = family.guests?.filter(g => 
                    g.rsvp?.invitationResponse === InvitationResponseEnum.Interested
                  ).length || 0;
                  
                  return (
                    <ListItemButton
                      key={family.invitationCode}
                      selected={selectedFamily?.invitationCode === family.invitationCode}
                      onClick={() => handleFamilySelect(family)}
                      sx={{ 
                        borderRadius: 1,
                        my: 0.5,
                        mx: 1,
                        '&.Mui-selected': {
                          bgcolor: 'primary.dark',
                          '&:hover': {
                            bgcolor: 'primary.main',
                          }
                        }
                      }}
                    >
                      <Badge
                        badgeContent={family.guests?.length || 0}
                        color="secondary"
                        sx={{ mr: 2 }}
                        overlap="circular"
                      >
                        <Avatar 
                          sx={{ 
                            bgcolor: interestedCount > 0 ? 'success.dark' : 'primary.dark', 
                            width: 40, 
                            height: 40, 
                            fontSize: '1rem' 
                          }}
                        >
                          {family.unitName?.substring(0, 1) || '?'}
                        </Avatar>
                      </Badge>
                      
                      <ListItemText 
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography noWrap component="span" sx={{ flexGrow: 1 }}>
                              {family.unitName || 'Unnamed Family'}
                            </Typography>
                            {interestedCount > 0 && (
                              <Tooltip title={`${interestedCount} interested guest${interestedCount !== 1 ? 's' : ''}`}>
                                <Box component="span" sx={{ display: 'flex', ml: 1 }}>
                                  <FavoriteIcon 
                                    fontSize="small" 
                                    color="error"
                                    sx={{ fontSize: '1rem' }} 
                                  />
                                </Box>
                              </Tooltip>
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="caption" component="span">
                              Code: {family.invitationCode}
                            </Typography>
                            <Box sx={{ mt: 0.5, display: 'flex', alignItems: 'center' }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={completionPercent}
                                sx={{ 
                                  height: 6, 
                                  borderRadius: 1, 
                                  flexGrow: 1,
                                  mr: 1,
                                  backgroundColor: 'rgba(255,255,255,0.1)'
                                }}
                              />
                              <Typography variant="caption">{completionPercent}%</Typography>
                            </Box>
                          </Box>
                        }
                        primaryTypographyProps={{
                          style: { textOverflow: 'ellipsis' }
                        }}
                      />
                    </ListItemButton>
                  );
                })
              )}
            </List>
          )}
          
          {/* Stats footer */}
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="body2" color="text.secondary">
              Showing {filteredFamilies.length} of {allFamilies.length} families • 
              {filteredFamilies.reduce((sum, family) => sum + (family.guests?.length || 0), 0)} guests
            </Typography>
          </Box>
        </Box>
        
        {/* Right side - Card Preview */}
        <Box sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          height: '100%',
          overflow: 'hidden'
        }}>
          {/* Toggle between front and back of the card */}
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 3, gap: 2 }}>
            <ToggleButtonGroup
              value={cardSide}
              exclusive
              onChange={handleCardSideToggle}
              aria-label="Card side"
              color="primary"
            >
              <ToggleButton value="front">
                <MailOutlineIcon sx={{ mr: 1 }} />
                Address Side
              </ToggleButton>
              <ToggleButton value="back">
                <EmailIcon sx={{ mr: 1 }} />
                Picture Side
              </ToggleButton>
            </ToggleButtonGroup>
            
            <Button
              variant="contained"
              startIcon={<PrintIcon />}
              disabled={!selectedFamily || isPrinting}
              onClick={handlePrint}
              color="secondary"
              sx={{ ml: 2 }}
            >
              Print Card
            </Button>
          </Box>
          
          {/* Card with rulers */}
          <Box 
            sx={{ 
              position: 'relative', 
              flexGrow: 1,
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'flex-start',
              p: 4,
              ml: 5, 
              mt: 5,
              overflow: 'auto',
              maxHeight: 'calc(100vh - 350px)'
            }}
          >
            {/* Horizontal ruler at the top */}
            <Box sx={{ 
              position: 'absolute', 
              top: 0, 
              left: 40, 
              width: `${actualCardWidth + 20}px`, 
              height: 40, 
              display: 'flex',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              borderRadius: '4px 4px 0 0'
            }}>
              {createRulerMarks(actualCardWidth + 20, true)}
            </Box>
            
            {/* Vertical ruler on the left */}
            <Box sx={{ 
              position: 'absolute', 
              top: 40, 
              left: 0, 
              width: 40, 
              height: `${actualCardHeight + 20}px`, 
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              borderRadius: '0 0 0 4px'
            }}>
              {createRulerMarks(actualCardHeight + 20, false)}
            </Box>
            
            {/* Card content with fade transition */}
            <Box sx={{ mt: 4, ml: 4 }}>
              {selectedFamily ? (
                <Fade key={`${cardSide}-${selectedFamily.invitationCode}`} in={true} timeout={500}>
                  <Box>
                    {cardSide === 'front' ? renderFrontSide() : renderBackSide()}
                    
                    {/* Optional: Add a simple completion percentage */}
                    <Box sx={{ 
                      mt: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1
                    }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        Form completion: {calculateCompletionPercentage(selectedFamily)}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={calculateCompletionPercentage(selectedFamily)}
                        sx={{ 
                          width: 100,
                          height: 4,
                          borderRadius: 1
                        }}
                      />
                    </Box>
                  </Box>
                </Fade>
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center', 
                  height: '200px',
                  width: `${actualCardWidth}px`,
                  color: 'text.secondary',
                  bgcolor: 'rgba(0,0,0,0.3)',
                  borderRadius: 2,
                  p: 3
                }}>
                  <InfoIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                  <Typography gutterBottom>Select a family to preview their card</Typography>
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    Choose a family from the list on the left to see their RSVP card
                  </Typography>
                </Box>
              )}
              
              {/* Display physical dimensions below the card */}
              {selectedFamily && (
                <>
                  <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'gray' }}>
                    Actual card dimensions: {CARD_WIDTH_INCHES}" × {CARD_HEIGHT_INCHES}"
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', color: 'gray' }}>
                    Scale: {(cardScale * 100).toFixed(0)}% of actual size
                  </Typography>
                </>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default PrintedRsvp;