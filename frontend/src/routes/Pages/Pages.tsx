import { Route, Routes } from 'react-router-dom';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import routes, { detailsRoutes } from '..';
import { useAppLayout } from '@/context/Providers/AppState/useAppLayout';
import { Pages as PageEnum } from '@/routes/types';
import ProtectedRoute from '@/routes/ProtectedRoute';

function Pages() {
  const { contentHeight } = useAppLayout();
  const theme = useTheme();

  // Get the Details component
  const DetailsComponent = routes[PageEnum.Details].component;

  // Build all route entries into one flat array
  const allRoutes: JSX.Element[] = [
    // Sub-routes for Details
    ...Object.values(detailsRoutes).map(({ path }) => (
      <Route key={path} path={path} element={<DetailsComponent />} />
    )),

    // Main routes
    ...Object.entries(routes).flatMap(([pageKey, { path, component: Component }]) => {
      const page = parseInt(pageKey) as PageEnum;

      if (page === PageEnum.PrintedRsvp) {
        return [
          <Route
            key={path}
            path={path}
            element={
              <ProtectedRoute requireAdmin>
                <Component />
              </ProtectedRoute>
            }
          />
        ];
      }

      if (page === PageEnum.Admin) {
        const subPaths = [
          '',
          '/edit',
          '/details',
          '/summary',
          '/printed-invite',
          '/notifications'
        ];
        return subPaths.map(suffix => (
          <Route
            key={`${path}${suffix}`}
            path={`${path}${suffix}`}
            element={
              <ProtectedRoute requireAdmin>
                <Component />
              </ProtectedRoute>
            }
          />
        ));
      }

      return [
        <Route
          key={path}
          path={path}
          element={<Component />}
        />
      ];
    })
  ];

  return (
    <Box>
      <Box
        sx={{
          height: 'auto',
          overflow: 'auto',
          padding: 0,
          paddingBottom: theme.spacing(8),
        }}
      >
        <Routes>{allRoutes}</Routes>
      </Box>
    </Box>
  );
}

export default Pages;
