import { useEffect, useRef } from 'react';

import { OptionsObject, SnackbarKey, useSnackbar, VariantType } from 'notistack';

import useNotifications from '@/store/notifications';
import { CustomVariant } from '@/store/notifications/types';

// NOTE: this is a workaround for a missing feature in notistack
// This will be removed once the new version of notistack is released
// But it works great for now :)
function Notifier() {
  const [notifications, actions] = useNotifications();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const displayed = useRef<SnackbarKey[]>([]);

  function storeDisplayed(key: SnackbarKey) {
    displayed.current = [...displayed.current, key];
  }

  function removeDisplayed(key: SnackbarKey) {
    displayed.current = [...displayed.current.filter((_key) => key !== _key)];
  }

  useEffect(() => {
    // Process notifications in a way that prevents infinite loops
    const notificationsToProcess = notifications.filter(notification => {
      // Skip already displayed notifications
      if (notification.options.key && displayed.current.includes(notification.options.key)) {
        return false;
      }
      return true;
    });

    // Process each notification
    notificationsToProcess.forEach(({ message, options, dismissed }) => {
      if (dismissed) {
        // dismiss snackbar using notistack
        if (options.key) {
          closeSnackbar(options.key);
        }
        return;
      }

      // display snackbar using notistack
      if (message && options.key) {
        // Ensure variant is one of the accepted values
        const safeOptions: OptionsObject<VariantType | 'primary' | 'secondary'> = {
          ...options,
          // Cast our custom variant to the types expected by notistack
          variant: (options.variant as VariantType | 'primary' | 'secondary') || 'default',
          onExited(event, key) {
            // remove this snackbar from the store
            actions.remove(key);
            removeDisplayed(key);
          },
        };
        
        // Add to displayed list before enqueueing to prevent race conditions
        storeDisplayed(options.key);
        enqueueSnackbar(message, safeOptions);
      }
    });
  }, [notifications, actions, closeSnackbar, enqueueSnackbar]); // Add dependencies

  return null;
}

export default Notifier;