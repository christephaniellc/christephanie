import {
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Container,
  CssBaseline,
  Stack,
  useColorScheme
} from "@mui/material";
import {Outlet} from "react-router-dom";
import React, {useState} from "react";
import HomeIcon from '@mui/icons-material/Home';
import ContrastIcon from '@mui/icons-material/Contrast';
import {useChristephanieTheme} from "./context/ThemeContext";
import {BottomNav} from "./components/BottomNavigation";
import ElPulpoDark from "./assets/el_pulpo_andy.jpg"

export const Layout = () => {
  return (
    <CssBaseline>
      <Stack sx={{
        height: "100vh",
        maxHeight: '100vh',
        bgcolor: 'background.default',
        overFlow: 'hidden',
        position: 'relative'
      }}>
        <Outlet/>
      </Stack>
      <BottomNav />
    </CssBaseline>
  );
};