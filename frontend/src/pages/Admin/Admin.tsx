import { useEffect, useState, ReactElement, useCallback, useMemo } from 'react';
import { FamilyUnitDto, InvitationResponseEnum, GuestDto, RsvpEnum, GuestEmailLogDto, CampaignType } from '@/types/api';
import { useAdminQueries } from '@/hooks/useAdminQueries';
import { useApiContext } from '@/context/ApiContext';
import Api from '@/api/Api';
import { isAdmin } from '@/utils/roles';
import { useRecoilValue } from 'recoil';
import { userState } from '@/store/user';
import { useAuth0 } from '@auth0/auth0-react';
import { getConfig } from '@/auth_config';
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
import React from 'react';

// Email campaign types (must match backend EmailTypeEnum)
export enum EmailCampaignType {
  RsvpNotify = 'RsvpNotify',
  RsvpReminder = 'RsvpReminder',
  ManorDetails = 'ManorDetails',
  FourthDetails = 'FourthDetails',
  WeddingDetails = 'WeddingDetails',
  ThankYou = 'ThankYou'
}

// Campaign display information
export interface CampaignInfo {
  type: EmailCampaignType;
  displayName: string;
  description: string;
  color: string;
}

// Campaign definitions with distinct colors
export const EMAIL_CAMPAIGNS: CampaignInfo[] = [
  {
    type: EmailCampaignType.RsvpNotify,
    displayName: 'RSVP Notification',
    description: 'Initial notification for guests to RSVP for the wedding',
    color: '#3f51b5' // Blue
  },
  {
    type: EmailCampaignType.RsvpReminder,
    displayName: 'RSVP Reminder',
    description: 'Reminder for guests who haven\'t responded yet',
    color: '#ff9800' // Orange - changed from warning.main (yellow) to be more distinct
  },
  {
    type: EmailCampaignType.ManorDetails,
    displayName: 'Manor Details',
    description: 'Information about accommodations at the manor',
    color: '#9c27b0' // Purple - changed from secondary.main to be more distinct from warning
  },
  {
    type: EmailCampaignType.FourthDetails,
    displayName: 'July 4th Details',
    description: 'Details about the July 4th celebration',
    color: '#f44336' // Red
  },
  {
    type: EmailCampaignType.WeddingDetails,
    displayName: 'Wedding Details',
    description: 'Final details and information about the wedding day',
    color: '#00bcd4' // Cyan - more vibrant than info.main
  },
  {
    type: EmailCampaignType.ThankYou,
    displayName: 'Thank You',
    description: 'Thank you messages after the wedding',
    color: '#4caf50' // Green
  }
];

// Define the TabPanel props interface
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
  style?: React.CSSProperties;
}

