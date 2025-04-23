import React, { useState } from 'react';
import { Box, Grid, Typography, useTheme, CircularProgress, Tab, Tabs, Paper } from '@mui/material';
import { StatsViewModel } from '@/types/api';
import { StephsActualFavoriteTypography } from '@/components/AttendanceButton/AttendanceButton';
import { rgba } from 'polished';
import { 
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Sector, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { animated, useSpring } from 'react-spring';
import { FeatureFlags, isFeatureEnabled } from '@/config';

// Custom themed tooltip with 8-bit style
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <Paper
        sx={{
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          border: '2px solid #E9950C',
          p: 1.5,
          boxShadow: '3px 3px 0px #E9950C',
          fontFamily: 'monospace',
        }}
      >
        <Typography variant="subtitle2" sx={{ color: 'white', mb: 0.5 }}>
          {label}
        </Typography>
        {payload.map((item: any, index: number) => (
          <Typography 
            key={index} 
            variant="body2" 
            sx={{ 
              color: item.color,
              display: 'flex',
              alignItems: 'center',
              '&::before': {
                content: '""',
                display: 'inline-block',
                width: '8px',
                height: '8px',
                backgroundColor: item.color,
                marginRight: '6px'
              }
            }}
          >
            {`${item.name}: ${item.value}`}
          </Typography>
        ))}
      </Paper>
    );
  }
  return null;
};

// 8-bit style pixel guest icon (single guest)
const PixelGuest = ({ 
  color, 
  highlighted = false,
  size = 20
}: { 
  color: string, 
  highlighted?: boolean,
  size?: number
}) => {
  const borderColor = highlighted ? '#E9950C' : 'transparent';
  const shadowColor = highlighted ? '0 0 8px ' + color : 'none';
  
  return (
    <Box
      sx={{
        width: size,
        height: size,
        backgroundColor: color,
        border: `2px solid ${borderColor}`,
        boxShadow: shadowColor,
        display: 'inline-block',
        margin: '2px',
        clipPath: 'polygon(0% 20%, 20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%)',
        transition: 'all 0.3s ease'
      }}
    />
  );
};

// Grid of pixel guest icons
const PixelGuestGrid = ({ 
  totalGuests, 
  attendingGuests,
  interestedGuests,
  declinedGuests,
  maxPerRow = 10
}: { 
  totalGuests: number, 
  attendingGuests: number,
  interestedGuests: number,
  declinedGuests: number,
  maxPerRow?: number
}) => {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexWrap: 'wrap',
        justifyContent: 'center',
        maxWidth: maxPerRow * 24,
        margin: '0 auto',
        mt: 2
      }}
    >
      {Array.from({ length: totalGuests }).map((_, index) => {
        // Determine color based on status
        let color = '#FFC107'; // Default yellow for pending
        let isHighlighted = false;
        
        if (index < attendingGuests) {
          color = '#63e368'; // Bright green for attending
          isHighlighted = true;
        } else if (index < attendingGuests + interestedGuests) {
          color = '#3c823f'; // Green for interested
        } else if (index < attendingGuests + interestedGuests + declinedGuests) {
          color = '#F44336'; // Red for declined
        }
        
        return (
          <PixelGuest 
            key={index} 
            color={color} 
            highlighted={isHighlighted}
          />
        );
      })}
    </Box>
  );
};

// Custom animated counter
const AnimatedCounter = ({ value, label, color }: { value: number, label: string, color: string }) => {
  const { number } = useSpring({
    from: { number: 0 },
    number: value,
    delay: 200,
    config: { mass: 1, tension: 20, friction: 10 }
  });

  return (
    <Box 
      sx={{ 
        textAlign: 'center', 
        p: 2,
        border: `2px solid ${color}`,
        backgroundColor: 'rgba(0,0,0,0.7)',
        boxShadow: `4px 4px 0 ${color}`,
        borderRadius: '4px',
        m: 1
      }}
    >
      <animated.div style={{ fontSize: '2rem', fontWeight: 'bold', color }}>
        {number.to(n => Math.floor(n))}
      </animated.div>
      <Typography variant="body2" sx={{ color: 'white', mt: 1, fontFamily: 'monospace' }}>
        {label}
      </Typography>
    </Box>
  );
};

