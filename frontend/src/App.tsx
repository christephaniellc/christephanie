import { Fragment, Suspense } from 'react';

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

function App() {
  return (
    <>
      <CssBaseline />
      <Notifications />
      <HotKeys />
      <SW />

      <Sidebar />
      <Suspense fallback={<Loading />}>
        <Pages />
      </Suspense>
      <BottomNav />
    </>
  );
}

export default withErrorHandler(App, AppErrorBoundaryFallback);