// TabPanel component for displaying tab content
const TabPanel = React.memo(function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  
  // Check if this is the Summary or Details tab
  const isSummaryTab = index === 4;
  const isDetailsTab = index === 0;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
      style={{ 
        width: '100%', 
        height: 'auto', // Let height be determined by content
        overflow: 'visible', // Don't clip content
        minHeight: '100%', // Take at least full height
        display: value === index ? 'block' : 'none' // Use display instead of hidden to preserve scroll position
      }}
    >
      {/* Only render children when the tab is active */}
      <Box sx={{ 
        width: '100%', 
        height: 'auto', 
        position: 'relative',
        overflow: 'visible' // Always visible overflow to prevent scroll jumps
      }}>
        {value === index ? children : null}
      </Box>
    </div>
  );
});

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
  
  // Memoize toggle function to avoid recreation on every render
  const toggleExpanded = useCallback((invitationCode: string) => {
    setExpandedFamilyCodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(invitationCode)) {
        newSet.delete(invitationCode);
      } else {
        newSet.add(invitationCode);
      }
      return newSet;
    });
  }, []);

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
  
  // Handle guest click to show detail popper - memoized to prevent rerenders
  const handleGuestClick = useCallback((event: React.MouseEvent<HTMLElement>, guestId: string) => {
    const flipAxis = getRandomAxis();
    setPopperState({
      open: true,
      anchorEl: event.currentTarget,
      guestId,
      flipped: false,
      flipAxis
    });
  }, []);

  // Handle closing the popper - memoized to prevent rerenders
  const handleClosePopper = useCallback(() => {
    setPopperState(prevState => ({
      ...prevState,
      open: false
    }));
  }, []);

  // Find a guest by ID - memoized to improve performance
  const findGuestById = useCallback((guestId: string | null) => {
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
  }, [adminData]);

  // Handle flipping the card - memoized to prevent rerenders
  const handleFlipCard = useCallback(() => {
    setPopperState(prevState => ({
      ...prevState,
      flipped: !prevState.flipped
    }));
  }, []);
  
  // Sort families based on selected sort option
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

  // Handle sorting selector change - memoized to prevent recreating on each render
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
  }

  // Function to sort admin data when the sort option changes
  const sortedAdminData = useMemo(() => {
    const sorted = sortFamilies([...adminData], sortOption);
    return sorted;
  }, [adminData, sortOption]);
    
  // Fetch admin data (admin-only endpoint) only if user is admin
  useEffect(() => {
    if (!userIsAdmin) {
      setLoading(false);
      return;
    }
  
    const fetchData = async () => {
      try {
        const result = await getAllFamiliesQuery.refetch();
  
        if (result.status === 'success' && result.data) {
          setAdminData(result.data);
          setError(null);
        } else {
          setError('Failed to load admin data.');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Error loading admin data.');
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
    // DO NOT include `getAllFamiliesQuery.data` here or it won’t run on mount
    // DO NOT debounce — we always want a guaranteed fetch on mount
  }, [userIsAdmin, getAllFamiliesQuery.refetch]);   

  // If user is not an admin, redirect to home page
  if (!loading && !userIsAdmin) {
    return <Navigate to="/" replace />;
  }

  // Define the component for each tab
  const EditTabContent = () => {
    return (
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
                families={sortedAdminData}
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
                  if (result.status === 'success' && result.data != null) {
                    setAdminData(result.data);
                    
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
  };

  // Details tab content with just families and guests
  const DetailsTabContent = () => (
    <Box sx={{ 
      p: { xs: 1, sm: 2, md: 3 }, 
      maxWidth: '100%',
      height: 'auto', // Changed from fixed height
      position: 'relative', // Ensure proper positioning context
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
            width: '100%',
            position: 'static' // Ensure grid doesn't create positioning context
          }}
          data-testid="admin-family-grid"
        >
          {sortedAdminData.map((family) => (
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
        // Get who updated the invitation response notes
        let lastUpdateName: string | null = null;
        
        // Look through guests to find who updated the invitation response last
        if (family.guests && family.guests.length > 0) {
          // Find the guest with the most recent invitation response update
          const guestsWithAudit = family.guests.filter(
            guest => guest.rsvp?.invitationResponseAudit?.username
          );
          
          if (guestsWithAudit.length > 0) {
            // Sort by last update date, most recent first
            const sortedGuests = [...guestsWithAudit].sort((a, b) => {
              const dateA = a.rsvp?.invitationResponseAudit?.lastUpdate ? 
                new Date(a.rsvp.invitationResponseAudit.lastUpdate).getTime() : 0;
              const dateB = b.rsvp?.invitationResponseAudit?.lastUpdate ? 
                new Date(b.rsvp.invitationResponseAudit.lastUpdate).getTime() : 0;
              return dateB - dateA; // Most recent first
            });
            
            // Get the username from the most recently updated guest
            lastUpdateName = sortedGuests[0].rsvp?.invitationResponseAudit?.username || null;
          }
        }
        
        familyComments.push({
          familyName: family.unitName || 'Unknown Family',
          invitationCode,
          comment: family.invitationResponseNotes,
          lastUpdatedBy: lastUpdateName
        });
      }
      
      // Process guest preferences
      // let attendingGuests = family.guests?.filter(guest => 
      //   guest.rsvp?.invitationResponse === InvitationResponseEnum.Interested
      //   || guest.rsvp?.wedding === RsvpEnum.Attending
      // ) || [];
      let attendingGuests = (family.guests?.filter(guest => 
        guest.rsvp?.invitationResponse === InvitationResponseEnum.Interested ||
        guest.rsvp?.wedding === RsvpEnum.Attending
      ) || []).map(guest => ({
        ...guest,
        familyUnitName: family.unitName,
        attending: guest.rsvp?.wedding === RsvpEnum.Attending
      }));

      attendingGuests?.forEach(guest => {
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
            // Create a properly formatted guest name (handle '+1' case)
            const fullName = guest.firstName === '+1' ? 
              `+1 (${guest.familyUnitName})` : 
              `${guest.firstName}${guest.lastName ? ' ' + guest.lastName : ''}`;
            entry.guests.push(fullName);
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
  
  // Notifications tab content
  const NotificationsTabContent = () => {
    const apiContext = useApiContext();
    const { getAccessTokenSilently } = useAuth0();
    const [sending, setSending] = useState<Record<string, boolean>>({});
    const [results, setResults] = useState<Record<string, { success: boolean; message: string }>>({});
    const [directApi, setDirectApi] = useState<Api | null>(null);
    const [apiBaseUrl, setApiBaseUrl] = useState<string>('');
    const [notificationHistory, setNotificationHistory] = useState<Record<string, GuestEmailLogDto[]>>({});
    const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
    const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
    
    // Initialize API base URL from config
    useEffect(() => {
      try {
        const config = getConfig();
        console.log('API config from getConfig():', config);
        if (config && config.webserviceUrl) {
          setApiBaseUrl(config.webserviceUrl);
          console.log('API base URL set to:', config.webserviceUrl);
        } else {
          // Fallback
          const fallbackUrl = window.location.origin + '/api';
          setApiBaseUrl(fallbackUrl);
          console.log('API base URL fallback to:', fallbackUrl);
        }
      } catch (error) {
        console.error('Error getting API base URL:', error);
        setApiBaseUrl(window.location.origin + '/api');
      }
    }, []);
    
    // Initialize a direct API instance as backup
    useEffect(() => {
      const getToken = async () => {
        try {
          return await getAccessTokenSilently();
        } catch (err) {
          console.error('Failed to get token:', err);
          return null;
        }
      };
      
      const api = new Api(getToken);
      setDirectApi(api);
      console.log('Direct API initialized');
    }, [getAccessTokenSilently]);
    
    // Debug info - check if sendRsvpNotification is available
    useEffect(() => {
      console.log('API Context in Notifications tab:', apiContext);
      console.log('sendRsvpNotification available:', typeof apiContext.sendRsvpNotification === 'function');
      console.log('API instance available:', !!apiContext.apiInstance);
      if (apiContext.apiInstance) {
        console.log('API instance methods:', Object.keys(apiContext.apiInstance));
      }
    }, [apiContext]);
    
    // Fetch notification history
    useEffect(() => {
      const fetchNotificationHistory = async () => {
        if (!apiContext.getEmailNotifications) {
          console.log('getEmailNotifications not available yet');
          return;
        }
        
        try {
          setLoadingHistory(true);
          console.log('Fetching email notification history...');
          
          let notificationsData;
          
          // Try multiple approaches to fetch notification history
          try {
            // First try: use API context
            notificationsData = await apiContext.getEmailNotifications();
            // Log the raw response to debug
            console.log('Raw notification data from API:', JSON.stringify(notificationsData, null, 2));
          } catch (callError) {
            console.error('API call failed, trying alternatives:', callError);
            
            // If context call fails, try direct API instance
            if (directApi && typeof directApi.getEmailNotifications === 'function') {
              console.log('Using directApi.getEmailNotifications');
              notificationsData = await directApi.getEmailNotifications();
              console.log('Raw notification data from direct API:', JSON.stringify(notificationsData, null, 2));
            } else {
              // Last resort: Make a direct fetch call
              console.log('Using direct fetch call');
              const token = await getAccessTokenSilently();
              
              // Try multiple possible API endpoints
              const possibleEndpoints = [
                `${apiBaseUrl}/notify/email`,
                `${window.location.origin}/api/notify/email`,
                `https://fianceapi.dev.wedding.christephanie.com/notify/email`,
                `https://fianceapi.wedding.christephanie.com/notify/email`
              ];
              
              // Try each endpoint until one succeeds
              let lastError;
              for (const url of possibleEndpoints) {
                try {
                  console.log('Trying URL:', url);
                  const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`
                    }
                  });
                  
                  if (!response.ok) {
                    throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
                  }
                  
                  notificationsData = await response.json();
                  console.log('Raw notification data from direct fetch:', JSON.stringify(notificationsData, null, 2));
                  
                  // If we got here, the request succeeded
                  console.log('Success with URL:', url);
                  break;
                } catch (endpointError) {
                  console.error(`Failed with URL ${url}:`, endpointError);
                  lastError = endpointError;
                }
              }
              
              // If we still don't have data, throw the last error
              if (!notificationsData && lastError) {
                throw lastError;
              }
            }
          }
          
          // Group notifications by guestId for easier lookup
          const groupedNotifications: Record<string, GuestEmailLogDto[]> = {};
          
          console.log('Type of notificationsData:', typeof notificationsData);
          console.log('Is array?', Array.isArray(notificationsData));
          
          const processNotification = (notification: any) => {
            // Skip if notification is not an object
            if (!notification || typeof notification !== 'object') {
              console.warn('Skipping invalid notification:', notification);
              return;
            }
            
            // Try to extract guestId from the notification object
            let guestId = notification.guestId;
            
            // If no guestId directly, try to find it in other properties
            if (!guestId) {
              // Check in metadata
              if (notification.metadata && notification.metadata.guestId) {
                guestId = notification.metadata.guestId;
              }
              // Check for 'To' field which might contain email
              else if (notification.to) {
                // This is a potential notification for this guest based on email
                const guestWithEmail = adminData.flatMap(family => family.guests || [])
                  .find(g => g.email?.value === notification.to);
                
                if (guestWithEmail) {
                  guestId = guestWithEmail.guestId;
                }
              }
            }
            
            if (!guestId) {
              console.warn('Found notification without guestId:', notification);
              return;
            }
            
            if (!groupedNotifications[guestId]) {
              groupedNotifications[guestId] = [];
            }
            
            // Make a copy of the notification with all fields
            // to ensure we have all possible data available
            groupedNotifications[guestId].push({
              ...notification,
              // Ensure these required fields are present
              guestId,
              campaignType: notification.campaignType || notification.emailType || notification.type || 'RsvpNotify',
              timestamp: notification.timestamp || notification.dateCreated || notification.date || new Date().toISOString(),
              deliveryStatus: notification.deliveryStatus || notification.status || 'sent',
              emailAddress: notification.emailAddress || notification.to || notification.email || '',
              verified: notification.verified || true,
              guestEmailLogId: notification.guestEmailLogId || notification.id || notification.notificationId || guestId
            });
          };
          
          if (Array.isArray(notificationsData)) {
            // Process array of notification records
            console.log('Processing as array with', notificationsData.length, 'items');
            notificationsData.forEach(processNotification);
          } else if (notificationsData && typeof notificationsData === 'object') {
            // First check for common nested structures
            const possibleArrayProps = ['items', 'notifications', 'logs', 'emailLogs', 'results', 'data'];
            
            // Check if any of these properties exist and contain arrays
            let foundArrayProp = false;
            for (const prop of possibleArrayProps) {
              if (notificationsData[prop] && Array.isArray(notificationsData[prop])) {
                console.log(`Processing as object with ${prop} array containing`, notificationsData[prop].length, 'items');
                notificationsData[prop].forEach(processNotification);
                foundArrayProp = true;
                break;
              }
            }
            
            if (!foundArrayProp) {
              // Check if this is a single notification object
              if (notificationsData.guestId || notificationsData.emailAddress || notificationsData.to) {
                console.log('Processing as a single notification object');
                processNotification(notificationsData);
              } else {
                // Try to process as a record object of guestId -> notifications
                console.log('Processing as object with entries, keys:', Object.keys(notificationsData));
                
                Object.entries(notificationsData).forEach(([key, value]) => {
                  if (Array.isArray(value)) {
                    // This could be a map of guestId -> notifications[]
                    console.log(`Found array at key "${key}" with ${value.length} items`);
                    value.forEach(processNotification);
                  } else if (value && typeof value === 'object') {
                    // This might be a single notification with the key as guestId
                    console.log(`Found object at key "${key}", checking if it's a notification`);
                    processNotification({
                      ...value,
                      guestId: (value as any).guestId || key // Use the key as guestId if not in the object
                    });
                  }
                });
              }
            }
          }
          
          // Sort notifications by timestamp (newest first) for each guest
          Object.keys(groupedNotifications).forEach(guestId => {
            groupedNotifications[guestId].sort((a, b) => {
              return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
            });
          });
          
          console.log('Grouped notifications by guestId:', Object.keys(groupedNotifications));
          console.log('Example of grouped notifications (if available):', 
            Object.keys(groupedNotifications).length > 0 
              ? JSON.stringify(groupedNotifications[Object.keys(groupedNotifications)[0]], null, 2)
              : 'No notifications found'
          );
          
          setNotificationHistory(groupedNotifications);
        } catch (error) {
          console.error('Failed to fetch notification history:', error);
        } finally {
          setLoadingHistory(false);
        }
      };
      
      fetchNotificationHistory();
    }, [apiContext, apiBaseUrl, directApi, getAccessTokenSilently, refreshTrigger]);
    
    // Get families and guests with valid emails first and declined families last
    const familiesWithVerifiedEmails = useMemo(() => {
      // Check if all family members have declined
      const isAllDeclined = (family: FamilyUnitDto): boolean => {
        if (!family.guests || family.guests.length === 0) return false;
        
        return family.guests.every(guest => 
          guest.rsvp?.invitationResponse === InvitationResponseEnum.Declined || 
          guest.rsvp?.wedding === RsvpEnum.Declined
        );
      };
      
      // First filter families with verified emails (non-declined)
      const verifiedNonDeclined = adminData.filter(family => 
        family.guests?.some(guest => guest.email?.verified === true) && 
        !isAllDeclined(family)
      );
      
      // Then get families without verified emails (non-declined)
      const unverifiedNonDeclined = adminData.filter(family => 
        !family.guests?.some(guest => guest.email?.verified === true) && 
        !isAllDeclined(family)
      );
      
      // Then get families with all declined members (verified first)
      const verifiedDeclined = adminData.filter(family => 
        family.guests?.some(guest => guest.email?.verified === true) && 
        isAllDeclined(family)
      );
      
      // Then families with all declined members and no verified emails
      const unverifiedDeclined = adminData.filter(family => 
        !family.guests?.some(guest => guest.email?.verified === true) && 
        isAllDeclined(family)
      );
      
      return [...verifiedNonDeclined, ...unverifiedNonDeclined, ...verifiedDeclined, ...unverifiedDeclined];
    }, [adminData]);
    
    // Create a unique key for tracking sending status and results
    const getSendingKey = (guestId: string, campaignType: EmailCampaignType): string => {
      return `${guestId}:${campaignType}`;
    };
    
    // Get the most recent notification for a guest and campaign type
    const getLatestNotification = (guestId: string, campaignType: EmailCampaignType | CampaignType): any => {
      if (!guestId || !notificationHistory[guestId]) {
        // No notifications for this guest
        return null;
      }
      
      // Convert campaignType to string for comparison
      const campaignTypeStr = String(campaignType);
      
      // Find notification with matching campaign type, trying various field names
      const notification = notificationHistory[guestId].find(notification => {
        // Try all possible field names and formats for campaign type
        // First check the standard field name
        if (notification.campaignType) {
          if (typeof notification.campaignType === 'string') {
            return notification.campaignType === campaignTypeStr;
          } else if (typeof notification.campaignType === 'object' && notification.campaignType && typeof (notification.campaignType as any).toString === 'function') {
            return (notification.campaignType as any).toString() === campaignTypeStr;
          }
        }
        
        // Try alternative field names
        const altFieldNames = ['emailType', 'type', 'notificationType', 'campaign'];
        for (const fieldName of altFieldNames) {
          if (notification[fieldName] && String(notification[fieldName]) === campaignTypeStr) {
            return true;
          }
        }
        
        // Check if there's a 'metadata' object with a campaign type field
        if (notification.metadata) {
          for (const fieldName of ['campaignType', 'emailType', 'type']) {
            if (notification.metadata[fieldName] && String(notification.metadata[fieldName]) === campaignTypeStr) {
              return true;
            }
          }
        }
        
        return false;
      });
      
      if (notification) {
        // Log successful match for debugging
        console.log(`Found notification for ${guestId}, campaign ${campaignTypeStr}:`, notification);
      }
      
      return notification || null;
    };
    
    // Format date in a readable format
    const formatDate = (dateString: string | number | Date): string => {
      try {
        // If it's a unix timestamp in seconds, convert to milliseconds
        if (typeof dateString === 'number' || (typeof dateString === 'string' && !isNaN(Number(dateString)))) {
          const numValue = Number(dateString);
          // Check if it's seconds (Unix timestamp) rather than milliseconds
          if (numValue < 10000000000) { // Approx year 2286 in seconds since epoch
            dateString = new Date(numValue * 1000);
          } else {
            dateString = new Date(numValue);
          }
        }
        
        const date = new Date(dateString);
        
        if (isNaN(date.getTime())) {
          console.warn('Invalid date provided:', dateString);
          return 'Just now'; // Fallback for invalid dates
        }
        
        // Check if date is today
        const today = new Date();
        const isToday = date.getDate() === today.getDate() &&
                        date.getMonth() === today.getMonth() &&
                        date.getFullYear() === today.getFullYear();
        
        if (isToday) {
          // Format as time only if today
          return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else {
          // Format as date and time if not today
          return date.toLocaleDateString([], { 
            month: 'short', 
            day: 'numeric' 
          }) + ' ' + date.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          });
        }
      } catch (error) {
        console.error('Error formatting date:', error, 'Original value:', dateString);
        return 'Recent'; // Fallback error case
      }
    };
    
    // Check if a notification is recent (within the last hour)
    const isRecentNotification = (dateString: string | number | Date): boolean => {
      try {
        let notificationTime: number;
        
        if (typeof dateString === 'number') {
          // If it's a Unix timestamp in seconds, convert to milliseconds
          if (dateString < 10000000000) { // Approx year 2286 in seconds since epoch
            notificationTime = dateString * 1000;
          } else {
            notificationTime = dateString;
          }
        } else {
          notificationTime = new Date(dateString).getTime();
        }
        
        if (isNaN(notificationTime)) {
          console.warn('Invalid date for recent check:', dateString);
          return true; // If we can't parse it, assume it's recent (better UX to highlight)
        }
        
        const oneHourAgo = Date.now() - (60 * 60 * 1000); // One hour ago in milliseconds
        return notificationTime > oneHourAgo;
      } catch (error) {
        console.error('Error checking if notification is recent:', error);
        return true; // If there's an error, assume it's recent (better UX to highlight)
      }
    };
    
    const handleSendNotification = async (guestId: string, campaignType: EmailCampaignType = EmailCampaignType.RsvpNotify) => {
      const sendingKey = getSendingKey(guestId, campaignType);
      
      try {
        setSending(prev => ({ ...prev, [sendingKey]: true }));
        
        console.log(`Sending ${campaignType} notification to guest:`, guestId);
        
        let response;
        
        // Use a single approach to make the API call based on availability
        try {
          // Prefer the API context method as the primary approach
          if (typeof apiContext.sendEmailNotification === 'function') {
            console.log('Using apiContext.sendEmailNotification');
            response = await apiContext.sendEmailNotification(campaignType, guestId);
          }
          // Fallback to direct fetch call if API context method is not available
          else {
            console.log('Using direct fetch call - API context method not available');
            const token = await getAccessTokenSilently();
            const url = `${apiBaseUrl}/notify/email?guestId=${encodeURIComponent(guestId)}&campaignType=${campaignType}`;
            
            console.log('Fetch URL:', url);
            response = await fetch(url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              }
            }).then(res => {
              if (!res.ok) {
                throw new Error(`Server responded with ${res.status}: ${res.statusText}`);
              }
              return res.json();
            });
          }
        } catch (callError) {
          console.error('API call failed:', callError);
          
          // Instead of trying multiple endpoints, just throw the error
          // This avoids sending duplicate emails and provides a clear error message
          throw callError;
        }
        
        console.log(`${campaignType} notification response:`, response);
        console.log(`${campaignType} notification response type:`, typeof response);
        console.log(`${campaignType} notification response format:`, JSON.stringify(response, null, 2));
        
        // Check response and update results
        if (response) {
          setResults(prev => ({ 
            ...prev, 
            [sendingKey]: { 
              success: true, 
              message: `${campaignType} email sent successfully` 
            }
          }));
          
          // Add response data to notification history immediately if possible
          // Even if the response doesn't match our expected format exactly,
          // we'll create a normalized notification object to display
          
          // For a specific guest notification (has guestId and possibly a campaignType)
          if (guestId && campaignType) {
            console.log('Adding new notification directly to history for', guestId);
            
            // Create a normalized notification object with the required fields
            const newNotification = {
              guestId: guestId,
              campaignType: campaignType,
              timestamp: new Date().toISOString(), // Use current timestamp
              deliveryStatus: 'sent',
              emailAddress: '',
              verified: true,
              guestEmailLogId: `${guestId}-${Date.now()}`,
              ...response // Include any fields from the response
            };
            
            // Update notification history with the new notification
            setNotificationHistory(prev => {
              const newHistory = {...prev};
              
              if (!newHistory[guestId]) {
                newHistory[guestId] = [];
              }
              
              // Add to the beginning of the array (most recent first)
              newHistory[guestId].unshift(newNotification);
              
              console.log(`Added notification for guestId ${guestId}:`, newNotification);
              return newHistory;
            });
          } 
          // For a bulk email campaign without specific guestId
          else if (typeof response === 'object' || Array.isArray(response)) {
            console.log('Handling response from bulk email campaign');
            
            // Try to extract notifications from the response
            const notifications = Array.isArray(response) ? response : 
              (response.items ? response.items : [response]);
            
            console.log('Extracted notifications:', notifications);
            
            // Update notification history
            setNotificationHistory(prev => {
              const newHistory = {...prev};
              
              notifications.forEach(notification => {
                // Extract guestId from the notification or metadata
                const notifGuestId = (notification as any).guestId || 
                  ((notification as any).metadata ? (notification as any).metadata.guestId : null);
                
                if (!notifGuestId) {
                  console.log('Skipping notification without guestId:', notification);
                  return;
                }
                
                if (!newHistory[notifGuestId]) {
                  newHistory[notifGuestId] = [];
                }
                
                // Create a normalized notification object
                const normalizedNotification: GuestEmailLogDto = {
                  guestId: notifGuestId,
                  campaignType: ((notification as any).campaignType || campaignType || 'RsvpNotify') as CampaignType,
                  timestamp: (notification as any).timestamp || new Date().toISOString(),
                  deliveryStatus: (notification as any).deliveryStatus || (notification as any).status || 'sent',
                  emailAddress: (notification as any).emailAddress || (notification as any).to || '',
                  verified: (notification as any).verified || true,
                  guestEmailLogId: notification.guestEmailLogId || notification.id || `${notifGuestId}-${Date.now()}`
                  // Do not spread notification to avoid type errors
                };
                
                newHistory[notifGuestId].unshift(normalizedNotification);
                console.log(`Added notification for guestId ${notifGuestId}:`, normalizedNotification);
              });
              
              return newHistory;
            });
          } else {
            // If we can't parse the response, create a local history entry anyway
            if (guestId) {
              console.log('Creating local history entry for', guestId);
              setNotificationHistory(prev => {
                const newHistory = {...prev};
                
                if (!newHistory[guestId]) {
                  newHistory[guestId] = [];
                }
                
                // Create a basic notification object
                const basicNotification: GuestEmailLogDto = {
                  guestId: guestId,
                  campaignType: campaignType as unknown as CampaignType,
                  timestamp: new Date().toISOString(),
                  deliveryStatus: 'sent',
                  emailAddress: '',
                  verified: true,
                  guestEmailLogId: `${guestId}-${Date.now()}`
                };
                
                newHistory[guestId].unshift(basicNotification);
                console.log('Added basic notification to history:', basicNotification);
                return newHistory;
              });
            }
          }
          
          // Refresh notification history after a short delay
          setTimeout(() => {
            setRefreshTrigger(prev => prev + 1);
          }, 2000);
        }
      } catch (error) {
        console.error(`Failed to send ${campaignType} notification:`, error);
        setResults(prev => ({ 
          ...prev, 
          [sendingKey]: { 
            success: false, 
            message: error instanceof Error ? error.message : `Failed to send ${campaignType} notification`
          }
        }));
        
        // Add an alert for better visibility
        alert(`Failed to send ${campaignType} notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setSending(prev => ({ ...prev, [sendingKey]: false }));
      }
    };
    
    const handleSendAllNotifications = async (campaignType: EmailCampaignType = EmailCampaignType.RsvpNotify) => {
      const sendingKey = `all:${campaignType}`;
      
      try {
        setSending(prev => ({ ...prev, [sendingKey]: true }));
        
        console.log(`Sending ${campaignType} notifications to all guests`);
        
        let response;
        
        // Use a single approach to make the API call based on availability
        try {
          // Prefer the API context method as the primary approach
          if (typeof apiContext.sendEmailNotification === 'function') {
            console.log('Using apiContext.sendEmailNotification for bulk notification');
            response = await apiContext.sendEmailNotification(campaignType);
          }
          // Fallback to direct fetch call if API context method is not available
          else {
            console.log('Using direct fetch call for bulk notification - API context method not available');
            const token = await getAccessTokenSilently();
            const url = `${apiBaseUrl}/notify/email?campaignType=${campaignType}`;
            
            console.log('Fetch URL:', url);
            response = await fetch(url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              }
            }).then(res => {
              if (!res.ok) {
                throw new Error(`Server responded with ${res.status}: ${res.statusText}`);
              }
              return res.json();
            });
          }
        } catch (callError) {
          console.error('API call failed:', callError);
          
          // Instead of trying multiple endpoints, just throw the error
          // This avoids sending duplicate emails and provides a clear error message
          throw callError;
        }
        
        console.log(`All ${campaignType} notifications response:`, response);
        
        // Check response and update results
        if (response) {
          setResults(prev => ({ 
            ...prev, 
            [sendingKey]: { 
              success: true, 
              message: `Sent ${response.length || 0} ${campaignType} email notifications successfully` 
            }
          }));
          
          // Refresh notification history after a short delay
          setTimeout(() => {
            setRefreshTrigger(prev => prev + 1);
          }, 2000);
        }
      } catch (error) {
        console.error(`Failed to send all ${campaignType} notifications:`, error);
        setResults(prev => ({ 
          ...prev, 
          [sendingKey]: { 
            success: false, 
            message: error instanceof Error ? error.message : `Failed to send ${campaignType} notifications`
          }
        }));
        
        // Add an alert for better visibility
        alert(`Failed to send ${campaignType} notifications: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setSending(prev => ({ ...prev, [sendingKey]: false }));
      }
    };
    
    const getEmailVerificationStatus = (guest: GuestDto) => {
      if (!guest.email) {
        return <Typography color="error" variant="caption">No email</Typography>;
      }
      
      if (guest.email.verified) {
        return <Typography color="success.main" variant="caption">Verified</Typography>;
      }
      
      return <Typography color="warning.main" variant="caption">Unverified</Typography>;
    };
    
    // Gets the status dot indicators for each guest
    const getGuestStatusDots = (guest: GuestDto) => {
      // Determine which dot should be filled based on priority
      let filledDotIndex = -1;
      
      // Priority 1: Red - Declined (either invitation or wedding)
      if (guest.rsvp?.invitationResponse === InvitationResponseEnum.Declined || 
          guest.rsvp?.wedding === RsvpEnum.Declined) {
        filledDotIndex = 0;
      }
      // Priority 2: Green - Attending wedding
      else if (guest.rsvp?.wedding === RsvpEnum.Attending) {
        filledDotIndex = 3;
      }
      // Priority 3: Light Green - Interested
      else if (guest.rsvp?.invitationResponse === InvitationResponseEnum.Interested) {
        filledDotIndex = 2;
      }
      // Priority 4: Yellow - Pending
      else if (guest.rsvp?.invitationResponse === InvitationResponseEnum.Pending || 
               !guest.rsvp?.invitationResponse) {
        filledDotIndex = 1;
      }
      
      // Define dot colors
      const dotColors = [
        { outline: '#d32f2f', fill: filledDotIndex === 0 ? '#d32f2f' : 'transparent' }, // Red
        { outline: '#ffc107', fill: filledDotIndex === 1 ? '#ffc107' : 'transparent' }, // Yellow
        { outline: '#8bc34a', fill: filledDotIndex === 2 ? '#8bc34a' : 'transparent' }, // Light Green
        { outline: '#4caf50', fill: filledDotIndex === 3 ? '#4caf50' : 'transparent' }  // Green
      ];
      
      return (
        <Box sx={{ display: 'flex', gap: 0.5, ml: 1 }}>
          {dotColors.map((color, index) => (
            <Box 
              key={index}
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                border: `1px solid ${color.outline}`,
                backgroundColor: color.fill,
              }}
            />
          ))}
        </Box>
      );
    };
    
    // Manually refresh notification history
    const handleRefreshHistory = () => {
      setRefreshTrigger(prev => prev + 1);
    };
    
    return (
      <Box sx={{ p: 0, height: 'auto', overflow: 'auto' }}>
        <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" component="h2">
              Send Notifications
            </Typography>
            <Button 
              size="small" 
              onClick={handleRefreshHistory}
              disabled={loadingHistory}
              startIcon={loadingHistory ? <CircularProgress size={16} /> : null}
            >
              {loadingHistory ? 'Loading...' : 'Refresh History'}
            </Button>
          </Box>
          <Divider sx={{ mb: 3 }} />
          
          {/* Campaign section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Email Campaigns
            </Typography>
            
            {/* Campaign cards - 3x2 Grid layout */}
            <Grid container spacing={2}>
              {EMAIL_CAMPAIGNS.map((campaign) => {
                const sendingKey = `all:${campaign.type}`;
                return (
                  <Grid item xs={12} sm={6} md={4} key={campaign.type}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        borderTop: '4px solid',
                        borderTopColor: campaign.color
                      }}
                    >
                      <Typography variant="subtitle1" gutterBottom>
                        {campaign.displayName}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2, flexGrow: 1 }}>
                        {campaign.description}
                      </Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        flexWrap: 'wrap', 
                        gap: 1 
                      }}>
                        <Button
                          variant="contained"
                          size="small"
                          sx={{ 
                            backgroundColor: campaign.color,
                            '&:hover': {
                              backgroundColor: `${campaign.color}dd`
                            }
                          }}
                          disabled={sending[sendingKey]}
                          onClick={() => handleSendAllNotifications(campaign.type)}
                        >
                          {sending[sendingKey] ? 'Sending...' : `Send to All`}
                        </Button>
                        
                        {results[sendingKey] && (
                          <Alert 
                            severity={results[sendingKey].success ? 'success' : 'error'}
                            sx={{ py: 0, flexGrow: 1 }}
                          >
                            {results[sendingKey].message}
                          </Alert>
                        )}
                      </Box>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
          
          {/* Individual guests section */}
          <Typography variant="h6" gutterBottom>
            Send to Individual Guests
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Guests with verified emails are shown at the top. You can send test emails to individual guests.
          </Typography>
          
          {/* Status dots legend */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>Guest Status Legend:</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box 
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    border: '1px solid #d32f2f',
                    backgroundColor: '#d32f2f',
                    mr: 1
                  }}
                />
                <Typography variant="caption">Declined</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box 
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    border: '1px solid #ffc107',
                    backgroundColor: '#ffc107',
                    mr: 1
                  }}
                />
                <Typography variant="caption">Pending</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box 
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    border: '1px solid #8bc34a',
                    backgroundColor: '#8bc34a',
                    mr: 1
                  }}
                />
                <Typography variant="caption">Interested</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box 
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    border: '1px solid #4caf50',
                    backgroundColor: '#4caf50',
                    mr: 1
                  }}
                />
                <Typography variant="caption">Attending</Typography>
              </Box>
            </Box>
            
            {/* Campaign buttons legend */}
            <Typography variant="subtitle2" gutterBottom>Campaign Button Legend:</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {EMAIL_CAMPAIGNS.map(campaign => (
                <Box key={campaign.type} sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box 
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: 0.5,
                      border: `1px solid ${campaign.color}`,
                      backgroundColor: `${campaign.color}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 1,
                      fontSize: '10px',
                      color: campaign.color
                    }}
                  >
                    {campaign.type.charAt(0)}
                  </Box>
                  <Typography variant="caption">{campaign.displayName}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={2}>
              {familiesWithVerifiedEmails.map((family) => (
                <Grid item xs={12} key={family.invitationCode}>
                  {(() => {
                    // Determine if all family members have declined
                    const allDeclined = family.guests?.every(g => 
                      g.rsvp?.invitationResponse === InvitationResponseEnum.Declined || 
                      g.rsvp?.wedding === RsvpEnum.Declined
                    );
                    
                    // Determine border color
                    let borderColor = 'text.disabled';
                    if (allDeclined) {
                      borderColor = 'error.main';
                    } else if (family.guests?.some(g => g.email?.verified)) {
                      borderColor = 'success.main';
                    }
                    
                    return (
                      <Paper 
                        variant="outlined" 
                        sx={{ 
                          p: 2,
                          borderLeft: '4px solid',
                          borderLeftColor: borderColor,
                          opacity: allDeclined ? 0.6 : (family.guests?.some(g => g.email?.verified) ? 1 : 0.7),
                          backgroundColor: allDeclined ? 'rgba(211, 47, 47, 0.05)' : 'inherit'
                        }}
                      >
                        <Typography variant="subtitle1" gutterBottom>
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
                        
                        <Grid container spacing={2}>
                          {family.guests?.map((guest) => (
                            <Grid item xs={12} sm={6} md={4} key={guest.guestId}>
                              <Box 
                                sx={{ 
                                  display: 'flex',
                                  flexDirection: 'column',
                                  border: '1px solid',
                                  borderColor: 'divider',
                                  borderRadius: 1,
                                  p: 2,
                                  height: '100%',
                                  minHeight: '180px', // Increased to accommodate notification history
                                  position: 'relative' // For proper positioning of buttons at bottom
                                }}
                              >
                                <Box sx={{ mb: 1 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Typography variant="subtitle2">
                                      {guest.firstName} {guest.lastName}
                                    </Typography>
                                    {getGuestStatusDots(guest)}
                                  </Box>
                                  <Typography variant="body2" color="text.secondary">
                                    {guest.email?.value || 'No email'} {getEmailVerificationStatus(guest)}
                                  </Typography>
                                </Box>
                                
                                {/* Last sent notification information */}
                                <Box sx={{ mt: 1, mb: 2, display: 'flex', flexDirection: 'column' }}>
                                  <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
                                    {guest.guestId && notificationHistory[guest.guestId] ? 
                                      `Last notifications sent (${notificationHistory[guest.guestId].length}):` : 
                                      'No notification history found'}
                                  </Typography>
                                  
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {/* First approach: show notifications grouped by campaign type */}
                                    {EMAIL_CAMPAIGNS.map(campaign => {
                                      // Find the most recent notification for this campaign type and guest
                                      const latestNotification = getLatestNotification(
                                        guest.guestId || '', 
                                        campaign.type as unknown as CampaignType
                                      );
                                      
                                      if (!latestNotification) {
                                        return null;
                                      }
                                      
                                      // Get timestamp from notification, with fallbacks
                                      const timestamp = latestNotification.timestamp 
                                        || latestNotification['dateCreated'] 
                                        || latestNotification['date'] 
                                        || latestNotification['sentAt']
                                        || Date.now(); // fallback to now if no timestamp
                                      
                                      // Check if it's a recent notification (within the last hour)
                                      const isRecent = isRecentNotification(timestamp);
                                      
                                      // Get delivery status with fallback
                                      const deliveryStatus = latestNotification.deliveryStatus 
                                        || latestNotification['status'] 
                                        || 'sent';
                                      
                                      return (
                                        <Box
                                          key={campaign.type}
                                          sx={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            borderRadius: '8px',
                                            padding: '2px 6px',
                                            fontSize: '0.7rem',
                                            backgroundColor: `${campaign.color}20`,
                                            border: `1px solid ${campaign.color}`,
                                            color: 'text.primary',
                                            whiteSpace: 'nowrap',
                                            animation: isRecent ? 'pulse 2s infinite' : 'none',
                                            '@keyframes pulse': {
                                              '0%': { boxShadow: `0 0 0 0 ${campaign.color}40` },
                                              '70%': { boxShadow: `0 0 0 4px ${campaign.color}00` },
                                              '100%': { boxShadow: `0 0 0 0 ${campaign.color}00` }
                                            }
                                          }}
                                          title={`${campaign.displayName} sent on ${
                                            typeof timestamp === 'object' && timestamp !== null ? timestamp.toLocaleString() : 
                                            timestamp ? new Date(timestamp).toLocaleString() : 'Unknown'
                                          }\nStatus: ${deliveryStatus}`}
                                        >
                                          <Typography
                                            component="span" 
                                            sx={{ 
                                              fontWeight: 'bold',
                                              color: campaign.color,
                                              mr: 0.5
                                            }}
                                          >
                                            {campaign.type.charAt(0)}:
                                          </Typography>
                                          <Typography component="span">
                                            {formatDate(timestamp)}
                                          </Typography>
                                        </Box>
                                      );
                                    })}
                                    
                                    {/* Alternate approach: show most recent notifications regardless of type */}
                                    {guest.guestId && notificationHistory[guest.guestId] &&
                                      notificationHistory[guest.guestId].length > 0 &&
                                      !EMAIL_CAMPAIGNS.some(campaign => 
                                        getLatestNotification(guest.guestId || '', campaign.type as unknown as CampaignType)) && (
                                      // If we have notifications but none match our campaign types, show them generically
                                      notificationHistory[guest.guestId].slice(0, 3).map((notification, idx) => {
                                        // Try to determine campaign type
                                        const campaignTypeStr = String(
                                          notification.campaignType || 
                                          notification.emailType || 
                                          notification.type || 
                                          'Notification'
                                        );
                                        
                                        // Try to find matching campaign
                                        const matchingCampaign = EMAIL_CAMPAIGNS.find(
                                          c => String(c.type) === campaignTypeStr
                                        );
                                        
                                        // Use matching campaign color or a default
                                        const color = matchingCampaign?.color || '#666666';
                                        
                                        // Get timestamp with fallbacks
                                        const timestamp: Date | string | number = (notification.timestamp || 
                                          notification.dateCreated || 
                                          notification.date || 
                                          Date.now()) as (Date | string | number);
                                          
                                        // Check if recent
                                        const isRecent = isRecentNotification(timestamp);
                                        
                                        return (
                                          <Box
                                            key={`notification-${idx}`}
                                            sx={{
                                              display: 'inline-flex',
                                              alignItems: 'center',
                                              borderRadius: '8px',
                                              padding: '2px 6px',
                                              fontSize: '0.7rem',
                                              backgroundColor: `${color}20`,
                                              border: `1px solid ${color}`,
                                              color: 'text.primary',
                                              whiteSpace: 'nowrap',
                                              animation: isRecent ? 'pulse 2s infinite' : 'none',
                                              '@keyframes pulse': {
                                                '0%': { boxShadow: `0 0 0 0 ${color}40` },
                                                '70%': { boxShadow: `0 0 0 4px ${color}00` },
                                                '100%': { boxShadow: `0 0 0 0 ${color}00` }
                                              }
                                            }}
                                            title={`${campaignTypeStr} sent on ${
                                              (typeof timestamp === 'object' && timestamp !== null) ? 
                                                timestamp.toLocaleString() : 
                                              (timestamp ? new Date(String(timestamp)).toLocaleString() : 'Unknown')
                                            }`}
                                          >
                                            <Typography
                                              component="span" 
                                              sx={{ 
                                                fontWeight: 'bold',
                                                color: color,
                                                mr: 0.5
                                              }}
                                            >
                                              {campaignTypeStr.charAt(0)}:
                                            </Typography>
                                            <Typography component="span">
                                              {formatDate(timestamp)}
                                            </Typography>
                                          </Box>
                                        );
                                      })
                                    )}
                                  </Box>
                                </Box>
                                
                                {/* Debug information - will help diagnose if notifications are being received properly */}
                                {(guest.guestId && notificationHistory[guest.guestId] && notificationHistory[guest.guestId].length > 0) ? (
                                  <Box sx={{ 
                                    mt: 1, 
                                    mb: 1,
                                    p: 1,
                                    borderRadius: 1,
                                    backgroundColor: 'rgba(0,0,0,0.03)', 
                                    fontSize: '0.7rem',
                                    display: 'block' // Always show for debugging
                                  }}>
                                    <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                                      Debug: {notificationHistory[guest.guestId].length} notification(s)
                                    </Typography>
                                    <Box component="pre" sx={{ 
                                      fontSize: '0.65rem', 
                                      overflowX: 'auto',
                                      m: 0,
                                      p: 0.5
                                    }}>
                                      {notificationHistory[guest.guestId].slice(0, 1).map((notification, idx) => 
                                        JSON.stringify({
                                          idx,
                                          guestId: notification.guestId,
                                          type: notification.campaignType,
                                          timestamp: notification.timestamp,
                                          status: notification.deliveryStatus,
                                          keys: Object.keys(notification)
                                        }, null, 1)
                                      )}
                                    </Box>
                                  </Box>
                                ) : (
                                  <Box sx={{ 
                                    mt: 1, 
                                    mb: 1,
                                    p: 1,
                                    borderRadius: 1,
                                    backgroundColor: 'rgba(255,0,0,0.03)', 
                                    fontSize: '0.7rem'
                                  }}>
                                    <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                                      No notification history found for guest {guest.guestId || 'unknown'}
                                    </Typography>
                                    <Box sx={{ mt: 0.5 }}>
                                      <Typography variant="caption" color="text.secondary">
                                        Available guest IDs in notification history: {Object.keys(notificationHistory).length > 0 ? 
                                          Object.keys(notificationHistory).slice(0, 3).join(', ') + 
                                          (Object.keys(notificationHistory).length > 3 ? '...' : '')
                                          : 'none'}
                                      </Typography>
                                    </Box>
                                  </Box>
                                )}
                                
                                <Box sx={{ mt: 'auto' }}>
                                  {/* Campaign buttons */}
                                  <Box sx={{ 
                                    display: 'flex', 
                                    flexWrap: 'wrap', 
                                    gap: 1,
                                    minHeight: '32px', // Ensure consistent height even when buttons expand
                                    alignItems: 'flex-start'
                                  }}>
                                    {EMAIL_CAMPAIGNS.map(campaign => {
                                      const sendingKey = getSendingKey(guest.guestId || '', campaign.type);
                                      const latestNotification = getLatestNotification(
                                        guest.guestId || '', 
                                        campaign.type as unknown as CampaignType
                                      );
                                      
                                      // Determine if this is a resend
                                      const isResend = !!latestNotification;
                                      
                                      return (
                                        <Box key={campaign.type} sx={{ position: 'relative' }}>
                                          <Button
                                            variant="outlined"
                                            size="small"
                                            disabled={sending[sendingKey] || !guest.email?.verified}
                                            onClick={() => handleSendNotification(guest.guestId || '', campaign.type)}
                                            sx={{ 
                                              opacity: guest.email?.verified ? 1 : 0.5,
                                              // Dynamic width when sending
                                              minWidth: sending[sendingKey] ? '120px' : '28px',
                                              maxWidth: sending[sendingKey] ? '120px' : '28px',
                                              padding: '4px 8px',
                                              borderColor: campaign.color,
                                              color: campaign.color,
                                              backgroundColor: `${campaign.color}10`,
                                              transition: 'all 0.3s ease',
                                              '&:hover': {
                                                borderColor: campaign.color,
                                                backgroundColor: `${campaign.color}20`
                                              },
                                              whiteSpace: 'nowrap',
                                              overflow: 'hidden'
                                            }}
                                            title={`${isResend ? 'Resend' : 'Send'} ${campaign.displayName} to ${guest.firstName} ${guest.lastName}${isResend ? ` (Last sent: ${formatDate(latestNotification.timestamp)})` : ''}`}
                                          >
                                            {sending[sendingKey] ? 
                                              `Sending email...` : 
                                              (isResend ? `${campaign.type.charAt(0)}↻` : campaign.type.charAt(0))
                                            }
                                          </Button>
                                          
                                          {/* Status indicator */}
                                          {results[sendingKey] && (
                                            <Box 
                                              sx={{ 
                                                position: 'absolute', 
                                                top: -4, 
                                                right: -4,
                                                width: 12,
                                                height: 12,
                                                borderRadius: '50%',
                                                backgroundColor: results[sendingKey].success ? 'success.main' : 'error.main',
                                                border: '1px solid white',
                                                boxShadow: '0 0 4px rgba(0,0,0,0.3)',
                                                animation: results[sendingKey].success ? 'pulse 1.5s infinite' : 'none',
                                                '@keyframes pulse': {
                                                  '0%': { boxShadow: '0 0 0 0 rgba(76, 175, 80, 0.7)' },
                                                  '70%': { boxShadow: '0 0 0 5px rgba(76, 175, 80, 0)' },
                                                  '100%': { boxShadow: '0 0 0 0 rgba(76, 175, 80, 0)' }
                                                }
                                              }} 
                                              title={results[sendingKey].message}
                                            />
                                          )}
                                        </Box>
                                      );
                                    })}
                                  </Box>
                                </Box>
                              </Box>
                            </Grid>
                          ))}
                        </Grid>
                      </Paper>
                    );
                  })()}
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      </Box>
    );
  };

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
        minHeight: '100vh', // Use minimum viewport height
        height: 'auto', // Let it grow with content
        overflow: 'visible', // Don't clip content
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
              height: 'auto',
              minHeight: 'calc(100vh - 108px)',
              overflow: 'visible', // Don't clip content, let children handle scrolling
              position: 'relative' // Create a positioning context
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

export default React.memo(AdminPage);