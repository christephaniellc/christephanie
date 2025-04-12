import { useEffect, useState } from 'react';
import { FamilyUnitDto, InvitationResponseEnum } from '@/types/api';
import { useAdminQueries } from '@/hooks/useAdminQueries';
import { useApiContext } from '@/context/ApiContext';
import { isAdmin } from '@/utils/roles';
import { useRecoilValue } from 'recoil';
import { userState } from '@/store/user';
import { getTierDetails } from './components/AdminHelpers';
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
  useMediaQuery
} from '@mui/material';
import { Navigate } from 'react-router-dom';

// Import custom components
import FamilyList, { SortOption } from './components/FamilyList';
import FamilyDetails from './components/FamilyDetails';

function AdminPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [adminData, setAdminData] = useState<FamilyUnitDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('lastUpdated');
  const [selectedFamily, setSelectedFamily] = useState<FamilyUnitDto | null>(null);
  const [familyDetailsLoading, setFamilyDetailsLoading] = useState(false);
  
  // Use both queries - stats for all users and admin data for admin users
  const { getAllFamiliesQuery } = useAdminQueries();
  const apiContext = useApiContext();
  
  const user = useRecoilValue(userState);
  const userIsAdmin = isAdmin(user);
  
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

  return (
    <Box sx={{ 
      width: '100%', 
      height: '100%',
      p: { xs: 1, sm: 2 }
    }}>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : (
        <Grid container spacing={2} sx={{ height: '100%' }}>
          {/* Left Panel - Family List */}
          <Grid item xs={12} md={4} lg={3} sx={{ 
            height: isMobile ? 'auto' : 'calc(100vh - 150px)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Paper elevation={3} sx={{ 
              p: 2, 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden' // Move overflow to Paper component
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
                overflow: 'auto' // Enable scrolling here
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
            height: isMobile ? 'auto' : 'calc(100vh - 150px)',
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
      )}
    </Box>
  );
}

export default AdminPage;