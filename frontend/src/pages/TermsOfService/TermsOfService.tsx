import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useEffect } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { ListSubheader } from '@mui/material';
import { useAppLayout } from '@/context/Providers/AppState/useAppLayout';
import { StephsActualFavoriteTypography, themePaletteToRgba } from '@/components/AttendanceButton/AttendanceButton';
import { useTheme } from '@mui/material/styles';

function TermsOfService() {
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

  const termsOfServiceItems: {
    [key: string]: {
      subheader: string;
      content: { subheader: string; content?: { subheader: string; content: string[] }[] }[];
    };
  } = {
    termsOfService: {
      subheader: 'Terms of Service',
      content: [
        {
          subheader:
            'By using our wedding website, you agree to these Terms of Service. We aim to create a welcoming, user-friendly space for all our guests, ensuring a smooth and enjoyable experience.',
        },
      ],
    },
    websiteUse: {
      subheader: 'Website Use',
      content: [
        {
          subheader:
            'Our website is designed to help manage wedding-related events - from saving the date and RSVP management to sharing photos and guestbook entries. Certain features, such as secure login via Auth0 with Google OAuth, require registration. You are responsible for keeping your account details secure.',
        },
      ],
    },
    userResponsibilities: {
      subheader: 'User Responsibilities',
      content: [
        {
          subheader:
            'We kindly ask that you provide accurate and complete information when using our site. Please use the website only for its intended purpose and in a way that does not disrupt the experience for other guests. We also expect any uploaded photos or guestbook entries to be respectful and appropriate for this celebratory occasion.',
        },
      ],
    },
    thirdPartyServices: {
      subheader: 'Third-Party Services',
      content: [
        {
          subheader:
            'Our site integrates with several trusted third-party services including Twilio for SMS messaging, AWS for hosting and infrastructure, and the USPS API for address verification. Use of these services is subject to their own terms and conditions, and we are not liable for issues arising from your interactions with them.',
        },
      ],
    },
    intellectualProperty: {
      subheader: 'Intellectual Property',
      content: [
        {
          subheader:
            'All content on our website - including text, images, and other media - is provided for your personal, non-commercial use in relation to our wedding. The underlying code for this site is stored in a private GitHub repository and is the exclusive property of the website owners. It may not be used, copied, or distributed without our explicit written permission.',
        },
      ],
    },
    disclaimers: {
      subheader: 'Disclaimers & Limitation of Liability',
      content: [
        {
          subheader:
            'Our website is provided "as is" without any warranties, express or implied. We are not liable for any damages, direct or indirect, arising from your use of the website. We reserve the right to modify these Terms of Service at any time, and continued use of the website signifies your acceptance of any changes.',
        },
      ],
    },
    governingLaw: {
      subheader: 'Governing Law',
      content: [
        {
          subheader:
            'These Terms of Service are governed by the laws of the United States, and any disputes will be resolved in the appropriate jurisdiction.',
        },
      ],
    },
    contactUpdates: {
      subheader: 'Contact and Updates',
      content: [
        {
          subheader:
            'If you have any questions about these terms or our policies, please contact us through our website. We may update these terms periodically, so we encourage you to review them regularly.',
        },
      ],
    },
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
          {termsOfServiceItems.termsOfService.subheader}
        </StephsActualFavoriteTypography>
        <Typography variant="body1" 
          sx={{ mt: 2, fontSize: '0.9rem' }}>
          {termsOfServiceItems.termsOfService.content[0].subheader}
        </Typography>
      </Box>
      <List sx={{ 
        overflow: 'auto', // Changed from 'scroll' to 'auto' to only show scrollbars when needed
        pt: 0,
        my: 2, 
        height: 'calc(100% - 300px)', 
        backgroundColor: 'rgba(0,0,0,.1)', 
        width: '100%',
        pb: 16, // Increased padding at bottom to avoid content being cut off behind BottomNav
        position: 'relative',
        zIndex: 1, // Lower z-index than headers
      }}>
        {Object.entries(termsOfServiceItems)
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

export default TermsOfService;