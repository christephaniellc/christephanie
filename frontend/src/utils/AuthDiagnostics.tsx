import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useRecoilValue } from 'recoil';
import { userState } from '@/store/user';
import { isAdmin } from '@/utils/roles';
import { useApiContext } from '@/context/ApiContext';

/**
 * Component for diagnosing authorization issues
 * Only logs to console for debugging - renders nothing
 */
export const AuthDiagnostics = () => {
  const { user: auth0User, getAccessTokenSilently, isAuthenticated } = useAuth0();
  const currentUser = useRecoilValue(userState);
  const { getMeQuery } = useApiContext();

  useEffect(() => {
    const runDiagnostics = async () => {
      if (!isAuthenticated || !auth0User) {
        console.log('🔍 Auth Diagnostics: User not authenticated');
        return;
      }

      console.log('🔍 Auth Diagnostics Starting...');
      
      // Log Auth0 user info
      console.log('📋 Auth0 User:', {
        sub: auth0User.sub,
        email: auth0User.email,
        email_verified: auth0User.email_verified,
        nickname: auth0User.nickname,
        name: auth0User.name,
        picture: auth0User.picture
      });

      // Log current user state from Recoil
      console.log('👤 Current User State:', {
        guestId: currentUser.guestId,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        email: currentUser.email,
        roles: currentUser.roles,
        isAdmin: isAdmin(currentUser)
      });

      // Log getMeQuery status
      console.log('🔄 GetMe Query:', {
        isLoading: getMeQuery?.isLoading,
        isSuccess: getMeQuery?.isSuccess,
        isError: getMeQuery?.isError,
        error: getMeQuery?.error,
        data: getMeQuery?.data ? {
          guestId: getMeQuery.data.guestId,
          roles: getMeQuery.data.roles,
          email: getMeQuery.data.email
        } : null
      });

      // Get and decode current access token
      try {
        const token = await getAccessTokenSilently();
        if (token) {
          // Decode JWT payload
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          const decodedToken = JSON.parse(jsonPayload);
          
          console.log('🎫 Current Access Token Claims:', {
            sub: decodedToken.sub,
            aud: decodedToken.aud,
            iss: decodedToken.iss,
            exp: decodedToken.exp ? new Date(decodedToken.exp * 1000).toISOString() : 'unknown',
            iat: decodedToken.iat ? new Date(decodedToken.iat * 1000).toISOString() : 'unknown',
            scope: decodedToken.scope,
            azp: decodedToken.azp,
            gty: decodedToken.gty,
            permissions: decodedToken.permissions,
            // Check for any custom claims that might contain roles
            'https://christephanie.com/roles': decodedToken['https://christephanie.com/roles'],
            'https://christephanie.com/user_metadata': decodedToken['https://christephanie.com/user_metadata'],
            'https://christephanie.com/app_metadata': decodedToken['https://christephanie.com/app_metadata'],
            // Show all claims for debugging
            allClaims: decodedToken
          });
        } else {
          console.log('❌ No access token available');
        }
      } catch (error) {
        console.error('❌ Failed to decode access token:', error);
      }

      console.log('🔍 Auth Diagnostics Complete');
    };

    // Run diagnostics when user state changes
    if (isAuthenticated) {
      runDiagnostics();
    }
  }, [isAuthenticated, auth0User, currentUser, getMeQuery?.data, getMeQuery?.isSuccess, getMeQuery?.isError]);

  // This component doesn't render anything
  return null;
};

export default AuthDiagnostics;