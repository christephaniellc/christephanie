import AddTaskIcon from '@mui/icons-material/AddTask';
import GitHubIcon from '@mui/icons-material/GitHub';
import HomeIcon from '@mui/icons-material/Home';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PrintIcon from '@mui/icons-material/Print';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import BarChartIcon from '@mui/icons-material/BarChart';
import BugReportIcon from '@mui/icons-material/BugReport';

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
    icon: GitHubIcon,
  },
  [Pages.RSVP]: {
    component: asyncComponentLoader(() => import('@/pages/RSVP')),
    path: '/rsvp',
    title: 'RSVP',
    icon: GitHubIcon,
  },
  [Pages.Details]: {
    component: asyncComponentLoader(() => import('@/pages/Info')),
    path: '/details',
    title: 'Details',
    icon: GitHubIcon,
  },
  [Pages.Registry]: {
    component: asyncComponentLoader(() => import('@/pages/Registry')),
    path: '/registry',
    title: 'Registry',
    icon: GitHubIcon,
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
    icon: AddTaskIcon,
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
    icon: BarChartIcon,
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
