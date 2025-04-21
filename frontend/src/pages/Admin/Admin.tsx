import { useEffect, useState, ReactElement } from 'react';
import { FamilyUnitDto, InvitationResponseEnum, GuestDto } from '@/types/api';
import { useAdminQueries } from '@/hooks/useAdminQueries';
import { useApiContext } from '@/context/ApiContext';
import { isAdmin } from '@/utils/roles';
import { useRecoilValue } from 'recoil';
import { userState } from '@/store/user';
import { getTierDetails } from './components/AdminHelpers';
import { GuestPopperState, getRandomAxis } from '../Stats/components/StatsHelpers';
import GuestDetailCard from '../Stats/components/GuestDetailCard';
import { StephsActualFavoriteTypography, StephsActualFavoriteTypographyNoDrop } from '@/components/AttendanceButton/components/StyledComponents';
import AdminFamilyCard from './components/AdminFamilyCard';
import PrintedRsvp from '../PrintedRsvp/PrintedRsvp';
import { SelectChangeEvent } from '@mui/material';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  CircularProgress, 
  Alert, 
  Divider,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
  Container,
  Popper,
  Grow,
  ClickAwayListener,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select
} from '@mui/material';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

// Import custom components
import FamilyList, { SortOption } from './components/FamilyList';
import FamilyDetails from './components/FamilyDetails';

// Define the TabPanel props interface
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
  style?: React.CSSProperties;
}

