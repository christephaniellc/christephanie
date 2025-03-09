import { ThemeOptions } from '@mui/material/styles';
import { deepmerge } from '@mui/utils';

import { Themes } from './types';

const sharedTheme = {
  palette: {
    background: {
      default: '#fafafa',
      paper: '#fff',
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 375, // iPhone SE width
      md: 800, // Slightly smaller than iPad Mini sideways
      lg: 1366, // iPad Pro 12.9" sideways
      xl: 1728, // MacBook Pro 16" effective width
    },
  },
  components: {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
    MuiDivider: {
      styleOverrides: {
        vertical: {
          marginRight: 10,
          marginLeft: 10,
        },
        // TODO: open issue for missing "horizontal" CSS rule
        // in Divider API - https://mui.com/material-ui/api/divider/#css
        middle: {
          marginTop: 10,
          marginBottom: 10,
          width: '80%',
        },
      },
    },
  },
} as ThemeOptions; // the reason for this casting is deepmerge return type
// TODO (Suren): replace mui-utils-deepmerge with lodash or ramda deepmerge

const themes: Record<Themes, ThemeOptions> = {
  light: deepmerge(sharedTheme, {
    palette: {
      mode: 'light',
      primary: {
        main: '#3f51b5',
      },
      secondary: {
        main: '#cddc39',
      },
      background: {
        default: '#fafafa',
        paper: '#fff',
      },
    },
  }),

  dark: deepmerge(sharedTheme, {
    palette: {
      mode: 'dark',
      primary: {
        main: "#9D00FF",
      },
      secondary: {
        main: "#E9950C",
      },
      background: {
        default: '#0E080F',
        paper: '#171717',
      },
    },
  }),
};

export default themes;
