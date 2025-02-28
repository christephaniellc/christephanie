import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useEffect } from 'react';

function TermsOfService() {
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

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom align="center">
        Terms of Service
      </Typography>
      <Divider sx={{ mb: 4 }} />

      <Typography variant="body1" paragraph>
        By using our wedding website, you agree to these Terms of Service. We aim to create a welcoming, user-friendly space for all our guests, ensuring a smooth and enjoyable experience.
      </Typography>

      <Typography variant="h5" gutterBottom>
        Website Use
      </Typography>
      <Typography variant="body1" paragraph>
        Our website is designed to help manage wedding-related events—from saving the date and RSVP management to sharing photos and guestbook entries. Certain features, such as secure login via Auth0 with Google OAuth, require registration. You are responsible for keeping your account details secure.
      </Typography>

      <Typography variant="h5" gutterBottom>
        User Responsibilities
      </Typography>
      <Typography variant="body1" paragraph>
        We kindly ask that you provide accurate and complete information when using our site. Please use the website only for its intended purpose and in a way that doesn’t disrupt the experience for other guests. We also expect any uploaded photos or guestbook entries to be respectful and appropriate for this celebratory occasion.
      </Typography>

      <Typography variant="h5" gutterBottom>
        Third-Party Services
      </Typography>
      <Typography variant="body1" paragraph>
        Our site integrates with several trusted third-party services including Twilio for SMS messaging, AWS for hosting and infrastructure, and the USPS API for address verification. Use of these services is subject to their own terms and conditions, and we are not liable for issues arising from your interactions with them.
      </Typography>

      <Typography variant="h5" gutterBottom>
        Intellectual Property
      </Typography>
      <Typography variant="body1" paragraph>
        All content on our website—including text, images, and other media—is provided for your personal, non-commercial use in relation to our wedding. The underlying code for this site is stored in a private GitHub repository and is the exclusive property of the website owners. It may not be used, copied, or distributed without our explicit written permission.
      </Typography>

      <Typography variant="h5" gutterBottom>
        Disclaimers & Limitation of Liability
      </Typography>
      <Typography variant="body1" paragraph>
        Our website is provided "as is" without any warranties, express or implied. We are not liable for any damages, direct or indirect, arising from your use of the website. We reserve the right to modify these Terms of Service at any time, and continued use of the website signifies your acceptance of any changes.
      </Typography>

      <Typography variant="h5" gutterBottom>
        Governing Law
      </Typography>
      <Typography variant="body1" paragraph>
        These Terms of Service are governed by the laws of the United States, and any disputes will be resolved in the appropriate jurisdiction.
      </Typography>

      <Typography variant="h5" gutterBottom>
        Contact and Updates
      </Typography>
      <Typography variant="body1" paragraph>
        If you have any questions about these terms or our policies, please contact us through our website. We may update these terms periodically, so we encourage you to review them regularly.
      </Typography>
    </Container>
  );
}

export default TermsOfService;
