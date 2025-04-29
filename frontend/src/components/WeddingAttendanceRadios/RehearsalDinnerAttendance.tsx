import React, { useCallback, useMemo, useState } from 'react';
import { Box, Typography, useTheme, ButtonGroup, Paper, Modal, IconButton, useMediaQuery } from '@mui/material';
import { RsvpEnum, GuestViewModel } from '@/types/api';
import { useFamily } from '@/store/family';
import { styled } from '@mui/material/styles';
import { Fireplace, LocalFireDepartment, Timer, WbTwilight, TvOutlined, Weekend, Close as CloseIcon } from '@mui/icons-material';
import { useAppLayout } from '@/context/Providers/AppState/useAppLayout';
import FourthOfJulyButton from './FourthOfJulyButton';

interface RehearsalDinnerAttendanceProps {
  guestId: string;
  showHeader?: boolean;
}

const RehearsalDinnerAttendance: React.FC<RehearsalDinnerAttendanceProps> = ({ 
  guestId,
  showHeader = false
}) => {
  const theme = useTheme();
  const [family, familyActions] = useFamily();
  const [loading, setLoading] = useState(false);
  const { screenWidth } = useAppLayout();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [modalOpen, setModalOpen] = useState(false);

  const guest = useMemo(() => {
    if (!family?.guests) return null;
    return family.guests.find((g) => g.guestId === guestId) as GuestViewModel | null;
  }, [family, guestId]);

  const currentResponse = useMemo(() => {
    return guest?.rsvp?.fourthOfJuly || RsvpEnum.Pending;
  }, [guest]);

  const updateRehearsalDinnerAttendance = useCallback(
    (response: RsvpEnum) => {
      if (!guest) return;
      
      // Store the selected response and set loading state
      setLoading(true);
      
      // Mark the response we're updating to
      const updatingToResponse = response;
      
      // Update the attendance
      familyActions.patchFamilyGuestMutation.mutate({
        updatedGuest: {
          guestId,
          fourthOfJuly: updatingToResponse,
        },
      });
      
      // Set a timeout to ensure loading state is visible
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    },
    [guest, guestId, familyActions]
  );

  const isBreakpointUpMin = screenWidth > theme.breakpoints.values.md;

  const handleOpenModal = () => {
    if (isMobile) {
      setModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  if (!guest) return null;

  // Common props for buttons
  const buttonDisabled = loading || 
    familyActions.patchFamilyGuestMutation.status === 'pending' || 
    familyActions.getFamilyUnitQuery.isFetching;

  // Define content for both the regular view and modal
  const content = (
    <Box 
      display="flex" 
      flexDirection="column" 
      alignItems="center" 
      width="100%" 
      py={isMobile ? 1 : 2}
      sx={{ 
        cursor: isMobile ? 'pointer' : 'default',
      }}
    >      
      <Box
        sx={{
          width: '100%',
          maxWidth: 600,
          p: { xs: 0.75, sm: 1 },
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(20px)',
          border: `1px dashed ${theme.palette.secondary.main}`,
          borderRadius: 1,
          boxShadow: 1,
        }}
      >
      <Typography variant="h6" gutterBottom
        sx={{ 
          alignContent: 'left',
          mb: { xs: 1.5, sm: 3 },
          textAlign: 'left',
          fontSize: { xs: '1.1rem', sm: '1.25rem' },
          px: { xs: 1, sm: 1 },
          pt: { xs: 0.5, sm: 0 },
        }}>
        {guest.firstName}
      </Typography>
        <ButtonGroup
          fullWidth
          orientation={isBreakpointUpMin ? 'horizontal' : 'vertical'}
          sx={{
            backgroundColor: 'rgba(0,0,0,.8)',
            height: '100%',
            '& .MuiButtonGroup-grouped': {
              borderRadius: 0,
            },
            display: 'flex',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <FourthOfJulyButton
            currentResponse={currentResponse}
            response={RsvpEnum.Declined}
            color="error"
            icons={
              <>
                <Weekend fontSize="inherit" sx={{ mr: { xs: 0.5, sm: 1 } }} />
                <TvOutlined fontSize="inherit" />
              </>
            }
            label="Can't make it"
            onClick={updateRehearsalDinnerAttendance}
            disabled={buttonDisabled}
            loading={loading && RsvpEnum.Declined !== currentResponse}
            isBreakpointUpMin={isBreakpointUpMin}
          />

          <FourthOfJulyButton
            currentResponse={currentResponse}
            response={RsvpEnum.Pending}
            color="info"
            icons={
              <>
                <Timer fontSize="inherit" sx={{ mr: { xs: 0.5, sm: 1 } }} />
                <WbTwilight fontSize="inherit" />
              </>
            }
            label="Not sure yet"
            onClick={updateRehearsalDinnerAttendance}
            disabled={buttonDisabled}
            loading={loading && RsvpEnum.Pending !== currentResponse}
            isBreakpointUpMin={isBreakpointUpMin}
          />

          <FourthOfJulyButton
            currentResponse={currentResponse}
            response={RsvpEnum.Attending}
            color="success"
            icons={
              <>
                <LocalFireDepartment fontSize="inherit" sx={{ mr: { xs: 0.5, sm: 1 } }} />
                <Fireplace fontSize="inherit" />
              </>
            }
            label="Yes, I'll be there!"
            onClick={updateRehearsalDinnerAttendance}
            disabled={buttonDisabled}
            loading={loading && RsvpEnum.Attending !== currentResponse}
            isBreakpointUpMin={isBreakpointUpMin}
          />

        </ButtonGroup>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Regular view that opens modal when clicked */}
      <Box onClick={handleOpenModal}>
        {content}
      </Box>

      {/* Modal view */}
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        aria-labelledby="rehearsal-dinner-modal"
        aria-describedby="rehearsal-dinner-details"
      >
        <Paper
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            height: '100%',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            pt: 6,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'auto',
            backgroundImage: 'linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.9))',
            backdropFilter: 'blur(10px)',
          }}
        >
          <IconButton
            aria-label="close"
            onClick={handleCloseModal}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'white',
            }}
          >
            <CloseIcon />
          </IconButton>
          
          {/* Content is rendered again inside the modal */}
          {content}
        </Paper>
      </Modal>
    </>
  );
};

export default RehearsalDinnerAttendance;