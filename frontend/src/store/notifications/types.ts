import type { OptionsObject, SnackbarKey, SnackbarMessage, VariantType } from 'notistack';

// Define our custom variant types, including standard notistack variants
export type CustomVariant = 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'default' | string;

// Our options object with flexible variant type
interface CustomOptionsObject extends Omit<OptionsObject, 'variant'> {
  variant?: CustomVariant;
  key?: SnackbarKey;
  onClick?: () => void; // Custom property for handling notification clicks
}

interface Notification {
  message: SnackbarMessage;
  options: CustomOptionsObject;
  dismissed: boolean;
}

declare module 'notistack' {
  export interface VariantOverrides {
    primary: {};
    secondary: {};
  }
}

type Actions = {
  push: (notification: Partial<Notification>) => SnackbarKey;
  close: (key: SnackbarKey, dismissAll?: boolean) => void;
  remove: (key: SnackbarKey) => void;
};

export type { Notification, Actions, CustomOptionsObject };