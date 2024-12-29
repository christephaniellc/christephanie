import React, {createContext, ReactNode, useContext, useMemo, useState} from "react";
import { createTheme, GlobalStyles, SxProps, Theme, ThemeProvider, useColorScheme, useMediaQuery } from '@mui/material';

interface ThemeContextProps {
  toggleTheme: () => void;
  mixedBackgroundSx: SxProps;
  mode?: "light" | "dark" | 'system';
  theme: Theme;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ChristephanieThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setMode] = useState<"light" | "dark">(prefersDarkMode ? "dark" : "light");

  const theme = createTheme({
    palette: {
      mode,
      primary: {
        main: "#9D00FF",
      },
      secondary: {
        main: "#E9950C",
      },
      background: {
        default: mode === "dark" ? "#09020E" : "#ffffff",
      },
    },
  });

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  const mixedBackgroundSx  = useMemo(() => {
    return {
      background: `${mode === 'light' ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)"}`,
    } as SxProps;
  }, [mode])

  return (
    <ThemeContext.Provider value={{ toggleTheme, mode, mixedBackgroundSx, theme }}>
      <GlobalStyles
        styles={{
          "input:-webkit-autofill": {
            WebkitBoxShadow: `0 0 0px 1000px ${theme.palette.background.default} inset`,
            WebkitTextFillColor: theme.palette.text.primary,
            transition: "background-color 5000s ease-in-out 0s",
          },
        }}
      />
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useChristephanieTheme = (): ThemeContextProps => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeToggle must be used within a ThemeProviderWithToggle");
  }
  return context;
};