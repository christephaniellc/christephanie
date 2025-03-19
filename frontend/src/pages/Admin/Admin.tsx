import { useEffect, useState } from 'react';
import { 
  Box, Typography, Grid, CircularProgress, 
  Popper, Grow, ClickAwayListener,
  FormControl, InputLabel, Select, MenuItem, SelectChangeEvent
} from '@mui/material';

import { FamilyUnitDto, InvitationResponseEnum } from '@/types/api';
import { useAdminQueries } from '@/hooks/useAdminQueries';
import { StephsActualFavoriteTypography } from '@/components/AttendanceButton/AttendanceButton';

import { GuestPopperState, getRandomAxis, getTierDetails } from './components/AdminHelpers';
import GuestDetailCard from './components/GuestDetailCard';
import FamilyCard from './components/FamilyCard';
import AdminDashboardCharts from '@/components/AdminDashboardCharts';

// Define sort options
type SortOption = 'lastUpdated' | 'invitationStatus' | 'default';

function Admin() {
  const [families, setFamilies] = useState<FamilyUnitDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('lastUpdated');
  const { getAllFamiliesQuery } = useAdminQueries();
  
  // State for guest detail popper
  const [popperState, setPopperState] = useState<GuestPopperState>({
    open: false,
    anchorEl: null,
    guestId: null,
    flipped: false,
    flipAxis: 'Y'
  });

  // Sort families based on selected sort option
  const sortFamilies = (families: FamilyUnitDto[], sortOption: SortOption) => {
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
          const getStatusPriority = (family: FamilyUnitDto): number => {
            if (family.guests?.some(guest => guest.rsvp?.invitationResponse === InvitationResponseEnum.Declined)) {
              return 1; // Declined has highest priority
            } else if (family.guests?.some(guest => guest.rsvp?.invitationResponse === InvitationResponseEnum.Interested)) {
              return 2; // Interested has medium priority
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
        
      case 'default':
      default:
        // Default sort: by tier priority, then alphabetically by family name
        return filteredFamilies.sort((a, b) => {
          const aTierDetails = getTierDetails(a.tier);
          const bTierDetails = getTierDetails(b.tier);
          
          // First sort by tier priority
          const tierComparison = aTierDetails.priority - bTierDetails.priority;
          
          // If same tier, sort alphabetically by family name
          if (tierComparison === 0) {
            const aName = a.unitName?.toLowerCase() || '';
            const bName = b.unitName?.toLowerCase() || '';
            return aName.localeCompare(bName);
          }
          
          return tierComparison;
        });
    }
  };

  // Handle sort option change
  const handleSortChange = (event: SelectChangeEvent<string>) => {
    setSortOption(event.target.value as SortOption);
  };

  // Effect to fetch families
  useEffect(() => {
    const fetchFamilies = async () => {
      try {
        setLoading(true);
        
        // Store the refetch function to a local variable to avoid dependency issues
        const refetch = getAllFamiliesQuery.refetch;
        
        // Fetch data only once when the component mounts
        const response = await refetch();
        if (response.data) {
          const excludedCodes = ["BAAAD", "BAAAA", "BAAAB"];
          
          // Filter out families whose invitationcode is in the excludedCodes array
          const filteredFamilies = response.data.filter(
            family => !excludedCodes.includes(family.invitationCode)
          );

          // Apply the current sort option
          const sortedFamilies = sortFamilies(filteredFamilies, sortOption);

          setFamilies(sortedFamilies);
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
    // We're intentionally not including getAllFamiliesQuery in the dependency array
    // to prevent infinite refreshes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Effect to resort families when sort option changes
  useEffect(() => {
    if (families.length > 0) {
      setFamilies(sortFamilies([...families], sortOption));
    }
  }, [sortOption]);
  
  // Find a guest by ID across all families
  const findGuestById = (guestId: string | null) => {
    if (!guestId) return null;
    
    for (const family of families) {
      const guest = family.guests?.find(g => g.guestId === guestId);
      if (guest) return guest;
    }
    return null;
  };
  
  // Handle opening the guest detail popper
  const handleGuestClick = (event: React.MouseEvent<HTMLElement>, guestId: string) => {
    // Close if clicking the same guest
    if (popperState.open && popperState.guestId === guestId) {
      setPopperState({
        ...popperState,
        open: false,
        anchorEl: null,
        guestId: null
      });
      return;
    }
    
    setPopperState({
      open: true,
      anchorEl: event.currentTarget,
      guestId: guestId,
      flipped: false,
      flipAxis: getRandomAxis()
    });
  };
  
  // Handle closing the popper
  const handleClosePopper = () => {
    setPopperState({
      ...popperState,
      open: false,
      flipped: false
    });
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
      p: 3, 
      maxWidth: '100%',
      maxHeight: '100vh',
      overflow: 'auto'
    }}>
      <StephsActualFavoriteTypography variant="h1" gutterBottom sx={{ mb: 4 }}>
        Admin Dashboard
      </StephsActualFavoriteTypography>

      {/* Dashboard Charts */}
      <AdminDashboardCharts families={families} loading={loading} />
      
      {/* Family Cards */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <StephsActualFavoriteTypography variant="h2" gutterBottom sx={{ mb: 0 }}>
          All Families
        </StephsActualFavoriteTypography>
        
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="sort-select-label">Sort by</InputLabel>
          <Select
            labelId="sort-select-label"
            id="sort-select"
            value={sortOption}
            label="Sort by"
            onChange={handleSortChange}
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
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <Grid container spacing={3} pb={15}>
          {families.map((family) => (
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
    </Box>
  );
}

export default Admin;