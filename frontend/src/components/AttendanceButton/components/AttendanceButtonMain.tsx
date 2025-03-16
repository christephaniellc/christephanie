import { Box, Button, useMediaQuery, useTheme } from '@mui/material';
import React, { useState } from 'react';
import LargeAttendanceButton from '@/components/AttendanceButton/ClientSideImportedComponents/LargeAttendanceButton';
import { useAttendanceButtonMain } from '../hooks/useAttendanceButtonMain';
import WeddingAttendanceRadios from '@/components/WeddingAttendanceRadios';
import { InvitationResponseEnum } from '@/types/api';

interface AttendanceButtonMainProps {
  guestId: string;
}

export const AttendanceButtonMain = ({ guestId }: AttendanceButtonMainProps) => {
  const {
    familyActions,
    guest,
    imgButtonSxProps,
    calculateShadow,
    stdStepper,
  } = useAttendanceButtonMain({ guestId });
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isAttendanceStep = stdStepper.tabIndex === 0;
  
  // State to control the modal
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };
  
  // Function to handle circular toggling of attendance status
  const toggleAttendanceStatus = () => {
    if (!guest || !familyActions.patchFamilyGuestMutation.isIdle) return;
    
    let newStatus: InvitationResponseEnum;
    
    switch (guest.rsvp?.invitationResponse) {
      case InvitationResponseEnum.Pending:
        newStatus = InvitationResponseEnum.Interested;
        break;
      case InvitationResponseEnum.Interested:
        newStatus = InvitationResponseEnum.Declined;
        break;
      case InvitationResponseEnum.Declined:
      default:
        newStatus = InvitationResponseEnum.Pending;
        break;
    }
    
    familyActions.patchFamilyGuestMutation.mutate({
      updatedGuest: {
        guestId,
        invitationResponse: newStatus,
      },
    });
  };
  
  // Determine the click handler based on the current step
  const handleClick = isAttendanceStep ? toggleAttendanceStatus : handleOpenModal;
  
  return (
    <>
      <Button
        disabled={
          !familyActions.patchFamilyGuestMutation.isIdle ||
          familyActions.getFamilyUnitQuery.isFetching
        }
        onClick={handleClick}
        sx={{
          alignItems: 'flex-start',
          boxShadow: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 2,
          position: 'relative',
          height: 'auto',
          ...imgButtonSxProps,
          color:
            !familyActions.patchFamilyMutation.isIdle
              ? 'white !important'
              : 'inherit',
          background: 'rgba(0,0,0,1)',
          filter: `drop-shadow(${calculateShadow()})`,
        }}
      >
        <Box display="flex" alignItems="flex-start" width="100%" sx={{ height: 'auto', minHeight: '100%' }}>
          {guest && (
            <LargeAttendanceButton
              guestId={guest.guestId}
              isPending={familyActions.patchFamilyMutation.isPending}
              error={familyActions.patchFamilyMutation.error}
            />
          )}
        </Box>
      </Button>

      {/* Modal for attendance changes */}
      {modalOpen && guest && (
        <WeddingAttendanceRadios 
          guestId={guest.guestId} 
          initialModalOpen={true}
          onModalClose={handleCloseModal}
        />
      )}
    </>
  );
};