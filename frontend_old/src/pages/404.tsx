import {Link} from "react-router-dom";
import {useRouteHistory} from "../context/Providers/AppState/useRouteHistory";
import React from "react";
import {Box, Typography} from "@mui/material";
import { useAppStateContext } from '../context/Providers/AppState/AppStateContext';

export const Four04Page = () => {
  const { previousRoute } = useAppStateContext();

  return (
    <Box>
      <Typography variant='h1' color='textPrimary'>Stay in your lane, buddy.  This route doesn't exist</Typography>
      <Typography component={Link} color='textSecondary' to={previousRoute || "/"}>Go back</Typography>
    </Box>
  );
}