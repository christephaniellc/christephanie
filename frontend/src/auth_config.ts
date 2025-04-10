/**
 * Configuration for different environments
 */
 
export type Config = {
  domain: string;
  clientId: string;
  audience: string;
  webserviceUrl: string;
  returnTo: string;
  stripePublicKey: string;
}

// Fixed development config - used in Jest environment
const DEV_CONFIG: Config = {
  domain: "christephanie.us.auth0.com",
  clientId: "sAJY1fIiPwOLa0z1SUzXZzD3Hp1vjuV5",
  audience: "https://fianceapi.dev.wedding.christephanie.com",
  webserviceUrl: "https://fianceapi.dev.wedding.christephanie.com",
  returnTo: "https://www.dev.wedding.christephanie.com",
  stripePublicKey: "pk_test_51R9Ynf2fLHdiDfDYE4j29s49kjr6g5JOcF6qTUH29dBM4iTAck7k7HasED7jwXxzp2URulNwV3sRaBtDu3VRpge400EVCA9Mno"
};

const PROD_CONFIG: Config = {
  domain: "christephanie.us.auth0.com",
  clientId: "wWcIuy2ILD0fvUucUzJlicIPUEHSa2f6",
  audience: "https://fianceapi.wedding.christephanie.com",
  webserviceUrl: "https://fianceapi.wedding.christephanie.com",
  returnTo: "https://www.wedding.christephanie.com",
  stripePublicKey: "pk_live_51R9YnJK8kEf0vyv7vrL97dO3Acz14890H4fuMdPxWboSbwqovju6OwldFd2jmnSvBROo4o4osKKMkDGlLez5RKfp00xMwXuaV8"
};

// Test config that is used in automated tests
export const TEST_CONFIG: Config = {
  domain: "test-domain.example.com",
  clientId: "test-client-id", 
  audience: "https://test-api.example.com",
  webserviceUrl: "https://test-api.example.com",
  returnTo: "https://test-return.example.com",
  stripePublicKey: (import.meta.env.STRIPE_PUBLIC_KEY) ? import.meta.env.STRIPE_PUBLIC_KEY : "pk_test_testttttttttttttttttttttttt"
};

// Environment-specific config using Vite environment variables from CI
const ENV_CONFIG: Config | null = (() => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    // Check if we have direct config values from GitHub Actions
    if (import.meta.env.DOMAIN && 
        import.meta.env.CLIENT_ID && 
        import.meta.env.AUDIENCE && 
        import.meta.env.WEBSERVICE_URL && 
        import.meta.env.RETURN_TO &&
        import.meta.env.STRIPE_PUBLIC_KEY) {
      return {
        domain: import.meta.env.DOMAIN,
        clientId: import.meta.env.CLIENT_ID,
        audience: import.meta.env.AUDIENCE,
        webserviceUrl: import.meta.env.WEBSERVICE_URL,
        returnTo: import.meta.env.RETURN_TO,
        stripePublicKey: import.meta.env.STRIPE_PUBLIC_KEY
      };
    }
  }
  return null;
})();

/**
 * Get application configuration
 * Simple implementation that works in both browser and test environments
 */
export function getConfig(): Config {
  // For test environments in Jest
  if (typeof window !== 'undefined' && (window as any).__TEST__) {
    return TEST_CONFIG;
  }
  
  // If we have environment-specific config from GitHub Actions
  if (ENV_CONFIG) {
    return ENV_CONFIG;
  }
  
  // For browser environments with Vite
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const env = import.meta.env.VITE_ENV || 'development';
    
    // Use production config when env is set to 'production'
    if (env === 'production') {
      return PROD_CONFIG;
    }
  }
  
  // Default to DEV_CONFIG for development and fallback
  return DEV_CONFIG;
}