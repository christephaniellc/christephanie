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

  // Get the Details component from routes
  const DetailsComponent = routes[PageEnum.Details].component;

  return (
    <Box>
      <Box 
        sx={{ 
          height: 'auto', 
          overflow: 'auto',
          padding: 0,
          paddingBottom: theme.spacing(8)
        }}
      >
        <Routes>
          {/* Add detail sub-routes */}
          {Object.values(detailsRoutes).map(({ path, tabIndex }) => (
            <Route 
              key={path} 
              path={path} 
              element={<DetailsComponent />} 
            />
          ))}
          
          {/* Add main routes */}
          {Object.entries(routes).map(([pageKey, { path, component: Component }]) => {
            const page = parseInt(pageKey) as PageEnum;
            
            // PrintedRsvp page requires admin role
            if (page === PageEnum.PrintedRsvp) {
              return (
                <Route 
                  key={path} 
                  path={path} 
                  element={
                    <ProtectedRoute requireAdmin>
                      <Component />
                    </ProtectedRoute>
                  } 
                />
              );
            }
            
            // Admin page and its sub-pages require admin role
            if (page === PageEnum.Admin) {
              return (
                <>
                  <Route 
                    key={path} 
                    path={path} 
                    element={
                      <ProtectedRoute requireAdmin>
                        <Component />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    key={`${path}/edit`} 
                    path={`${path}/edit`} 
                    element={
                      <ProtectedRoute requireAdmin>
                        <Component />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    key={`${path}/details`} 
                    path={`${path}/details`} 
                    element={
                      <ProtectedRoute requireAdmin>
                        <Component />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    key={`${path}/summary`} 
                    path={`${path}/summary`} 
                    element={
                      <ProtectedRoute requireAdmin>
                        <Component />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    key={`${path}/printed-invite`} 
                    path={`${path}/printed-invite`} 
                    element={
                      <ProtectedRoute requireAdmin>
                        <Component />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    key={`${path}/notifications`} 
                    path={`${path}/notifications`} 
                    element={
                      <ProtectedRoute requireAdmin>
                        <Component />
                      </ProtectedRoute>
                    } 
                  />
                </>
              );
            }
            
            // Stats page requires only authentication
            if (page === PageEnum.Stats) {
              return (
                <Route 
                  key={path} 
                  path={path} 
                  element={
                      <Component />
                  }
                />
              );
            }
            
            // Regular routes
            return <Route key={path} path={path} element={<Component />} />;
          })}
        </Routes>
      </Box>
    </Box>
  );
}

export default Pages;