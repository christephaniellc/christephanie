import { atom, selector, useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import CardGiftcard from '@mui/icons-material/CardGiftcard';
import LocalFlorist from '@mui/icons-material/LocalFlorist';
import Cake from '@mui/icons-material/Cake';
import Hotel from '@mui/icons-material/Hotel';
import DirectionsCar from '@mui/icons-material/DirectionsCar';
import Flight from '@mui/icons-material/Flight';
import WineBar from '@mui/icons-material/WineBar';

import { SvgIconComponent } from '@mui/icons-material';

// Registry gift option type
export type GiftOption = {
  id: string;
  title: string;
  description: string;
  icon: SvgIconComponent; // React icon component
  suggestedAmounts: number[];
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
    description: 'Help us create unforgettable memories on our honeymoon adventure.',
    icon: Flight,
    suggestedAmounts: [25, 50, 100, 200]
  },
  {
    id: 'flowers',
    title: 'Wedding Flowers',
    description: 'Contribute to beautiful floral arrangements for our special day.',
    icon: LocalFlorist,
    suggestedAmounts: [20, 50, 75, 100]
  },
  {
    id: 'cake',
    title: 'Wedding Cake',
    description: 'Help us celebrate with a delicious wedding cake.',
    icon: Cake,
    suggestedAmounts: [15, 25, 50, 75]
  },
  {
    id: 'accommodations',
    title: 'Guest Accommodations',
    description: 'Support our out-of-town guests with comfortable accommodations.',
    icon: Hotel,
    suggestedAmounts: [30, 60, 100, 150]
  },
  {
    id: 'transportation',
    title: 'Transportation',
    description: 'Help with transportation costs for our wedding day.',
    icon: DirectionsCar,
    suggestedAmounts: [20, 40, 75, 100]
  },
  {
    id: 'drinks',
    title: 'Drinks & Toasts',
    description: 'Contribute to refreshments and celebratory toasts.',
    icon: WineBar,
    suggestedAmounts: [15, 30, 50, 100]
  },
];

// Atoms
export const giftOptionsState = atom<GiftOption[]>({
  key: 'giftOptionsState',
  default: giftOptionsData
});

export const selectedAmountsState = atom<Record<string, number | null>>({
  key: 'selectedAmountsState',
  default: {}
});

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

export const paymentSuccessDialogState = atom<{open: boolean; amount: number; category: string}>({
  key: 'paymentSuccessDialogState',
  default: {
    open: false,
    amount: 0,
    category: ''
  }
});

export const paymentErrorDialogState = atom<{open: boolean; message: string}>({
  key: 'paymentErrorDialogState',
  default: {
    open: false,
    message: ''
  }
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
    description: 'If you prefer to give a traditional gift, we\'ve created a registry at our favorite store.',
    url: 'https://www.amazon.com/wedding/registry', // Replace with actual registry URL
    icon: CardGiftcard
  }
});

// Custom hooks for registry state management
export const useRegistry = () => {
  const giftOptions = useRecoilValue(giftOptionsState);
  const [selectedAmounts, setSelectedAmounts] = useRecoilState(selectedAmountsState);
  const [customAmounts, setCustomAmounts] = useRecoilState(customAmountsState);
  const [notification, setNotification] = useRecoilState(notificationState);
  const traditionalRegistry = useRecoilValue(traditionalRegistryState);

  const handleAmountSelect = (id: string, amount: number) => {
    setSelectedAmounts(prev => ({
      ...prev,
      [id]: amount
    }));
    // Clear custom amount when preset is selected
    setCustomAmounts(prev => ({
      ...prev,
      [id]: ''
    }));
  };

  const handleCustomAmountChange = (id: string, value: string) => {
    // Allow only numbers
    if (value === '' || /^\d+$/.test(value)) {
      setCustomAmounts(prev => ({
        ...prev,
        [id]: value
      }));
      // Clear preset selection when custom is entered
      if (value) {
        setSelectedAmounts(prev => ({
          ...prev,
          [id]: null
        }));
      }
    }
  };

  const [paymentDialog, setPaymentDialog] = useRecoilState(paymentDialogState);
  const [successDialog, setSuccessDialog] = useRecoilState(paymentSuccessDialogState);
  const [errorDialog, setErrorDialog] = useRecoilState(paymentErrorDialogState);

  const handleContribute = (id: string) => {
    const amount = parseInt(customAmounts[id]) || selectedAmounts[id] || 0;
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
  
  const handlePaymentSuccess = () => {
    const { amount, category, categoryId } = paymentDialog;
    
    // Close payment dialog
    setPaymentDialog(prev => ({
      ...prev,
      open: false
    }));
    
    // Show success dialog
    setSuccessDialog({
      open: true,
      amount,
      category
    });
    
    // Reset the form
    setSelectedAmounts(prev => ({
      ...prev,
      [categoryId]: null
    }));
    setCustomAmounts(prev => ({
      ...prev,
      [categoryId]: ''
    }));
  };
  
  const handlePaymentError = (message: string) => {
    // Close payment dialog
    setPaymentDialog(prev => ({
      ...prev,
      open: false
    }));
    
    // Show error dialog
    setErrorDialog({
      open: true,
      message
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
    setErrorDialog(prev => ({
      ...prev,
      open: false
    }));
  };

  const closeNotification = () => {
    setNotification(prev => ({
      ...prev,
      show: false
    }));
  };

  return {
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
  };
};