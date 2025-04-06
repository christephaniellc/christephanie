import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import React, { useEffect } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { Grid, Link, ListSubheader } from '@mui/material';
import { useAppLayout } from '@/context/Providers/AppState/useAppLayout';
import { StephsActualFavoriteTypography, themePaletteToRgba } from '@/components/AttendanceButton/AttendanceButton';
import { useTheme } from '@mui/material/styles';

interface AboutUsProps {
  handleTabLink: (to: string) => void;
}

function AboutUs({handleTabLink}: AboutUsProps) {
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

  const aboutUsItems: {
    [key: string]: {
      subheader: string;
      content: { subheader: string; content?: { subheader: string; content: (string | JSX.Element)[] }[] }[];
    };
  } = {
    titleAboutUs: {
      subheader: 'Steph & Topher',
      content: [
        {
          subheader:
            'Welcome to our wedding website! We\'re so excited to share our special day with you and can\'t wait to celebrate together in September 2025.',
        },
      ],
    },
    howWeMet: {
      subheader: 'How We Met',
      content: [
        {
          subheader:
            'Our love story began in the summer of 2017 at Burning Man. We were introduced by mutual friends at camp and instantly connected over our shared love of adventure, technology, and terrible puns.',
        },
        {
          subheader: '',
          content: [
            {
              subheader: 'First Impressions:',
              content: [
                'Topher: "I was immediately drawn to Steph\'s infectious laugh and brilliant mind. She was building an interactive light installation, and I couldn\'t help but be impressed."',
                'Steph: "I thought Topher was both hilarious and surprisingly practical for someone wearing a shark onesie in the desert. His kind heart and genuine curiosity stood out immediately."'
              ],
            },
            {
              subheader: 'Our Early Days:',
              content: [
                'After returning from the desert, we discovered we both lived in Seattle just a few miles apart.',
                'Our first official date was at a tiny ramen shop in the International District, where we talked for hours until they had to kindly ask us to leave so they could close.',
                'Within a few months, we were practically inseparable, bonding over our love of hiking, coding projects, and exploring Seattle\'s food scene.'
              ],
            }
          ],
        }
      ],
    },
    engagementStory: {
      subheader: 'Our Engagement',
      content: [
        {
          subheader:
            'After five wonderful years together, Topher proposed during a trip to Norway in July 2022. The proposal happened under the midnight sun while hiking in the Lofoten Islands.',
        },
        {
          subheader: '',
          content: [
            {
              subheader: 'The Proposal:',
              content: [
                'Topher had been carrying the ring throughout our week-long hiking trip, waiting for the perfect moment.',
                'At the summit of Reinebringen with a view of the fjords below, he got down on one knee as the midnight sun cast a golden glow across the mountains.',
                'Steph was completely surprised and (after a moment of shock) said yes! We celebrated with the small group of hikers who had gathered for the midnight sun, complete with a bottle of champagne that Topher had somehow managed to carry up the mountain without Steph noticing.'
              ],
            }
          ],
        }
      ],
    },
    funFacts: {
      subheader: 'Fun Facts About Us',
      content: [
        {
          subheader: '',
          content: [
            {
              subheader: 'Travels Together:',
              content: [
                'We\'ve visited 14 countries together, including Thailand, Mexico, Germany, and Canada.',
                'Our longest road trip was 3,500 miles through the American Southwest.',
                'We\'ve attended Burning Man together three times.'
              ],
            },
            {
              subheader: 'At Home:',
              content: [
                'We love hosting dinner parties and game nights with friends.',
                'We\'ve built several home automation projects together, including an overly complicated system just to feed our cats.',
                'We maintain a small urban garden and are unreasonably proud of our homegrown tomatoes.'
              ],
            },
            {
              subheader: 'Little Known Facts:',
              content: [
                'Topher can solve a Rubik\'s cube in under a minute.',
                'Steph speaks conversational Thai and is learning German.',
                'We have a growing collection of board games that has now taken over an entire closet.'
              ],
            }
          ],
        }
      ],
    },
    photos: {
      subheader: 'Photo Gallery',
      content: [
        {
          subheader: 'Some of our favorite moments together',
        }
      ],
    },
    contactUs: {
      subheader: 'Contact Us',
      content: [
        {
          subheader:
            'Have questions about the wedding? Feel free to reach out to us!',
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

  const photoGalleryImages = [
    '/src/assets/engagement-photos/topher_and_steph_rsvp1.jpg',
    '/src/assets/engagement-photos/bremerhaven.jpg',
    '/src/assets/engagement-photos/burn_night.jpg',
    '/src/assets/engagement-photos/hammock.jpg',
    '/src/assets/engagement-photos/oktoberfest.jpg',
    '/src/assets/engagement-photos/roadtrip.jpg',
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
          {aboutUsItems.titleAboutUs.subheader}
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
          {aboutUsItems.titleAboutUs.content[0].subheader}
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
        {Object.entries(aboutUsItems)
          .slice(1)
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
                    {key === 'photos' && (
                      <Grid container spacing={2} sx={{ padding: '16px' }}>
                        {photoGalleryImages.map((image, index) => (
                          <Grid item xs={12} sm={6} md={4} key={index}>
                            <Box 
                              component="img" 
                              src={image}
                              alt={`Steph and Topher photo ${index + 1}`}
                              sx={{
                                width: '100%',
                                height: '200px',
                                objectFit: 'cover',
                                borderRadius: '8px',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                                transition: 'transform 0.3s ease',
                                '&:hover': {
                                  transform: 'scale(1.05)',
                                },
                              }}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    )}
                  </Box>
                ))}
              </List>
            </Box>
          ))}
      </List>
    </Container>
  );
}

export default AboutUs;