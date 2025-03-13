export function getEnumValueByIndex<T>(enumObj: T, index: number): T[keyof T] {
  const values = Object.values(enumObj) as T[keyof T][];
  return values[index];
}

import { BrowserInfoDto, ClientInfoDto, ConnectionInfoDto, DeviceInfoDto, StorageSupportInfoDto } from '@/types/api';

/**
 * Safely collects client information for telemetry purposes
 */
export const collectClientInfo = (): ClientInfoDto => {
  try {
    // Make sure we're in a browser environment
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return {
        dateRecorded: new Date(),
      };
    }

    // Get browser info
    const userAgent = navigator.userAgent;
    const browserMatch = userAgent.match(/(chrome|safari|firefox|msie|trident|edge(?=\/))\/?\s*(\d+)/i) || [];
    const browserName = browserMatch[1]?.toLowerCase() || 'unknown';
    const browserVersion = browserMatch[2] || '';

    // Get connection info if available
    let connection: ConnectionInfoDto | undefined;
    if ('connection' in navigator && navigator.connection) {
      const conn = navigator.connection as any;
      connection = {
        effectiveType: conn.effectiveType,
        downlink: conn.downlink,
      };
    }

    // Get device info
    let device: DeviceInfoDto = {
      type: /mobile|android|iphone|ipad|ipod/i.test(userAgent) ? 'mobile' : 'desktop',
      touchSupport: 'ontouchstart' in window,
      hardwareConcurrency: navigator.hardwareConcurrency?.toString(),
      deviceMemory: (navigator as any).deviceMemory?.toString(),
    };

    // Storage support
    const storageSupport: StorageSupportInfoDto = {
      cookiesEnabled: navigator.cookieEnabled,
      localStorageEnabled: (() => {
        try {
          localStorage.setItem('test', 'test');
          localStorage.removeItem('test');
          return true;
        } catch (e) {
          return false;
        }
      })(),
    };

    // Create the client info object
    return {
      dateRecorded: new Date(),
      os: navigator.platform,
      browser: {
        name: browserName,
        version: browserVersion,
        userAgent,
      },
      screen: {
        width: window.screen.width,
        height: window.screen.height,
        colorDepth: window.screen.colorDepth,
      },
      language: navigator.language,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      device,
      connection,
      geolocation: undefined, // We're not collecting geolocation for privacy reasons
      referrer: document.referrer,
      storageSupport,
    };
  } catch (error) {
    console.error('Error collecting client info:', error);
    // Return minimal info in case of error
    return {
      dateRecorded: new Date(),
      browser: {
        name: 'unknown',
        version: 'error',
        userAgent: 'error collecting info',
      }
    };
  }
}