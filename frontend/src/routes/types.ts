import { FC } from 'react';
import { PathRouteProps } from 'react-router-dom';

import type { SvgIconProps } from '@mui/material/SvgIcon';

enum Pages {
  Welcome,
  SaveTheDate,
  RSVP,
  Details,
  Registry,
  Profile,
  Bureaucracy,
  Stats,
  Admin,
  VerifyEmail,
  PrintedRsvp,
  Debug,
  NotFound,
  BachelorParty, // Added for bachelor party page
}

type PathRouteCustomProps = {
  title?: string;
  component: FC;
  icon?: FC<SvgIconProps>;
};

type Routes = Record<Pages, PathRouteProps & PathRouteCustomProps>;

// Type for details sub-routes
type DetailRouteProps = {
  path: string;
  title: string;
  icon: FC<SvgIconProps>;
  tabIndex: number;
};

// Type for all details routes
type DetailsRoutes = Record<string, DetailRouteProps>;

export type { Routes, DetailsRoutes, DetailRouteProps };
export { Pages };
