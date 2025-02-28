import { Route, Routes } from 'react-router-dom';

import Box from '@mui/material/Box';

import routes from '..';
import { useAppLayout } from '@/context/Providers/AppState/useAppLayout';

function Pages() {
  const { contentHeight } = useAppLayout();
  return (
    <Box sx={{ height: contentHeight, border: '1px solid blue' }}>
      <Routes>
        {Object.values(routes).map(({ path, component: Component }) => {
          return <Route key={path} path={path} element={<Component />} />;
        })}
      </Routes>
    </Box>
  );
}

export default Pages;
