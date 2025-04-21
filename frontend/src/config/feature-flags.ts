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
  ENABLE_REGISTRY: true,
  ENABLE_DETAILS: true,
  ENABLE_DETAILS_ABOUTUS: true,
  ENABLE_DETAILS_ACCOMMODATIONS: true,
  ENABLE_DETAILS_TRAVEL: false,
  ENABLE_DETAILS_ATTIRE: true,
  ENABLE_DETAILS_SCHEDULE: true,
  ENABLE_DETAILS_SCHEDULE_WEDDINGDAY: false,
  ENABLE_DETAILS_THINGS_TO_DO: false,

  // Phase
  ENABLE_SURVEY_PHASE: false,
  ENABLE_RSVP_PHASE: true,
  ENABLE_WEDDING_PHASE: false,
  
  // RSVP Components
  ENABLE_WEDDING_ATTENDANCE_SLIDER: true
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