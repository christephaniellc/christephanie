/**
 * Feature flags configuration file
 * 
 * This file contains flags that can be used to enable or disable features
 * throughout the application. This is useful for features that are:
 * 
 * 1. Still in development
 * 2. Waiting for external dependencies (like API approval)
 * 3. Being A/B tested
 * 4. Deployed but not yet ready for public use
 */

export const FeatureFlags = {
  // Communication preferences features
  ENABLE_COMMUNICATION_PREFERENCES: true, // Main flag to enable/disable the entire feature
  ENABLE_EMAIL_VERIFICATION: true,        // Enable email verification flow
  ENABLE_SMS_VERIFICATION: false,          // Enable SMS verification flow
  
  // Pages
  ENABLE_RSVP: false,
  ENABLE_REGISTRY: false,
  ENABLE_DETAILS: false,
  ENABLE_DETAILS_ABOUTUS: false,
  ENABLE_DETAILS_ACCOMMODATIONS: false,
  ENABLE_DETAILS_TRAVEL: false,
  ENABLE_DETAILS_ATTIRE: false,
  ENABLE_DETAILS_SCHEDULE: false,
  ENABLE_DETAILS_THINGS_TO_DO: false,

  // Phase
  ENABLE_SURVEY_PHASE: true,
  ENABLE_RSVP_PHASE: false,
  ENABLE_WEDDING_PHASE: false
};

/**
 * Helper function to check if a feature is enabled
 * @param flagName The name of the feature flag to check
 * @returns boolean indicating whether the feature is enabled
 */
export const isFeatureEnabled = (flagName: keyof typeof FeatureFlags): boolean => {
  // You could add additional logic here, like checking URL parameters
  // for testing in development, or checking user roles for admin features
  
  // For now, just return the flag value
  return FeatureFlags[flagName];
};