type AdminTab = 'overview' | 'food' | 'accommodation' | 'interest' | 'client-info';

interface AdminDashboardChartsProps {
  stats: StatsViewModel;
  loading: boolean;
}

const AdminDashboardCharts: React.FC<AdminDashboardChartsProps> = ({ stats, loading }) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Prepare data for charts using the stats from backend
  const metrics = {
    totalGuests: stats?.totalGuests || 0,
    interestedGuests: stats?.interestedGuests || 0,
    attendingGuests: stats?.attendingWeddingGuests || 0,
    declinedGuests: stats?.declinedGuests || 0,
    pendingGuests: stats?.pendingWeddingGuests || 0,
    
    // Interest data pie chart
    interestData: [
      { name: 'Attending', value: stats?.attendingWeddingGuests || 0, color: '#63e368' },
      { name: 'Interested', value: stats?.interestedGuests || 0, color: '#3c823f' },
      { name: 'Declined', value: stats?.declinedGuests || 0, color: '#F44336' },
      { name: 'Pending', value: stats?.pendingWeddingGuests || 0, color: '#FFC107' }
    ],
    
    // Age data bar chart
    ageData: [
      { name: 'Babies', value: stats?.babyGuests || 0, color: '#E91E63' },
      { name: 'Under 13', value: stats?.under13Guests || 0, color: '#9C27B0' },
      { name: 'Under 21', value: stats?.under21Guests || 0, color: '#3F51B5' },
      { name: 'Adults', value: stats?.adultGuests || 0, color: '#2196F3' }
    ],
    
    // Food data pie chart
    foodData: [
      { name: 'Omnivore', value: stats?.omnivoreGuests || 0, color: '#FF9800' },
      { name: 'Vegetarian', value: stats?.vegetarianGuests || 0, color: '#8BC34A' },
      { name: 'Vegan', value: stats?.veganGuests || 0, color: '#4CAF50' },
      { name: 'Meat-a-tarian', value: (stats?.totalRespondedSurveyGuests || 0) - 
        (stats?.omnivoreGuests || 0) - (stats?.vegetarianGuests || 0) - (stats?.veganGuests || 0), color: '#9C27B0' }
    ],
    
    // Accommodation data radar chart
    accommodationData: [
      { name: 'Manor', value: stats?.manorGuests || 0, color: '#9C27B0' },
      { name: 'Camping', value: stats?.campingGuests || 0, color: '#4CAF50' },
      { name: 'Hotel', value: stats?.hotelGuests || 0, color: '#2196F3' },
      { name: 'Other', value: stats?.otherAccommodationGuests || 0, color: '#FF9800' },
      { name: 'Unknown', value: stats?.unknownAccommodationGuests || 0, color: '#757575' }
    ],
    
    // Allergies data for tags
    allergiesData: Object.entries(stats?.allergiesCount || {})
      .map(([name, value]) => ({ name, value, color: '#F44336' }))
      .sort((a, b) => b.value - a.value),
    
    // Family status data pie chart
    familyStatusData: [
      { name: 'Attending', value: stats?.attendingWeddingFamilies || 0, color: '#63e368' },
      { name: 'Interested', value: stats?.interestedFamilies || 0, color: '#4CAF50' },
      { name: 'Declined', value: stats?.declinedFamilies || 0, color: '#F44336' },
      { name: 'Pending', value: stats?.pendingFamilies || 0, color: '#FFC107' }
    ],
    
    // Family counts
    attendingFamilies: stats?.attendingWeddingFamilies || 0,
    interestedFamilies: stats?.interestedFamilies || 0,
    declinedFamilies: stats?.declinedFamilies || 0,
    pendingFamilies: stats?.pendingFamilies || 0,
    totalFamilies: stats?.totalFamilies || 0,
    
    // Client info
    clientInfo: {
      deviceTypes: Object.entries(stats?.deviceTypesCount || {})
        .map(([name, value]) => ({ 
          name, 
          value, 
          color: name === 'mobile' ? '#FF9800' : name === 'desktop' ? '#2196F3' : '#9C27B0' 
        }))
        .sort((a, b) => b.value - a.value),
      
      browsers: Object.entries(stats?.browsers || {})
        .map(([name, value]) => ({ 
          name, 
          value, 
          color: 
            name === 'chrome' ? '#4CAF50' : 
            name === 'firefox' ? '#FF9800' : 
            name === 'safari' ? '#2196F3' : 
            name === 'edge' ? '#3F51B5' : 
            '#9E9E9E'
        }))
        .sort((a, b) => b.value - a.value),
      
      operatingSystems: Object.entries(stats?.operatingSystems || {})
        .map(([name, value]) => ({ 
          name, 
          value, 
          color: name.includes('win') ? '#2196F3' : 
                name.includes('mac') ? '#9C27B0' : 
                name.includes('linux') ? '#FF9800' : 
                name.includes('android') ? '#4CAF50' : 
                name.includes('ios') ? '#F44336' : '#9E9E9E'
        }))
        .sort((a, b) => b.value - a.value),
      
      screenSizes: Object.entries(stats?.screenSizes || {})
        .map(([name, value]) => ({ 
          name, 
          value, 
          color: 
            name.includes('mobile') ? '#F44336' : 
            name.includes('tablet') ? '#FF9800' : 
            name.includes('laptop') ? '#4CAF50' : 
            name.includes('desktop') ? '#2196F3' : '#9E9E9E'
        }))
        .sort((a, b) => b.value - a.value),
        
      languages: Object.entries(stats?.languages || {})
        .map(([name, value]) => ({ name, value, color: '#E91E63' }))
        .sort((a, b) => b.value - a.value),
        
      connectionTypes: Object.entries(stats?.connectionTypes || {})
        .map(([name, value]) => ({ 
          name, 
          value, 
          color: 
            name === '4g' ? '#4CAF50' : 
            name === '3g' ? '#FF9800' : 
            name === '2g' ? '#F44336' : 
            name === 'slow-2g' ? '#D32F2F' : '#9E9E9E'
        }))
        .sort((a, b) => b.value - a.value)
    },
    
    totalClientInfos: stats?.totalClientInfos || 0,
    uniqueDevices: stats?.deviceIds?.length || 0,

    attendingMetric: FeatureFlags.ENABLE_RSVP_PHASE 
      ? stats?.attendingWeddingGuests : stats?.interestedGuests
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ 
        backgroundColor: 'rgba(0,0,0,0.7)', 
        p: { xs: 1.5, sm: 2, md: 3 }, 
        borderRadius: 2, 
        mb: 4,
        // Allow screenshots
        userSelect: 'text',
        WebkitUserSelect: 'text',
        WebkitTouchCallout: 'default'
      }}>
        <StephsActualFavoriteTypography variant="h2" sx={{ mb: 3, textAlign: 'center', fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' } }}>
          Wedding Dashboard
        </StephsActualFavoriteTypography>
        
        <Typography
          variant="body2"
          sx={{
            mb: 2,
            textAlign: 'center',
            color: 'white',
            fontFamily: 'monospace',
            opacity: 0.8
          }}
        >
          Note: All statistics exclude pending guests (except client info, which shows all visits)
        </Typography>
        
        {/* Stats at the top as pixel art counters */}
        <Grid container spacing={2} justifyContent="center" sx={{ mb: 4 }}>
          { isFeatureEnabled('ENABLE_RSVP_PHASE') && (
            <Grid item xs={6} sm={4}>
              <AnimatedCounter 
                value={metrics.attendingGuests} 
                label="Attending (Confirmed)"
                color="#63e368" 
              />
            </Grid>
          )}
          <Grid item xs={3} sm={2}>
            <AnimatedCounter 
              value={metrics.interestedGuests} 
              label={ "Interested" }
              color="#3c823f" 
            />
          </Grid>
          <Grid item xs={3} sm={2}>
            <AnimatedCounter 
              value={metrics.declinedGuests} 
              label="Declined" 
              color="#F44336" 
            />
          </Grid>
          <Grid item xs={3} sm={2}>
            <AnimatedCounter 
              value={metrics.pendingGuests} 
              label="Pending" 
              color={
                metrics.pendingGuests + metrics.attendingMetric > 250 
                  ? "#f2ab3a" // Red if pending + interested > 250
                  : (metrics.pendingGuests + metrics.attendingMetric + 10) <= 250 
                    ? "#4CAF50" // Green if (pending + interested + 10) <= 250
                    : "#FFC107" // Yellow otherwise
              }
            />
          </Grid>
        </Grid>
        
        {/* Pixel art visualization of guests */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 2, 
              color: 'white',
              fontFamily: 'monospace',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' },
              overflowWrap: 'break-word'
            }}
          >
            Guest Visualization
          </Typography>
          <PixelGuestGrid 
            totalGuests={metrics.totalGuests} 
            attendingGuests={metrics.attendingGuests}
            interestedGuests={metrics.interestedGuests}
            declinedGuests={metrics.declinedGuests}
            maxPerRow={20}
          />
          <Typography 
            variant="body2" 
            sx={{ 
              mt: 2, 
              color: 'white',
              fontFamily: 'monospace',
              opacity: 0.7
            }}
          >
            Each pixel represents one guest (green = interested, red = declined, yellow = pending - not included in statistics)
          </Typography>
        </Box>
        
        {/* Tabs for different chart categories */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={activeTab} 
            onChange={(_, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              '& .MuiTab-root': {
                color: 'white',
                fontFamily: 'monospace',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                '&.Mui-selected': {
                  color: '#E9950C',
                },
                minWidth: { xs: '120px', sm: '160px' },
                px: { xs: 1, sm: 2 },
                whiteSpace: 'normal'
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#E9950C',
                height: 3
              },
              '& .MuiTabs-scrollButtons': {
                color: 'white',
                '&.Mui-disabled': {
                  opacity: 0.3,
                }
              }
            }}
          >
            <Tab label="Overview" value="overview" />
            <Tab label="Food" value="food" />
            <Tab label="Accommodation" value="accommodation" />
            <Tab label="Interest Details" value="interest" />
            <Tab label="Client Info" value="client-info" />
          </Tabs>
        </Box>
        
        {/* Chart content based on active tab */}
        {activeTab === 'overview' && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ height: 300 }}>
                <Box>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mb: 1, 
                      color: 'white',
                      fontFamily: 'monospace',
                      textAlign: 'center',
                      fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' },
                      overflowWrap: 'break-word'
                    }}
                  >
                    Interest Status
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      mb: 2, 
                      color: 'white',
                      fontFamily: 'monospace',
                      textAlign: 'center',
                      opacity: 0.8
                    }}
                  >
                    Total: {metrics.attendingMetric + metrics.declinedGuests} of {metrics.totalGuests} guests ({metrics.pendingGuests} pending)
                  </Typography>
                </Box>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={metrics.interestData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {metrics.interestData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="#000" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ height: 300 }}>
                <Box>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mb: 1, 
                      color: 'white',
                      fontFamily: 'monospace',
                      textAlign: 'center',
                      fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' },
                      overflowWrap: 'break-word'
                    }}
                  >
                    Age Groups
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      mb: 2, 
                      color: 'white',
                      fontFamily: 'monospace',
                      textAlign: 'center',
                      opacity: 0.8
                    }}
                  >
                    Total: {metrics.ageData.reduce((sum, item) => sum + item.value, 0)} of {metrics.attendingGuests + metrics.declinedGuests} responded guests
                  </Typography>
                </Box>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={metrics.ageData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: 'white' }}
                      axisLine={{ stroke: 'white' }}
                    />
                    <YAxis 
                      tick={{ fill: 'white' }}
                      axisLine={{ stroke: 'white' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {metrics.ageData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color} 
                          stroke="#000"
                          strokeWidth={2}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Grid>
          </Grid>
        )}
        
        {activeTab === 'food' && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ height: 300 }}>
                <Box>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mb: 1, 
                      color: 'white',
                      fontFamily: 'monospace',
                      textAlign: 'center',
                      fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' },
                      overflowWrap: 'break-word'
                    }}
                  >
                    Dietary Preferences
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      mb: 2, 
                      color: 'white',
                      fontFamily: 'monospace',
                      textAlign: 'center',
                      opacity: 0.8
                    }}
                  >
                    Total: {metrics.foodData.reduce((sum, item) => sum + item.value, 0)} of {metrics.attendingGuests + metrics.declinedGuests} responded guests
                  </Typography>
                </Box>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={metrics.foodData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {metrics.foodData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="#000" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ minHeight: 300 }}>
                <Box>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mb: 1, 
                      color: 'white',
                      fontFamily: 'monospace',
                      textAlign: 'center',
                      fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' },
                      overflowWrap: 'break-word'
                    }}
                  >
                    Food Allergies
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      mb: 2, 
                      color: 'white',
                      fontFamily: 'monospace',
                      textAlign: 'center',
                      opacity: 0.8
                    }}
                  >
                    Total: {metrics.allergiesData.reduce((sum, item) => {
                      // Exclude "none" or blank allergies from the total count
                      if (item.name.toLowerCase() === "none" || item.name.trim() === "") {
                        return sum;
                      }
                      return sum + item.value;
                    }, 0)} allergies from {metrics.attendingGuests + metrics.declinedGuests} guests
                  </Typography>
                </Box>
                
                {/* Allergy Tag Cloud - better visualization for many allergies */}
                <Box sx={{ 
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  gap: 1,
                  p: 2,
                  maxHeight: 400,
                  overflowY: 'auto',
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  borderRadius: 1,
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  {metrics.allergiesData.map((allergyItem, index) => {
                    // Calculate size based on count (more frequent = larger)
                    const minSize = 0.75;
                    const maxSize = 1.75;
                    const maxCount = Math.max(...metrics.allergiesData.map(item => item.value));
                    const size = minSize + ((allergyItem.value / maxCount) * (maxSize - minSize));
                    
                    // Calculate opacity based on count
                    const minOpacity = 0.7;
                    const maxOpacity = 1;
                    const opacity = minOpacity + ((allergyItem.value / maxCount) * (maxOpacity - minOpacity));
                    
                    return (
                      <Box 
                        key={`allergy-tag-${index}`}
                        sx={{
                          backgroundColor: '#F44336',
                          color: 'white',
                          px: 1.5,
                          py: 0.75,
                          borderRadius: 4,
                          fontSize: `${size}rem`,
                          opacity,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                          border: '1px solid rgba(0,0,0,0.2)',
                          '&:hover': {
                            boxShadow: '0 4px 8px rgba(0,0,0,0.5)',
                            transform: 'translateY(-2px)'
                          },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <Typography 
                          component="span" 
                          sx={{ 
                            fontFamily: 'monospace',
                            fontWeight: 'bold',
                            fontSize: 'inherit'
                          }}
                        >
                          {allergyItem.name}
                        </Typography>
                        <Typography 
                          component="span" 
                          sx={{
                            backgroundColor: 'rgba(0,0,0,0.3)', 
                            borderRadius: '50%',
                            width: '1.5em',
                            height: '1.5em',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8em',
                            ml: 0.5
                          }}
                        >
                          {allergyItem.value}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            </Grid>
          </Grid>
        )}
        
        {activeTab === 'accommodation' && (
          <Box sx={{ height: 400 }}>
            <Box>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 1, 
                  color: 'white',
                  fontFamily: 'monospace',
                  textAlign: 'center',
                  fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' },
                  overflowWrap: 'break-word'
                }}
              >
                Sleeping Arrangements
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  mb: 2, 
                  color: 'white',
                  fontFamily: 'monospace',
                  textAlign: 'center',
                  opacity: 0.8
                }}
              >
                Total: {metrics.accommodationData.reduce((sum, item) => sum + item.value, 0)} of {metrics.attendingGuests + metrics.declinedGuests} responded guests
              </Typography>
            </Box>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={metrics.accommodationData}>
                <PolarGrid stroke="rgba(255,255,255,0.3)" />
                <PolarAngleAxis dataKey="name" tick={{ fill: 'white' }} />
                <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={{ fill: 'white' }} />
                <Radar 
                  name="Guests" 
                  dataKey="value" 
                  stroke="#E9950C" 
                  fill="#E9950C" 
                  fillOpacity={0.6} 
                />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </Box>
        )}
        
        {activeTab === 'interest' && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ height: 300 }}>
                <Box>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mb: 1, 
                      color: 'white',
                      fontFamily: 'monospace',
                      textAlign: 'center',
                      fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' },
                      overflowWrap: 'break-word'
                    }}
                  >
                    Family Unit Interest Status
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      mb: 2, 
                      color: 'white',
                      fontFamily: 'monospace',
                      textAlign: 'center',
                      opacity: 0.8
                    }}
                  >
                    Total: {metrics.attendingFamilies + metrics.declinedFamilies} of {metrics.totalFamilies} families ({metrics.pendingFamilies} pending)
                  </Typography>
                </Box>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={metrics.familyStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {metrics.familyStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="#000" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box 
                sx={{ 
                  height: 300, 
                  display: 'flex', 
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  border: '2px solid rgba(233, 149, 12, 0.5)',
                  borderRadius: '4px',
                  p: 2
                }}
              >
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mb: 3, 
                    color: 'white',
                    fontFamily: 'monospace',
                    textAlign: 'center'
                  }}
                >
                  STD Completion
                </Typography>
                
                <Box sx={{ position: 'relative', width: '100%', height: 30, mb: 2 }}>
                  <Box 
                    sx={{ 
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      border: '2px solid rgba(255,255,255,0.3)',
                    }}
                  />
                  <Box 
                    sx={{ 
                      position: 'absolute',
                      width: `${(metrics.attendingGuests + metrics.declinedGuests) / metrics.totalGuests * 100}%`,
                      height: '100%',
                      backgroundColor: '#E9950C',
                      transition: 'width 1s ease-in-out',
                      clipPath: 'polygon(0% 0%, 95% 0%, 100% 50%, 95% 100%, 0% 100%)'
                    }}
                  />
                </Box>
                
                <Typography 
                  variant="h4" 
                  sx={{ 
                    color: '#E9950C',
                    fontFamily: 'monospace',
                    textAlign: 'center',
                    mb: 1
                  }}
                >
                  {Math.round((metrics.attendingGuests + metrics.declinedGuests) / metrics.totalGuests * 100)}%
                </Typography>
                
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'white',
                    fontFamily: 'monospace',
                    textAlign: 'center',
                    opacity: 0.7
                  }}
                >
                  {metrics.pendingGuests} guests still need to respond (only counting responded guests in statistics)
                </Typography>
                
                <Typography 
                  variant="body2" 
                  sx={{ 
                    mt: 3,
                    color: 'white',
                    fontFamily: 'monospace',
                    textAlign: 'center',
                    opacity: 0.7
                  }}
                >
                  Deadline: April 15th, 2025
                </Typography>
              </Box>
            </Grid>
          </Grid>
        )}
        
        {activeTab === 'client-info' && (
          <>
            <Typography
              variant="body2"
              sx={{
                mb: 3,
                textAlign: 'center',
                color: 'white',
                fontFamily: 'monospace',
                opacity: 0.8
              }}
            >
              Note: Client info section includes ALL guests (including pending)
            </Typography>
            
            {/* Client info summary */}
            <Grid container spacing={2} justifyContent="center" sx={{ mb: 4 }}>
              <Grid item xs={6} sm={3}>
                <AnimatedCounter 
                  value={metrics.totalClientInfos} 
                  label="Total Sessions" 
                  color="#2196F3" 
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <AnimatedCounter 
                  value={metrics.uniqueDevices} 
                  label="Unique Devices" 
                  color="#4CAF50" 
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <AnimatedCounter 
                  value={Math.round(metrics.totalClientInfos / metrics.totalGuests * 10) / 10} 
                  label="Sessions Per Guest" 
                  color="#FF9800" 
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <AnimatedCounter 
                  value={metrics.clientInfo.deviceTypes.reduce((a, b) => a + (b.name === 'mobile' ? b.value : 0), 0)} 
                  label="Mobile Sessions" 
                  color="#E91E63" 
                />
              </Grid>
            </Grid>
            
            <Grid container spacing={8}>
              {/* Device Types Chart */}
              <Grid item xs={12} md={6}>
                <Box sx={{ height: 300 }}>
                  <Box>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        mb: 1, 
                        color: 'white',
                        fontFamily: 'monospace',
                        textAlign: 'center',
                        fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' },
                        overflowWrap: 'break-word'
                      }}
                    >
                      Device Types
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        mb: 2, 
                        color: 'white',
                        fontFamily: 'monospace',
                        textAlign: 'center',
                        opacity: 0.8
                      }}
                    >
                      Total: {metrics.clientInfo.deviceTypes.reduce((sum, item) => sum + item.value, 0)} devices from all guests (including pending)
                    </Typography>
                  </Box>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={metrics.clientInfo.deviceTypes}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {metrics.clientInfo.deviceTypes.map((entry, index) => (
                          <Cell key={`cell-device-${index}`} fill={entry.color} stroke="#000" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>
              
              {/* Browsers Chart */}
              <Grid item xs={12} md={6}>
                <Box sx={{ height: 300 }}>
                  <Box>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        mb: 1, 
                        color: 'white',
                        fontFamily: 'monospace',
                        textAlign: 'center',
                        fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' },
                        overflowWrap: 'break-word'
                      }}
                    >
                      Browsers
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        mb: 2, 
                        color: 'white',
                        fontFamily: 'monospace',
                        textAlign: 'center',
                        opacity: 0.8
                      }}
                    >
                      Total: {metrics.clientInfo.browsers.reduce((sum, item) => sum + item.value, 0)} browser sessions (including pending guests)
                    </Typography>
                  </Box>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={metrics.clientInfo.browsers.slice(0, 5)}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fill: 'white' }}
                        axisLine={{ stroke: 'white' }}
                      />
                      <YAxis 
                        tick={{ fill: 'white' }}
                        axisLine={{ stroke: 'white' }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {metrics.clientInfo.browsers.map((entry, index) => (
                          <Cell 
                            key={`cell-browser-${index}`} 
                            fill={entry.color} 
                            stroke="#000"
                            strokeWidth={2}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>
              
              {/* Operating Systems Chart */}
              <Grid item xs={12} md={6}>
                <Box sx={{ height: 300 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mb: 2, 
                      color: 'white',
                      fontFamily: 'monospace',
                      textAlign: 'center'
                    }}
                  >
                    Operating Systems
                  </Typography>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={metrics.clientInfo.operatingSystems.slice(0, 5)}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fill: 'white' }}
                        axisLine={{ stroke: 'white' }}
                      />
                      <YAxis 
                        tick={{ fill: 'white' }}
                        axisLine={{ stroke: 'white' }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {metrics.clientInfo.operatingSystems.map((entry, index) => (
                          <Cell 
                            key={`cell-os-${index}`} 
                            fill={entry.color} 
                            stroke="#000"
                            strokeWidth={2}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>
              
              {/* Screen Sizes Chart */}
              <Grid item xs={12} md={6}>
                <Box sx={{ height: 300 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mb: 2, 
                      color: 'white',
                      fontFamily: 'monospace',
                      textAlign: 'center'
                    }}
                  >
                    Screen Sizes
                  </Typography>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={metrics.clientInfo.screenSizes}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis 
                        type="number" 
                        tick={{ fill: 'white' }}
                        axisLine={{ stroke: 'white' }}
                      />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        tick={{ fill: 'white' }}
                        axisLine={{ stroke: 'white' }}
                        width={100}
                        tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {metrics.clientInfo.screenSizes.map((entry, index) => (
                          <Cell 
                            key={`cell-screen-${index}`} 
                            fill={entry.color} 
                            stroke="#000"
                            strokeWidth={2}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>
              
              {/* Connection Speed Chart */}
              {metrics.clientInfo.connectionTypes.length > 0 && (
                <Grid item xs={12} md={6}>
                  <Box sx={{ height: 300 }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        mb: 2, 
                        color: 'white',
                        fontFamily: 'monospace',
                        textAlign: 'center'
                      }}
                    >
                      Connection Types
                    </Typography>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={metrics.clientInfo.connectionTypes}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {metrics.clientInfo.connectionTypes.map((entry, index) => (
                            <Cell key={`cell-connection-${index}`} fill={entry.color} stroke="#000" strokeWidth={2} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </Grid>
              )}
              
              {/* Languages Chart */}
              {metrics.clientInfo.languages.length > 0 && (
                <Grid item xs={12} md={6}>
                  <Box sx={{ height: 300 }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        mb: 2, 
                        color: 'white',
                        fontFamily: 'monospace',
                        textAlign: 'center'
                      }}
                    >
                      Languages
                    </Typography>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={metrics.clientInfo.languages.slice(0, 5)}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fill: 'white' }}
                          axisLine={{ stroke: 'white' }}
                        />
                        <YAxis 
                          tick={{ fill: 'white' }}
                          axisLine={{ stroke: 'white' }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="value" fill="#E91E63" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Grid>
              )}
            </Grid>
          </>
        )}
      </Box>
    </Box>
  );
};

export default AdminDashboardCharts;