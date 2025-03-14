import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import { rem } from 'polished';

// Define components that can be shared between SaveTheDatePage and SaveTheDateStepper
export const ButtonsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'space-between',
  gap: 16,
  justifyContent: 'center',
  width: '100%',
  height: 'auto',
  maxHeight: '100%', // Let parent container control the height constraint
  position: 'relative',
  overflowY: 'auto',
  overflowX: 'hidden',
}));