import React, { useCallback, useMemo, useState } from 'react';
import { Box, Button, Typography, useTheme, ButtonGroup, Paper } from '@mui/material';
import { RsvpEnum, GuestViewModel } from '@/types/api';
import { useFamily } from '@/store/family';
import { styled } from '@mui/material/styles';
import { darken } from '@mui/material';
import { StephsActualFavoriteTypography } from '@/components/AttendanceButton/AttendanceButton';
import { Fireplace, LocalFireDepartment, Timer, WbTwilight, TvOutlined, Weekend } from '@mui/icons-material';
import { useAppLayout } from '@/context/Providers/AppState/useAppLayout';

const TitlePaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(3),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  borderRadius: theme.spacing(1),
  textAlign: 'center',
  position: 'relative',
  overflow: 'hidden',
  boxShadow: theme.shadows[5],
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.1) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.1) 75%, transparent 75%, transparent)',
    backgroundSize: '10px 10px',
    zIndex: 1,
  },
}));

const IconContainer = styled(Box)(({ theme }) => ({
  fontSize: '2rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

interface RehearsalDinnerAttendanceProps {
  guestId: string;
}

const RehearsalDinnerAttendance: React.FC<RehearsalDinnerAttendanceProps> = ({ guestId }) => {
  const theme = useTheme();
  const [family, familyActions] = useFamily();
  const [loading, setLoading] = useState(false);
  const { screenWidth } = useAppLayout();

  const guest = useMemo(() => {
    if (!family?.guests) return null;
    return family.guests.find((g) => g.guestId === guestId) as GuestViewModel | null;
  }, [family, guestId]);

  const currentResponse = useMemo(() => {
    return guest?.rsvp?.fourthOfJuly || RsvpEnum.Pending;
  }, [guest]);

  const updateRehearsalDinnerAttendance = useCallback(
    async (response: RsvpEnum) => {
      if (!guest) return;
      
      setLoading(true);
      try {
        await familyActions.patchFamilyGuestMutation.mutate({
          updatedGuest: {
            guestId,
            fourthOfJuly: response,
          },
        });
        await familyActions.getFamily();
      } catch (error) {
        console.error('Error updating rehearsal dinner attendance', error);
      } finally {
        setLoading(false);
      }
    },
    [guest, guestId, familyActions]
  );

  const isBreakpointUpMin = screenWidth > theme.breakpoints.values.md;

  if (!guest) return null;

  return (
    <Box 
      display="flex" 
      flexDirection="column" 
      alignItems="center" 
      width="100%" 
      py={2}
    >
      <TitlePaper elevation={3} sx={{ width: '100%', maxWidth: 600 }}>
        <Typography variant="h5" fontWeight="bold" sx={{ position: 'relative', zIndex: 2 }}>
          4th of July Rehearsal Dinner
        </Typography>
        <Typography variant="subtitle1" sx={{ position: 'relative', zIndex: 2 }}>
          Burgers & Dogs - BYOB
        </Typography>
      </TitlePaper>
      
      <Typography variant="h6" gutterBottom align="center" sx={{ mb: 3 }}>
        {guest.firstName} {guest.lastName}
      </Typography>
      
      <Box
        sx={{
          width: '100%',
          maxWidth: 600,
          p: 1,
          mb: 4,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(20px)',
          border: `1px dashed ${theme.palette.secondary.main}`,
          borderRadius: 1,
          boxShadow: 1,
        }}
      >
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
          <Button
            variant={currentResponse === RsvpEnum.Attending ? 'contained' : 'outlined'}
            color="success"
            onClick={() => updateRehearsalDinnerAttendance(RsvpEnum.Attending)}
            disabled={loading || familyActions.patchFamilyGuestMutation.status === 'pending' || familyActions.getFamilyUnitQuery.isFetching}
            sx={{
              lineHeight: 1.2,
              justifyContent: 'center',
              paddingY: 1.5,
              paddingX: 2,
              width: isBreakpointUpMin ? '33.33%' : '100%',
              height: !isBreakpointUpMin ? '33.33%' : '100%',
            }}
          >
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              gap={1}
              sx={{ width: '100%' }}
            >
              <IconContainer>
                <LocalFireDepartment fontSize="inherit" sx={{ mr: 1 }} />
                <Fireplace fontSize="inherit" />
              </IconContainer>
              <StephsActualFavoriteTypography
                sx={{
                  textShadow: currentResponse === RsvpEnum.Attending 
                    ? `3px 3px 0 ${darken(theme.palette.success.dark, 0.5)}`
                    : 'none',
                }}
              >
                Yes, I'll be there!
              </StephsActualFavoriteTypography>
            </Box>
          </Button>
          
          <Button
            variant={currentResponse === RsvpEnum.Declined ? 'contained' : 'outlined'}
            color="error"
            onClick={() => updateRehearsalDinnerAttendance(RsvpEnum.Declined)}
            disabled={loading || familyActions.patchFamilyGuestMutation.status === 'pending' || familyActions.getFamilyUnitQuery.isFetching}
            sx={{
              lineHeight: 1.2,
              justifyContent: 'center',
              paddingY: 1.5,
              paddingX: 2,
              width: isBreakpointUpMin ? '33.33%' : '100%',
              height: !isBreakpointUpMin ? '33.33%' : '100%',
            }}
          >
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              gap={1}
              sx={{ width: '100%' }}
            >
              <IconContainer>
                <Weekend fontSize="inherit" sx={{ mr: 1 }} />
                <TvOutlined fontSize="inherit" />
              </IconContainer>
              <StephsActualFavoriteTypography
                sx={{
                  textShadow: currentResponse === RsvpEnum.Declined 
                    ? `3px 3px 0 ${darken(theme.palette.error.dark, 0.5)}`
                    : 'none',
                }}
              >
                Can't make it
              </StephsActualFavoriteTypography>
            </Box>
          </Button>
          
          <Button
            variant={currentResponse === RsvpEnum.Pending ? 'contained' : 'outlined'}
            color="info"
            onClick={() => updateRehearsalDinnerAttendance(RsvpEnum.Pending)}
            disabled={loading || familyActions.patchFamilyGuestMutation.status === 'pending' || familyActions.getFamilyUnitQuery.isFetching}
            sx={{
              lineHeight: 1.2,
              justifyContent: 'center',
              paddingY: 1.5,
              paddingX: 2,
              width: isBreakpointUpMin ? '33.33%' : '100%',
              height: !isBreakpointUpMin ? '33.33%' : '100%',
            }}
          >
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              gap={1}
              sx={{ width: '100%' }}
            >
              <IconContainer>
                <Timer fontSize="inherit" sx={{ mr: 1 }} />
                <WbTwilight fontSize="inherit" />
              </IconContainer>
              <StephsActualFavoriteTypography
                sx={{
                  textShadow: currentResponse === RsvpEnum.Pending 
                    ? `3px 3px 0 ${darken(theme.palette.info.dark, 0.5)}`
                    : 'none',
                }}
              >
                Not sure yet
              </StephsActualFavoriteTypography>
            </Box>
          </Button>
        </ButtonGroup>
      </Box>
      
      <Box mt={2} textAlign="center" sx={{ 
        p: 2, 
        borderRadius: 2, 
        bgcolor: 'background.paper',
        boxShadow: theme.shadows[2]
      }}>
        <Typography variant="body1" color={
          currentResponse === RsvpEnum.Attending 
            ? 'success.main' 
            : currentResponse === RsvpEnum.Declined 
              ? 'error.main' 
              : 'info.main'
        }>
          {currentResponse === RsvpEnum.Attending && "Great! We'll see you at the Rehearsal Dinner on the 4th of July. Don't forget to BYOB!"}
          {currentResponse === RsvpEnum.Declined && "We'll miss you at the Rehearsal Dinner."}
          {currentResponse === RsvpEnum.Pending && "Let us know if you can make it to the 4th of July Rehearsal Dinner."}
        </Typography>
      </Box>
    </Box>
  );
};

export default RehearsalDinnerAttendance;