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
import { useNavigate } from 'react-router-dom';
import { differenceInDays, format } from 'date-fns';
import Tooltip from '@mui/material/Tooltip';
import StickFigureIcon from '@/components/StickFigureIcon';
import { useCallback, useEffect } from 'react';
import routes from '@/routes';
import { Pages } from '@/routes/types';
import { userState } from '@/store/user';

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
    stepUrl: routes[Pages.FoodPreferences].path,
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
  const navigate = useNavigate();
  const handleNext = useCallback((step: Step) => {
    // Go to the next tab if possible
    setActiveStep((prevActiveStep) => prevActiveStep + 1);

    // return setActiveStep((prevActiveStep) => prevActiveStep + 1);
  }, [rsvpSteps, activeStep]);

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const continueText = () => {
    return 'RSVP';
  };

  useEffect(() => {
    setRsvpSteps((prev) => {
      const newSteps = { ...prev };

      newSteps.saveTheDate.stepCompleted = false;
      return newSteps;
    });
  }, []);

  return (
    <Box width="100%" minWidth={330}>
      <Stepper activeStep={activeStep} orientation="vertical" sx={{ pl: 2 }}>
        {Object.entries(rsvpSteps).map(([key, step]) => (<Step key={key}>
            <StepLabel
              icon={<StickFigureIcon rotation={0} fontSize={'large'} ageGroup={user.ageGroup} />}
              optional={
                <Typography variant="caption">
                  {step.id === 0 && step.stepCompleted ? 'Thanks for responding!' : `${format(step.lastDate, 'EEEE ' + 'MMMM do, yyyy')}`}
                </Typography>
              }
            >
              {step.label}
            </StepLabel>
            <StepContent>
              <Tooltip sx={{ textAlign: 'start' }} content={step.description} title={''}>
                <Box sx={{ mb: 2 }}>
                  <Button
                    variant="contained"
                    onClick={() => handleNext(step)}
                    sx={{ mt: 1, mr: 1 }}
                    disabled={step.id !== 0}
                  >
                    {continueText()}
                  </Button>
                  <Button
                    disabled={!step.stepCompleted}
                    onClick={() => {
                      step.id === 0 && step.stepCompleted ? navigate('/save-the-date') : step.id < Object.values(rsvpSteps).length ? handleBack() : handleReset();
                    }}
                    sx={{ mt: 1, mr: 1 }}
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
          <Button onClick={handleReset} sx={{ mt: 1, mr: 1 }}>
            Reset
          </Button>
        </Paper>
      )}
    </Box>
  );
}

