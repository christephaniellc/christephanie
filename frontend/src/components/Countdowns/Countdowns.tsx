import React, { useEffect, useMemo, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import { familyState } from '@/store/family';
import { InvitationResponseEnum } from '@/types/api';
import { useRecoilValue } from 'recoil';
import { rem } from 'polished';
import { useUser } from '@/store/user';
import { ForestRounded } from '@mui/icons-material';
import { useAppLayout } from '@/context/Providers/AppState/useAppLayout';

export const Countdowns = ({ event = 'Wedding', interested }: {
  event: 'Wedding' | 'Invitation',
  interested: InvitationResponseEnum
}) => {
  const {  screenWidth } = useAppLayout();
  // const shortScreen = contentHeight < 800;
  const [user] = useUser();
  const familyUnit = useRecoilValue(familyState);
  const addressValidated = familyUnit?.mailingAddress;
  const today = new Date();
  const weddingDay = new Date(2025, 6, 5);
  const invitationDay = new Date(2025, 0, 30);
  const myDate = event === 'Wedding' ? weddingDay : invitationDay;
  const daysUntil = Math.floor((myDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const daysUntilMessage = useMemo(() => {
    if (!familyUnit) return 'Are waiting for you to Create an Account!';
    switch (interested) {
      case 'Pending':
        return `Let us know when you know!`;
      case 'Interested':
        return addressValidated ? `${daysUntil} days until the ${event}!` : `${daysUntil} days to provide your address!`;
      case 'Declined':
        return 'Sorry to miss you at the Wedding!';
    }
  }, [interested, addressValidated, familyUnit]);

  const centerTreesWidthRef = useRef<null | HTMLElement>(null);

  const numberOfTrees = useMemo(() => {
    if (!centerTreesWidthRef.current) return 3;
    return Math.floor(centerTreesWidthRef.current!.clientWidth / 70);
  }, [centerTreesWidthRef, screenWidth]);

  const colors = ['#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722', '#F44336'];

  return (
    <Box sx={{
      textAlign: 'start',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      px: 3,

    }}
         ref={centerTreesWidthRef}>
      {event === 'Invitation' && <Typography>{daysUntilMessage}</Typography> || (
        <>
          <Box maxWidth={800} mx="auto" display="flex" width="100%" alignItems="center">
            <Typography width="38%" mx="auto" variant="h3" fontSize={rem(18)} textAlign="end">
              July 5, 2025
            </Typography>
            <Box display="flex" mx="auto" flexGrow={1} justifyContent="center">
              {Array(Math.floor(numberOfTrees * 0.75)).fill(undefined)
                .map((_, index) => <ForestRounded key={index} fontSize="small"
                                                  sx={{ color: colors[Math.floor(Math.random() * colors.length)] }} />)}
            </Box>
            <Typography variant="h3" fontSize={rem(18)} mx="auto" textAlign="start" width={'38%'}>
              {user.auth0Id && user.guestId && 'Lovettsville, VA'}
            </Typography>
            {!(user.auth0Id && user.guestId) && Array(numberOfTrees)
              .fill(
                <ForestRounded sx={{ mx: 'auto' }} fontSize="small" />)
              .map(e => e)
            }
          </Box>
          <Box textAlign="center"
                      width="100%">
            {Array(Math.floor(numberOfTrees / 3)).fill(undefined)
              .map((_, index) => <ForestRounded key={index} fontSize="small"
                                                sx={{ color: colors[Math.floor(Math.random() * colors.length)] }} />)}
            in {daysUntil} days
            {Array(Math.floor(numberOfTrees / 4)).fill(undefined)
              .map((_, index) => <ForestRounded key={index} fontSize="small"
                                                sx={{ color: colors[Math.floor(Math.random() * colors.length)] }} />)}
          </Box>
          <Box display="flex" mx="auto" flexGrow={1} justifyContent="center" width={'100%'}>
            {Array(numberOfTrees).fill(undefined)
              .map((_, index) => <ForestRounded key={index} fontSize="small"
                                                sx={{ color: colors[Math.floor(Math.random() * colors.length)] }} />)}
          </Box>

        </>
      )}
    </Box>
  );

};