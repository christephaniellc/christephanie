import {
  CssBaseline,
  Stack
} from "@mui/material";
import {Outlet} from "react-router-dom";
import React from "react";
import {BottomNav} from "./components/BottomNav";

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