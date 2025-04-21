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
  } = useRegisterSW();
  
  // Force the app to allow screenshots on mobile devices
  useEffect(() => {
    // Add meta tag to allow screenshots
    const metaTag = document.createElement('meta');
    metaTag.name = 'allow-screenshots';
    metaTag.content = 'true';
    document.head.appendChild(metaTag);

    // Make sure webkit touch callout is enabled
    document.documentElement.style.setProperty('-webkit-touch-callout', 'default', 'important');
    document.documentElement.style.setProperty('-webkit-user-select', 'auto', 'important');
    document.documentElement.style.setProperty('user-select', 'auto', 'important');
  }, []);

  const close = useCallback(() => {
    setOfflineReady(false);
    setNeedRefresh(false);

    if (notificationKey.current) {
      notificationsActions.close(notificationKey.current);
    }
  }, [setOfflineReady, setNeedRefresh, notificationsActions]);

  const handleReload = useCallback(() => {
    //console.log('Updating service worker and reloading the page');
    // First close the notification
    close();
    // Then trigger the service worker update and force reload
    try {
      // Force update with skipWaiting to ensure the new service worker takes over immediately
      updateServiceWorker(true);

      // As a fallback, force page reload after a short delay if the updateServiceWorker
      // doesn't trigger a reload by itself
      setTimeout(() => {        
         //console.log('Forcing page reload as fallback');
         window.location.reload();
       }, 1000);
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