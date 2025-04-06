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
import FavoriteIcon from '@mui/icons-material/Favorite';
import HotelIcon from '@mui/icons-material/Hotel';
import FlightIcon from '@mui/icons-material/Flight';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import EventIcon from '@mui/icons-material/Event';
import ExploreIcon from '@mui/icons-material/Explore';
import FactCheckIcon from '@mui/icons-material/FactCheck';

import asyncComponentLoader from '@/utils/loader';

import { Pages, Routes } from './types';

// Main site routes
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
    component: asyncComponentLoader(() => import('@/pages/DetailsPage')),
    path: '/details',
    title: 'Stone Manor Wedding Details',
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
  // Bachelor Party route
  [Pages.BachelorParty]: {
    component: asyncComponentLoader(() => import('@/pages/BachelorParty')),
    path: '/bachelor-party',
    title: 'Bachelor Party',
    icon: FactCheckIcon,
  },
};

// Routes for individual detail tabs - these all go to the details page but with a specific tab active
export const detailsRoutes = {
  aboutUs: {
    path: '/details/about-us',
    title: 'About Us',
    icon: FavoriteIcon,
    tabIndex: 0,
  },
  accommodations: {
    path: '/details/accommodations',
    title: 'Accommodations',
    icon: HotelIcon,
    tabIndex: 1,
  },
  travel: {
    path: '/details/travel',
    title: 'Travel',
    icon: FlightIcon,
    tabIndex: 2,
  },
  attire: {
    path: '/details/attire',
    title: 'Attire',
    icon: CheckroomIcon,
    tabIndex: 3,
  },
  schedule: {
    path: '/details/schedule',
    title: 'Schedule',
    icon: EventIcon,
    tabIndex: 4,
  },
  thingsToDo: {
    path: '/details/things-to-do',
    title: 'Things to Do',
    icon: ExploreIcon,
    tabIndex: 5,
  },
};

export default routes;