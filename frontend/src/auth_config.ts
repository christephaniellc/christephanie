/**
 * Configuration for different environments
 */
 
export type Config = {
  domain: string;
  clientId: string;
  audience: string;
  webserviceUrl: string;
  returnTo: string;
}

// Fixed development config - used in Jest environment
const DEV_CONFIG: Config = {
  domain: "christephanie.us.auth0.com",
  clientId: "sAJY1fIiPwOLa0z1SUzXZzD3Hp1vjuV5",
  audience: "https://fianceapi.dev.wedding.christephanie.com",
  webserviceUrl: "https://fianceapi.dev.wedding.christephanie.com",
  returnTo: "https://www.dev.wedding.christephanie.com"
};

// Test config that is used in automated tests
export const TEST_CONFIG: Config = {
  domain: "test-domain.example.com",
  clientId: "test-client-id", 
  audience: "https://test-api.example.com",
  webserviceUrl: "https://test-api.example.com",
  returnTo: "https://test-return.example.com"
};

/**
 * Get application configuration
 * Simple implementation that works in both browser and test environments
 */
export function getConfig(): Config {
  // Just return the dev config for tests and development
  // This is mocked in tests to return TEST_CONFIG
  return DEV_CONFIG;
}

// This is here for Vite environment but not used in Jest
// The commented code is for typechecking only
/*
function getRealConfig() {
  let env = 'development';
  
  // @ts-ignore - Vite-specific code
  if (import.meta?.env?.VITE_ENV) {
    // @ts-ignore - Vite-specific
    env = import.meta.env.VITE_ENV;
  }
  
  return env;
}
*/