// TabPanel component for displaying tab content
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  
  // Special styles for Summary tab
  const isSummaryTab = index === 4;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
      style={{ 
        width: '100%', 
        height: isSummaryTab ? 'auto' : '100%', 
        overflow: isSummaryTab ? 'visible' : 'auto',
        minHeight: isSummaryTab ? '100%' : 'auto'
      }}
    >
      {value === index && (
        <Box sx={{ 
          width: '100%', 
          height: isSummaryTab ? 'auto' : '100%', 
          position: 'relative',
          overflow: isSummaryTab ? 'visible' : 'inherit'
        }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Helper function for tab accessibility props
function a11yProps(index: number) {
  return {
    id: `admin-tab-${index}`,
    'aria-controls': `admin-tabpanel-${index}`,
  };
}

// Interface for tab items
interface TabItem {
  label: string;
  path: string;
}

// Maps URL paths to tab indices
const pathToTabIndex: Record<string, number> = {
  '/admin': 0,
  '/admin/details': 0,
  '/admin/edit': 1,
  '/admin/printed-invite': 2,
  '/admin/notifications': 3,
  '/admin/summary': 4,
};

function AdminPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const navigate = useNavigate();

  const [expandedFamilyCodes, setExpandedFamilyCodes] = useState<Set<string>>(new Set());
  
  const toggleExpanded = (invitationCode: string) => {
    setExpandedFamilyCodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(invitationCode)) {
        newSet.delete(invitationCode);
      } else {
        newSet.add(invitationCode);
      }
      return newSet;
    });
  };

  // Initial tab index based on the current URL path
  const initialTabIndex = pathToTabIndex[location.pathname] || 0;
  const [tabIndex, setTabIndex] = useState(initialTabIndex);
  
  const [adminData, setAdminData] = useState<FamilyUnitDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('lastUpdated');
  const [selectedFamily, setSelectedFamily] = useState<FamilyUnitDto | null>(null);
  const [familyDetailsLoading, setFamilyDetailsLoading] = useState(false);
  
  // Guest detail popper state
  const [popperState, setPopperState] = useState<GuestPopperState>({
    open: false,
    anchorEl: null,
    guestId: null,
    flipped: false,
    flipAxis: 'Y'
  });
  
  
  // Use admin data query
  const { getAllFamiliesQuery } = useAdminQueries();
  const apiContext = useApiContext();
  
  const user = useRecoilValue(userState);
  const userIsAdmin = isAdmin(user);

  // Update tab index when location changes
  useEffect(() => {
    // If we're on the root admin path, redirect to the details tab
    if (location.pathname === '/admin') {
      navigate('/admin/details');
      return;
    }

    const newTabIndex = pathToTabIndex[location.pathname] || 0;
    if (newTabIndex !== tabIndex) {
      setTabIndex(newTabIndex);
    }
  }, [location.pathname, tabIndex, navigate]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);

    // Update URL when tab changes
    switch(newValue) {
      case 0:
        navigate('/admin/details');
        break;
      case 1:
        navigate('/admin/edit');
        break;
      case 2:
        navigate('/admin/printed-invite');
        break;
      case 3:
        navigate('/admin/notifications');
        break;
      case 4:
        navigate('/admin/summary');
        break;
      default:
        navigate('/admin');
    }
  };
  
  // Handle guest click to show detail popper
  const handleGuestClick = (event: React.MouseEvent<HTMLElement>, guestId: string) => {
    const flipAxis = getRandomAxis();
    setPopperState({
      open: true,
      anchorEl: event.currentTarget,
      guestId,
      flipped: false,
      flipAxis
    });
  };

  // Handle closing the popper
  const handleClosePopper = () => {
    setPopperState({
      ...popperState,
      open: false
    });
  };

  // Find a guest by ID
  const findGuestById = (guestId: string | null) => {
    if (!guestId) {
      return null;
    }
    
    let foundGuest = null;
    let invitationCode = null;
    
    for (const family of adminData) {
      if (family.guests) {
        foundGuest = family.guests.find(guest => guest.guestId === guestId);
        if (foundGuest) {
          invitationCode = family.invitationCode;
          break;
        }
      }
    }
    
    // Add invitationCode to guest if found
    if (foundGuest && invitationCode) {
      return {
        ...foundGuest,
        invitationCode
      };
    }
    
    return null;
  };

  // Handle flipping the card
  const handleFlipCard = () => {
    setPopperState({
      ...popperState,
      flipped: !popperState.flipped
    });
  };
  
  // Sort families based on selected sort option - specific for FamilyUnitDto arrays
  const sortFamilies = (families: FamilyUnitDto[], sortOption: SortOption): FamilyUnitDto[] => {
    const filteredFamilies = [...families];
    
    switch(sortOption) {
      case 'lastUpdated':
        // Sort by last update date (most recent first), then tier, then last name
        return filteredFamilies.sort((a, b) => {
          // Get lastUpdate timestamps
          const aLastUpdate = a.guests?.reduce((latest, guest) => {
            const invitationAudit = guest.rsvp?.invitationResponseAudit?.lastUpdate;
            const rsvpAudit = guest.rsvp?.rsvpAudit?.lastUpdate;
            
            const latestGuestUpdate = new Date(
              Math.max(
                invitationAudit ? new Date(invitationAudit).getTime() : 0,
                rsvpAudit ? new Date(rsvpAudit).getTime() : 0
              )
            );
            
            return latestGuestUpdate > latest ? latestGuestUpdate : latest;
          }, new Date(0)) || new Date(0);
          
          const bLastUpdate = b.guests?.reduce((latest, guest) => {
            const invitationAudit = guest.rsvp?.invitationResponseAudit?.lastUpdate;
            const rsvpAudit = guest.rsvp?.rsvpAudit?.lastUpdate;
            
            const latestGuestUpdate = new Date(
              Math.max(
                invitationAudit ? new Date(invitationAudit).getTime() : 0,
                rsvpAudit ? new Date(rsvpAudit).getTime() : 0
              )
            );
            
            return latestGuestUpdate > latest ? latestGuestUpdate : latest;
          }, new Date(0)) || new Date(0);
          
          // Sort by lastUpdate (most recent first)
          const dateComparison = bLastUpdate.getTime() - aLastUpdate.getTime();
          
          if (dateComparison !== 0) {
            return dateComparison;
          }
          
          // If same last update date, then sort by tier
          const aTierDetails = getTierDetails('tier' in a ? a.tier : null);
          const bTierDetails = getTierDetails('tier' in b ? b.tier : null);
          const tierComparison = aTierDetails.priority - bTierDetails.priority;
          
          if (tierComparison !== 0) {
            return tierComparison;
          }
          
          // If same tier, sort by last name
          const aName = a.unitName?.toLowerCase() || '';
          const bName = b.unitName?.toLowerCase() || '';
          return aName.localeCompare(bName);
        });
        
      case 'invitationStatus':
        // Sort by invitation status (declined first, then interested, then pending), then tier, then last name
        return filteredFamilies.sort((a, b) => {
          // Get invitation status priority (1: Declined, 2: Interested, 3: Pending)
          const getStatusPriority = (family: FamilyUnitDto): number => {
            if (family.guests?.some(guest => guest.rsvp?.invitationResponse === InvitationResponseEnum.Declined)) {
              return 1; // Declined has highest priority
            } else if (family.guests?.some(guest => guest.rsvp?.invitationResponse === InvitationResponseEnum.Interested)) {
              return 2; // Interested has second highest priority
            } else {
              return 3; // Pending has lowest priority
            }
          };
          
          const aStatusPriority = getStatusPriority(a);
          const bStatusPriority = getStatusPriority(b);
          
          // Sort by status priority
          const statusComparison = aStatusPriority - bStatusPriority;
          
          if (statusComparison !== 0) {
            return statusComparison;
          }
          
          // If same status, sort by tier
          const aTierDetails = getTierDetails('tier' in a ? a.tier : null);
          const bTierDetails = getTierDetails('tier' in b ? b.tier : null);
          const tierComparison = aTierDetails.priority - bTierDetails.priority;
          
          if (tierComparison !== 0) {
            return tierComparison;
          }
          
          // If same tier, sort by last name
          const aName = a.unitName?.toLowerCase() || '';
          const bName = b.unitName?.toLowerCase() || '';
          return aName.localeCompare(bName);
        });
      
      default: // 'default' - Sort by tier, then family name
        return filteredFamilies.sort((a, b) => {
          // Sort by tier priority
          const aTierDetails = getTierDetails('tier' in a ? a.tier : null);
          const bTierDetails = getTierDetails('tier' in b ? b.tier : null);
          const tierComparison = aTierDetails.priority - bTierDetails.priority;
          
          if (tierComparison !== 0) {
            return tierComparison;
          }
          
          // If same tier, sort by last name
          const aName = a.unitName?.toLowerCase() || '';
          const bName = b.unitName?.toLowerCase() || '';
          return aName.localeCompare(bName);
        });
    }
  };

  // Handle sorting selector change
  const handleSortChange = (event: SelectChangeEvent) => {
    setSortOption(event.target.value as SortOption);
  };

  // Handle family selection
  const handleFamilySelect = async (family: FamilyUnitDto) => {
    if (family.invitationCode === selectedFamily?.invitationCode) {
      return; // Already selected
    }
    
    setFamilyDetailsLoading(true);
    setSelectedFamily(family);
    
    try {
      // Optionally fetch more detailed information about the family
      // This could be implemented later to get the most up-to-date information
      // const detailedFamily = await apiContext.getFamilyByInvitationCode(family.invitationCode);
      // setSelectedFamily(detailedFamily);
      
      // For now, just use the family from the list
      setFamilyDetailsLoading(false);
    } catch (err) {
      console.error('Error fetching detailed family data:', err);
      setFamilyDetailsLoading(false);
    }
  };

  // Function to sort admin data when the sort option changes
  useEffect(() => {
    if (adminData.length > 0) {
      const sortedFamilies = sortFamilies([...adminData], sortOption);
      setAdminData(sortedFamilies);
    }
  }, [sortOption]); // Only re-sort when the sort option changes
    
  // Fetch admin data (admin-only endpoint) only if user is admin
  useEffect(() => {
    // Only fetch admin data if the user has admin role
    if (!userIsAdmin) {
      setLoading(false);
      return;
    }
    
    const fetchAdminData = async () => {
      try {
        // Check if we already have cached data
        if (getAllFamiliesQuery.data && getAllFamiliesQuery.data.length > 0) {
          const sortedFamilies = sortFamilies(getAllFamiliesQuery.data, sortOption);
          setAdminData(sortedFamilies);
          
          // Select the first family by default when data loads
          if (sortedFamilies.length > 0 && !selectedFamily) {
            setSelectedFamily(sortedFamilies[0]);
          }
          
          setLoading(false);
          return;
        }
        
        const result = await getAllFamiliesQuery.refetch();
        
        if (result.status === 'success' && result.data) {
          const sortedFamilies = sortFamilies(result.data, sortOption);
          setAdminData(sortedFamilies);
          
          // Select the first family by default when data loads
          if (sortedFamilies.length > 0 && !selectedFamily) {
            setSelectedFamily(sortedFamilies[0]);
          }
          
          setLoading(false);
        } else {
          console.error('Failed to load admin data');
          setError('Failed to load admin data. Please try again later.');
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching admin data:', err);
        setError('Error loading admin data. Please try again later.');
        setLoading(false);
      }
    };

    fetchAdminData();
    // Only run once on mount if user is admin
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getAllFamiliesQuery, userIsAdmin]);
  

  // If user is not an admin, redirect to home page
  if (!loading && !userIsAdmin) {
    return <Navigate to="/" replace />;
  }

  // Define the component for each tab
  const EditTabContent = () => (
    <Grid container spacing={2} sx={{ height: '100%' }}>
      {/* Left Panel - Family List */}
      <Grid item xs={12} md={4} lg={3} sx={{ 
        height: isMobile ? 'auto' : 'calc(100vh - 200px)', // Adjusted for tabs
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Paper elevation={3} sx={{ 
          p: 2, 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <Typography variant="h6" component="h2" gutterBottom>
            Family Units
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          {/* Family List component - allow it to fill available space */}
          <Box sx={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column',
            overflow: 'auto'
          }}>
            <FamilyList 
              families={adminData}
              selectedFamily={selectedFamily}
              onFamilySelect={handleFamilySelect}
              sortOption={sortOption}
              onSortChange={handleSortChange}
            />
          </Box>
        </Paper>
      </Grid>
      
      {/* Right Panel - Family Details */}
      <Grid item xs={12} md={8} lg={9} sx={{ 
        height: isMobile ? 'auto' : 'calc(100vh - 200px)', // Adjusted for tabs
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Paper elevation={3} sx={{ 
          p: 2, 
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Family Details component */}
          <FamilyDetails 
            family={selectedFamily} 
            loading={familyDetailsLoading}
            onFamilyUpdate={async () => {
              // Refresh all families data
              try {
                const result = await getAllFamiliesQuery.refetch();
                if (result.status === 'success' && result.data) {
                  const sortedFamilies = sortFamilies(result.data, sortOption);
                  setAdminData(sortedFamilies);
                  
                  // Also update the selected family
                  if (selectedFamily) {
                    const updatedFamily = result.data.find(
                      f => f.invitationCode === selectedFamily.invitationCode
                    );
                    if (updatedFamily) {
                      setSelectedFamily(updatedFamily);
                    }
                  }
                }
              } catch (err) {
                console.error('Error refreshing admin data:', err);
              }
            }}
          />
        </Paper>
      </Grid>
    </Grid>
  );

  // Details tab content with just families and guests
  const DetailsTabContent = () => (
    <Box sx={{ 
      p: { xs: 1, sm: 2, md: 3 }, 
      maxWidth: '100%',
      height: '100%',
      overflow: 'auto', // Make sure the content is scrollable
      userSelect: 'text',
      WebkitUserSelect: 'text',
      WebkitTouchCallout: 'default',
      WebkitUserModify: 'read-write',
      MozUserSelect: 'text',
      msUserSelect: 'text',
      cursor: 'auto'
    }}>
      <StephsActualFavoriteTypography variant="h1" gutterBottom sx={{ 
        mb: 4,
        fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.5rem' }
      }}>
        Wedding Guests
      </StephsActualFavoriteTypography>
      
      {/* Family Cards */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' }, 
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' }, 
        gap: { xs: 2, sm: 0 },
        mb: 4 
      }}>
        <StephsActualFavoriteTypography variant="h2" gutterBottom sx={{ 
          mb: 0,
          fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
        }}>
          All Families
        </StephsActualFavoriteTypography>
        
        <FormControl sx={{ 
          minWidth: { xs: '100%', sm: 200 }
        }}>
          <InputLabel id="details-sort-select-label">Sort by</InputLabel>
          <Select
            labelId="details-sort-select-label"
            id="details-sort-select"
            value={sortOption}
            label="Sort by"
            onChange={handleSortChange}
            sx={{ 
              '& .MuiSelect-select': {
                whiteSpace: 'normal'
              }
            }}
          >
            <MenuItem value="lastUpdated">Last Updated (Recent First)</MenuItem>
            <MenuItem value="invitationStatus">Interest Status (Declined First)</MenuItem>
            <MenuItem value="default">Tier (Tier, Name)</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid 
          container 
          spacing={3} 
          sx={{ 
            pb: 15,
            mt: 0, // Add explicit margin to prevent layout shifts
            width: '100%'
          }}
          data-testid="admin-family-grid"
        >
          {adminData.map((family) => (
            <Grid item xs={12} md={6} lg={4} key={family.invitationCode}>
              <AdminFamilyCard 
                family={family} 
                onGuestClick={handleGuestClick}
                expanded={expandedFamilyCodes.has(family.invitationCode)}
                onToggleExpanded={() => toggleExpanded(family.invitationCode)}
              />
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Guest Detail Popper */}
      <Popper
        open={popperState.open}
        anchorEl={popperState.anchorEl}
        placement="bottom-start"
        transition
        style={{ zIndex: 1300, width: 300 }}
      >
        {({ TransitionProps }) => (
          <ClickAwayListener onClickAway={handleClosePopper}>
            <Grow {...TransitionProps} timeout={350}>
              <Box 
                sx={{ 
                  mt: 1,
                  maxHeight: '80vh',
                  overflow: 'auto',
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 1,
                  boxShadow: 3,
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {popperState.guestId && findGuestById(popperState.guestId) && (
                  <>
                    <Box>
                      {/* Action button for flipping the card */}
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          justifyContent: 'flex-end',
                          p: 1,
                          borderBottom: '1px solid rgba(255,255,255,0.2)'
                        }}
                      >
                        <Button 
                          variant="outlined" 
                          size="small"
                          color="primary"
                          onClick={handleFlipCard}
                        >
                          Flip Card
                        </Button>
                      </Box>
                      
                      <Box onClick={handleFlipCard}>
                        <GuestDetailCard 
                          guest={findGuestById(popperState.guestId)!} 
                          flipped={popperState.flipped} 
                          flipAxis={popperState.flipAxis}
                        />
                      </Box>
                    </Box>
                  </>
                )}
              </Box>
            </Grow>
          </ClickAwayListener>
        )}
      </Popper>
    </Box>
  );

  // Summary tab content with comprehensive statistics, organized by family
  const SummaryTabContent = () => {
    // Group families by accommodation preferences
    type AccommodationMap = {
      camping: Map<string, FamilyUnitDto>;
      manor: Map<string, FamilyUnitDto>;
      hotel: Map<string, FamilyUnitDto>;
      other: Map<string, FamilyUnitDto>;
      unknown: Map<string, FamilyUnitDto>;
    };
    
    // Initialize accommodation maps (using Maps to maintain unique families)
    const familyAccommodationMap: AccommodationMap = {
      camping: new Map<string, FamilyUnitDto>(),
      manor: new Map<string, FamilyUnitDto>(),
      hotel: new Map<string, FamilyUnitDto>(),
      other: new Map<string, FamilyUnitDto>(),
      unknown: new Map<string, FamilyUnitDto>()
    };
    
    // Track guests by accommodation type within each family
    type GuestAccommodation = {
      camping: GuestDto[];
      manor: GuestDto[];
      hotel: GuestDto[];
      other: GuestDto[];
      unknown: GuestDto[];
    };
    
    // Map to store guests by accommodation for each family
    const familyGuestsByAccommodation = new Map<string, GuestAccommodation>();
    
    // Collect family comments
    const familyComments = [] as Array<{
      familyName: string,
      invitationCode: string,
      comment: string,
      lastUpdatedBy: string | null
    }>;
    
    // Collect food allergies and dietary restrictions
    const foodAllergies = new Map<string, {count: number, guests: string[], families: Set<string>}>();
    
    // Process all families and guests
    adminData.forEach(family => {
      const invitationCode = family.invitationCode || '';
      
      // Initialize guest accommodation map for this family
      familyGuestsByAccommodation.set(invitationCode, {
        camping: [],
        manor: [],
        hotel: [],
        other: [],
        unknown: []
      });
      
      // Check for family comments
      if (family.invitationResponseNotes?.trim()) {
        // Get latest guest activity 
        const validGuests = family.guests?.filter(guest => guest.lastActivity !== null) || [];
        let lastUpdateName: string | null = null;
        
        if (validGuests.length > 0) {
          const latestGuest = validGuests.reduce((prev, current) => {
            const prevDate = new Date(prev.lastActivity!);
            const currentDate = new Date(current.lastActivity!);
            return prevDate > currentDate ? prev : current;
          });
          lastUpdateName = latestGuest.firstName;
        }
        
        familyComments.push({
          familyName: family.unitName || 'Unknown Family',
          invitationCode,
          comment: family.invitationResponseNotes,
          lastUpdatedBy: lastUpdateName
        });
      }
      
      // Process guest preferences
      family.guests?.forEach(guest => {
        const guestAccommodation = familyGuestsByAccommodation.get(invitationCode)!;
        
        // Accommodation preferences
        if (guest.preferences?.sleepPreference) {
          switch(guest.preferences.sleepPreference) {
            case 'Camping':
              guestAccommodation.camping.push(guest);
              familyAccommodationMap.camping.set(invitationCode, family);
              break;
            case 'Manor':
              guestAccommodation.manor.push(guest);
              familyAccommodationMap.manor.set(invitationCode, family);
              break;
            case 'Hotel':
              guestAccommodation.hotel.push(guest);
              familyAccommodationMap.hotel.set(invitationCode, family);
              break;
            case 'Other':
              guestAccommodation.other.push(guest);
              familyAccommodationMap.other.set(invitationCode, family);
              break;
            default:
              guestAccommodation.unknown.push(guest);
              familyAccommodationMap.unknown.set(invitationCode, family);
          }
        } else {
          guestAccommodation.unknown.push(guest);
          familyAccommodationMap.unknown.set(invitationCode, family);
        }
        
        // Food allergies and restrictions
        if (guest.preferences?.foodAllergies && guest.preferences.foodAllergies.length > 0) {
          guest.preferences.foodAllergies.forEach(allergy => {
            if (!foodAllergies.has(allergy)) {
              foodAllergies.set(allergy, {count: 0, guests: [], families: new Set()});
            }
            const entry = foodAllergies.get(allergy)!;
            entry.count++;
            entry.guests.push(`${guest.firstName} ${guest.lastName || ''}`);
            entry.families.add(family.unitName || '');
          });
        }
      });
    });
    
    // Convert Maps to arrays for rendering
    const campingFamilies = Array.from(familyAccommodationMap.camping.values());
    const manorFamilies = Array.from(familyAccommodationMap.manor.values());
    const hotelFamilies = Array.from(familyAccommodationMap.hotel.values());
    const otherFamilies = Array.from(familyAccommodationMap.other.values());
    const unknownFamilies = Array.from(familyAccommodationMap.unknown.values());
    
    // Sort food allergies by count (descending)
    const sortedFoodAllergies = Array.from(foodAllergies.entries())
      .sort((a, b) => b[1].count - a[1].count);
    
    // Function to render a family card with guests grouped by accommodation type
    const renderFamilyCard = (family: FamilyUnitDto, accommodationType: keyof GuestAccommodation, color: string) => {
      const invitationCode = family.invitationCode || '';
      const guestGroups = familyGuestsByAccommodation.get(invitationCode);
      
      if (!guestGroups) return null;
      
      const relevantGuests = guestGroups[accommodationType];
      
      if (relevantGuests.length === 0) return null;
      
      return (
        <Grid item xs={12} sm={6} md={4} key={`${invitationCode}-${accommodationType}`}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              borderRadius: 2,
              borderLeft: '4px solid',
              borderColor: color,
              height: '100%'
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              {family.unitName}
              <Typography 
                component="span" 
                variant="caption" 
                sx={{ ml: 1, color: 'text.secondary' }}
              >
                ({family.invitationCode})
              </Typography>
            </Typography>
            
            <Divider sx={{ my: 1 }} />
            
            {/* Show guests with this accommodation type */}
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Guests ({relevantGuests.length}):
            </Typography>
            {relevantGuests.map(guest => (
              <Typography key={guest.guestId} variant="body2" sx={{ ml: 2 }}>
                • {guest.firstName} {guest.lastName}
              </Typography>
            ))}
          </Paper>
        </Grid>
      );
    };
    
    return (
      <Box sx={{ 
        height: 'auto',
        minHeight: '100%',
        overflow: 'visible',
        p: 0
      }}>
        <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
          <StephsActualFavoriteTypographyNoDrop variant="h5" gutterBottom>
            Accommodation Preferences
          </StephsActualFavoriteTypographyNoDrop>
          <Divider sx={{ mb: 3 }} />
          
          {/* Camping section */}
          <StephsActualFavoriteTypographyNoDrop variant="h6" gutterBottom 
          sx={{
            color: 'primary.main',
            mb: 2
          }}>
            Camping ({campingFamilies.length} families)
          </StephsActualFavoriteTypographyNoDrop>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {campingFamilies.length === 0 ? (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  No families have selected camping.
                </Typography>
              </Grid>
            ) : (
              campingFamilies.map(family => 
                renderFamilyCard(family, 'camping', 'primary.main')
              )
            )}
          </Grid>
          
          {/* Manor section */}
          <StephsActualFavoriteTypographyNoDrop variant="h6" gutterBottom
          sx={{
            color: 'secondary.main',
            mb: 2
          }}>
            Manor ({manorFamilies.length} families)
          </StephsActualFavoriteTypographyNoDrop>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {manorFamilies.length === 0 ? (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  No families have selected manor.
                </Typography>
              </Grid>
            ) : (
              manorFamilies.map(family => 
                renderFamilyCard(family, 'manor', 'secondary.main')
              )
            )}
          </Grid>
          
          {/* Hotel section */}
          <StephsActualFavoriteTypographyNoDrop variant="h6" gutterBottom 
          sx={{
            color: 'info.main',
            mb: 2
          }}>
            Hotel ({hotelFamilies.length} families)
          </StephsActualFavoriteTypographyNoDrop>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {hotelFamilies.length === 0 ? (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  No families have selected hotel.
                </Typography>
              </Grid>
            ) : (
              hotelFamilies.map(family => 
                renderFamilyCard(family, 'hotel', 'info.main')
              )
            )}
          </Grid>
          
          {/* Other section */}
          <StephsActualFavoriteTypographyNoDrop variant="h6" gutterBottom 
          sx={{
            color: 'warning.main',
            mb: 2
          }}>
            Other ({otherFamilies.length} families)
          </StephsActualFavoriteTypographyNoDrop>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {otherFamilies.length === 0 ? (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  No families have selected other accommodations.
                </Typography>
              </Grid>
            ) : (
              otherFamilies.map(family => 
                renderFamilyCard(family, 'other', 'warning.main')
              )
            )}
          </Grid>
          
          {/* Unknown section */}
          <StephsActualFavoriteTypographyNoDrop variant="h6" gutterBottom
          sx={{
            color: 'text.secondary',
            mb: 2
          }}>
            Unknown ({unknownFamilies.length} families)
          </StephsActualFavoriteTypographyNoDrop>
          <Grid container spacing={2}>
            {unknownFamilies.length === 0 ? (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  All families have specified their accommodation preferences.
                </Typography>
              </Grid>
            ) : (
              unknownFamilies.map(family => 
                renderFamilyCard(family, 'unknown', 'text.disabled')
              )
            )}
          </Grid>
        </Paper>
        
        {/* Family Comments Section */}
        <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Family Comments
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          {familyComments.length === 0 ? (
            <Typography color="text.secondary">
              No families have provided comments.
            </Typography>
          ) : (
            <Grid container spacing={3}>
              {familyComments.map((comment, index) => (
                <Grid item xs={12} key={index}>
                  <Paper 
                    elevation={1} 
                    sx={{ 
                      p: 3, 
                      borderLeft: '4px solid',
                      borderColor: 'info.main',
                      bgcolor: 'background.paper',
                    }}
                  >
                    <Typography variant="h6" gutterBottom>
                      {comment.familyName}
                      <Typography 
                        component="span" 
                        variant="caption" 
                        sx={{ ml: 1, color: 'text.secondary' }}
                      >
                        ({comment.invitationCode})
                      </Typography>
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        whiteSpace: 'pre-wrap',
                        mb: 2
                      }}
                    >
                      "{comment.comment}"
                    </Typography>
                    {comment.lastUpdatedBy && (
                      <Typography variant="caption" color="text.secondary">
                        Last updated by: {comment.lastUpdatedBy}
                      </Typography>
                    )}
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
        
        {/* Food Allergies Section */}
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Food Allergies & Dietary Restrictions
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          {sortedFoodAllergies.length === 0 ? (
            <Typography color="text.secondary">
              No guests have reported food allergies or dietary restrictions.
            </Typography>
          ) : (
            <Grid container spacing={3}>
              {sortedFoodAllergies.map(([allergy, data], index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Paper 
                    elevation={1} 
                    sx={{ 
                      p: 3, 
                      height: '100%',
                      borderLeft: '4px solid',
                      borderColor: 'error.main'
                    }}
                  >
                    <Typography variant="h6" gutterBottom>
                      {allergy}
                      <Typography 
                        component="span" 
                        variant="caption" 
                        sx={{ 
                          ml: 1,
                          bgcolor: 'error.main', 
                          color: 'white',
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                        }}
                      >
                        {data.count} {data.count === 1 ? 'guest' : 'guests'}
                      </Typography>
                    </Typography>
                    <Typography variant="subtitle2" gutterBottom>
                      Affected Guests:
                    </Typography>
                    <Box sx={{ ml: 2 }}>
                      {data.guests.map((name, i) => (
                        <Typography key={i} variant="body2">
                          • {name}
                        </Typography>
                      ))}
                    </Box>
                    <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                      Families Affected:
                    </Typography>
                    <Box sx={{ ml: 2 }}>
                      {Array.from(data.families).map((name, i) => (
                        <Typography key={i} variant="body2">
                          • {name}
                        </Typography>
                      ))}
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      </Box>
    );
  };
  
  // Placeholder for the Notifications tab
  const NotificationsTabContent = () => (
    <Paper elevation={3} sx={{ p: 4, height: isMobile ? 'auto' : 'calc(100vh - 200px)' }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Send Notifications
      </Typography>
      <Divider sx={{ mb: 3 }} />
      <Typography variant="body1">
        This tab will allow you to send notifications to guests. Functionality will be implemented soon.
      </Typography>
    </Paper>
  );

  // Create tab items array
  const tabItems: TabItem[] = [
    {
      label: 'Details',
      path: '/admin/details',
    },
    {
      label: 'Edit',
      path: '/admin/edit',
    },
    {
      label: 'Printed Invite',
      path: '/admin/printed-invite',
    },
    {
      label: 'Send Notifications',
      path: '/admin/notifications',
    },
    {
      label: 'Summary',
      path: '/admin/summary',
    },
  ];
  
  return (
    <Container
      disableGutters
      maxWidth={false}
      sx={{
        width: '100%',
        height: '100vh', // Use viewport height for consistent sizing
        overflow: 'hidden', // Hide overflow at the container level
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        padding: 0,
        margin: 0,
      }}
    >
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : (
        <>
          {/* Tab Navigation */}
          <Paper
            square
            elevation={3}
            sx={{
              width: '100%',
              position: 'sticky',
              top: 0,
              zIndex: 100,
              backgroundColor: theme.palette.background.paper,
            }}
          >
            <Tabs
              value={tabIndex}
              onChange={handleTabChange}
              variant="fullWidth"
              textColor="primary"
              indicatorColor="secondary"
              aria-label="Admin tabs"
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                width: '100%',
                '& .MuiTabs-flexContainer': {
                  justifyContent: 'center',
                  paddingLeft: { xs: '12px', sm: 0 },
                },
                '& .MuiTabs-scroller': {
                  overflow: 'visible !important',
                },
              }}
            >
              {tabItems.map((item, index) => (
                <Tab
                  key={index}
                  label={item.label}
                  {...a11yProps(index)}
                  sx={{
                    fontWeight: 'bold',
                    '&.Mui-selected': {
                      color: theme.palette.secondary.main,
                    },
                    fontSize: {
                      xs: '0.75rem',
                      sm: '0.875rem',
                      md: '1rem',
                    },
                    minWidth: {
                      xs: '80px',
                      sm: '120px',
                      md: '160px',
                    },
                  }}
                />
              ))}
            </Tabs>
          </Paper>

          {/* Tab Content */}
          <Box 
            sx={{ 
              flexGrow: 1, 
              width: '100%', 
              p: { xs: 1, sm: 2 },
              height: 'auto', // Changed from fixed height
              minHeight: 'calc(100vh - 108px)', // Minimum height
              overflow: 'auto', // Changed to allow scrolling
            }}
          >
            <TabPanel value={tabIndex} index={0}>
              <DetailsTabContent />
            </TabPanel>
            <TabPanel value={tabIndex} index={1}>
              <EditTabContent />
            </TabPanel>
            <TabPanel value={tabIndex} index={2}>
              <PrintedRsvp />
            </TabPanel>
            <TabPanel value={tabIndex} index={3}>
              <NotificationsTabContent />
            </TabPanel>
            <TabPanel value={tabIndex} index={4} style={{ overflowY: 'auto', height: 'auto' }}>
              <SummaryTabContent />
            </TabPanel>
          </Box>
        </>
      )}
    </Container>
  );
}

export default AdminPage;