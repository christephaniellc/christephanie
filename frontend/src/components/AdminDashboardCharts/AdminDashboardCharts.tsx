import React, { useMemo, useState } from 'react';
import { Box, Grid, Typography, useTheme, CircularProgress, Tab, Tabs, Paper } from '@mui/material';
import { FamilyUnitViewModel, InvitationResponseEnum, RsvpEnum, SleepPreferenceEnum, FoodPreferenceEnum, AgeGroupEnum } from '@/types/api';
import { StephsActualFavoriteTypography } from '@/components/AttendanceButton/AttendanceButton';
import { rgba } from 'polished';
import { 
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Sector, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { animated, useSpring } from 'react-spring';

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
  declinedGuests,
  maxPerRow = 10
}: { 
  totalGuests: number, 
  attendingGuests: number,
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
          color = '#4CAF50'; // Green for attending
          isHighlighted = true;
        } else if (index < attendingGuests + declinedGuests) {
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

type AdminTab = 'overview' | 'food' | 'accommodation' | 'rsvp';

interface AdminDashboardChartsProps {
  families: FamilyUnitViewModel[];
  loading: boolean;
}

const AdminDashboardCharts: React.FC<AdminDashboardChartsProps> = ({ families, loading }) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Calculate all the metrics we need from the families data
  const metrics = useMemo(() => {
    // Count all guests
    let totalGuests = 0;
    let attendingGuests = 0;
    let declinedGuests = 0;
    let pendingGuests = 0;
    let babyGuests = 0;
    let under13Guests = 0;
    let under21Guests = 0;
    let adultGuests = 0;
    let omnivoreGuests = 0;
    let vegetarianGuests = 0;
    let veganGuests = 0;
    let manorGuests = 0;
    let campingGuests = 0;
    let hotelGuests = 0;
    let otherAccommodationGuests = 0;
    let unknownAccommodationGuests = 0;
    let allergiesCount: Record<string, number> = {};

    // Count families by response type
    let attendingFamilies = 0;
    let declinedFamilies = 0;
    let pendingFamilies = 0;
    
    // Process each family
    families.forEach(family => {
      let familyAttending = false;
      let familyDeclined = false;
      
      // Process each guest in the family
      family.guests?.forEach(guest => {
        totalGuests++;
        
        // Count by invitationResponse status
        if (guest.rsvp?.invitationResponse === InvitationResponseEnum.Interested) {
          attendingGuests++;
          familyAttending = true;
        } else if (guest.rsvp?.invitationResponse === InvitationResponseEnum.Declined) {
          declinedGuests++;
          familyDeclined = true;
        } else {
          pendingGuests++;
        }
        
        // Count by age group
        if (guest.ageGroup === AgeGroupEnum.Baby) babyGuests++;
        else if (guest.ageGroup === AgeGroupEnum.Under13) under13Guests++;
        else if (guest.ageGroup === AgeGroupEnum.Under21) under21Guests++;
        else if (guest.ageGroup === AgeGroupEnum.Adult) adultGuests++;
        
        // Count by food preference
        if (guest.preferences?.foodPreference === FoodPreferenceEnum.Omnivore) omnivoreGuests++;
        else if (guest.preferences?.foodPreference === FoodPreferenceEnum.Vegetarian) vegetarianGuests++;
        else if (guest.preferences?.foodPreference === FoodPreferenceEnum.Vegan) veganGuests++;
        
        // Count by accommodation preference
        if (guest.preferences?.sleepPreference === SleepPreferenceEnum.Manor) manorGuests++;
        else if (guest.preferences?.sleepPreference === SleepPreferenceEnum.Camping) campingGuests++;
        else if (guest.preferences?.sleepPreference === SleepPreferenceEnum.Hotel) hotelGuests++;
        else if (guest.preferences?.sleepPreference === SleepPreferenceEnum.Other) otherAccommodationGuests++;
        else if (guest.preferences?.sleepPreference === SleepPreferenceEnum.Unknown) unknownAccommodationGuests++;
        
        // Count allergies
        guest.preferences?.foodAllergies?.forEach(allergy => {
          allergiesCount[allergy] = (allergiesCount[allergy] || 0) + 1;
        });
      });
      
      // Count family status
      if (familyAttending) attendingFamilies++;
      else if (familyDeclined) declinedFamilies++;
      else pendingFamilies++;
    });
    
    // Prepare data for charts
    const rsvpData = [
      { name: 'Interested', value: attendingGuests, color: '#4CAF50' },
      { name: 'Declined', value: declinedGuests, color: '#F44336' },
      { name: 'Pending', value: pendingGuests, color: '#FFC107' }
    ];
    
    const ageData = [
      { name: 'Babies', value: babyGuests, color: '#E91E63' },
      { name: 'Under 13', value: under13Guests, color: '#9C27B0' },
      { name: 'Under 21', value: under21Guests, color: '#3F51B5' },
      { name: 'Adults', value: adultGuests, color: '#2196F3' }
    ];
    
    const foodData = [
      { name: 'Omnivore', value: omnivoreGuests, color: '#FF9800' },
      { name: 'Vegetarian', value: vegetarianGuests, color: '#8BC34A' },
      { name: 'Vegan', value: veganGuests, color: '#4CAF50' }
    ];
    
    const accommodationData = [
      { name: 'Manor', value: manorGuests, color: '#9C27B0' },
      { name: 'Camping', value: campingGuests, color: '#4CAF50' },
      { name: 'Hotel', value: hotelGuests, color: '#2196F3' },
      { name: 'Other', value: otherAccommodationGuests, color: '#FF9800' },
      { name: 'Unknown', value: unknownAccommodationGuests, color: '#757575' }
    ];
    
    const allergiesData = Object.entries(allergiesCount)
      .map(([name, value]) => ({ name, value, color: '#F44336' }))
      .sort((a, b) => b.value - a.value);
    
    const familyStatusData = [
      { name: 'Interested', value: attendingFamilies, color: '#4CAF50' },
      { name: 'Declined', value: declinedFamilies, color: '#F44336' },
      { name: 'Pending', value: pendingFamilies, color: '#FFC107' }
    ];
    
    return {
      totalGuests,
      attendingGuests,
      declinedGuests,
      pendingGuests,
      rsvpData,
      ageData,
      foodData,
      accommodationData,
      allergiesData,
      familyStatusData,
      attendingFamilies,
      declinedFamilies,
      pendingFamilies,
      totalFamilies: families.length
    };
  }, [families]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ backgroundColor: 'rgba(0,0,0,0.7)', p: 3, borderRadius: 2, mb: 4 }}>
        <StephsActualFavoriteTypography variant="h2" sx={{ mb: 3, textAlign: 'center' }}>
          Wedding Dashboard
        </StephsActualFavoriteTypography>
        
        {/* Stats at the top as pixel art counters */}
        <Grid container spacing={2} justifyContent="center" sx={{ mb: 4 }}>
          <Grid item xs={6} sm={3}>
            <AnimatedCounter 
              value={metrics.totalGuests} 
              label="Total Guests" 
              color="#E9950C" 
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <AnimatedCounter 
              value={metrics.attendingGuests} 
              label="Interested" 
              color="#4CAF50" 
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <AnimatedCounter 
              value={metrics.declinedGuests} 
              label="Declined" 
              color="#F44336" 
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <AnimatedCounter 
              value={metrics.pendingGuests} 
              label="Pending" 
              color="#FFC107" 
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
              letterSpacing: '0.1em'
            }}
          >
            Guest Visualization
          </Typography>
          <PixelGuestGrid 
            totalGuests={metrics.totalGuests} 
            attendingGuests={metrics.attendingGuests}
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
            Each pixel represents one guest (green = attending, red = declined, yellow = pending)
          </Typography>
        </Box>
        
        {/* Tabs for different chart categories */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={activeTab} 
            onChange={(_, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                color: 'white',
                fontFamily: 'monospace',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                '&.Mui-selected': {
                  color: '#E9950C',
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#E9950C',
                height: 3
              }
            }}
          >
            <Tab label="Overview" value="overview" />
            <Tab label="Food" value="food" />
            <Tab label="Accommodation" value="accommodation" />
            <Tab label="RSVP Details" value="rsvp" />
          </Tabs>
        </Box>
        
        {/* Chart content based on active tab */}
        {activeTab === 'overview' && (
          <Grid container spacing={3}>
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
                  RSVP Status
                </Typography>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={metrics.rsvpData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {metrics.rsvpData.map((entry, index) => (
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
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mb: 2, 
                    color: 'white',
                    fontFamily: 'monospace',
                    textAlign: 'center'
                  }}
                >
                  Age Groups
                </Typography>
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
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mb: 2, 
                    color: 'white',
                    fontFamily: 'monospace',
                    textAlign: 'center'
                  }}
                >
                  Dietary Preferences
                </Typography>
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
                  Food Allergies
                </Typography>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={metrics.allergiesData.slice(0, 5)}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
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
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" fill="#F44336" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Grid>
          </Grid>
        )}
        
        {activeTab === 'accommodation' && (
          <Box sx={{ height: 400 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 2, 
                color: 'white',
                fontFamily: 'monospace',
                textAlign: 'center'
              }}
            >
              Sleeping Arrangements
            </Typography>
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
        
        {activeTab === 'rsvp' && (
          <Grid container spacing={3}>
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
                  Family Unit RSVP Status
                </Typography>
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
                  RSVP Completion
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
                  {metrics.totalGuests - (metrics.attendingGuests + metrics.declinedGuests)} guests still need to respond
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
      </Box>
    </Box>
  );
};

export default AdminDashboardCharts;