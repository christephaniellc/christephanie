import { Box, Button, CircularProgress, useMediaQuery, useTheme } from '@mui/material';
import React, { useState } from 'react';
import LargeAttendanceButton from '@/components/AttendanceButton/ClientSideImportedComponents/LargeAttendanceButton';
import { useAttendanceButtonMain } from '../hooks/useAttendanceButtonMain';
import WeddingAttendanceRadios from '@/components/WeddingAttendanceRadios';
import { InvitationResponseEnum } from '@/types/api';
import { AttendanceStatusStepper } from './AttendanceStatusStepper';

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
  
  // Determine the aria label based on the current status
  const getAriaLabel = () => {
    if (!guest) return 'Loading attendance options';
    
    const currentStatus = guest.rsvp?.invitationResponse;
    const firstName = guest.firstName || 'Guest';
    
    if (isAttendanceStep) {
      // On attendance step - describe toggle behavior
      return `${firstName}'s attendance status: ${currentStatus}. Click to change status.`;
    } else {
      // On other steps - describe modal opening behavior
      return `${firstName}'s attendance status: ${currentStatus}. Click to open detailed RSVP options.`;
    }
  };

  return (
    <>
      <Box display="flex" flexDirection="row" width="80%">

      {/* Vertical stepper to show the status options - always visible and clickable */}
      {guest && (
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            mr: 3
          }}
        >
          <AttendanceStatusStepper 
            currentStatus={guest.rsvp?.invitationResponse || InvitationResponseEnum.Pending}
            onStatusChange={(newStatus) => {
              if (!familyActions.patchFamilyGuestMutation.isIdle) return;
              
              familyActions.patchFamilyGuestMutation.mutate({
                updatedGuest: {
                  guestId,
                  invitationResponse: newStatus,
                },
              });
            }}
            disabled={familyActions.getFamilyUnitQuery.isFetching}
            isLoading={familyActions.patchFamilyGuestMutation.isPending}
          />
        </Box>
      )}
        <Button
          disabled={
            !familyActions.patchFamilyGuestMutation.isIdle ||
            familyActions.getFamilyUnitQuery.isFetching
          }
          onClick={handleClick}
          aria-label={familyActions.patchFamilyGuestMutation.isPending ? "Updating attendance..." : getAriaLabel()}
          aria-haspopup={!isAttendanceStep}
          aria-expanded={modalOpen}
          aria-busy={!familyActions.patchFamilyGuestMutation.isIdle}
          sx={{
            alignItems: 'flex-start',
            boxShadow: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: 2,
            position: 'relative',
            height: 'auto',
            flexGrow: 1,
            ...imgButtonSxProps,
            color:
              !familyActions.patchFamilyMutation.isIdle
                ? 'white !important'
                : 'inherit',
            background: 'rgba(0,0,0,1)',
            filter: `drop-shadow(${calculateShadow()})`,
          }}
        >
          <Box 
            display="flex" 
            alignItems="flex-start" 
            width="100%" 
            sx={{ height: 'auto', minHeight: '100%', position: 'relative' }}
          >
            {guest && (
              <>
                {familyActions.patchFamilyGuestMutation.isPending && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'rgba(0, 0, 0, 0.85)',
                      backdropFilter: 'blur(8px)',
                      zIndex: 10,
                      borderRadius: 1,
                      color: 'white',
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                      animation: 'fadeInOut 1.5s infinite',
                      '@keyframes fadeInOut': {
                        '0%': { opacity: 0.7 },
                        '50%': { opacity: 1 },
                        '100%': { opacity: 0.7 },
                      },
                    }}
                    role="status"
                    aria-live="polite"
                  >
                    <CircularProgress 
                      size={24} 
                      thickness={4}
                      color={
                        guest.rsvp?.invitationResponse === InvitationResponseEnum.Interested 
                          ? "primary" 
                          : guest.rsvp?.invitationResponse === InvitationResponseEnum.Declined
                            ? "error"
                            : "secondary"
                      }
                      sx={{ 
                        mb: 3,
                        filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.5))'
                      }}
                    />
                    <Box 
                      component="span" 
                      sx={{ 
                        color: guest.rsvp?.invitationResponse === InvitationResponseEnum.Interested 
                          ? 'primary.main' 
                          : guest.rsvp?.invitationResponse === InvitationResponseEnum.Declined
                            ? 'error.main'
                            : 'secondary.main',
                        mb: 1,
                        fontSize: '1.5rem',
                        textShadow: '0 0 10px rgba(0,0,0,0.7)'
                      }}
                    >
                      UPDATING
                    </Box>
                    <Box component="span" sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      fontSize: '1rem',
                      opacity: 0.9
                    }}>
                      Please wait...
                    </Box>
                  </Box>
                )}
                <LargeAttendanceButton
                  guestId={guest.guestId}
                  isPending={familyActions.patchFamilyMutation.isPending || familyActions.patchFamilyGuestMutation.isPending}
                  error={familyActions.patchFamilyMutation.error}
                  rsvpLoading={familyActions.patchFamilyGuestMutation.isPending}
                />
              </>
            )}
          </Box>
        </Button>
      </Box>

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