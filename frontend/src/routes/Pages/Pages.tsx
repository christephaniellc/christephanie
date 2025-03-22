import { Route, Routes } from 'react-router-dom';
import Box from '@mui/material/Box';

import routes from '..';
import { useAppLayout } from '@/context/Providers/AppState/useAppLayout';
import { Pages as PageEnum } from '@/routes/types';
import ProtectedRoute from '@/routes/ProtectedRoute';
import AppVersionFooter from '@/components/VersionHash';

function Pages() {
  const { contentHeight } = useAppLayout();
  return (
    <Box>
      <Box sx={{ height: contentHeight, overflow: 'hidden' }}>
        <Routes>
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
            
            // Stats page (formerly Admin) requires only authentication
            if (page === PageEnum.Admin) {
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
      <Box
        sx={{        
          background: "transparent"
        }}>        
        {AppVersionFooter()}
      </Box>
    </Box>
  );
}

export default Pages;