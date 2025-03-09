import * as React from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepContent from '@mui/material/StepContent';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useRecoilValue } from 'recoil';
import { useNavigate, useLocation } from 'react-router-dom';
import { differenceInDays, format } from 'date-fns';
import Tooltip from '@mui/material/Tooltip';
import StickFigureIcon from '@/components/StickFigureIcon';
import { useCallback, useEffect, useMemo } from 'react';
import routes from '@/routes';
import { Pages } from '@/routes/types';
import { userState } from '@/store/user';
import { saveTheDateStepsState } from '@/store/steppers/steppers';
import { InvitationResponseEnum, RsvpEnum } from '@/types/api';

export interface Step {
  id: number;
  label: string;
  description: string;
  lastDate: Date;
  stepCompleted: boolean;
  stepUrl: string | undefined;
  component?: React.ReactNode;
}

const steps: { [step: string]: Step } = {
  saveTheDate: {
    id: 0,
    label: 'Save the Date',
    description: `We're getting married on the 5th of July in Lovettsville, VA.  For now,
    we just want to get an idea of who's coming.  We'll send out the official invitations
    once we get your interest and mailing address!`,
    lastDate: new Date('2025-04-01'),
    stepCompleted: false,
    stepUrl: routes[Pages.SaveTheDate].path,
  },
  rsvp: {
    id: 1,
    label: 'RSVP (coming soon)!',
    description:
      'Finalize your RSVP by letting us know if you can make it, and if you have any dietary restrictions.',
    lastDate: new Date('2025-05-20'),
    stepCompleted: true,
    stepUrl: '/'
  },
  wedding: {
    id: 2,
    label: 'Wedding Day',
    description: `July 5th, 2025! See you in ${differenceInDays(new Date('2025-07-05'), new Date())} days!`,
    lastDate: new Date('2025-07-06'),
    stepCompleted: true,
    stepUrl: routes[Pages.Profile].path,
  },
};

