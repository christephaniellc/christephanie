import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { darken, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';
import { rsvpStepsState, rsvpStepperState, rsvpTabIndex } from '@/store/steppers';
import { StephsActualFavoriteTypographyBackNext } from '@/components/AttendanceButton/AttendanceButton';
import { useFamily } from '@/store/family';
import { InvitationResponseEnum } from '@/types/api';

interface NavigationButtonsProps {
  tabIndex: number;
}

export const NavigationButtons: React.FC<NavigationButtonsProps> = ({ tabIndex }) => {
  const [family, familyActions] = useFamily();
  const navigate = useNavigate();
  const theme = useTheme();
  const rsvpSteps = useRecoilValue(rsvpStepsState);
  const [tabIndexState, setTabIndex] = useRecoilState(rsvpTabIndex);
  const rsvpStepper = useRecoilValue(rsvpStepperState);

  const handleNavigateToStep = (step: string) => {
    familyActions.getFamily();
    setTabIndex(Object.keys(rsvpSteps).indexOf(step));
    navigate(`/rsvp?step=${step}`);
  };

  return (
    <Box
      role="navigation"
      aria-label="Form navigation"
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingBottom: '90px',
      }}
    >
      <Button
        variant="outlined"
        color="error"
        aria-label="Go back to previous step"
        sx={{
          backdropFilter: 'blur(20px)',
          backgroundColor: 'rgba(0,0,0,.8)',
          display: tabIndex > 0 ? 'inherit' : 'none',
          flexShrink: 0,
        }}
        onClick={() => {
          familyActions.getFamily();

          // Find previous visible step using same logic as next button
          const basicSteps = [
            'weddingAttendance', 
            'fourthOfJulyAttendance',
            'mailingAddress',
            'comments',
            'summary',
          ];
          const atLeastOneAttending =
            family?.guests?.some(
              (guest) => guest.rsvp?.invitationResponse === InvitationResponseEnum.Interested,
            ) ?? false;
            
          // We've removed the welcome step

          // Filter steps based on attendance
          const visibleSteps = Object.entries(rsvpSteps).filter(([key, step]) => {
            if (atLeastOneAttending) {
              return step.display;
            } else {
              return basicSteps.includes(key) && step.display;
            }
          });

          // Find the current visible step index
          const currentVisibleIndex = visibleSteps.findIndex(
            ([key]) => key === rsvpStepper.currentStep[0],
          );

          // Go to the previous visible step
          if (currentVisibleIndex > 0) {
            const prevStep = visibleSteps[currentVisibleIndex - 1][0];
            handleNavigateToStep(prevStep);
          }
        }}
      >
        <StephsActualFavoriteTypographyBackNext
          sx={{
            textShadow: `3px 3px 0 ${darken(
              rsvpStepper.currentStep[1].completed
                ? theme.palette.success.dark
                : theme.palette.error.dark,
              0.5,
            )}`,
            color: rsvpStepper.currentStep[1].completed ? 'success.main' : 'error.main',
          }}
        >
          Wait, go back
        </StephsActualFavoriteTypographyBackNext>
      </Button>
      <Box id={'spacer'} display={'flex'} width={1}></Box>
      <Button
        variant="outlined"
        color={
          rsvpStepper.currentStep[1].completed ? 'success' : ('error' as 'success' | 'error')
        }
        aria-label={
          tabIndex < rsvpStepper.totalTabs - 1
            ? 'Continue to next step'
            : 'Finish and submit form'
        }
        sx={{
          flexShrink: 0,
          backdropFilter: 'blur(20px)',
          backgroundColor: 'rgba(0,0,0,.8)',
          display: tabIndex < rsvpStepper.totalTabs ? 'inherit' : 'none',
        }}
        onClick={async () => {
          // If we're at the last tab, navigate home
          if (tabIndex >= rsvpStepper.totalTabs - 1) {
            navigate('/');
            return;
          }

          // If we're at the comments step (last step before summary), navigate to summary
          if (rsvpStepper.currentStep[0] === 'comments') {
            handleNavigateToStep('summary');
          } else {
            // Otherwise find next visible step
            // Basic steps to always include
            const basicSteps = [
              'weddingAttendance',
              'fourthOfJulyAttendance',
              'mailingAddress',
              'comments',
              'summary',
            ];

            // Force a refresh of family data first to ensure we have latest state
            // especially important after changing from Pending to Interested
            await familyActions.getFamily();

            // Re-check attendance status with fresh data
            const refreshedAtLeastOneAttendingState =
              family?.guests?.some(
                (guest) => guest.rsvp?.invitationResponse === InvitationResponseEnum.Interested,
              ) ?? false;
              
            // We've removed the welcome step

            // Filter steps based on UPDATED attendance status
            const visibleSteps = Object.entries(rsvpSteps).filter(([key, step]) => {
              if (refreshedAtLeastOneAttendingState) {
                return step.display;
              } else {
                return basicSteps.includes(key) && step.display;
              }
            });

            // Find the current visible step index
            const currentVisibleIndex = visibleSteps.findIndex(
              ([key]) => key === rsvpStepper.currentStep[0],
            );

            // Go to the next visible step
            if (currentVisibleIndex < visibleSteps.length - 1) {
              const nextStep = visibleSteps[currentVisibleIndex + 1][0];
              handleNavigateToStep(nextStep);
            } else {
              // If no more visible steps, navigate home
              navigate('/');
            }
          }
        }}
      >
        <StephsActualFavoriteTypographyBackNext
          sx={{
            textShadow: `3px 3px 0 ${darken(
              rsvpStepper.currentStep[1].completed
                ? theme.palette.success.dark
                : theme.palette.error.dark,
              0.5,
            )}`,
            color: rsvpStepper.currentStep[1].completed ? 'success.main' : 'error.main',
          }}
        >
          {tabIndex < rsvpStepper.totalTabs - 1 ? 'Next' : 'Finish'}
        </StephsActualFavoriteTypographyBackNext>
      </Button>
    </Box>
  );
};

export default NavigationButtons;