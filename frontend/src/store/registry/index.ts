import { atom, selector, useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { CardGiftcardIcon, LocalFloristIcon, CakeIcon, HotelIcon, DirectionsCarIcon, FlightIcon, WineBarIcon } from '@mui/icons-material';

// Registry gift option type
export type GiftOption = {
  id: string;
  title: string;
  description: string;
  icon: any; // React icon component
  suggestedAmounts: number[];
};

// Registry notification type
export type RegistryNotification = {
  show: boolean;
  message: string;
  severity: 'success' | 'error';
};

// Gift options data
export const giftOptionsData: GiftOption[] = [
  {
    id: 'honeymoon',
    title: 'Honeymoon Fund',
    description: 'Help us create unforgettable memories on our honeymoon adventure.',
    icon: FlightIcon,
    suggestedAmounts: [25, 50, 100, 200]
  },
  {
    id: 'flowers',
    title: 'Wedding Flowers',
    description: 'Contribute to beautiful floral arrangements for our special day.',
    icon: LocalFloristIcon,
    suggestedAmounts: [20, 50, 75, 100]
  },
  {
    id: 'cake',
    title: 'Wedding Cake',
    description: 'Help us celebrate with a delicious wedding cake.',
    icon: CakeIcon,
    suggestedAmounts: [15, 25, 50, 75]
  },
  {
    id: 'accommodations',
    title: 'Guest Accommodations',
    description: 'Support our out-of-town guests with comfortable accommodations.',
    icon: HotelIcon,
    suggestedAmounts: [30, 60, 100, 150]
  },
  {
    id: 'transportation',
    title: 'Transportation',
    description: 'Help with transportation costs for our wedding day.',
    icon: DirectionsCarIcon,
    suggestedAmounts: [20, 40, 75, 100]
  },
  {
    id: 'drinks',
    title: 'Drinks & Toasts',
    description: 'Contribute to refreshments and celebratory toasts.',
    icon: WineBarIcon,
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

// Selectors
export const traditionalRegistryState = atom<{
  title: string;
  description: string;
  url: string;
  icon: any;
}>({
  key: 'traditionalRegistryState',
  default: {
    title: 'Physical Gifts',
    description: 'If you prefer to give a traditional gift, we\'ve created a registry at our favorite store.',
    url: 'https://www.amazon.com/wedding/registry', // Replace with actual registry URL
    icon: CardGiftcardIcon
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

  const handleContribute = (id: string) => {
    const amount = customAmounts[id] || selectedAmounts[id];
    const category = giftOptions.find(option => option.id === id)?.title;
    
    // Show notification
    setNotification({
      show: true,
      message: `Thank you for your contribution of $${amount} to our ${category}!`,
      severity: 'success'
    });
    
    // Reset the form after submission
    setSelectedAmounts(prev => ({
      ...prev,
      [id]: null
    }));
    setCustomAmounts(prev => ({
      ...prev,
      [id]: ''
    }));
    
    // Here we would integrate with Stripe API
    console.log(`Processing $${amount} contribution to ${id}`);
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
    handleAmountSelect,
    handleCustomAmountChange,
    handleContribute,
    closeNotification
  };
};