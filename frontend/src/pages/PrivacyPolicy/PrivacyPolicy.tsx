import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useEffect } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { ListSubheader } from '@mui/material';
import { useAppLayout } from '@/context/Providers/AppState/useAppLayout';
import { StephsActualFavoriteTypography } from '@/components/AttendanceButton/AttendanceButton';

function PrivacyPolicy() {
  const { contentHeight } = useAppLayout();
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    console.log('PrivacyPolicy mounted.');

    // Example of an async operation that respects the AbortController
    const fetchData = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
        if (!signal.aborted) {
          console.log('Data fetched successfully.');
        }
      } catch (error) {
        if (signal.aborted) {
          console.log('Fetch aborted due to navigation.');
        }
      }
    };

    fetchData();

    return () => {
      console.log('PrivacyPolicy unmounted. Aborting any pending tasks.');
      controller.abort();
    };
  }, []);

  const privacyPolicyItems: {
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
            'We’re delighted to welcome you to our wedding website. Your privacy is very important to us, and we’ve created this policy to explain how we collect, use, and protect your personal information as you interact with our site. This document covers all three phases of our website—from the initial “Save the Date” page through to the guestbook and photo upload feature available by our wedding day.',
        },
      ],
    },
    whatInformationWeCollect: {
      subheader: 'What Information We Collect',
      content: [
        {
          subheader: 'Our website is designed in three phases:',
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
  return (
    <Container
      sx={{
        width: '100%',
        maxHeight: contentHeight,
        overflow: 'hidden',
        borderRadius: 'sm',
        display: 'flex',
        flexWrap: 'wrap',
        position: 'relative',
      }}
    >
      <Box my={2} sx={{ backdropFilter: 'blur(20px)', backgroundColor: 'rgba(0,0,0,.1)' }}>
        <StephsActualFavoriteTypography 
          sx={{ 
          mt: 2, 
          fontSize: '2rem',
          textAlign: 'center' }}>
          {privacyPolicyItems.privacyPolicy.subheader}
        </StephsActualFavoriteTypography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          {privacyPolicyItems.privacyPolicy.content[0].subheader}
        </Typography>
      </Box>
      <List sx={{ overflow: 'auto', py: 0, my: 2, height: contentHeight - 250 , backgroundColor: 'rgba(0,0,0,.1)' }}>
        {Object.entries(privacyPolicyItems)
          .slice(1)
          .map(([key, value]) => (
            <ListItem
              data-testid={`list-item-${key}`}
              key={key}
              sx={{ flexWrap: 'wrap', width: '100%',
                backgroundColor: 'rgba(0,0,0,.1)',
            }}
            >
              <ListSubheader sx={{ width: '100%' }}>
                {value.subheader}
              </ListSubheader>
              <List sx={{ position: 'relative', width: '100%' }}>
                {value.content.map((content, index) => (
                  <ListItem key={index} sx={{ flexWrap: 'wrap', width: '100%' }}>
                    {(content.content && (
                      <>
                        <ListSubheader disableSticky={false} key={index} sx={{ width: '100%' }}>
                          {content.subheader}
                        </ListSubheader>
                        <List sx={{ position: 'relative', width: '100%' }}>
                          {content.content.map((subContent, index) => (
                            <ListItem key={index} sx={{ flexWrap: 'wrap', width: '100%' }}>
                              <ListSubheader sx={{ width: '100%' }}>
                                {subContent.subheader}
                              </ListSubheader>
                              <List>
                                {subContent.content?.map((paragraph, pIndex) => (
                                  <ListItem>{paragraph}</ListItem>
                                ))}
                              </List>
                            </ListItem>
                          ))}
                        </List>
                      </>
                    )) || <>{content.subheader}</>}
                  </ListItem>
                ))}
              </List>
            </ListItem>
          ))}
      </List>
    </Container>
  );
}

export default PrivacyPolicy;
