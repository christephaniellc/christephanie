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
  maxHeight: 'calc(100% - 150px)', // Adjusted to account for bottom navigation buttons
  height: 'auto',
  paddingBottom: rem('100px'), // Increased padding to ensure content doesn't overlap with buttons
  position: 'relative',
  overflow: 'auto',
  [theme.breakpoints.down('sm')]: {
    paddingBottom: rem('150px'), // Even more padding on mobile
  }
}));