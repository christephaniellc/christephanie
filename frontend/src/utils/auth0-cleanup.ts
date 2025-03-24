/**
 * Utility functions to clean up Auth0 tokens and session data
 * This helps prevent issues with persistent auth state after logout
 */

import { getConfig } from '@/auth_config';

/**
 * Aggressively clears all Auth0-related storage
 * @param clientId - The Auth0 client ID
 */
export function clearAllAuth0Data(clientId: string): void {
  console.log('Performing complete Auth0 data cleanup');
  
  // 1. Clear localStorage
  clearAuth0LocalStorage(clientId);
  
  // 2. Clear sessionStorage
  clearAuth0SessionStorage();
  
  // 3. Clear related cookies
  clearAuth0Cookies();
}

/**
 * Get the direct Auth0 logout URL that can be used as a last resort
 * This bypasses the Auth0 SDK entirely for maximum reliability
 */
export function getAuth0LogoutUrl(): string {
  const config = getConfig();
  const returnTo = encodeURIComponent(window.location.origin + '/');
  
  // Format: https://{domain}/v2/logout?client_id={clientId}&returnTo={url}
  return `https://${config.domain}/v2/logout?client_id=${config.clientId}&returnTo=${returnTo}`;
}

/**
 * Force a hard logout via direct Auth0 endpoint
 * This is more reliable than using the SDK in some cases
 */
export function forceAuth0Logout(): void {
  const logoutUrl = getAuth0LogoutUrl();
  console.log('Performing hard Auth0 logout via direct URL:', logoutUrl);
  window.location.href = logoutUrl;
}

/**
 * Creates a development helper button that can be called from the console
 * to perform a nuclear logout when testing auth issues
 */
export function createDevLoginDebugButton(): void {
  // Debug button disabled - no-op function
  return;
}

/**
 * Clears Auth0-related items from localStorage
 */
function clearAuth0LocalStorage(clientId: string): void {
  const allStorageKeys = Object.keys(localStorage);
  const auth0Keys = allStorageKeys.filter(key => 
    key.startsWith('@@auth0') || 
    key.includes(clientId) ||
    key.includes('auth0') ||
    key.includes('token') ||
    key.includes('login') ||
    key.includes('auth')
  );
  
  console.log(`Clearing ${auth0Keys.length} Auth0-related localStorage items`);
  auth0Keys.forEach(key => {
    try {
      localStorage.removeItem(key);
    } catch (err) {
      console.warn(`Failed to remove localStorage key: ${key}`, err);
    }
  });
}

/**
 * Clears Auth0-related items from sessionStorage
 */
function clearAuth0SessionStorage(): void {
  const sessionKeys = Object.keys(sessionStorage);
  const authKeys = sessionKeys.filter(key => 
    key.includes('auth') || 
    key.includes('redirect') ||
    key.includes('token')
  );
  
  console.log(`Clearing ${authKeys.length} Auth0-related sessionStorage items`);
  authKeys.forEach(key => {
    try {
      sessionStorage.removeItem(key);
    } catch (err) {
      console.warn(`Failed to remove sessionStorage key: ${key}`, err);
    }
  });
}

/**
 * Clears Auth0-related cookies
 */
function clearAuth0Cookies(): void {
  document.cookie.split(';').forEach(cookie => {
    const [name] = cookie.trim().split('=');
    if (name.includes('auth0') || name.includes('auth') || name.includes('session')) {
      console.log(`Clearing cookie: ${name}`);
      try {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        // Also try with different paths
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname}`;
      } catch (err) {
        console.warn(`Failed to clear cookie: ${name}`, err);
      }
    }
  });
}