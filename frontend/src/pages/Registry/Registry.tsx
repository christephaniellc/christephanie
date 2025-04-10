import React from 'react';
import { 
  Container, 
  Typography, 
  Snackbar,
  Alert,
  Box,
  Button,
  styled,
} from '@mui/material';
import { useRegistry } from '@/store/registry';
import {
  RegistryInfoSection,
  GiftCategoryList,
  TraditionalRegistrySection,
  StripePaymentForm,
  PaymentSuccessDialog,
  PaymentErrorDialog,
  MyContributions
} from './components';

// Styled components
const RegistryContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(12), // Add extra space for the bottom nav on mobile
  paddingLeft: theme.spacing(2), // Less horizontal padding on mobile
  paddingRight: theme.spacing(2),
  overflow: 'hidden', // Prevent horizontal scrolling on mobile
  [theme.breakpoints.up('sm')]: {
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    paddingBottom: theme.spacing(10),
  },
  [theme.breakpoints.up('md')]: {
    paddingTop: theme.spacing(6),
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
  },
}));

const PageTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  fontFamily: 'Snowstorm, sans-serif',
  color: theme.palette.mode === 'dark' ? '#fff' : theme.palette.primary.main,
  textAlign: 'center',
  fontSize: '2.5rem',
  [theme.breakpoints.up('md')]: {
    fontSize: '3.2rem',
  },
}));

/**
 * Registry page - container component that handles the state and layout
 * Business logic is extracted to the useRegistry hook in the store
 */
const Registry: React.FC = () => {
  console.log('Rendering Registry component');
  
  // Use try-catch to handle any errors during state initialization
  try {
    const {
      giftOptions,
      customAmounts,
      notification,
      traditionalRegistry,
      paymentDialog,
      successDialog,
      errorDialog,
      handleCustomAmountChange,
      handleContribute,
      handlePaymentSuccess,
      handlePaymentError,
      closePaymentDialog,
      closeSuccessDialog,
      closeErrorDialog
    } = useRegistry();
    
    // We DON'T want to close the error dialog if it's genuinely showing an error
    // The previous implementation was resetting our error dialog

    return (
      <RegistryContainer 
        maxWidth="lg">
        <PageTitle variant="h1">Our Registry</PageTitle>
        
        {/* Info section explaining the registry */}
        <RegistryInfoSection />
        
        {/* Display user's contributions if they exist */}
        <MyContributions />
        
        {/* Gift categories section */}
        <GiftCategoryList 
          giftOptions={giftOptions}
          customAmounts={customAmounts}
          onCustomAmountChange={handleCustomAmountChange}
          onContribute={handleContribute}
        />
        
        {/* Traditional registry section */}
        <TraditionalRegistrySection 
          title={traditionalRegistry.title}
          description={traditionalRegistry.description}
          url={traditionalRegistry.url}
          icon={traditionalRegistry.icon}
        />
        
        {/* Payment Dialogs */}
        <StripePaymentForm
          open={paymentDialog.open}
          amount={paymentDialog.amount}
          category={paymentDialog.category}
          onClose={closePaymentDialog}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />
        
        <PaymentSuccessDialog
          open={successDialog.open}
          onClose={closeSuccessDialog}
          amount={successDialog.amount}
          category={successDialog.category}
          paymentIntentId={successDialog.paymentIntentId}
          email={successDialog.email}
          notes={successDialog.notes}
          timestamp={successDialog.timestamp}
        />
        
        <PaymentErrorDialog
          open={errorDialog.open}
          onClose={closeErrorDialog}
          errorMessage={errorDialog.message}
          errorCode={errorDialog.errorCode}
          errorType={errorDialog.errorType}
        />        
      </RegistryContainer>
    );
  } catch (error) {
    console.error('Error rendering Registry page:', error);
    
    // Return a simpler component with error message
    return (
      <RegistryContainer maxWidth="lg">
        <PageTitle variant="h1">Our Registry</PageTitle>
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body1" align="center" sx={{ mb: 3 }}>
            We're experiencing technical difficulties. Please try again.
          </Typography>
          <Button 
            variant="contained" 
            color="secondary" 
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </Button>
        </Box>
      </RegistryContainer>
    );
  }
};

export default Registry;