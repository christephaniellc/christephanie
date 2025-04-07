import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import React, { useEffect } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { 
  Card, 
  CardContent, 
  CardMedia, 
  Chip, 
  Grid, 
  Link, 
  ListSubheader,
  Rating, 
  Stack
} from '@mui/material';
import { useAppLayout } from '@/context/Providers/AppState/useAppLayout';
import { StephsActualFavoriteTypography, themePaletteToRgba } from '@/components/AttendanceButton/AttendanceButton';
import { useTheme } from '@mui/material/styles';
import PlaceIcon from '@mui/icons-material/Place';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import FavoriteIcon from '@mui/icons-material/Favorite';

interface ThingsToDoProps {
  handleTabLink: (to: string) => void;
}

function ThingsToDo({handleTabLink}: ThingsToDoProps) {
  const { contentHeight } = useAppLayout();
  const theme = useTheme();
  
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    // Example of an async operation that respects the AbortController
    const fetchData = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
        if (!signal.aborted) {
          // Data fetched successfully
        }
      } catch (error) {
        if (signal.aborted) {
          console.log('Fetch aborted due to navigation.');
        }
      }
    };

    fetchData();

    return () => {
      controller.abort();
    };
  }, []);

  const thingsToDoItems: {
    [key: string]: {
      subheader: string;
      content: { subheader: string; content?: { subheader: string; content: (string | JSX.Element)[] }[] }[];
    };
  } = {
    titleThingsToDo: {
      subheader: 'Things To Do',
      content: [
        {
          subheader:
            'Making the trip to Maine for our wedding? There\'s plenty to see and do in the area! Here are some of our favorite spots and recommendations for activities during your stay.',
        },
      ],
    },
    attractions: {
      subheader: 'Local Attractions',
      content: [
        {
          subheader:
            'The Brunswick area is known for its stunning coastal scenery, outdoor activities, and charming downtown. Here are some must-visit spots:',
        },
      ],
    },
    dining: {
      subheader: 'Where to Eat',
      content: [
        {
          subheader:
            'Maine is famous for its incredible seafood and farm-to-table cuisine. Here are some of our favorite places to eat in the area:',
        },
      ],
    },
    dayTrips: {
      subheader: 'Day Trips',
      content: [
        {
          subheader:
            'If you\'re extending your stay or have some extra time, consider these day trip options:',
        },
      ],
    },
    couplesFavorites: {
      subheader: 'Our Favorites',
      content: [
        {
          subheader:
            'These are some of Steph and Topher\'s personal favorite spots and activities in the area:',
        },
      ],
    }
  };
  
  // Local attractions data
  const attractions = [
    {
      name: 'Brunswick Downtown',
      image: 'https://images.unsplash.com/photo-1543746379-5173480168cc',
      description: 'Historic Maine Street with shops, galleries, and restaurants. Don\'t miss the Brunswick Farmers\' Market on Tuesdays and Fridays.',
      distance: '0.5 miles from hotels',
      time: '2-3 hours',
      cost: 'Free',
      category: 'Shopping & Culture',
      favorite: true
    },
    {
      name: 'Bowdoin College Museum of Art',
      image: 'https://images.unsplash.com/photo-1544805522-a957be943f9e',
      description: 'World-class art collection featuring works from ancient civilizations to contemporary pieces. Free admission.',
      distance: '1 mile from hotels',
      time: '1-2 hours',
      cost: 'Free',
      category: 'Culture'
    },
    {
      name: 'Popham Beach State Park',
      image: 'https://images.unsplash.com/photo-1517627043994-d54cc14d7569',
      description: 'One of Maine\'s most beautiful sandy beaches with stunning views, tide pools, and hiking trails.',
      distance: '14 miles from Brunswick',
      time: 'Half-day',
      cost: '$8 per vehicle',
      category: 'Outdoors',
      favorite: true
    },
    {
      name: 'Androscoggin Bicycle Path',
      image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b',
      description: '2.6-mile riverside path perfect for walking, jogging, or biking. Scenic views of the river and wildlife.',
      distance: '2 miles from hotels',
      time: '1-2 hours',
      cost: 'Free',
      category: 'Outdoors'
    },
    {
      name: 'Maine Maritime Museum',
      image: 'https://images.unsplash.com/photo-1519074025331-a8a2f11097a0',
      description: 'Interactive museum celebrating Maine\'s maritime heritage with exhibits on shipbuilding and lobstering.',
      distance: '8 miles from Brunswick',
      time: '2-3 hours',
      cost: '$17.50 adult admission',
      category: 'Culture'
    },
    {
      name: 'L.L. Bean Flagship Store',
      image: 'https://images.unsplash.com/photo-1565214975484-3cfa9e56f914',
      description: 'Iconic outdoor retailer\'s massive flagship store in Freeport. Open 24 hours a day, 365 days a year.',
      distance: '15 miles from Brunswick',
      time: '1-3 hours',
      cost: 'Free (unless you shop!)',
      category: 'Shopping',
      favorite: true
    }
  ];
  
  // Restaurant recommendations
  const restaurants = [
    {
      name: 'Tao Yuan',
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
      description: 'Award-winning Asian fusion cuisine by James Beard-nominated chef Cara Stadler. Innovative small plates using local ingredients.',
      price: '$$$',
      category: 'Fine Dining',
      favorite: true
    },
    {
      name: 'Wild Oats Bakery & Cafe',
      image: 'https://images.unsplash.com/photo-1534331042788-26735289d827',
      description: 'Beloved local cafe serving fresh-baked goods, sandwiches, soups, and salads. Perfect for breakfast or lunch.',
      price: '$',
      category: 'Casual',
      favorite: true
    },
    {
      name: 'Frontier',
      image: 'https://images.unsplash.com/photo-1530662532971-e1af3ee48bbf',
      description: 'Global cuisine in a renovated mill space overlooking the Androscoggin River. Also features a gallery space and cinema.',
      price: '$$',
      category: 'Casual Fine Dining'
    },
    {
      name: 'Five Islands Lobster Co.',
      image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2',
      description: 'No-frills dockside lobster shack serving the freshest seafood. Stunning harbor views. Cash only!',
      price: '$$',
      category: 'Seafood',
      favorite: true
    }
  ];
  
  // Day trips
  const dayTrips = [
    {
      name: 'Portland',
      image: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89',
      description: 'Maine\'s largest city known for its historic Old Port district, world-class restaurants, and vibrant arts scene.',
      distance: '30 miles from Brunswick',
      time: 'Full day',
      highlights: 'Portland Head Light, Old Port shopping, breweries, Portland Museum of Art'
    },
    {
      name: 'Acadia National Park',
      image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f',
      description: 'Maine\'s crown jewel with breathtaking coastal scenery, hiking trails, and carriage roads.',
      distance: '180 miles from Brunswick',
      time: 'Overnight trip recommended',
      highlights: 'Cadillac Mountain, Jordan Pond, Park Loop Road, Bar Harbor'
    },
    {
      name: 'Boothbay Harbor',
      image: 'https://images.unsplash.com/photo-1520942702018-0862200e6873',
      description: 'Charming coastal town with boat tours, shops, and the renowned Coastal Maine Botanical Gardens.',
      distance: '35 miles from Brunswick',
      time: 'Half to full day',
      highlights: 'Harbor cruises, Botanical Gardens, downtown shopping'
    }
  ];
  
  // Get the semi-transparent background color like in AttendanceButton
  const semiTransparentBackgroundColor = themePaletteToRgba(theme.palette.primary.main, 0.1);
  
  // Common styles for all headers to mimic the "Interested" box styling
  const commonHeaderStyle = {
    width: '100%',
    maxWidth: '100%',
    position: 'sticky' as const,
    backdropFilter: 'blur(16px)',
    border: `2px solid ${semiTransparentBackgroundColor}`,
    backgroundColor: semiTransparentBackgroundColor,
    color: theme.palette.primary.contrastText,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
    left: 0,
    right: 0,
    top: 0, // Ensure headers stick to top
  };
  
  // Styles for subheaders with different z-index values - lower level headers have higher z-index
  const mainHeaderStyle = {
    ...commonHeaderStyle,
    zIndex: 10,
  };
  
  const subHeaderStyle = {
    ...commonHeaderStyle,
    zIndex: 11,
  };
  
  const subSubHeaderStyle = {
    ...commonHeaderStyle,
    zIndex: 12,
  };
  
  // Function to render dollar signs based on price
  const renderPrice = (price: string) => {
    switch(price) {
      case '$':
        return <Box><AttachMoneyIcon fontSize="small" /></Box>;
      case '$$':
        return <Box><AttachMoneyIcon fontSize="small" /><AttachMoneyIcon fontSize="small" /></Box>;
      case '$$$':
        return <Box><AttachMoneyIcon fontSize="small" /><AttachMoneyIcon fontSize="small" /><AttachMoneyIcon fontSize="small" /></Box>;
      default:
        return <Box><AttachMoneyIcon fontSize="small" /></Box>;
    }
  };
  
  return (
    <Container
      sx={{
        width: '100%',
        height: contentHeight,
        overflow: 'hidden',
        borderRadius: 'sm',
        display: 'flex',
        flexWrap: 'wrap',
        position: 'relative',
        paddingBottom: '80px', // Added padding to ensure content doesn't get hidden behind BottomNav
      }}
    >
      <Box my={2} sx={{ 
        backdropFilter: 'blur(16px)',
        width: '100%',
        px: 2,
        mt: 2,
        pb: 2,
        zIndex: 5, // Lower z-index than headers
      }}>
        <StephsActualFavoriteTypography variant="h4" sx={{ textAlign: 'center',
            mt: 2,
            fontSize: '2rem'}}>
          {thingsToDoItems.titleThingsToDo.subheader}
        </StephsActualFavoriteTypography>
        
        <Box
          sx={{
            width: '100%',
            height: '120px',
            overflow: 'hidden',
            position: 'relative',
            '@keyframes rollLogo': {
              '0%, 10%': { left: 0, transform: 'rotate(0deg)' },
              '30%': { left: 'calc(100% - 120px)', transform: 'rotate(360deg)' },
              '50%, 60%': { left: 0, transform: 'rotate(0deg)' },
              '80%': { left: 'calc(100% - 120px)', transform: 'rotate(-360deg)' },
              '100%': { left: 0, transform: 'rotate(0deg)' }
            },
            '& img': {
              position: 'absolute',
              height: '120px',
              width: '120px',
              animation: 'rollLogo 8s infinite',
            }
          }}
        >
          <img 
            src="/favicon_big_art_transparent.png" 
            alt="Wedding Logo" 
          />
        </Box>

        <Typography variant="body1" 
          sx={{ mt: 2, fontSize: '0.9rem' }}>
          {thingsToDoItems.titleThingsToDo.content[0].subheader}
        </Typography>
      </Box>
      <List sx={{ 
        overflow: 'auto', 
        pt: 0,
        my: 2, 
        height: 'calc(100% - 300px)', 
        backgroundColor: 'rgba(0,0,0,.1)', 
        width: '100%',
        pb: 16, // Increased padding at bottom to avoid content being cut off behind BottomNav
        position: 'relative',
        zIndex: 1, // Lower z-index than headers
      }}>
        {/* Local Attractions Section */}
        <Box
          data-testid="list-item-attractions"
          sx={{ 
            flexWrap: 'wrap', 
            width: '100%',
            backgroundColor: 'rgba(0,0,0,.1)',
            padding: 0,
            mb: 2,
          }}
        >
          <ListSubheader sx={mainHeaderStyle}>
            {thingsToDoItems.attractions.subheader}
          </ListSubheader>
          <Typography sx={{ padding: '16px 16px 0' }}>
            {thingsToDoItems.attractions.content[0].subheader}
          </Typography>
          
          <Grid container spacing={2} sx={{ padding: '16px' }}>
            {attractions.map((attraction, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardMedia
                    component="img"
                    height="160"
                    image={attraction.image}
                    alt={attraction.name}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography gutterBottom variant="h6" component="div">
                        {attraction.name}
                      </Typography>
                      {attraction.favorite && (
                        <FavoriteIcon color="secondary" fontSize="small" titleAccess="Couple's Favorite" />
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {attraction.description}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <PlaceIcon fontSize="small" color="primary" />
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        {attraction.distance}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <AccessTimeIcon fontSize="small" color="primary" />
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        {attraction.time}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <AttachMoneyIcon fontSize="small" color="primary" />
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        {attraction.cost}
                      </Typography>
                    </Box>
                    <Chip 
                      label={attraction.category} 
                      size="small" 
                      color="primary" 
                      variant="outlined" 
                      sx={{ mt: 1 }} 
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
        
        {/* Dining Section */}
        <Box
          data-testid="list-item-dining"
          sx={{ 
            flexWrap: 'wrap', 
            width: '100%',
            backgroundColor: 'rgba(0,0,0,.1)',
            padding: 0,
            mb: 2,
          }}
        >
          <ListSubheader sx={mainHeaderStyle}>
            {thingsToDoItems.dining.subheader}
          </ListSubheader>
          <Typography sx={{ padding: '16px 16px 0' }}>
            {thingsToDoItems.dining.content[0].subheader}
          </Typography>
          
          <Grid container spacing={2} sx={{ padding: '16px' }}>
            {restaurants.map((restaurant, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardMedia
                    component="img"
                    height="140"
                    image={restaurant.image}
                    alt={restaurant.name}
                  />
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography gutterBottom variant="h6" component="div">
                        {restaurant.name}
                      </Typography>
                      {restaurant.favorite && (
                        <FavoriteIcon color="secondary" fontSize="small" titleAccess="Couple's Favorite" />
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {restaurant.description}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {renderPrice(restaurant.price)}
                      <Chip 
                        label={restaurant.category} 
                        size="small" 
                        color="primary" 
                        variant="outlined" 
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
        
        {/* Day Trips Section */}
        <Box
          data-testid="list-item-dayTrips"
          sx={{ 
            flexWrap: 'wrap', 
            width: '100%',
            backgroundColor: 'rgba(0,0,0,.1)',
            padding: 0,
            mb: 2,
          }}
        >
          <ListSubheader sx={mainHeaderStyle}>
            {thingsToDoItems.dayTrips.subheader}
          </ListSubheader>
          <Typography sx={{ padding: '16px 16px 0' }}>
            {thingsToDoItems.dayTrips.content[0].subheader}
          </Typography>
          
          <Grid container spacing={2} sx={{ padding: '16px' }}>
            {dayTrips.map((trip, index) => (
              <Grid item xs={12} key={index}>
                <Card sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
                  <CardMedia
                    component="img"
                    sx={{ 
                      width: { xs: '100%', md: 200 },
                      height: { xs: 200, md: 'auto' }
                    }}
                    image={trip.image}
                    alt={trip.name}
                  />
                  <CardContent sx={{ flex: '1 0 auto' }}>
                    <Typography component="div" variant="h5">
                      {trip.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {trip.description}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <PlaceIcon fontSize="small" color="primary" />
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        {trip.distance}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <AccessTimeIcon fontSize="small" color="primary" />
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        {trip.time}
                      </Typography>
                    </Box>
                    <Typography variant="subtitle2" sx={{ mt: 1 }}>
                      Highlights:
                    </Typography>
                    <Typography variant="body2">
                      {trip.highlights}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
        
        {/* Couple's Favorites Section */}
        <Box
          data-testid="list-item-couplesFavorites"
          sx={{ 
            flexWrap: 'wrap', 
            width: '100%',
            backgroundColor: 'rgba(0,0,0,.1)',
            padding: 0,
            mb: 2,
          }}
        >
          <ListSubheader sx={mainHeaderStyle}>
            {thingsToDoItems.couplesFavorites.subheader}
          </ListSubheader>
          <Typography sx={{ padding: '16px' }}>
            {thingsToDoItems.couplesFavorites.content[0].subheader}
          </Typography>
          
          <Grid container spacing={2} sx={{ padding: '0 16px 16px' }}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Steph's Perfect Day in Maine
                  </Typography>
                  <Typography variant="body2" paragraph>
                    "Start with breakfast at Wild Oats Bakery, then spend the morning exploring the shops on Maine Street. 
                    Head to Popham Beach for the afternoon and bring a picnic lunch. End the day with dinner at Five Islands 
                    Lobster Co. and watch the sunset over the harbor."
                  </Typography>
                  
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Topher's Must-Do Activities
                  </Typography>
                  <Typography variant="body2" paragraph>
                    "Rent bikes and ride the Androscoggin Bicycle Path in the morning. Grab lunch at Frontier, 
                    then head to Boothbay Harbor for the afternoon. Make sure to stop at L.L. Bean in Freeport 
                    on your way back—it's open 24/7 and always an adventure!"
                  </Typography>
                  
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Our Rainy Day Recommendation
                  </Typography>
                  <Typography variant="body2">
                    "Visit the Bowdoin College Museum of Art, followed by browsing at Gulf of Maine Books. 
                    Warm up with coffee at Little Dog Coffee Shop, then head to Eveningstar Cinema for an indie film. 
                    Finish with dinner at Tao Yuan—make reservations in advance!"
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </List>
    </Container>
  );
}

export default ThingsToDo;