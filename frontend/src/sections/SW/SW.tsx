import { useCallback, useEffect, useRef } from 'react';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';

import type { SnackbarKey } from 'notistack';
import { useRegisterSW } from 'virtual:pwa-register/react';

import useNotifications from '@/store/notifications';
import { Box } from '@mui/material';

// Force clear cache after deployment
const LAST_FORCE_REFRESH_KEY = 'last_force_refresh';
const VERSION_CHECK_INTERVAL = 30 * 1000; // 30 seconds
const BYPASS_CACHE_PARAM = 'nocache';

// Function to fetch the current version from version.txt
async function fetchCurrentVersion() {
  try {
    // Bypass cache by adding a timestamp parameter
    const response = await fetch(`/version.txt?_t=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' }
    });
    if (!response.ok) throw new Error('Failed to fetch version');
    return await response.text();
  } catch (error) {
    console.error('Error fetching version:', error);
    return null;
  }
}

function SW() {
  const [, notificationsActions] = useNotifications();
  const notificationKey = useRef<SnackbarKey | null>(null);
  const versionCheckIntervalRef = useRef<number | null>(null);
  
  // Register the service worker
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    immediate: true,
    onRegisteredSW(swUrl, registration) {
      console.log('Service worker registered:', swUrl);
      
      // Check for updates every minute
      if (registration) {
        setInterval(() => {
          console.log('Manually checking for SW updates...');
          registration.update().catch(console.error);
        }, 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.error('Service worker registration error:', error);
    }
  });

  // Manual version checking
  useEffect(() => {
    // Check if we have a nocache param in the URL, which means we should force a refresh
    const urlParams = new URLSearchParams(window.location.search);
    const shouldForceRefresh = urlParams.has(BYPASS_CACHE_PARAM);
    
    if (shouldForceRefresh) {
      // Remove the param so we don't do this on every page load
      urlParams.delete(BYPASS_CACHE_PARAM);
      const newUrl = window.location.pathname + (urlParams.toString() ? `?${urlParams.toString()}` : '');
      window.history.replaceState({}, '', newUrl);
      
      // Force cache clear
      clearAllCaches().then(() => {
        console.log('Caches cleared due to nocache parameter');
        window.location.reload();
      });
      return;
    }

    // Set up polling for version changes
    let lastKnownVersion: string | null = null;
    
    const checkVersionAndRefresh = async () => {
      const currentVersion = await fetchCurrentVersion();
      console.log('Current version:', currentVersion);
      
      if (currentVersion) {
        if (lastKnownVersion === null) {
          // First check, just store the version
          lastKnownVersion = currentVersion;
        } else if (lastKnownVersion !== currentVersion) {
          // Version changed, set needRefresh to true
          console.log(`Version changed from ${lastKnownVersion} to ${currentVersion}`);
          setNeedRefresh(true);
        }
      }
    };

    // Initial check
    checkVersionAndRefresh();
    
    // Set up interval for checking
    const intervalId = window.setInterval(checkVersionAndRefresh, VERSION_CHECK_INTERVAL);
    versionCheckIntervalRef.current = intervalId as unknown as number;
    
    return () => {
      if (versionCheckIntervalRef.current !== null) {
        window.clearInterval(versionCheckIntervalRef.current);
      }
    };
  }, [setNeedRefresh]);

  // Function to clear all caches
  const clearAllCaches = async () => {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => {
            console.log('Clearing cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
        console.log('All caches cleared successfully');
      } catch (error) {
        console.error('Error clearing caches:', error);
      }
    }
  };

  const close = useCallback(() => {
    setOfflineReady(false);
    setNeedRefresh(false);

    if (notificationKey.current) {
      notificationsActions.close(notificationKey.current);
    }
  }, [setOfflineReady, setNeedRefresh, notificationsActions]);

  const handleReload = useCallback(async () => {
    console.log('Updating service worker and reloading the page');
    // First close the notification
    close();
    
    try {
      // Clear all caches first
      await clearAllCaches();
      
      // Set a flag to indicate that we did a force refresh
      localStorage.setItem(LAST_FORCE_REFRESH_KEY, Date.now().toString());
      
      // Try to update the service worker
      updateServiceWorker(true);
      
      console.log('%cService worker update triggered - reload should happen automatically', 
        'background:green; color:white; padding:4px 8px; border-radius:4px; font-weight:bold');
      
      // As a fallback, force page reload after a delay
      setTimeout(() => {
        console.log('%cForcing hard reload with cache clearing', 
          'background:orange; color:black; padding:4px 8px; border-radius:4px; font-weight:bold');
        
        // Force reload with cache bypass
        window.location.href = window.location.pathname + 
          (window.location.search ? window.location.search + '&' : '?') + 
          `${BYPASS_CACHE_PARAM}=${Date.now()}`;
      }, 1000);
    } catch (error) {
      console.error('Error during reload process:', error);
      // Last resort - just reload the page
      window.location.reload();
    }
  }, [close, updateServiceWorker]);

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
  }, [close, needRefresh, offlineReady, notificationsActions, handleReload]);

  return null;
}

export default SW;