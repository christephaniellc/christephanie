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
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(10), // Add extra space for the bottom nav
  [theme.breakpoints.up('md')]: {
    paddingTop: theme.spacing(6),
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
      closeErrorDialog,
      closeNotification
    } = useRegistry();
    
    // We DON'T want to close the error dialog if it's genuinely showing an error
    // The previous implementation was resetting our error dialog

    return (
      <RegistryContainer maxWidth="lg">
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
        
        {/* Notification */}
        <Snackbar 
          open={notification.show} 
          autoHideDuration={6000} 
          onClose={closeNotification}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={closeNotification} 
            severity={notification.severity} 
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
        
        {/* Additional error notification that shows when payment fails */}
        <Snackbar 
          open={errorDialog.open} 
          autoHideDuration={10000} 
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          sx={{ mt: 6 }}
        >
          <Alert 
            severity="error" 
            variant="filled"
            elevation={6}
            onClose={closeErrorDialog}
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={() => {
                  // Set focus on error dialog to ensure it's visible
                  console.log('Opening error details');
                  // Force dialog to stay open
                  // Call handlePaymentError again with current error to force dialog open
                  handlePaymentError(errorDialog.message, errorDialog.errorCode, errorDialog.errorType);
                }}
              >
                VIEW DETAILS
              </Button>
            }
            sx={{ width: '100%' }}
          >
            Payment Failed: {errorDialog.message}
          </Alert>
        </Snackbar>
        
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
        
        {/* Direct error display as a fallback */}
        {errorDialog.open && errorDialog.message && (
          <Box 
            sx={{ 
              position: 'fixed', 
              top: '20px', 
              left: '50%', 
              transform: 'translateX(-50%)',
              zIndex: 9999,
              width: '90%',
              maxWidth: '500px',
              p: 2,
              bgcolor: 'error.main',
              color: 'white',
              borderRadius: 1,
              boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <Typography variant="h6" gutterBottom>Payment Error</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>{errorDialog.message}</Typography>
            <Button 
              variant="outlined" 
              color="inherit" 
              size="small"
              onClick={closeErrorDialog}
            >
              Dismiss
            </Button>
          </Box>
        )}
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