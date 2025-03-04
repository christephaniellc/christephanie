import AddTaskIcon from '@mui/icons-material/AddTask';
import GitHubIcon from '@mui/icons-material/GitHub';
import HomeIcon from '@mui/icons-material/Home';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

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
  [Pages.Profile]: {
    component: asyncComponentLoader(() => import('@/pages/Profile')),
    path: '/profile',
    title: 'Profile',
    icon: AddTaskIcon,
  },
  [Pages.FoodPreferences]: {
    component: asyncComponentLoader(() => import('@/pages/Page4')),
    path: '/food-preferences',
    title: 'Food Preferences',
    icon: AddTaskIcon,
  },
  [Pages.PrivacyPolicy]: {
    component: asyncComponentLoader(() => import('@/pages/PrivacyPolicy')),
    path: '/privacy-policy',
    title: 'Privacy Policy',
    icon: AddTaskIcon,
  },
  [Pages.TermsOfService]: {
    component: asyncComponentLoader(() => import('@/pages/TermsOfService')),
    path: '/terms-of-service',
    title: 'TermsOfService',
    icon: AddTaskIcon,
  },
  [Pages.AboutUs]: {
    component: asyncComponentLoader(() => import('@/pages/AboutUs')),
    path: '/about-us',
    title: 'AboutUs',
    icon: AddTaskIcon,
  },
  [Pages.Admin]: {
    component: asyncComponentLoader(() => import('@/pages/Admin')),
    path: '/admin',
    title: 'Admin',
    icon: AdminPanelSettingsIcon,
  },
  [Pages.NotFound]: {
    component: asyncComponentLoader(() => import('@/pages/NotFound')),
    path: '*',
  },
};

export default routes;
