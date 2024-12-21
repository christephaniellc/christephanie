import React from 'react';
import { Box, Typography } from '@mui/material';
import { format } from 'date-fns';

export const DaysUntil = ({event = "Wedding" }: {event: "Wedding" | "Invitation"}) => {
  const today = new Date();
  const weddingDay = new Date(2025, 6, 5);
  const invitationDay = new Date(2025, 0, 30);
  const myDate = event === "Wedding" ? weddingDay : invitationDay;
  const daysUntil = Math.floor((myDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (event === "Invitation") {
    return <Box maxWidth={200}>{daysUntil} days to decide!</Box>
  }

  return (
    <Box sx={{
      textAlign: 'center',
      mb: 3,
    }}>
      <Typography variant="h3" gutterBottom>July 5, 2025</Typography>
      <Typography variant="h6">in {daysUntil} days</Typography>
    </Box>
  );

};