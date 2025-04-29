/**
 * Utility function to force a complete refresh by clearing caches and reloading
 */

export async function forceRefresh() {
  console.log('🧹 Starting force refresh process...');
  
  // Step 1: Clear all caches
  if ('caches' in window) {
    try {
      console.log('Clearing all browser caches...');
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => {
          console.log(`- Deleting cache: ${cacheName}`);
          return caches.delete(cacheName);
        })
      );
      console.log('✅ All caches cleared successfully');
    } catch (error) {
      console.error('❌ Error clearing caches:', error);
    }
  } else {
    console.warn('⚠️ Cache API not available in this browser');
  }
  
  // Step 2: Unregister service workers
  if ('serviceWorker' in navigator) {
    try {
      console.log('Unregistering service workers...');
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        registrations.map(registration => {
          console.log(`- Unregistering service worker: ${registration.scope}`);
          return registration.unregister();
        })
      );
      console.log('✅ All service workers unregistered');
    } catch (error) {
      console.error('❌ Error unregistering service workers:', error);
    }
  } else {
    console.warn('⚠️ Service Worker API not available in this browser');
  }
  
  // Step 3: Force reload with cache bypass
  console.log('🔄 Reloading page with cache bypass...');
  // Add a nocache parameter to force a clean reload
  window.location.href = window.location.pathname + 
    (window.location.search ? window.location.search + '&' : '?') + 
    `nocache=${Date.now()}`;
}

// Export a global function that users can call from the console
(window as any).forceRefresh = forceRefresh;

export default forceRefresh;