import { useCallback, useEffect, useRef } from 'react';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';

import type { SnackbarKey } from 'notistack';
import { useRegisterSW } from 'virtual:pwa-register/react';

import useNotifications from '@/store/notifications';
import { Box } from '@mui/material';

function SW() {
  const [, notificationsActions] = useNotifications();
  const notificationKey = useRef<SnackbarKey | null>(null);
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    // Immediately check for updates on component mount
    immediate: true,
    // Use auto-update strategy
    onRegisteredSW(swUrl, registration) {
      console.log('Service worker registered:', swUrl);
      // Force a check for updates immediately
      if (registration) {
        setInterval(() => {
          console.log('Checking for service worker updates...');
          registration.update().catch(console.error);
        }, 10 * 60 * 1000); // Check every 10 minutes
      }
    },
    onRegisterError(error) {
      console.error('Service worker registration error:', error);
    }
  });

  const close = useCallback(() => {
    setOfflineReady(false);
    setNeedRefresh(false);

    if (notificationKey.current) {
      notificationsActions.close(notificationKey.current);
    }
  }, [setOfflineReady, setNeedRefresh, notificationsActions]);

  const handleReload = useCallback(() => {
    console.log('Updating service worker and reloading the page');
    // First close the notification
    close();
    // Then trigger the service worker update and force reload
    try {
      // Force update with skipWaiting to ensure the new service worker takes over immediately
      updateServiceWorker(true);
      // Add a clear indication in the console for debugging
      console.log('%cService worker update triggered - reload should happen automatically', 
        'background:green; color:white; padding:4px 8px; border-radius:4px; font-weight:bold');
      
      // As a fallback, force page reload after a short delay if the updateServiceWorker
      // doesn't trigger a reload by itself
      setTimeout(() => {
        console.log('%cForcing page reload as fallback', 
          'background:orange; color:black; padding:4px 8px; border-radius:4px; font-weight:bold');
        // Clear caches before reloading as an extra precaution
        if ('caches' in window) {
          caches.keys().then(cacheNames => {
            cacheNames.forEach(cacheName => {
              console.log('Clearing cache:', cacheName);
              caches.delete(cacheName);
            });
            // Now force reload
            window.location.reload();
          });
        } else {
          window.location.reload();
        }
      }, 1500);
    } catch (error) {
      console.error('Error updating service worker, forcing reload:', error);
      (window as Window).location.reload();
    }
  }, [close, updateServiceWorker]);

  useEffect(() => {
    if (offlineReady) {
      notificationsActions.push({
        options: {
          autoHideDuration: 4500,
          content: <Alert severity="success">App is ready to work offline.</Alert>,
        },
      });
    } else if (needRefresh) {
      notificationKey.current = notificationsActions.push({
        message: 'New content is available, click to reload.',
        options: {
          variant: 'warning',
          persist: true,
          action: (
            <>
              <Button onClick={handleReload}>Reload</Button>
              <Button onClick={close}>Close</Button>
            </>
          ),
        },
      });
    }
  }, [close, needRefresh, offlineReady, notificationsActions, updateServiceWorker, handleReload]);

  return null;
}

export default SW;