import { useEffect, useState } from 'react';
import { createDevLoginDebugButton } from './auth0-cleanup';

/**
 * Component that adds development tools for Auth0 debugging
 * Only appears in development environment
 */
export const AuthDebugger = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const env = import.meta.env.VITE_ENV || 'development';
    // Only create button once and only in development
    if (!isInitialized && env !== 'prod' && env !== 'production') {
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