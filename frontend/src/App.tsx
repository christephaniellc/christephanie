import { Fragment, Suspense, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import CssBaseline from '@mui/material/CssBaseline';

import { withErrorHandler } from '@/error-handling';
import AppErrorBoundaryFallback from '@/error-handling/fallbacks/App';
import Pages from '@/routes/Pages';
import HotKeys from '@/sections/HotKeys';
import Notifications from '@/sections/Notifications';
import SW from '@/sections/SW';
import Sidebar from '@/sections/Sidebar';
import BottomNav from '@/components/BottomNav';
import Loading from '@/components/Loading';
import './assets/styles/fonts.css';

// Import the Auth debugger for development mode
import AuthDebugger from '@/utils/AuthDebugger';

function App() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth0();

  // Check for redirects after login
  useEffect(() => {
    // If auth is complete and not loading
    if (!isLoading) {
      // Check for stored redirect path from login
      const storedRedirectPath = sessionStorage.getItem('auth_redirect_to');
      if (storedRedirectPath) {
        console.log('App: Redirecting to stored path after login:', storedRedirectPath);
        sessionStorage.removeItem('auth_redirect_to'); // Clear it after use
        
        // Use a small delay to ensure this navigation takes precedence
        setTimeout(() => {
          navigate(storedRedirectPath, { replace: true });
        }, 100);
      }
    }
  }, [isLoading, isAuthenticated, navigate]);

  return (
    <>
      <CssBaseline />
      <Notifications />
      <HotKeys />
      <SW />
      {false && <AuthDebugger />}

      <Sidebar />
      <Suspense fallback={<Loading />}>
        <Pages />
      </Suspense>
      <BottomNav />
    </>
  );
}

export default withErrorHandler(App, AppErrorBoundaryFallback);
