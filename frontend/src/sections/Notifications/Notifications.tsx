import { SnackbarProvider } from 'notistack';
import { notifications } from '@/config';
import Notifier from './Notifier';
import CustomNotification from '@/components/CustomNotification';

function Notifications() {
  return (
    <SnackbarProvider
      maxSnack={notifications.maxSnack}
      Components={{
        // Register our custom variants
        info: CustomNotification,
        success: CustomNotification,
        warning: CustomNotification,
        error: CustomNotification,
        // And our new custom variants
        primary: CustomNotification,
        secondary: CustomNotification,
      }}
    >
      <Notifier />
    </SnackbarProvider>
  );
}

export default Notifications;
