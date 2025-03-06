import React, { useMemo, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import { familyState, guestSelector } from '@/store/family';
import { AgeGroupEnum, InvitationResponseEnum } from '@/types/api';
import { useRecoilValue } from 'recoil';
import { rem } from 'polished';
import { useUser } from '@/store/user';
import { ForestRounded, ForestSharp, ForestTwoTone } from '@mui/icons-material';
import { useAppLayout } from '@/context/Providers/AppState/useAppLayout';
import StickFigureIcon from '@/components/StickFigureIcon';

export const Countdowns = ({ event = 'Wedding', interested, guestId }: {
  event: 'Wedding' | 'Invitation',
  interested: InvitationResponseEnum
  guestId?: string
}) => {
  const { screenWidth } = useAppLayout();
  const guest = useRecoilValue(guestSelector(guestId));
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
          <Box maxWidth={800} mx="auto" display="flex" width="100%" alignItems="center" justifyContent='center' flexWrap='wrap'>
            in {daysUntil} days
          </Box>
        </>
      )}
    </Box>
  );

};