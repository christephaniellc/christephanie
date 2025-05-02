import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { darken, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { rsvpStepsState, rsvpStepperState, rsvpTabIndex } from '@/store/steppers';
import { StephsActualFavoriteTypographyBackNext } from '@/components/AttendanceButton/AttendanceButton';
import { useFamily } from '@/store/family';
import { InvitationResponseEnum } from '@/types/api';
import { rsvpScrollTriggerState } from '../RSVPPage';

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
  const setScrollTrigger = useSetRecoilState(rsvpScrollTriggerState);

  const handleNavigateToStep = (step: string) => {
    // Check if step exists and is visible before navigating
    if (step && rsvpSteps[step] && rsvpSteps[step].display) {
      //console.log(`NavigationButtons: Navigating to step ${step}`);
      
      // Trigger scrolling via shared atom
      setScrollTrigger(prev => prev + 1);
      
      // Scroll window to top immediately
      window.scrollTo(0, 0);
      
      // Try to find the scrollable content box and scroll it too
      const scrollableBox = document.querySelector('[role="region"][aria-label$="form section"]');
      if (scrollableBox) {
        (scrollableBox as HTMLElement).scrollTop = 0;
      }
      
      // First update the tab index in state
      const stepIndex = Object.keys(rsvpSteps).indexOf(step);
      setTabIndex(stepIndex);
      
      // Then navigate to the URL with replace:true to avoid adding to history
      navigate(`/rsvp?step=${step}`, { replace: true });
    } else {
      console.warn(`NavigationButtons: Attempted to navigate to invalid or invisible step ${step}`);
    }
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
          // Trigger scrolling via shared atom
          setScrollTrigger(prev => prev + 1);
          
          // Scroll window to top
          window.scrollTo(0, 0);
          
          // Try to find the scrollable content box and scroll it too
          const scrollableBox = document.querySelector('[role="region"][aria-label$="form section"]');
          if (scrollableBox) {
            (scrollableBox as HTMLElement).scrollTop = 0;
          }
          
          // Immediately stop if we're transitioning between steps
          if (familyActions.getFamilyUnitQuery.isFetching) {
            //console.log('Navigation in progress, ignoring click');
            return;
          }
          
          try {
            // Basic steps that are always shown
            const basicSteps = [
              'weddingAttendance',
              'fourthOfJulyAttendance',
              'mailingAddress',
              'comments',
              'summary',
            ];
            
            // Get fresh family data asynchronously
            familyActions.getFamily();
            
            // Check attendance status using current state
            const anyAttending = family?.guests?.some(
              (guest) => 
                guest.rsvp?.wedding === 'Attending' || 
                (guest.rsvp?.wedding === 'Pending' && guest.rsvp?.invitationResponse === 'Interested')
            ) ?? false;
            
            // Filter to visible steps (those with display=true or basic steps for non-attending)
            const visibleSteps = Object.entries(rsvpSteps).filter(([key, step]) => {
              if (!step.display) return false;
              
              return anyAttending || basicSteps.includes(key);
            });
            
            // console.log('Back navigation data:', {
            //   anyAttending,
            //   currentStep: rsvpStepper.currentStep[0],
            //   visibleSteps: visibleSteps.map(([key]) => key)
            // });

            // Find current position in visible steps
            const currentVisibleIndex = visibleSteps.findIndex(
              ([key]) => key === rsvpStepper.currentStep[0],
            );

            // If we found the current step and there's a previous step, go to it
            if (currentVisibleIndex > 0) {
              const prevStep = visibleSteps[currentVisibleIndex - 1][0];
              //console.log(`Moving to previous step: ${prevStep}`);
              handleNavigateToStep(prevStep);
            }
          } catch (error) {
            console.error('Error during back navigation:', error);
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
          // Trigger scrolling via shared atom
          setScrollTrigger(prev => prev + 1);
          
          // Scroll window to top
          window.scrollTo(0, 0);
          
          // Try to find the scrollable content box and scroll it too
          const scrollableBox = document.querySelector('[role="region"][aria-label$="form section"]');
          if (scrollableBox) {
            (scrollableBox as HTMLElement).scrollTop = 0;
          }
          
          // Immediately stop if we're transitioning between steps
          if (familyActions.getFamilyUnitQuery.isFetching) {
            //console.log('Navigation in progress, ignoring click');
            return;
          }
          
          // If we're at the last tab, navigate home
          if (tabIndex >= rsvpStepper.totalTabs - 1) {
            //console.log('At last tab, navigating home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            navigate('/');
            return;
          }

          try {
            // If we're at the comments step (last step before summary), navigate to summary
            if (rsvpStepper.currentStep[0] === 'comments') {
              handleNavigateToStep('summary');
            } else {
              // Basic steps that are always shown
              const basicSteps = [
                'weddingAttendance',
                'fourthOfJulyAttendance',
                'mailingAddress',
                'comments',
                'summary',
              ];
              
              // Get fresh family data if needed but don't wait
              // This is just a background refresh to ensure latest data is available
              familyActions.getFamily();

              // Check attendance status - we'll use current state since we just refreshed it
              const anyAttending = family?.guests?.some(
                (guest) => 
                  guest.rsvp?.wedding === 'Attending' || 
                  (guest.rsvp?.wedding === 'Pending' && guest.rsvp?.invitationResponse === 'Interested')
              ) ?? false;
              
              // Filter to visible steps (those with display=true or basic steps for non-attending)
              const visibleSteps = Object.entries(rsvpSteps).filter(([key, step]) => {
                if (!step.display) return false;
                
                return anyAttending || basicSteps.includes(key);
              });
              
              // Find current position in visible steps
              const currentVisibleIndex = visibleSteps.findIndex(
                ([key]) => key === rsvpStepper.currentStep[0],
              );

              // If we found the current step and there's a next step, go to it
              if (currentVisibleIndex !== -1 && currentVisibleIndex < visibleSteps.length - 1) {
                const nextStep = visibleSteps[currentVisibleIndex + 1][0];
                handleNavigateToStep(nextStep);
              } else {
                // Couldn't find current step or at end, go home
                window.scrollTo({ top: 0, behavior: 'smooth' });
                navigate('/');
              }
            }
          } catch (error) {
            console.error('Error during navigation:', error);
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