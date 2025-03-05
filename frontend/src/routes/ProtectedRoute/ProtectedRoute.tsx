import { ReactNode, useContext, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { CircularProgress, Box, Typography } from '@mui/material';
import { useRecoilValue } from 'recoil';
import { userState } from '@/store/user';
import { isAdmin } from '@/utils/roles';
import routes from '@/routes';
import { Pages } from '@/routes/types';
import { ApiContext } from '@/context/ApiContext';
import { useAuth0 } from '@auth0/auth0-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

/**
 * A wrapper component that protects routes requiring admin role
 */
const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const user = useRecoilValue(userState);
  const apiContext = useContext(ApiContext);
  const { isAuthenticated, isLoading } = useAuth0();
  const userHasAdmin = isAdmin(user);
  
  // Try to ensure we have the latest user data with roles
  useEffect(() => {
    if (isAuthenticated && !userHasAdmin && requireAdmin) {
      console.log('Protected route: Refreshing user data to check for admin role...');
      apiContext.getMeQuery.refetch()
        .then(response => {
          console.log('ProtectedRoute: User refresh response:', response.data);
        })
        .catch(err => {
          console.error('ProtectedRoute: Failed to refresh user data:', err);
        });
    }
  }, [isAuthenticated, requireAdmin, userHasAdmin, apiContext.getMeQuery]);

  // If Auth0 is still loading or we're still loading user data, show a loading spinner
  if (isLoading || (!user?.guestId && isAuthenticated)) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>Loading user data...</Typography>
      </Box>
    );
  }
  
  // If admin role is required but user is not admin, redirect to home
  if (requireAdmin && !userHasAdmin) {
    console.log('ProtectedRoute: Access denied - admin required');
    return <Navigate to={routes[Pages.Welcome].path!} replace />;
  }
  
  // Otherwise, render the children
  return <>{children}</>;
};

export default ProtectedRoute;