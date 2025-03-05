import { Route, Routes } from 'react-router-dom';
import Box from '@mui/material/Box';

import routes from '..';
import { useAppLayout } from '@/context/Providers/AppState/useAppLayout';
import { Pages as PageEnum } from '@/routes/types';
import ProtectedRoute from '@/routes/ProtectedRoute';

function Pages() {
  const { contentHeight } = useAppLayout();
  return (
    <Box sx={{ height: contentHeight, overflow: 'hidden' }}>
      <Routes>
        {Object.entries(routes).map(([pageKey, { path, component: Component }]) => {
          const page = parseInt(pageKey) as PageEnum;
          
          // Wrap Admin page with ProtectedRoute
          if (page === PageEnum.Admin) {
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
          
          // Regular routes
          return <Route key={path} path={path} element={<Component />} />;
        })}
      </Routes>
    </Box>
  );
}

export default Pages;