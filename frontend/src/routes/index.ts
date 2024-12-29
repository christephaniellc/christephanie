import AddTaskIcon from '@mui/icons-material/AddTask';
import GitHubIcon from '@mui/icons-material/GitHub';
import HomeIcon from '@mui/icons-material/Home';

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
    path: '/page-1',
    title: 'Page 1',
    icon: GitHubIcon,
  },
  [Pages.Profile]: {
    component: asyncComponentLoader(() => import('@/pages/Page2')),
    path: '/page-2',
    title: 'Page 2',
    icon: AddTaskIcon,
  },
  [Pages.NotFound]: {
    component: asyncComponentLoader(() => import('@/pages/NotFound')),
    path: '*',
  },
};

export default routes;
