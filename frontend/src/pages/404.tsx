import {Link} from "react-router-dom";
import {useRouteHistory} from "../hooks/useRouteHistory";
import React from "react";
import {Box, Typography} from "@mui/material";

export const Four04Page = () => {
  const { getPreviousRoute } = useRouteHistory();
  const previousRoute = getPreviousRoute();

  return (
    <Box>
      <Typography variant='h1' color='textPrimary'>Stay in your lane, buddy.  This route doesn't exist</Typography>
      <Typography component={Link} color='textSecondary' to={previousRoute || "/"}>Go back</Typography>
    </Box>
  );
}