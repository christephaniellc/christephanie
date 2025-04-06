import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import React, { useEffect } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { Card, CardContent, CardMedia, Grid, Link, ListSubheader } from '@mui/material';
import { useAppLayout } from '@/context/Providers/AppState/useAppLayout';
import { StephsActualFavoriteTypography, themePaletteToRgba } from '@/components/AttendanceButton/AttendanceButton';
import { useTheme } from '@mui/material/styles';

interface AttireProps {
  handleTabLink: (to: string) => void;
}

function Attire({handleTabLink}: AttireProps) {
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

  const travelLink = (
    <Link onClick={() => handleTabLink('travel')}>
      travel page
    </Link>
  );

  const attireItems: {
    [key: string]: {
      subheader: string;
      content: { subheader: string; content?: { subheader: string; content: (string | JSX.Element)[] }[] }[];
    };
  } = {
    titleAttire: {
      subheader: 'Attire Guidelines',
      content: [
        {
          subheader:
            'We want everyone to feel comfortable and enjoy our celebration. Here\'s our guide to help you decide what to wear to our various wedding events.',
        },
      ],
    },
    dressCode: {
      subheader: 'Wedding Day Dress Code',
      content: [
        {
          subheader: 'Semi-Formal / Cocktail Attire',
          content: [
            {
              subheader: 'For Women:',
              content: [
                'Cocktail dresses, dressy separates, or a formal jumpsuit',
                'Tea-length, knee-length, or midi dresses are perfect',
                'Feel free to add some flair with accessories that reflect your personal style',
                'Wedges or block heels recommended for outdoor areas (there will be some grass)'
              ],
            },
            {
              subheader: 'For Men:',
              content: [
                'Suit (tie optional) or dress slacks with button-down shirt and blazer',
                'Dark colors like navy, charcoal, or black are always appropriate, but don\'t be afraid of subtle patterns or colors',
                'Dress shoes (comfortable enough for dancing!)',
                'Optional accessories like pocket squares, cufflinks, or subtle suspenders'
              ],
            },
            {
              subheader: 'For Children:',
              content: [
                'Comfortable formal wear - we understand kids need to move!',
                'For young girls: Simple dresses, nice pants outfit, or whatever makes them comfortable',
                'For young boys: Dress pants with a button-down shirt, or a suit if they enjoy dressing up',
                'Comfortable shoes suitable for running around and playing'
              ],
            }
          ],
        }
      ],
    },
    otherEvents: {
      subheader: 'Other Wedding Events',
      content: [
        {
          subheader: '',
          content: [
            {
              subheader: 'Welcome Dinner (Friday):',
              content: [
                'Casual attire',
                'Jeans or casual pants are fine',
                'The venue is a local brewery, so come comfortable!'
              ],
            },
            {
              subheader: 'Post-Wedding Brunch (Sunday):',
              content: [
                'Casual to smart casual',
                'Sundresses, nice jeans, button-downs all appropriate',
                'Very relaxed atmosphere to recap the festivities'
              ],
            }
          ],
        }
      ],
    },
    considerations: {
      subheader: 'Weather & Venue Considerations',
      content: [
        {
          subheader:
            'Maine in September can have variable weather. Please check our ' + travelLink + ' for the latest weather forecast as the wedding approaches.',
        },
        {
          subheader: '',
          content: [
            {
              subheader: 'Temperature:',
              content: [
                'Daytime temperatures typically range from 65-75°F (18-24°C)',
                'Evening temperatures can drop to 50-60°F (10-15°C)',
                'Consider bringing a light jacket, wrap, or sweater for the evening'
              ],
            },
            {
              subheader: 'Venue:',
              content: [
                'The ceremony will be held outdoors (weather permitting) on a lawn',
                'The reception will be in a renovated barn with smooth floors',
                'Some outdoor areas may have uneven terrain - please choose footwear accordingly',
                'There will be outdoor heaters on the patio area if the evening gets chilly'
              ],
            }
          ],
        }
      ],
    },
    colorPalette: {
      subheader: 'Wedding Color Palette',
      content: [
        {
          subheader:
            'Our wedding colors are sage green, dusty blue, and champagne/gold accents. While there\'s absolutely no need to match our colors, we\'re sharing for those who might be interested!',
        },
      ],
    },
    questions: {
      subheader: 'Questions?',
      content: [
        {
          subheader:
            'If you have any questions about what to wear, please don\'t hesitate to reach out:',
        },
        {
          subheader: 'Email',
          content: [
            {
              subheader: '',
              content: [
                'steph-and-topher@wedding.christephanie.com',
              ],
            },
          ],
        },
      ],
    }
  };
  
  // Examples for attire visuals
  const attireExamples = [
    {
      title: 'Semi-Formal Women',
      image: 'https://images.unsplash.com/photo-1623082574085-157d955c3ddd',
      alt: 'Example of women\'s cocktail attire'
    },
    {
      title: 'Semi-Formal Men',
      image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf',
      alt: 'Example of men\'s semi-formal attire'
    },
    {
      title: 'Outdoor Appropriate',
      image: 'https://images.unsplash.com/photo-1613940619248-850f3def82f4',
      alt: 'Example of appropriate footwear for outdoor venue'
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
  
  // Color swatches for wedding palette
  const colorSwatches = [
    { color: '#8CA788', name: 'Sage Green' },
    { color: '#A6BECE', name: 'Dusty Blue' },
    { color: '#E3D9C6', name: 'Champagne' },
    { color: '#D4AF37', name: 'Gold Accent' },
  ];
  
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
          {attireItems.titleAttire.subheader}
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
          {attireItems.titleAttire.content[0].subheader}
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
        {/* Main content sections */}
        {Object.entries(attireItems)
          .slice(1, 4) // Render the first few sections before the visual examples
          .map(([key, value]) => (
            <Box
              data-testid={`list-item-${key}`}
              key={key}
              sx={{ flexWrap: 'wrap', width: '100%',
                backgroundColor: 'rgba(0,0,0,.1)',
                padding: 0,
                mb: 2, // Add margin between sections
            }}
            >
              <ListSubheader sx={mainHeaderStyle}>
                {value.subheader}
              </ListSubheader>
              <List sx={{ position: 'relative', width: '100%', padding: 0 }}>
                {value.content.map((content, index) => (
                  <Box key={index} sx={{ flexWrap: 'wrap', width: '100%', padding: 0, mt: 1 }}>
                    {content.subheader && !content.content && (
                      <Typography sx={{ padding: '8px 16px' }}>
                        {content.subheader}
                      </Typography>
                    )}
                    {content.content && (
                      <>
                        {content.subheader && (
                          <ListSubheader disableSticky={false} key={index} sx={subHeaderStyle}>
                            {content.subheader}
                          </ListSubheader>
                        )}
                        <List sx={{ position: 'relative', width: '100%', padding: 0 }}>
                          {content.content.map((subContent, index) => (
                            <Box key={index} sx={{ flexWrap: 'wrap', width: '100%', padding: 0, mt: 1 }}>
                              {subContent.subheader && (
                                <ListSubheader sx={subSubHeaderStyle}>
                                  {subContent.subheader}
                                </ListSubheader>
                              )}
                              <List sx={{ width: '100%', padding: '8px 16px' }}>
                                {subContent.content?.map((paragraph, pIndex) => (
                                  <ListItem key={pIndex} sx={{ padding: '4px 0' }}>{paragraph}</ListItem>
                                ))}
                              </List>
                            </Box>
                          ))}
                        </List>
                      </>
                    )}
                  </Box>
                ))}
              </List>
            </Box>
          ))}
        
        {/* Visual Examples Section */}
        <Box
          sx={{ 
            flexWrap: 'wrap', 
            width: '100%',
            backgroundColor: 'rgba(0,0,0,.1)',
            padding: 0,
            mb: 2,
          }}
        >
          <ListSubheader sx={mainHeaderStyle}>
            Attire Examples
          </ListSubheader>
          <Grid container spacing={2} sx={{ padding: '16px' }}>
            {attireExamples.map((example, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card>
                  <CardMedia
                    component="img"
                    height="200"
                    image={example.image}
                    alt={example.alt}
                  />
                  <CardContent>
                    <Typography variant="h6" component="div">
                      {example.title}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
        
        {/* Color Palette Section */}
        <Box
          data-testid={`list-item-colorPalette`}
          sx={{ 
            flexWrap: 'wrap', 
            width: '100%',
            backgroundColor: 'rgba(0,0,0,.1)',
            padding: 0,
            mb: 2,
          }}
        >
          <ListSubheader sx={mainHeaderStyle}>
            {attireItems.colorPalette.subheader}
          </ListSubheader>
          <Typography sx={{ padding: '8px 16px' }}>
            {attireItems.colorPalette.content[0].subheader}
          </Typography>
          <Grid container spacing={2} sx={{ padding: '16px' }}>
            {colorSwatches.map((swatch, index) => (
              <Grid item xs={6} sm={3} key={index}>
                <Box
                  sx={{
                    backgroundColor: swatch.color,
                    height: '80px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      backgroundColor: 'rgba(255,255,255,0.8)',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      margin: '8px',
                      fontWeight: 'bold',
                    }}
                  >
                    {swatch.name}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
        
        {/* Questions Section */}
        <Box
          data-testid={`list-item-questions`}
          sx={{ 
            flexWrap: 'wrap', 
            width: '100%',
            backgroundColor: 'rgba(0,0,0,.1)',
            padding: 0,
            mb: 2,
          }}
        >
          <ListSubheader sx={mainHeaderStyle}>
            {attireItems.questions.subheader}
          </ListSubheader>
          <List sx={{ position: 'relative', width: '100%', padding: 0 }}>
            {attireItems.questions.content.map((content, index) => (
              <Box key={index} sx={{ flexWrap: 'wrap', width: '100%', padding: 0, mt: 1 }}>
                {content.subheader && !content.content && (
                  <Typography sx={{ padding: '8px 16px' }}>
                    {content.subheader}
                  </Typography>
                )}
                {content.content && (
                  <>
                    {content.subheader && (
                      <ListSubheader disableSticky={false} key={index} sx={subHeaderStyle}>
                        {content.subheader}
                      </ListSubheader>
                    )}
                    <List sx={{ position: 'relative', width: '100%', padding: 0 }}>
                      {content.content.map((subContent, index) => (
                        <Box key={index} sx={{ flexWrap: 'wrap', width: '100%', padding: 0, mt: 1 }}>
                          {subContent.subheader && (
                            <ListSubheader sx={subSubHeaderStyle}>
                              {subContent.subheader}
                            </ListSubheader>
                          )}
                          <List sx={{ width: '100%', padding: '8px 16px' }}>
                            {subContent.content?.map((paragraph, pIndex) => (
                              <ListItem key={pIndex} sx={{ padding: '4px 0' }}>{paragraph}</ListItem>
                            ))}
                          </List>
                        </Box>
                      ))}
                    </List>
                  </>
                )}
              </Box>
            ))}
          </List>
        </Box>
      </List>
    </Container>
  );
}

export default Attire;