import { useEffect, useState } from 'react';
import { 
  Box, Typography, CircularProgress, 
  useMediaQuery,
  useTheme
} from '@mui/material';

import { StatsViewModel } from '@/types/api';
import { useStatsQueries } from '@/hooks/useAdminQueries';
import { StephsActualFavoriteTypography } from '@/components/AttendanceButton/AttendanceButton';
import StatsDashboardCharts from '@/components/StatsDashboardCharts';

function Stats() {
  const [statsData, setStatsData] = useState<StatsViewModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Use stats query
  const { getStatsQuery } = useStatsQueries();
  
  // Fetch stats data for all users (public endpoint)
  useEffect(() => {
    const fetchStatsData = async () => {
      try {
        // Check if we already have cached data
        if (getStatsQuery.data) {
          setStatsData(getStatsQuery.data);
          setLoading(false);
          return;
        }
        
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

  return (
    <Box sx={{ 
      p: { xs: 1, sm: 2, md: 3 }, 
      mb: 10,
      maxWidth: '100%',
      maxHeight: '100vh',
      overflow: 'auto',
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
        Wedding Statistics
      </StephsActualFavoriteTypography>

      {/* Dashboard Charts - available to all authenticated users */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" sx={{ mb: 4 }}>{error}</Typography>
      ) : (
        <StatsDashboardCharts stats={statsData!} loading={false} />
      )}
    </Box>
  );
}

export default Stats;