export default function WelcomePageStepper() {
  const [activeStep, setActiveStep] = React.useState(0);
  const user = useRecoilValue(userState);
  const [rsvpSteps, setRsvpSteps] = React.useState(steps);
  const stdSteps = useRecoilValue(saveTheDateStepsState);
  const navigate = useNavigate();
  const location = useLocation();

  // Check for step query parameter on load
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const stepParam = params.get('step');
    if (stepParam) {
      // Navigate to the Save the Date page with the specified step
      navigate(`${routes[Pages.SaveTheDate].path}?step=${stepParam}`);
    }
  }, [location.search]);

  // Check if user is attending and all steps are completed
  const isUserAttending = useMemo(() => {
    return user.rsvp?.invitationResponse === InvitationResponseEnum.Interested || 
           user.rsvp?.wedding === RsvpEnum.Attending;
  }, [user.rsvp]);

  // Check if all steps are completed
  const allStepsCompleted = useMemo(() => {
    return Object.values(stdSteps).every(step => step.completed);
  }, [stdSteps]);

  // Find the first incomplete step
  const firstIncompleteStep = useMemo(() => {
    const incompleteStep = Object.entries(stdSteps).find(([_, step]) => !step.completed);
    return incompleteStep ? incompleteStep[0] : null;
  }, [stdSteps]);

  const handleNext = useCallback((step: Step) => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  }, []);

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const handleActionButtonClick = () => {
    if (isUserAttending && allStepsCompleted) {
    } else if (firstIncompleteStep) {
      // If there are incomplete steps, navigate to the first incomplete step
      navigate(`${routes[Pages.SaveTheDate].path}?step=${firstIncompleteStep}`);
    }
  };

  const actionButtonText = useMemo(() => {
    if (isUserAttending && allStepsCompleted) {
      return 'RSVP';
    } else if (firstIncompleteStep) {
      return `Finish ${stdSteps[firstIncompleteStep].label}`;
    }
    return 'Continue';
  }, [isUserAttending, allStepsCompleted, firstIncompleteStep, stdSteps]);

  useEffect(() => {
    setRsvpSteps((prev) => {
      const newSteps = { ...prev };
      newSteps.saveTheDate.stepCompleted = false;
      return newSteps;
    });
  }, []);

  return (
    <Box 
      width="100%" 
      minWidth={280} 
      sx={{ 
        px: {xs: 1, sm: 2},
        maxHeight: {xs: 'calc(100vh - 280px)', sm: 'auto'},
        overflow: {xs: 'auto', sm: 'visible'},
        // Ensure it doesn't go below viewport
        paddingBottom: {xs: '60px', sm: 'initial'}
      }}
    >
      <Stepper 
        activeStep={activeStep} 
        orientation="vertical" 
        sx={{ 
          pl: {xs: 0, sm: 2},
          '& .MuiStepConnector-line': {
            minHeight: {xs: 24, sm: 40}
          }
        }}
        data-testid="vertical-stepper"
      >
        {Object.entries(rsvpSteps).map(([key, step]) => (<Step key={key}>
            <StepLabel
              icon={<StickFigureIcon rotation={0} fontSize={'large'} ageGroup={user.ageGroup} />}
              optional={
                <Typography 
                  variant="caption"
                  sx={{
                    display: 'block',
                    fontSize: {xs: '0.65rem', sm: '0.75rem'},
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: {xs: 'normal', sm: 'nowrap'},
                    maxWidth: {xs: '180px', sm: '280px', md: '100%'}
                  }}
                >
                  {step.id === 0 && step.stepCompleted ? 'Thanks for responding!' : `${format(step.lastDate, 'EEEE ' + 'MMMM do, yyyy')}`}
                </Typography>
              }
              sx={{
                flexDirection: {xs: 'column', sm: 'row'},
                alignItems: {xs: 'flex-start', sm: 'center'}
              }}
            >
              <Typography sx={{ fontSize: {xs: '0.9rem', sm: '1rem'} }}>
                {step.label}
              </Typography>
            </StepLabel>
            <StepContent
              sx={{
                paddingLeft: {xs: 16, sm: 20},
                marginLeft: {xs: 0, sm: 2},
                paddingRight: {xs: 1, sm: 2},
                borderLeft: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <Tooltip sx={{ textAlign: 'start' }} content={step.description} title={''}>
                <Box 
                  sx={{ 
                    mb: 2,
                    display: 'flex', 
                    flexDirection: {xs: 'column', sm: 'row'}, 
                    width: '100%',
                    // Ensure buttons are properly sized and visible on mobile
                    gap: 1,
                    position: 'relative',
                    zIndex: 5
                  }}
                >
                  <Button
                    variant="contained"
                    onClick={handleActionButtonClick}
                    sx={{ 
                      mt: 1, 
                      mr: {xs: 0, sm: 1}, 
                      mb: {xs: 1, sm: 0},
                      width: {xs: '100%', sm: 'auto'}
                    }}
                    fullWidth={true}
                    size="large"
                  >
                    {actionButtonText}
                  </Button>
                  <Button
                    disabled={!step.stepCompleted}
                    onClick={() => {
                      step.id === 0 && step.stepCompleted ? navigate('/save-the-date') : step.id < Object.values(rsvpSteps).length ? handleBack() : handleReset();
                    }}
                    sx={{ 
                      mt: 1, 
                      width: {xs: '100%', sm: 'auto'}
                    }}
                    fullWidth={true}
                    size="large"
                  >
                    {step.id === 0 && step.stepCompleted ? 'Update Your Response' : 'Back'}
                  </Button>
                </Box>
              </Tooltip>
            </StepContent>
          </Step>
        ))}
      </Stepper>
      {activeStep === Object.values(rsvpSteps).length && (
        <Paper square elevation={0} sx={{ p: 3 }}>
          <Typography>All steps completed - you&apos;re finished</Typography>
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: {xs: 'column', sm: 'row'}, 
              width: '100%',
              mt: 2
            }}
          >
            <Button 
              variant="contained" 
              onClick={handleActionButtonClick} 
              sx={{ 
                mt: 1, 
                mr: {xs: 0, sm: 1}, 
                mb: {xs: 1, sm: 0},
                width: {xs: '100%', sm: 'auto'}
              }}
              fullWidth={true}
              size="large"
            >
              {actionButtonText}
            </Button>
            <Button 
              onClick={handleReset} 
              sx={{ 
                mt: 1, 
                width: {xs: '100%', sm: 'auto'}
              }}
              fullWidth={true}
              size="large"
            >
              Reset
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
}

