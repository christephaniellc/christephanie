import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import useFamilyUnit from '@/store/family';
import { InvitationResponseEnum } from '@/types/api';
import useUser from '@/store/user';

export const Countdowns = ({event = "Wedding", interested }: {event: "Wedding" | "Invitation", interested: InvitationResponseEnum}) => {
  const [user] = useUser();
  const [familyUnit] = useFamilyUnit();
  const addressValidated = familyUnit?.mailingAddress
  const today = new Date();
  const weddingDay = new Date(2025, 6, 5);
  const invitationDay = new Date(2025, 0, 30);
  const myDate = event === "Wedding" ? weddingDay : invitationDay;
  const daysUntil = Math.floor((myDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const daysUntilMessage = useMemo(() => {
    if (!familyUnit) return `Are waiting for you to Create an Account!`;
    switch(interested) {
      case "Pending":
        return `Are waiting on your response!`;
      case "Interested":
        return addressValidated ? `${daysUntil} days until the ${event}!` : `${daysUntil} days to provide your address!`;
      case "Declined":
        return `Sorry to miss you at the Wedding!`;
    }
  }, [interested, addressValidated, user, familyUnit]);

  if (event === "Invitation") {
    return <Box textAlign='center' mb={2}>
      {daysUntilMessage}
    </Box>
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