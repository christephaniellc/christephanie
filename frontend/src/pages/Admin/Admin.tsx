import { useEffect, useState } from 'react';
import { 
  Box, Typography, Grid, CircularProgress, 
  Popper, Grow, ClickAwayListener,
  FormControl, InputLabel, Select, MenuItem, SelectChangeEvent
} from '@mui/material';

import { FamilyUnitDto, FamilyUnitViewModel, InvitationResponseEnum } from '@/types/api';
import { useAdminQueries, useStatsQueries } from '@/hooks/useAdminQueries';
import { StephsActualFavoriteTypography } from '@/components/AttendanceButton/AttendanceButton';
import { isAdmin } from '@/utils/roles';
import { useRecoilValue } from 'recoil';
import { userState } from '@/store/user';

import { GuestPopperState, getRandomAxis, getTierDetails } from './components/AdminHelpers';
import GuestDetailCard from './components/GuestDetailCard';
import FamilyCard from './components/FamilyCard';
import AdminDashboardCharts from '@/components/AdminDashboardCharts';

// Define sort options
type SortOption = 'lastUpdated' | 'invitationStatus' | 'default';

function Stats() {
  const [statsData, setStatsData] = useState<FamilyUnitViewModel[]>([]);
  const [adminData, setAdminData] = useState<FamilyUnitDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminLoading, setAdminLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('lastUpdated');
  
  // Use both queries - stats for all users and admin data for admin users
  const { getStatsQuery } = useStatsQueries();
  const { getAllFamiliesQuery } = useAdminQueries();
  
  const user = useRecoilValue(userState);
  const userIsAdmin = isAdmin(user);
  
  // State for guest detail popper
  const [popperState, setPopperState] = useState<GuestPopperState>({
    open: false,
    anchorEl: null,
    guestId: null,
    flipped: false,
    flipAxis: 'Y'
  });

  // Sort families based on selected sort option (generic version for both data types)
  const sortFamilies = <T extends FamilyUnitViewModel>(families: T[], sortOption: SortOption): T[] => {
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
          const aTierDetails = getTierDetails(a.tier);
          const bTierDetails = getTierDetails(b.tier);
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
          const getStatusPriority = (family: FamilyUnitViewModel): number => {
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
          const aTierDetails = getTierDetails(a.tier);
          const bTierDetails = getTierDetails(b.tier);
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
          const aTierDetails = getTierDetails(a.tier);
          const bTierDetails = getTierDetails(b.tier);
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

  // Function to sort admin data when the sort option changes
  useEffect(() => {
    if (adminData.length > 0) {
      const sortedFamilies = sortFamilies([...adminData], sortOption);
      setAdminData(sortedFamilies);
    }
  }, [sortOption]); // Only re-sort when the sort option changes
  
  // Fetch stats data for all users (public endpoint)
  useEffect(() => {
    const fetchStatsData = async () => {
      try {
        // Check if we already have cached data
        if (getStatsQuery.data && getStatsQuery.data.length > 0) {
          //console.log('Using cached stats data');
          setStatsData(getStatsQuery.data);
          setLoading(false);
          return;
        }
        
        //console.log('Fetching stats data from public API');
        const result = await getStatsQuery.refetch();
        
        if (result.status === 'success' && result.data) {
          setStatsData(result.data);
          setLoading(false);
        } else {
          setError('Failed to load stats data');
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching stats data:', err);
        setError('An error occurred while loading the data');
        setLoading(false);
      }
    };

    fetchStatsData();
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getStatsQuery]);
  
  // Fetch admin data (admin-only endpoint) only if user is admin
  useEffect(() => {
    // Only fetch admin data if the user has admin role
    if (!userIsAdmin) {
      setAdminLoading(false);
      return;
    }
    
    const fetchAdminData = async () => {
      try {
        // Check if we already have cached data
        if (getAllFamiliesQuery.data && getAllFamiliesQuery.data.length > 0) {
          //console.log('Using cached admin data');
          const sortedFamilies = sortFamilies(getAllFamiliesQuery.data, sortOption);
          setAdminData(sortedFamilies);
          setAdminLoading(false);
          return;
        }
        
        //console.log('Fetching admin data from private API');
        const result = await getAllFamiliesQuery.refetch();
        
        if (result.status === 'success' && result.data) {
          const sortedFamilies = sortFamilies(result.data, sortOption);
          setAdminData(sortedFamilies);
          setAdminLoading(false);
        } else {
          console.error('Failed to load admin data');
          setAdminLoading(false);
        }
      } catch (err) {
        console.error('Error fetching admin data:', err);
        setAdminLoading(false);
      }
    };

    fetchAdminData();
    // Only run once on mount if user is admin
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getAllFamiliesQuery, userIsAdmin]);

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
  const findGuestById = (guestId: string) => {
    let foundGuest = null;
    
    for (const family of adminData) {
      if (family.guests) {
        foundGuest = family.guests.find(guest => guest.guestId === guestId);
        if (foundGuest) break;
      }
    }
    
    return foundGuest;
  };

  // Handle flipping the card
  const handleFlipCard = () => {
    setPopperState({
      ...popperState,
      flipped: !popperState.flipped
    });
  };

  return (
    <Box sx={{ 
      p: { xs: 1, sm: 2, md: 3 }, 
      maxWidth: '100%',
      maxHeight: '100vh',
      overflow: 'auto'
    }}>
      <StephsActualFavoriteTypography variant="h1" gutterBottom sx={{ 
        mb: 4,
        fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.5rem' }
      }}>
        Statistics
      </StephsActualFavoriteTypography>

      {/* Dashboard Charts - available to all authenticated users */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" sx={{ mb: 4 }}>{error}</Typography>
      ) : (
        <AdminDashboardCharts families={statsData} loading={false} />
      )}
      
      {/* Family Cards - only visible to admins */}
      {userIsAdmin && (
        <>
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
              <InputLabel id="sort-select-label">Sort by</InputLabel>
              <Select
                labelId="sort-select-label"
                id="sort-select"
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
          
          {adminLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3} pb={15}>
              {adminData.map((family) => (
                <Grid item xs={12} md={6} lg={4} key={family.invitationCode}>
                  <FamilyCard 
                    family={family} 
                    onGuestClick={handleGuestClick} 
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
                    }} 
                    onClick={handleFlipCard}
                  >
                    {popperState.guestId && (
                      <GuestDetailCard 
                        guest={findGuestById(popperState.guestId)} 
                        flipped={popperState.flipped} 
                        flipAxis={popperState.flipAxis}
                      />
                    )}
                  </Box>
                </Grow>
              </ClickAwayListener>
            )}
          </Popper>
        </>
      )}
    </Box>
  );
}

export default Stats;