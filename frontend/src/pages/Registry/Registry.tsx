import React from 'react';
import { 
  Container, 
  Typography, 
  Snackbar,
  Alert,
  styled,
} from '@mui/material';
import { useRegistry } from '@/store/registry';
import {
  RegistryInfoSection,
  GiftCategoryList,
  TraditionalRegistrySection,
  StripePaymentForm,
  PaymentSuccessDialog,
  PaymentErrorDialog
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
  const {
    giftOptions,
    selectedAmounts,
    customAmounts,
    notification,
    traditionalRegistry,
    paymentDialog,
    successDialog,
    errorDialog,
    handleAmountSelect,
    handleCustomAmountChange,
    handleContribute,
    handlePaymentSuccess,
    handlePaymentError,
    closePaymentDialog,
    closeSuccessDialog,
    closeErrorDialog,
    closeNotification
  } = useRegistry();

  return (
    <RegistryContainer maxWidth="lg">
      <PageTitle variant="h1">Our Registry</PageTitle>
      
      {/* Info section explaining the registry */}
      <RegistryInfoSection />
      
      {/* Gift categories section */}
      <GiftCategoryList 
        giftOptions={giftOptions}
        selectedAmounts={selectedAmounts}
        customAmounts={customAmounts}
        onAmountSelect={handleAmountSelect}
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
      />
      
      <PaymentErrorDialog
        open={errorDialog.open}
        onClose={closeErrorDialog}
        errorMessage={errorDialog.message}
      />
    </RegistryContainer>
  );
};

export default Registry;