import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useEffect } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { ListSubheader } from '@mui/material';
import { useAppLayout } from '@/context/Providers/AppState/useAppLayout';
import { StephsActualFavoriteTypography, themePaletteToRgba } from '@/components/AttendanceButton/AttendanceButton';
import { rem } from 'polished';
import { useTheme } from '@mui/material/styles';

function AboutUs() {
  const { contentHeight } = useAppLayout();
  const theme = useTheme();
  
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    //console.log('AboutUs mounted.');

    // Example of an async operation that respects the AbortController
    const fetchData = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
        if (!signal.aborted) {
          //console.log('Data fetched successfully.');
        }
      } catch (error) {
        if (signal.aborted) {
          console.log('Fetch aborted due to navigation.');
        }
      }
    };

    fetchData();

    return () => {
      //console.log('AboutUs unmounted. Aborting any pending tasks.');
      controller.abort();
    };
  }, []);

  const aboutUsItems: {
    [key: string]: {
      subheader: string;
      content: { subheader: string; content?: { subheader: string; content: string[] }[] }[];
    };
  } = {
    titleAboutUs: {
      subheader: 'About Us',
      content: [
        {
          subheader:
            'Welcome to Christephanie LLC – a registered and fully compliant business based in Seattle, WA. We are two independent software developers (and a soon-to-be-married couple) who created this secure, invitation-only wedding RSVP platform to manage guest invitations and event details.'//,
            //`We are two independent software developers (getting married!) who created this secure, invitation-only website to manage our wedding invitations and guest preferences. Welcome to our custom wedding RSVP platform!`,
        },
      ],
    },
    businessOverview: {
      subheader: 'Business Overview',
      content: [
        {
          subheader:
            'Christephanie LLC is a legally registered company in the State of Washington. We specialize in developing a customizable online RSVP and event management platform designed for modern couples. Our service not only manages wedding invitations but also provides a secure environment where guests can update their attendance, meal choices, and other event preferences. As we expand our service, our platform will be available for future couples to create their own bespoke wedding websites.',
        },
      ],
    },
    whatInformationWeCollect: {
      subheader: 'What We Do',
      content: [
        {
          subheader:
          'Like what you see? For a small monthly fee, we provide an innovative online platform service tailored for couples looking to add a personal touch to their wedding planning. Our solution is designed to securely manage wedding invitations, RSVP responses, and real-time event updates.',
        },
        {
          subheader: '',
          content: [
            {
              subheader: 'Custom RSVP Experience:',

              content: [
                'Invited guests enter a unique invitation code along with their first name to securely access event details and RSVP.',
                'Our modern and customized design provides a unique user experience for those engaged couples looking to add a little flair to their online RSVP experience.',
                'Guests can add your own details, pithy comments, and easter eggs to create a memorable experience.'              
              ],
            },
            {
              subheader: 'Secure and Private:',
              content: [
                'Access to the site is strictly by invitation, ensuring wedding and guest information remains private.',
                'Guests create a secure Auth0 login account after their invitation code and first name are validated, allowing for easy future access.',
                'Features include confirming attendance, submitting food preferences and allergies, accommodation choices, and providing registry information for contributions.',
                'For further details, please review our [Privacy Policy](https://www.dev.wedding.christephanie.com/privacy-policy) and [Terms of Service](https://www.dev.wedding.christephanie.com/terms-of-service).',
              ],
            },
            {
              subheader: 'Real-Time Updates:',
              content: [
                'We send important, non-marketing event reminders and event updates via email or SMS to our guests.',
                'Recipients must opt-in and validate their contact information before receiving notifications.',
                'Our platform is built to support scalable notifications as we extend our service to more couples.',
              ],
            },
          ],
        },
      ],
    },
    howWeUseYourInformation: {
      subheader: 'Contact Us',
      content: [
        {
          subheader:
            'For any questions or additional details, please reach out to us. We appreciate your interest and look forward to celebrating with you!',
        },
        {
          subheader: 'Email',
          content: [
            {
              subheader: '',
              content: [
                'hosts@dev.wedding.christephanie.com',
              ],
            },
          ],
        },
        {
          subheader: 'Phone',
          content: [
            {
              subheader: '',
              content: [
                '+1-202-780-9244',
              ],
            },
          ],
        },
        {
          subheader: 'Business Address',
          content: [
            {
              subheader: '',
              content: [
                '6514 5th Ave NE, Seattle WA, 98115',
              ],
            },
          ],
        },
      ],
    },
    yourRights: {
      subheader: 'Disclaimer:',
      content: [
        {
          subheader:
            'The content provided on this page is for informational purposes only and represents a wedding event RSVP project. We are not liable for any misuse of the information or any external links provided on this page.',
        },
      ],
    }
  };
  
  // Get the semi-transparent background color like in AttendanceButton
  const semiTransparentBackgroundColor = themePaletteToRgba(theme.palette.primary.main, 0.1);
  
  // Common styles for all headers to mimic the "Interested" box styling
  const commonHeaderStyle = {
    width: '100%',  // Use 100% instead of 100vw to prevent horizontal scrollbar
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
            alt="Logo" 
          />
        </Box>

        <StephsActualFavoriteTypography sx={{ mt: 2, textAlign: 'left' }}>
          Christephanie LLC
        </StephsActualFavoriteTypography>
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
                    {(content.content && (
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
                    )) || (
                      <Typography sx={{ padding: '8px 16px' }}>
                        {content.subheader}
                      </Typography>
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