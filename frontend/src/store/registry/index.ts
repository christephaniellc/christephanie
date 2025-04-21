import { atom, selector, useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import CardGiftcard from '@mui/icons-material/CardGiftcard';
import ConstructionIcon from '@mui/icons-material/Construction';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import Flight from '@mui/icons-material/Flight';
import CelebrationIcon from '@mui/icons-material/Celebration';

import { SvgIconComponent } from '@mui/icons-material';

// Registry gift option type
export type GiftOption = {
  id: string;
  title: string;
  description: string;
  icon: SvgIconComponent; // React icon component
};

// Registry notification type
export type RegistryNotification = {
  show: boolean;
  message: string;
  severity: 'success' | 'error';
};

// Payment dialog state type
export type PaymentDialogState = {
  open: boolean;
  amount: number;
  category: string;
  categoryId: string;
};

// Gift options data
export const giftOptionsData: GiftOption[] = [
  {
    id: 'honeymoon',
    title: 'Honeymoon Fund',
    description: 'Help us create hot-ballooning (or similiarly ridiculous) memories on our honeymoon adventure.',
    icon: Flight
  },
  {
    id: 'remodel',
    title: 'Remodelling Our House',
    description: 'Our 105 year-old house needs some TLC, from structural support improvements to electrical modernization (we still have knob and tube--yikes). Help us prevent zapping fires!',
    icon: ConstructionIcon
  },
  {
    id: 'garden',
    title: 'Garden and Project Fund',
    description: 'Help us become Seattle-level environmentally crunchy with solar panels! Or shall we add a pollinator garden and pizza oven? ',
    icon: LocalFloristIcon
  },
  {
    id: 'custom',
    title: 'Custom',
    description: 'Contribute in your own way!',
    icon: CelebrationIcon
  },
];

// Atoms
export const giftOptionsState = atom<GiftOption[]>({
  key: 'giftOptionsState',
  default: giftOptionsData
});

// Remove selectedAmountsState as it's no longer needed

export const customAmountsState = atom<Record<string, string>>({
  key: 'customAmountsState',
  default: {}
});

export const notificationState = atom<RegistryNotification>({
  key: 'registryNotificationState',
  default: {
    show: false,
    message: '',
    severity: 'success'
  }
});

export const paymentDialogState = atom<PaymentDialogState>({
  key: 'paymentDialogState',
  default: {
    open: false,
    amount: 0,
    category: '',
    categoryId: ''
  }
});

export const paymentSuccessDialogState = atom<{
  open: boolean; 
  amount: number; 
  category: string;
  paymentIntentId: string;
  email: string;
  notes: string;
  timestamp: string;
}>({
  key: 'paymentSuccessDialogState',
  default: {
    open: false,
    amount: 0,
    category: '',
    paymentIntentId: '',
    email: '',
    notes: '',
    timestamp: ''
  }
});

export const paymentErrorDialogState = atom<{
  open: boolean; 
  message: string;
  errorCode: string;
  errorType: string;
}>({
  key: 'paymentErrorDialogState',
  default: {
    open: false,
    message: '',
    errorCode: '',
    errorType: ''
  },
  // Force reset of error state on page refresh
  effects: [
    ({ setSelf }) => {
      setSelf({ open: false, message: '', errorCode: '', errorType: '' });
    }
  ]
});

// Selectors
export const traditionalRegistryState = atom<{
  title: string;
  description: string;
  url: string;
  icon: SvgIconComponent;
}>({
  key: 'traditionalRegistryState',
  default: {
    title: 'Physical Gifts',
    description: 'If you prefer to give a traditional gift, we\'ve created a registry.',
    url: 'https://www.myregistry.com/giftlist/christephanie', // Replace with actual registry URL
    icon: CardGiftcard
  }
});

// Custom hooks for registry state management
export const useRegistry = () => {
  const giftOptions = useRecoilValue(giftOptionsState);
  // Removed selectedAmounts state
  const [customAmounts, setCustomAmounts] = useRecoilState(customAmountsState);
  const [notification, setNotification] = useRecoilState(notificationState);
  const traditionalRegistry = useRecoilValue(traditionalRegistryState);

  const handleCustomAmountChange = (id: string, value: string) => {
    // Allow only numbers
    if (value === '' || /^\d+$/.test(value)) {
      setCustomAmounts(prev => ({
        ...prev,
        [id]: value
      }));
    }
  };

  const [paymentDialog, setPaymentDialog] = useRecoilState(paymentDialogState);
  const [successDialog, setSuccessDialog] = useRecoilState(paymentSuccessDialogState);
  const [errorDialog, setErrorDialog] = useRecoilState(paymentErrorDialogState);

  const handleContribute = (id: string) => {
    const amount = parseInt(customAmounts[id]) || 0;
    const category = giftOptions.find(option => option.id === id)?.title || '';
    
    if (amount <= 0) return;
    
    // Open payment dialog instead of showing notification directly
    setPaymentDialog({
      open: true,
      amount,
      category,
      categoryId: id
    });
  };
  
  const handlePaymentSuccess = (details: { 
    paymentIntentId: string; 
    email: string; 
    notes?: string;
    timestamp: string 
  }) => {
    const { amount, category, categoryId } = paymentDialog;
    
    // Close payment dialog
    setPaymentDialog(prev => ({
      ...prev,
      open: false
    }));
    
    // Show success dialog with transaction details
    setSuccessDialog({
      open: true,
      amount,
      category,
      paymentIntentId: details.paymentIntentId,
      email: details.email,
      notes: details.notes || '',
      timestamp: details.timestamp
    });
    
    // Reset the form
    setCustomAmounts(prev => ({
      ...prev,
      [categoryId]: ''
    }));    
  };
  
  const handlePaymentError = (message: string, errorCode: string = '', errorType: string = '') => {
    console.log('handlePaymentError called with:', { message, errorCode, errorType });
    
    // Close payment dialog immediately
    setPaymentDialog(prev => ({
      ...prev,
      open: false
    }));

    // Show detailed error dialog immediately
    console.log('Setting error dialog state to:', {
      open: true,
      message,
      errorCode,
      errorType
    });
    
    setErrorDialog({
      open: true,
      message,
      errorCode,
      errorType
    });
    
    // Also force an update with a small delay to handle any race conditions
    setTimeout(() => {
      console.log('Re-setting error dialog just to be safe');
      setErrorDialog(prev => ({
        ...prev,
        open: true
      }));
    }, 500);
    
    // Log error for debugging
    console.error('Payment failed:', {
      message,
      errorCode,
      errorType
    });
  };
  
  const closePaymentDialog = () => {
    setPaymentDialog(prev => ({
      ...prev,
      open: false
    }));
  };
  
  const closeSuccessDialog = () => {
    setSuccessDialog(prev => ({
      ...prev,
      open: false
    }));
  };
  
  const closeErrorDialog = () => {
    console.log('Closing error dialog');
    setErrorDialog({
      open: false,
      message: '',
      errorCode: '',
      errorType: ''
    });
  };

  return {
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
  };
};