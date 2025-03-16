import { useAuth0 } from '@auth0/auth0-react';
import { Theme, useTheme } from '@mui/material/styles';

const mockUseAuth0 = (returnValue: Partial<ReturnType<typeof useAuth0>>) => {
  (useAuth0 as jest.Mock).mockReturnValue(returnValue);
};

// Create a partial theme mock that matches the structure MUI expects
const defaultTheme = {
  // Cast to any to avoid TypeScript errors with partial implementation
  palette: {
    mode: 'light',
    primary: {
      main: '#3f51b5',
      light: '#7986cb',
      dark: '#303f9f',
      contrastText: '#fff'
    },
    secondary: {
      main: '#E9950C',
      light: '#ffb74d',
      dark: '#f57c00',
      contrastText: '#fff'
    },
    success: {
      main: '#4caf50',
      light: '#81c784',
      dark: '#388e3c',
      contrastText: 'rgba(0, 0, 0, 0.87)'
    },
    error: {
      main: '#f44336',
      light: '#e57373',
      dark: '#d32f2f',
      contrastText: '#fff'
    },
    warning: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00',
      contrastText: 'rgba(0, 0, 0, 0.87)'
    },
    info: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1976d2',
      contrastText: '#fff'
    },
    grey: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#eeeeee',
      300: '#e0e0e0',
      400: '#bdbdbd',
      500: '#9e9e9e',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
      A100: '#d5d5d5',
      A200: '#aaaaaa',
      A400: '#303030',
      A700: '#616161'
    },
    common: {
      black: '#000',
      white: '#fff'
    },
    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.6)',
      disabled: 'rgba(0, 0, 0, 0.38)'
    },
    divider: 'rgba(0, 0, 0, 0.12)',
    background: {
      paper: '#fff',
      default: '#fafafa'
    },
    contrastThreshold: 3,
    tonalOffset: 0.2
  },
  shape: {
    borderRadius: 4
  },
  // Using any to bypass TypeScript's strict checking for the shadows array
  shadows: Array(25).fill('none') as any,
  // Using any for spacing function to avoid TypeScript errors
  spacing: ((...args: any) => `${0.25 * args[0]}rem`) as any,
  components: {},
  // Custom property for our theme - not part of standard MUI Theme
  applyStyles: () => ({})
} as any;

// Mock the useTheme hook
const mockUseTheme = (themeOverrides: Partial<Theme> = {}) => {
  const mockTheme = { ...defaultTheme, ...themeOverrides };
  (useTheme as jest.Mock).mockReturnValue(mockTheme);
};

export { mockUseAuth0, mockUseTheme, defaultTheme };