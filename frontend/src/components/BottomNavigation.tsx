import {BottomNavigation, BottomNavigationAction, Box} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import ContrastIcon from "@mui/icons-material/Contrast";
import React from "react";
import {useChristephanieTheme} from "../context/ThemeContext";
import {useAppLayout} from "../hooks/useAppLayout";

export const BottomNav = () => {
  const { mode, toggleTheme, mixedBackgroundSx } = useChristephanieTheme();
  const { navValue, setNavValue } = useAppLayout();

  return (
    <Box position='fixed' bottom={0} width='100%'>
      <BottomNavigation
        sx={{
          ...mixedBackgroundSx
        }}
        showLabels
        value={navValue}
        onChange={(event, newValue) => {
          setNavValue(newValue);
        }}
      >
        <BottomNavigationAction label="Home" icon={<HomeIcon/>}/>
        <BottomNavigationAction label={mode} icon={<ContrastIcon />} onClick={toggleTheme}/>
      </BottomNavigation>
    </Box>
    )
}