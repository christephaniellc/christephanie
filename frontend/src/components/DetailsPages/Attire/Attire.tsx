import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import React from 'react';
import { Button, Link } from '@mui/material';
import { 
  Card, 
  CardContent, 
  Paper, 
  Divider, 
  Tabs, 
  Tab, 
  Stack 
} from '@mui/material';
import { useAppLayout } from '@/context/Providers/AppState/useAppLayout';
import { StephsActualFavoriteTypography, StephsActualFavoriteTypographyNoDrop } from '@/components/AttendanceButton/AttendanceButton';
import { useTheme } from '@mui/material/styles';
import { 
  Checkroom, 
  WbSunny, 
  Celebration, 
  Help,
  OpenInNew
} from '@mui/icons-material';
import burnNightImage from '@/assets/engagement-photos/burn_night.jpg';

interface AttireProps {
  handleTabLink: (to: string) => void;
}

// Interface for TabPanel props
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// TabPanel component for displaying tab content
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`attire-tabpanel-${index}`}
      aria-labelledby={`attire-tab-${index}`}
      {...other}
      style={{ width: '100%' }}
    >
      {value === index && (
        <Box sx={{ width: '100%', pt: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Helper function for tab accessibility props
function a11yProps(index: number) {
  return {
    id: `attire-tab-${index}`,
    'aria-controls': `attire-tabpanel-${index}`,
  };
}

function Attire({handleTabLink}: AttireProps) {
  const { contentHeight } = useAppLayout();
  const theme = useTheme();
  const [tabIndex, setTabIndex] = React.useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };
  
  return (
    <Container
      sx={{
        width: '100%',
        height: contentHeight * 0.9,
        overflow: 'auto',
        borderRadius: 'sm',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        paddingBottom: '80px', // Added padding to ensure content doesn't get hidden behind BottomNav
        backgroundImage: `url(${burnNightImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(2px)',
          zIndex: 0
        },
      }}
    >
      <Box my={2} sx={{ 
        width: '100%',
        px: 2,
        mt: 2,
        pb: 2,
        position: 'relative',
        zIndex: 1,
      }}>
        <StephsActualFavoriteTypography variant="h4" sx={{ 
          textAlign: 'center',
          mt: 2,
          fontSize: { xs: '1.8rem', sm: '2rem', md: '2.2rem' },
        }}>
          Dress Code: Be Yourself
        </StephsActualFavoriteTypography>
        
        {/* Circular logo with animation */}
        <Box
          sx={{
            width: '100%',
            height: '120px',
            overflow: 'hidden',
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            '@keyframes pulse': {
              '0%': { transform: 'scale(1)' },
              '50%': { transform: 'scale(1.1)' },
              '100%': { transform: 'scale(1)' }
            },
            '& img': {
              height: '120px',
              width: '120px',
              animation: 'pulse 3s infinite ease-in-out',
            }
          }}
        >
          <img 
            src="/favicon_big_art_transparent.png" 
            alt="Wedding Logo" 
          />
        </Box>
      </Box>
      
      {/* Tabbed content section */}
      <Box sx={{ 
        width: '100%', 
        px: { xs: 0, md: 2 }, // Remove padding on small and medium screens
        position: 'relative',
        zIndex: 1
      }}>
        <Paper
          elevation={5}
          sx={{
            backdropFilter: 'blur(20px)',
            backgroundColor: 'rgba(0,0,0,.2)',
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            overflow: 'hidden',
            borderRadius: { xs: 0, md: 2 }, // Remove border radius on small and medium screens
          }}
        >
          {/* Tabs navigation */}
          <Box sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            backgroundColor: 'rgba(0,0,0,.3)',
          }}>
            <Tabs
              value={tabIndex}
              onChange={handleTabChange}
              variant="fullWidth"
              textColor="secondary"
              indicatorColor="secondary"
              aria-label="Attire information tabs"
            >
              <Tab 
                icon={<Checkroom />} 
                label="Dress Code" 
                {...a11yProps(0)} 
                sx={{ 
                  fontWeight: 'bold',
                  '&.Mui-selected': {
                    color: theme.palette.secondary.main,
                  }
                }}
              />
              <Tab 
                icon={<Celebration />} 
                label="What We're Wearing" 
                {...a11yProps(1)}
                sx={{ 
                  fontWeight: 'bold',
                  '&.Mui-selected': {
                    color: theme.palette.secondary.main,
                  }
                }}
              />
              <Tab 
                icon={<WbSunny />} 
                label="Weather Tips" 
                {...a11yProps(2)}
                sx={{ 
                  fontWeight: 'bold', 
                  '&.Mui-selected': {
                    color: theme.palette.secondary.main,
                  }
                }}
              />
            </Tabs>
          </Box>

          {/* Tab content */}
          <Box sx={{ p: { xs: 1, md: 2 } }}>
            {/* Dress Code Tab */}
            <TabPanel value={tabIndex} index={0}>
              <Stack spacing={2}>
                <Card sx={{ backgroundColor: 'rgba(0,0,0,0.1)' }}>
                  <CardContent>
                    <StephsActualFavoriteTypographyNoDrop                     
                      sx={{
                        fontSize: '1.5rem'
                      }}
                      gutterBottom>
                      Burning Man-Style Wedding: Express Yourself
                    </StephsActualFavoriteTypographyNoDrop>
                    <Typography variant="body1" paragraph>
                      This is a burning man-style wedding where self-expression is celebrated! We want you to come dressed in whatever makes you feel most like yourself and most comfortable.
                    </Typography>
                    <Typography variant="body1" paragraph>
                      Love jeans and a t-shirt? Wear them! Prefer a sundress? Perfect! Want to rock a suit? Go for it! Flippy floppies? Absolutely! The only rule is that there are no rules — just be you.
                    </Typography>
                  </CardContent>
                </Card>

                <Card sx={{ backgroundColor: 'rgba(0,0,0,0.1)' }}>
                  <CardContent>
                    <StephsActualFavoriteTypographyNoDrop                     
                      sx={{
                        fontSize: '1.5rem'
                      }}
                      gutterBottom>
                      General Guidelines
                    </StephsActualFavoriteTypographyNoDrop>
                    <Typography variant="body1" paragraph>
                      While there's no strict dress code, here are some general ideas for those who want guidance:
                    </Typography>
                    <Typography component="div" variant="body1">
                      <ul>
                        <li>From formal to semi-formal to casual attire: are all perfectly fine</li>
                        <li>Bright colors and creative outfits are welcome!</li>    
                        <li><Button
                            variant="outlined"
                            color="secondary"
                            size="small"
                            endIcon={<OpenInNew />}
                            onClick={() => window.open(`https://www.pinterest.com/hosts0408/burning-man-attire/`)}
                            sx={{ mt: 1, alignSelf: 'flex-start' }}
                            data-testid="search-google-button"
                          >Burning man costume ideas</Button>
                          <ul>
                            <li>Linens / leathers</li>
                            <li>Sarongs / kilts</li>
                            <li>Bohemian / futuristic / punk</li>
                            <li><span style={{fontSize: '0.8rem'}}><b>Note:</b> try to avoid feathers/sequins/costume items that shed an become litter</span></li>
                          </ul>
                        </li>
                        <li>Comfortable shoes recommended (there will be dancing!)</li>
                        <li>Consider bringing a light layer for the evening</li>
                      </ul>
                    </Typography>
                  </CardContent>
                </Card>
              </Stack>
            </TabPanel>

            {/* What We're Wearing Tab */}
            <TabPanel value={tabIndex} index={1}>
              <Stack spacing={2}>
                <Card sx={{ backgroundColor: 'rgba(0,0,0,0.1)' }}>
                  <CardContent>
                    <StephsActualFavoriteTypographyNoDrop                    
                      sx={{
                        fontSize: '1.5rem'
                      }}
                      gutterBottom>
                      What Topher & Steph Are Wearing
                    </StephsActualFavoriteTypographyNoDrop>
                    <Typography variant="body1" paragraph>
                      We'll start the day in traditional wedding attire for the ceremony and dinner, but we'll be changing into more comfortable clothes for the party afterward.
                    </Typography>
                    <Typography variant="body1" paragraph>
                      Feel free to bring a change of clothes too if you want to switch into something more dance-floor friendly as the night goes on!
                    </Typography>
                  </CardContent>
                </Card>

                <Card sx={{ backgroundColor: 'rgba(0,0,0,0.1)' }}>
                  <CardContent>
                    <StephsActualFavoriteTypographyNoDrop                     
                      sx={{
                        fontSize: '1.5rem'
                      }}
                      gutterBottom>
                      Ceremony & Dinner
                    </StephsActualFavoriteTypographyNoDrop>
                    <Typography variant="body1" paragraph>
                      For the ceremony and dinner, we'll be in traditional wedding attire:
                    </Typography>
                    <Typography component="div" variant="body1" paragraph>
                      <ul>
                        <li>Topher: Classic suit with personal touches</li>
                        <li>Steph: Traditional white wedding dress</li>
                      </ul>
                    </Typography>
                    
                    <StephsActualFavoriteTypographyNoDrop 
                      sx={{
                        fontSize: '1.5rem'
                      }}
                      gutterBottom>
                      Reception & Party
                    </StephsActualFavoriteTypographyNoDrop>
                    <Typography variant="body1" paragraph>
                      For the reception and party, we'll change into:
                    </Typography>
                    <Typography component="div" variant="body1">
                      <ul>
                        <li>Comfortable, fun, and lightweight outfits. It will be hot! </li>
                        <li><Button
                            variant="outlined"
                            color="secondary"
                            size="small"
                            endIcon={<OpenInNew />}
                            onClick={() => window.open(`https://www.pinterest.com/hosts0408/burning-man-attire/`)}
                            sx={{ mt: 1, alignSelf: 'flex-start' }}
                            data-testid="search-google-button"
                          >Burning man costume ideas</Button>
                          <ul>
                            <li>Linens / leathers</li>
                            <li>Sarongs / kilts</li>
                            <li>Bohemian / futuristic / punk</li>
                            <li><span style={{fontSize: '0.8rem'}}><b>Note:</b> try to avoid feathers/sequins/costume items that shed an become litter</span></li>
                          </ul>
                        </li>
                        <li>Shoes we can dance in all night</li>
                      </ul>
                    </Typography>
                  </CardContent>
                </Card>
              </Stack>
            </TabPanel>

            {/* Weather Tips Tab */}
            <TabPanel value={tabIndex} index={2}>
              <Stack spacing={2}>
                <Card sx={{ backgroundColor: 'rgba(0,0,0,0.1)' }}>
                  <CardContent>
                    <StephsActualFavoriteTypographyNoDrop 
                      sx={{
                        fontSize: '1.5rem'
                      }}
                      gutterBottom>
                      Weather Considerations
                    </StephsActualFavoriteTypographyNoDrop>
                    <Typography variant="body1" paragraph>
                      Virginia in July can be quite hot and humid. The ceremony will be outdoors (weather permitting), and while indoor spaces will be air-conditioned, outdoor areas may be warm.
                    </Typography>
                    <Typography variant="body1" paragraph>
                      <strong>Temperature:</strong> Expect daytime highs of 85-95°F (29-35°C) and evening temperatures around 70-80°F (21-27°C).
                    </Typography>
                  </CardContent>
                </Card>

                <Card sx={{ backgroundColor: 'rgba(0,0,0,0.1)' }}>
                  <CardContent>
                    <StephsActualFavoriteTypographyNoDrop 
                      sx={{
                        fontSize: '1.5rem'
                      }}
                    gutterBottom>
                      Helpful Tips
                    </StephsActualFavoriteTypographyNoDrop>
                    <Typography component="div" variant="body1">
                      <ul>
                        <li>Light, breathable fabrics are recommended</li>
                        <li>Some outdoor areas may have uneven terrain - consider appropriate footwear: 
                          flats or chunky heels recommended</li>
                        <ul>
                          <li>(Steph loves heels, but will be wearing boots!)</li>
                        </ul>
                        <li>You might want to bring a hat or sunglasses</li>
                        <li>Sunscreen is always a good idea!</li>
                        <li>A small personal fan might be handy</li>
                        <li>Bringing a light jacket or wrap for air-conditioned indoor spaces</li>
                      </ul>
                    </Typography>
                  </CardContent>
                </Card>
              </Stack>
            </TabPanel>
          </Box>
        </Paper>
      </Box>

      {/* Contact Information Section */}
      <Box mt={4} mb={8} px={{ xs: 0, md: 2 }}>
        <Paper
          elevation={5}
          sx={{
            backdropFilter: 'blur(20px)',
            backgroundColor: 'rgba(0,0,0,.1)',
            p: { xs: 2, md: 3 },
            borderRadius: { xs: 0, md: 2 },
            textAlign: 'center',
          }}
        >
          <Typography variant="h6" 
            sx={{
              fontSize: { xs: '1.0rem', sm: '1.2rem' },
              wordBreak: 'break-word'
            }}
            gutterBottom>
            If you have any questions about attire, please contact us at:<br />
            <Box component="span"
              sx={{
                color: theme.palette.secondary.main
              }}
            >
              <strong>hosts@wedding.christephanie.com</strong>
            </Box>
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}

export default Attire;