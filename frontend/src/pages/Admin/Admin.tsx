import { useEffect, useState } from 'react';
import { 
  Box, Typography, Grid, CircularProgress, 
  Popper, Grow, ClickAwayListener
} from '@mui/material';

import { FamilyUnitViewModel } from '@/types/api';
import { useAdminQueries } from '@/hooks/useAdminQueries';
import { StephsActualFavoriteTypography } from '@/components/AttendanceButton/AttendanceButton';

import { GuestPopperState, getRandomAxis } from './components/AdminHelpers';
import GuestDetailCard from './components/GuestDetailCard';
import FamilyCard from './components/FamilyCard';

function Admin() {
  const [families, setFamilies] = useState<FamilyUnitViewModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getAllFamiliesQuery } = useAdminQueries();
  
  // State for guest detail popper
  const [popperState, setPopperState] = useState<GuestPopperState>({
    open: false,
    anchorEl: null,
    guestId: null,
    flipped: false,
    flipAxis: 'Y'
  });

  useEffect(() => {
    const fetchFamilies = async () => {
      try {
        setLoading(true);
        // Check if we already have data from initialData
        if (getAllFamiliesQuery.data) {
          setFamilies(getAllFamiliesQuery.data);
        } else {
          // Only refetch if we don't have data
          const response = await getAllFamiliesQuery.refetch();
          if (response.data) {
            setFamilies(response.data);
          }
          if (response.error) {
            setError('Failed to fetch families');
          }
        }
      } catch (err) {
        setError('An error occurred while fetching families');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFamilies();
  }, [getAllFamiliesQuery]);
  
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
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <Grid container spacing={3}>
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