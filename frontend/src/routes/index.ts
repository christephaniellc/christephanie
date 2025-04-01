import AddTaskIcon from '@mui/icons-material/AddTask';
import HomeIcon from '@mui/icons-material/Home';
import PrintIcon from '@mui/icons-material/Print';
import BarChartIcon from '@mui/icons-material/BarChart';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import GiftCardIcon from '@mui/icons-material/CardGiftcard';
import ConnectWithoutContactIcon from '@mui/icons-material/ConnectWithoutContact';
import GavelIcon from '@mui/icons-material/Gavel';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';

import asyncComponentLoader from '@/utils/loader';

import { Pages, Routes } from './types';

const routes: Routes = {
  [Pages.Welcome]: {
    component: asyncComponentLoader(() => import('@/pages/Welcome')),
    path: '/',
    title: 'Welcome',
    icon: HomeIcon,
  },
  [Pages.SaveTheDate]: {
    component: asyncComponentLoader(() => import('@/pages/SaveTheDate')),
    path: '/save-the-date',
    title: 'Save the Date',
    icon: ConnectWithoutContactIcon,
  },
  [Pages.RSVP]: {
    component: asyncComponentLoader(() => import('@/pages/RSVP')),
    path: '/rsvp',
    title: 'RSVP',
    icon: SaveAsIcon,
  },
  [Pages.Details]: {
    component: asyncComponentLoader(() => import('@/pages/Info')),
    path: '/details',
    title: 'Details',
    icon: AutoAwesomeIcon,
  },
  [Pages.Registry]: {
    component: asyncComponentLoader(() => import('@/pages/Registry')),
    path: '/registry',
    title: 'Registry',
    icon: GiftCardIcon,
  },
  [Pages.Profile]: {
    component: asyncComponentLoader(() => import('@/pages/Profile')),
    path: '/profile',
    title: 'Profile',
    icon: AddTaskIcon,
  },
  [Pages.Bureaucracy]: {
    component: asyncComponentLoader(() => import('@/pages/Bureaucracy/Bureaucracy')),
    path: '/about-us',
    title: 'About Christephanie LLC',
    icon: GavelIcon,
  },
  [Pages.Stats]: {
    component: asyncComponentLoader(() => import('@/pages/Stats')),
    path: '/stats',
    title: 'Wedding Stats',
    icon: BarChartIcon,
  },
  [Pages.Admin]: {
    component: asyncComponentLoader(() => import('@/pages/Admin')),
    path: '/admin',
    title: 'Admin Functions',
    icon: AutoFixHighIcon,
  },
  [Pages.VerifyEmail]: {
    component: asyncComponentLoader(() => import('@/pages/VerifyEmail')),
    path: '/verify-email',
    title: 'Verify Email',
  },
  [Pages.PrintedRsvp]: {
    component: asyncComponentLoader(() => import('@/pages/PrintedRsvp')),
    path: '/printed-rsvp',
    title: 'Printed RSVP',
    icon: PrintIcon,
  },
  [Pages.Debug]: {
    component: asyncComponentLoader(() => import('@/pages/Cors/CorsPage')),
    path: '/debug',
    title: 'CORS Debugger',
    // No icon to avoid showing in navigation
  },
  [Pages.NotFound]: {
    component: asyncComponentLoader(() => import('@/pages/NotFound')),
    path: '*',
  },
};

export default routes;
