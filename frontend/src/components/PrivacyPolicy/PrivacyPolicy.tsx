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

export const privacyPolicyItems: {
  [key: string]: {
    subheader: string;
    content: { subheader: string; content?: { subheader: string; content: string[] }[] }[];
  };
} = {
  privacyPolicy: {
    subheader: 'Privacy Policy',
    content: [
      {
        subheader:
          'We are delighted to welcome you to our wedding website. Your privacy is very important to us, and we have created this policy to explain how we collect, use, and protect your personal information as you interact with our site. This document covers all three phases of our website - from the initial "Save the Date" page through to the guestbook and photo upload feature available by our wedding day.',
      },
    ],
  },
  whatInformationWeCollect: {
    subheader: 'What Information We Collect',
    content: [
      {
        subheader: '',
        content: [
          {
            subheader: 'Save the Date Phase:',

            content: [
              'Indicate your interest in attending (pending, interested, or declined); provide age group for each guest (adult, under 21, under 13, or baby); enter your mailing address and select your preferred contact method (email or SMS, with verification and opt-in); and let us know about food allergies and accommodation preferences (hotel, camping, or other).',
            ],
          },
          {
            subheader: 'RSVP Phase:',
            content: [
              'Confirm attendance for events (wedding, rehearsal, breakfasts, etc.); submit meal choices; and provide registry information for contributions toward our honeymoon or house renovations.',
            ],
          },
          {
            subheader: 'Wedding Event Phase:',
            content: [
              'Upload photos, videos, and write guestbook entries to share memories and well wishes.',
            ],
          },
        ],
      },
    ],
  },
  howWeUseYourInformation: {
    subheader: 'How We Use Your Information',
    content: [
      {
        subheader:
          'Your data is used solely for managing our wedding events and communications. We use the information to send you important updates and reminders (via email or SMS, per your preference), verify your contact details, personalize your experience on our website, process RSVPs, and organize event-related contributions.',
      },
      {
        subheader: 'Third-Party Services',
        content: [
          {
            subheader: '',
            content: [
              'Auth0 (with Google OAuth): Manages secure logins.',
              'Twilio: Delivers SMS messages.',
              'AWS: Provides hosting, infrastructure, and email notifications.',
              'USPS API: Verifies mailing addresses.',
              'Others: GitHub (private repository for our code), Jira (project management), and registry/payment providers such as Zola or Square.',
            ],
          },
        ],
      },
    ],
  },
  dataSecurityAndRetention: {
    subheader: 'Data Security and Retention',
    content: [
      {
        subheader:
          'We take reasonable steps to safeguard your information using secure storage on AWS and industry-standard security practices. Your personal data will be retained only as long as necessary to facilitate our wedding events and related communications.',
      },
    ],
  },
  internationalGuests: {
    subheader: 'International Guests',
    content: [
      {
        subheader:
          'While most of our guests are in the United States, we welcome a few from Germany. We strive to comply with applicable data protection laws, including GDPR, to ensure your rights are respected.',
      },
    ],
  },
  yourRights: {
    subheader: 'Your Rights',
    content: [
      {
        subheader:
          'You may request access to your personal data, correct inaccuracies, or opt out of certain communications at any time. If you have any questions or concerns, please reach out to us via the contact form on our website.',
      },
    ],
  },
  contactUs: {
    subheader: 'Contact Us',
    content: [
      {
        subheader:
          'If you have any questions about this privacy policy or your personal data, please contact us through the website.',
      },
    ],
  },
};

interface PrivacyPolicyProps { 
  handleTabLink: (to: string) => void;
 }

function PrivacyPolicy({handleTabLink}: PrivacyPolicyProps) {
  const { contentHeight } = useAppLayout();
  const theme = useTheme();
  
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

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

  // Get the semi-transparent background color
  const semiTransparentBackgroundColor = themePaletteToRgba(theme.palette.primary.main, 0.1);
  
  // Common styles for all headers
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
    top: 0,
  };
  
  // Styles for subheaders with different z-index values
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
        paddingBottom: '80px',
      }}
      data-testid="privacy-policy-container"
    >
      <Box my={2} sx={{ 
        backdropFilter: 'blur(16px)',
        width: '100%',
        px: 2,
        mt: 2,
        pb: 2,
        zIndex: 5,
      }}>
        <StephsActualFavoriteTypography variant="h4" sx={{ textAlign: 'center',
            mt: 2,
            fontSize: '2rem'}}>
          {privacyPolicyItems.privacyPolicy.subheader}
        </StephsActualFavoriteTypography>
        <Typography variant="body1" 
          sx={{ mt: 2, fontSize: '0.9rem' }}>
          {privacyPolicyItems.privacyPolicy.content[0].subheader}
        </Typography>
      </Box>
      <List sx={{ 
        overflow: 'auto',
        pt: 0,
        my: 2, 
        height: 'calc(100% - 300px)', 
        backgroundColor: 'rgba(0,0,0,.1)', 
        width: '100%',
        pb: 16,
        position: 'relative',
        zIndex: 1,
      }}>
        {Object.entries(privacyPolicyItems)
          .slice(1)
          .map(([key, value]) => (
            <Box
              data-testid={`list-item-${key}`}
              key={key}
              sx={{ flexWrap: 'wrap', width: '100%',
                backgroundColor: 'rgba(0,0,0,.1)',
                padding: 0,
                mb: 2,
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

export default PrivacyPolicy;