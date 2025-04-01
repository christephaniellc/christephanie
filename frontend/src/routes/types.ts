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
  NotFound
}

type PathRouteCustomProps = {
  title?: string;
  component: FC;
  icon?: FC<SvgIconProps>;
};

type Routes = Record<Pages, PathRouteProps & PathRouteCustomProps>;

export type { Routes };
export { Pages };
