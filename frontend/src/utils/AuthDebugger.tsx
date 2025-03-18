import { useEffect, useState } from 'react';
import { createDevLoginDebugButton } from './auth0-cleanup';

/**
 * Component that adds development tools for Auth0 debugging
 * Only appears in development environment
 */
export const AuthDebugger = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Only create button once and only in development
    if (!isInitialized && process.env.NODE_ENV !== 'prod') {
      try {
        createDevLoginDebugButton();
        setIsInitialized(true);
        console.log('Auth Debugger initialized');
      } catch (err) {
        console.error('Failed to initialize Auth Debugger', err);
      }
    }
  }, [isInitialized]);

  // This component doesn't render anything visible
  return null;
};

export default AuthDebugger;