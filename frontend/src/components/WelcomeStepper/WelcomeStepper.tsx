import React, { useMemo } from 'react';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  CardHeader, 
  Divider, 
  Paper, 
  Step, 
  StepContent, 
  StepLabel, 
  Stepper, 
  Typography, 
  useTheme 
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import { format, differenceInDays } from 'date-fns';
import { useRecoilValue } from 'recoil';
import { InvitationResponseEnum, RsvpEnum } from '@/types/api';
import { userState } from '@/store/user';
import { saveTheDateStepsState, stdStepperState } from '@/store/steppers/steppers';
import routes from '@/routes';
import { Pages } from '@/routes/types';
import StickFigureIcon from '@/components/StickFigureIcon';

// Step interface
export interface Step {
  id: number;
  label: string;
  description: string;
  lastDate: Date;
  stepCompleted: boolean;
  stepUrl: string | undefined;
  component?: React.ReactNode;
}

// Define steps
const steps: { [step: string]: Step } = {
  saveTheDate: {
    id: 0,
    label: 'Save the Date',
    description: `We're getting married on the 5th of July in Lovettsville, VA. For now,
    we just want to get an idea of who's coming. We'll send out the official invitations
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

const WelcomeStepper = () => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = React.useState(0);
  const user = useRecoilValue(userState);
  const [rsvpSteps, setRsvpSteps] = React.useState(steps);
  const stdSteps = useRecoilValue(saveTheDateStepsState);
  const stdStepper = useRecoilValue(stdStepperState);
  const navigate = useNavigate();
  const location = useLocation();

  // Check for step query parameter on load
  React.useEffect(() => {
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

  // Current active step information
  const activeStepInfo = Object.values(rsvpSteps)[activeStep];

  // Determine response status message
  const responseStatus = useMemo(() => {
    if (!user.rsvp) return "Please respond";
    
    switch (user.rsvp.invitationResponse) {
      case InvitationResponseEnum.Interested:
        return "You're interested in attending!";
      case InvitationResponseEnum.Declined:
        return "You've declined to attend";
      default:
        return "Please respond";
    }
  }, [user.rsvp]);

  // Handle primary action button click
  const handleActionButtonClick = () => {
    if (isUserAttending && allStepsCompleted) {
      // If user is attending and all steps are completed, go back to SaveTheDate
      navigate(routes[Pages.SaveTheDate].path);
    } else if (firstIncompleteStep) {
      // If there are incomplete steps, navigate to the first incomplete step
      navigate(`${routes[Pages.SaveTheDate].path}?step=${firstIncompleteStep}`);
    }
  };

  // Determine action button text
  const actionButtonText = useMemo(() => {
    if (isUserAttending && allStepsCompleted) {
      return 'Update Response';
    } else if (firstIncompleteStep) {
      return `${stdSteps[firstIncompleteStep].label}`;
    }
    return 'Respond';
  }, [isUserAttending, allStepsCompleted, firstIncompleteStep, stdSteps]);

  React.useEffect(() => {
    setRsvpSteps((prev) => {
      const newSteps = { ...prev };
      newSteps.saveTheDate.stepCompleted = false;
      return newSteps;
    });
  }, []);

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Step title card */}
      <Card 
        elevation={3} 
        sx={{ 
          mb: 2, 
          backgroundColor: alpha(theme.palette.background.paper, 0.2),
          backdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
          boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.3)}`
        }}
      >
        <CardHeader
          title={
            <Typography variant="h5" color="common.white" fontWeight="medium">
              {activeStepInfo.label}
            </Typography>
          }
          subheader={
            <Typography variant="subtitle1" color="common.white" sx={{ opacity: 0.8 }}>
              {format(activeStepInfo.lastDate, 'MMMM d, yyyy')}
            </Typography>
          }
          sx={{ pb: 1 }}
        />
        <CardContent sx={{ pt: 0 }}>
          <Box mt={1.5}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: user.rsvp?.invitationResponse === InvitationResponseEnum.Interested 
                  ? theme.palette.success.main 
                  : user.rsvp?.invitationResponse === InvitationResponseEnum.Declined
                    ? theme.palette.error.main
                    : theme.palette.warning.main,
                fontWeight: 'medium',
                p: 1,
                borderRadius: 1,
                backgroundColor: alpha(theme.palette.background.paper, 0.3),
                display: 'inline-block'
              }}
            >
              Status: {responseStatus}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Stepper section */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', mb: 2 }}>
        <Stepper 
          activeStep={activeStep} 
          orientation="vertical" 
          sx={{ 
            '& .MuiStepConnector-line': {
              minHeight: { xs: 24, sm: 32 },
              borderLeftColor: alpha(theme.palette.common.white, 0.3)
            },
            '& .MuiStepLabel-iconContainer': {
              bgcolor: alpha(theme.palette.background.paper, 0.2),
              backdropFilter: 'blur(5px)',
              borderRadius: '50%',
              p: 0.5
            }
          }}
        >
          {Object.entries(rsvpSteps).map(([key, step]) => (
            <Step key={key}>
              <StepLabel
                icon={<StickFigureIcon rotation={0} fontSize="medium" ageGroup={user.ageGroup} />}
              >
                <Typography color="common.white" fontWeight={activeStep === step.id ? 'medium' : 'normal'}>
                  {step.label}
                </Typography>
                <Typography 
                  variant="caption" 
                  color="common.white" 
                  sx={{ opacity: 0.7, display: 'block' }}
                >
                  {format(step.lastDate, 'MMMM d, yyyy')}
                </Typography>
              </StepLabel>
              <StepContent
                sx={{
                  borderLeft: `1px solid ${alpha(theme.palette.common.white, 0.3)}`,
                  pb: 2
                }}
              >
                <Typography 
                  variant="body2" 
                  color="common.white" 
                  sx={{ mb: 2, opacity: 0.9 }}
                >
                  {step.description}
                </Typography>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Box>

      {/* Action buttons */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 2, 
          mt: 'auto',
          backgroundColor: alpha(theme.palette.background.paper, 0.15),
          backdropFilter: 'blur(10px)',
          borderTop: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
          boxShadow: `0 -4px 20px ${alpha(theme.palette.common.black, 0.2)}`,
          // Ensure buttons are always visible and properly positioned
          position: 'sticky',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          width: '100%'
        }}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            width: '100%'
          }}
        >
          <Button
            variant="contained"
            color={firstIncompleteStep ? 'secondary' : "primary"}
            size="large"
            fullWidth
            onClick={handleActionButtonClick}
            sx={{
              fontWeight: 'medium',
              py: 1.5,
              boxShadow: `4px 4px 0px ${alpha(firstIncompleteStep ? theme.palette.secondary.dark : theme.palette.primary.main, 0.3)}`
            }}
          >
            {actionButtonText}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default WelcomeStepper;