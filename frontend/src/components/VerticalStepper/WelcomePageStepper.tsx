import * as React from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepContent from '@mui/material/StepContent';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { familyGuestsStates, useFamily } from '@/store/family';
import { useRecoilValue } from 'recoil';
import { redirect, useNavigate } from 'react-router-dom';
import { differenceInDays, subDays } from 'date-fns';

const steps = [
  {
    label: 'Save the Date',
    description: `We're getting married on the 5th of July in Lovettsville, VA.  For now,
    we just want to get an idea of who's coming.  We'll send out the official invitations
    once we get your interest and mailing address!`,
  },
  {
    label: 'RSVP (coming soon)!',
    description:
      'Finalize your RSVP by letting us know if you can make it, and if you have any dietary restrictions.',
  },
  {
    label: 'Wedding Day',
    description: `July 5th, 2025! See you in ${differenceInDays(new Date("2025-07-05"), new Date())} days!`,
  },
];

export default function WelcomePageStepper() {
  const [activeStep, setActiveStep] = React.useState(0);
  const familyStates = useRecoilValue(familyGuestsStates);
  const [family, familyActions] = useFamily();
  const navigate = useNavigate();
  const handleNext = () => {
    if (!familyStates?.allUsersResponded) {
      navigate('/save-the-date?step=attendance');
    } else if (!familyStates?.mailingAddressEntered || !familyStates?.mailingAddressUspsVerified) {
      navigate('/save-the-date?step=address');
    } else if (familyStates.nobodyComing) {
      console.log('find a way to disable this button');
    } else {
      // Go to the next tab if possible
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
    // return setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const continueText = () => {
    console.log('familyStates', familyStates);
    if (!familyStates?.allUsersResponded) {
      return 'Let us know if you\'re interested';
    } else if (familyStates.nobodyComing) {
      return 'Let us know if you change your mind';
    } else if (!familyStates?.mailingAddressEntered || !familyStates?.mailingAddressUspsVerified) {
      return 'Finish entering your address'
    }
  }

  return (
    <Box>
      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel
              optional={
                index === steps.length - 1 ? (
                  <Typography variant="caption">In {differenceInDays(new Date("2025-07-05"), new Date())} days</Typography>
                ) : null
              }
            >
              {step.label}
            </StepLabel>
            <StepContent>
              <Typography textAlign="start">{step.description}</Typography>
              <Box sx={{ mb: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  sx={{ mt: 1, mr: 1 }}
                >
                  {continueText(steps)}
                </Button>
                <Button
                  disabled={index === 0}
                  onClick={handleBack}
                  sx={{ mt: 1, mr: 1 }}
                >
                  Back
                </Button>
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>
      {activeStep === steps.length && (
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