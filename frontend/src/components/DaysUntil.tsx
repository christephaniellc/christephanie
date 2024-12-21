import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { format } from 'date-fns';
import { InvitationResponseEnum } from '../types/types';
import { useRsvpContext } from '../context/Rsvp/RsvpContext';

export const DaysUntil = ({event = "Wedding", interested }: {event: "Wedding" | "Invitation", interested: InvitationResponseEnum}) => {
  const { familyUnit, addressValidated } = useRsvpContext();
  const today = new Date();
  const weddingDay = new Date(2025, 6, 5);
  const invitationDay = new Date(2025, 0, 30);
  const myDate = event === "Wedding" ? weddingDay : invitationDay;
  const daysUntil = Math.floor((myDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const daysUntilMessage = useMemo(() => {
    switch(interested) {
      case "Pending":
        return `Let us know when you know!`;
      case "Interested":
        return addressValidated ? `${daysUntil} days until the ${event}!` : `${daysUntil} days to provide your address!`;
      case "Declined":
        return `Sorry to miss you at the Wedding!`;
    }
  }, [interested, addressValidated]);
  if (event === "Invitation") {
    return <Box maxWidth={200}>{daysUntilMessage}</Box>
  }

  return (
    <Box sx={{
      textAlign: 'center',
      mb: 3,
    }}>
      <Typography variant="h3">July 5, 2025</Typography>
      <Typography variant="h6">in {daysUntil} days</Typography>
    </Box>
  );

};