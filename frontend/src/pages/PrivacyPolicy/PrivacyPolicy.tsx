import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useEffect } from 'react';

function PrivacyPolicy() {
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
        Privacy Policy
      </Typography>
      <Divider sx={{ mb: 4 }} />

      <Typography variant="body1" paragraph>
        We’re delighted to welcome you to our wedding website. Your privacy is very important to us, and we’ve created this policy to explain how we collect, use, and protect your personal information as you interact with our site. This document covers all three phases of our website—from the initial “Save the Date” page through to the guestbook and photo upload feature prior to our wedding day.
      </Typography>

      <Typography variant="h5" gutterBottom>
        What Information We Collect
      </Typography>
      <Typography variant="body1" paragraph>
        Our website is designed in three phases:
      </Typography>
      <Box component="ul" sx={{ pl: 4, mb: 2 }}>
        <li>
          <Typography variant="body1">
            <strong>Save the Date Phase:</strong> Indicate your interest in attending (pending, interested, or declined); provide age group for each guest (adult, under 21, under 13, or baby); enter your mailing address and select your preferred contact method (email or SMS, with verification and opt-in); and let us know about food allergies and accommodation preferences (hotel, camping, or other).
          </Typography>
        </li>
        <li>
          <Typography variant="body1">
            <strong>RSVP Phase:</strong> Confirm attendance for events (wedding, rehearsal, breakfasts, etc.); submit meal choices; and provide registry information for contributions toward our honeymoon or house renovations.
          </Typography>
        </li>
        <li>
          <Typography variant="body1">
            <strong>Pre-Wedding Day Phase:</strong> Upload photos and write guestbook entries to share memories and well wishes.
          </Typography>
        </li>
      </Box>

      <Typography variant="h5" gutterBottom>
        How We Use Your Information
      </Typography>
      <Typography variant="body1" paragraph>
        Your data is used solely for managing our wedding events and communications. We use the information to send you important updates and reminders (via email or SMS, per your preference), verify your contact details, personalize your experience on our website, process RSVPs, and organize event-related contributions.
      </Typography>

      <Typography variant="h5" gutterBottom>
        Third-Party Services
      </Typography>
      <Typography variant="body1" paragraph>
        To support our website’s functionality, we integrate with trusted third-party providers:
      </Typography>
      <Box component="ul" sx={{ pl: 4, mb: 2 }}>
        <li>
          <Typography variant="body1">
            <strong>Auth0 (with Google OAuth):</strong> Manages secure logins.
          </Typography>
        </li>
        <li>
          <Typography variant="body1">
            <strong>Twilio:</strong> Delivers SMS messages.
          </Typography>
        </li>
        <li>
          <Typography variant="body1">
            <strong>AWS:</strong> Provides hosting, infrastructure, and email notifications.
          </Typography>
        </li>
        <li>
          <Typography variant="body1">
            <strong>USPS API:</strong> Verifies mailing addresses.
          </Typography>
        </li>
        <li>
          <Typography variant="body1">
            <strong>Others:</strong> GitHub (private repository for our code), Jira (project management), and registry/payment providers such as Zora or Square.
          </Typography>
        </li>
      </Box>

      <Typography variant="h5" gutterBottom>
        Data Security and Retention
      </Typography>
      <Typography variant="body1" paragraph>
        We take reasonable steps to safeguard your information using secure storage on AWS and industry-standard security practices. Your personal data will be retained only as long as necessary to facilitate our wedding events and related communications.
      </Typography>

      <Typography variant="h5" gutterBottom>
        International Guests
      </Typography>
      <Typography variant="body1" paragraph>
        While most of our guests are in the United States, we welcome a few from Germany. We strive to comply with applicable data protection laws, including GDPR, to ensure your rights are respected.
      </Typography>

      <Typography variant="h5" gutterBottom>
        Your Rights
      </Typography>
      <Typography variant="body1" paragraph>
        You may request access to your personal data, correct inaccuracies, or opt out of certain communications at any time. If you have any questions or concerns, please reach out to us via the contact form on our website.
      </Typography>

      <Typography variant="h5" gutterBottom>
        Contact Us
      </Typography>
      <Typography variant="body1" paragraph>
        If you have any questions about this privacy policy or your personal data, please contact us through the website.
      </Typography>
    </Container>
  );
}

export default PrivacyPolicy;
