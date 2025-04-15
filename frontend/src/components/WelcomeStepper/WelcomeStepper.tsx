import React, { useMemo, useEffect, useState, useRef, useCallback } from 'react';
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
  useTheme,
  useMediaQuery,
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
import { CountdownBox, SideCountdownContainer } from '@/pages/Welcome/styled';
import Countdowns from '@/components/Countdowns';
import { useAppLayout } from '@/context/Providers/AppState/useAppLayout';
import { BlockTextTypography, BlockTextTypographyLess, StephsActualFavoriteTypography, StephsActualFavoriteTypographyNoDrop, StephsActualFavoriteTypographyNoDropWhite, Text3dTypography } from '../AttendanceButton/AttendanceButton';
import { useAuth0 } from '@auth0/auth0-react';
import LoadingBox from '@/components/LoadingBox';
import { familyGuestsStates } from '@/store/family';
import { isFeatureEnabled } from '@/config';

// Step interface
export interface Step {
  id: number;
  label: string;
  description: string;
  lastDate: Date;
  stepCompleted: boolean;
  stepUrl: string | undefined;
  component?: React.ReactNode;
  enabled: boolean;
}

// Define steps
const steps: { [step: string]: Step } = {
  saveTheDate: {
    id: 0,
    label: 'Save the Date Survey',
    description: `We're getting married on the 5th of July at Stone Manor in Lovettsville, VA. 
    For now, we are gathering survey data for planning purposes.
    We'll send out official paper invitations once we get your interest and mailing address! 
    Official RSVP phase coming soon.`,
    lastDate: new Date('2025-04-16'),
    stepCompleted: !isFeatureEnabled('ENABLE_SURVEY_PHASE'),
    stepUrl: routes[Pages.SaveTheDate].path,
    enabled: true //isFeatureEnabled('ENABLE_SURVEY_PHASE')
  },
  rsvp: {
    id: 1,
    label: 'RSVP',
    description:
      `Finalize your RSVP by letting us know if you can make it to our events, along with your final accomodations for shuttle headcounts.
      <br/><br/>
      <b>NEW SITE CONTENT!</b> 
      <br/>
      <span style="color: #e9950c; font-weight: bold;">RSVP</span>
      - <span style="color: #e9950c; font-weight: bold;">Stats</span>
      - <span style="color: #e9950c; font-weight: bold;">Details</span>
      - <span style="color: #e9950c; font-weight: bold;">Registry</span>
      `,
    lastDate: new Date('2025-05-20'),
    stepCompleted: !isFeatureEnabled('ENABLE_RSVP_PHASE'),
    stepUrl: '/',
    enabled: isFeatureEnabled('ENABLE_RSVP_PHASE')
  },
  wedding: {
    id: 2,
    label: 'Wedding Day',
    description: `July 5th, 2025! See you in ${differenceInDays(
      new Date('2025-07-05'),
      new Date(),
    )} days!`,
    lastDate: new Date('2025-07-06'),
    stepCompleted: !isFeatureEnabled('ENABLE_WEDDING_PHASE'),
    stepUrl: routes[Pages.Profile].path,
    enabled: true //isFeatureEnabled('ENABLE_WEDDING_PHASE')
  },
};

const WelcomeStepper = () => {
  const theme = useTheme();
  const { user: auth0User } = useAuth0();
  const attendanceState = useRecoilValue(familyGuestsStates);
  const [activeStep, setActiveStep] = React.useState(0);
  const user = useRecoilValue(userState);
  const [rsvpSteps, setRsvpSteps] = React.useState(steps);
  const stdSteps = useRecoilValue(saveTheDateStepsState);
  const stdStepper = useRecoilValue(stdStepperState);
  const navigate = useNavigate();
  const location = useLocation();
  const { contentHeight } = useAppLayout();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // State to track whether button should be at top or bottom
  const [buttonAtTop, setButtonAtTop] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const stepperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  // Check for step query parameter on load
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const stepParam = params.get('step');
    if (stepParam) {
      // Navigate to the Save the Date page with the specified step
      navigate(`${routes[Pages.SaveTheDate].path}?step=${stepParam}`);
    }
  }, [location.search]);

  // Check if all steps are completed
  const allStepsCompleted = useMemo(() => {
    return Object.values(stdSteps).every((step) => step.completed);
  }, [stdSteps]);

  // Find the first applicable incomplete step based on RSVP status
  const firstIncompleteStep = useMemo(() => {
    // Define which steps are relevant for pending/declined guests
    const basicSteps = ['attendance', 'mailingAddress', 'comments', 'summary'];
    
    // If user is not attending (declined or pending), only show basic steps
    const relevantSteps = attendanceState?.atLeastOneAttending 
      ? Object.entries(stdSteps) 
      : Object.entries(stdSteps).filter(([key]) => basicSteps.includes(key));
    
    // Find the first incomplete relevant step
    const incompleteStep = relevantSteps?.find(([_, step]) => !step.completed);
    return incompleteStep ? incompleteStep[0] : null;
  }, [stdSteps, attendanceState]);

  // Current active step information
  const activeStepInfo = Object.values(rsvpSteps)[activeStep];

  const calculateChipColor = useCallback((key: string) => {
    console.log(`key: ${key}`)
    switch(key) {
      case('saveTheDate'):
        return user.rsvp?.invitationResponse === InvitationResponseEnum.Interested 
        ? theme.palette.success.main
        : user.rsvp?.invitationResponse === InvitationResponseEnum.Declined
          ? theme.palette.error.main
          : theme.palette.warning.main;
      case('rsvp'):
      return user.rsvp?.wedding === RsvpEnum.Attending 
        ? theme.palette.success.main
        : user.rsvp?.wedding === RsvpEnum.Declined
          ? theme.palette.error.main
          : theme.palette.warning.main;
      default:
        return theme.palette.warning.main
    }
  }, [user.rsvp, theme.palette]);

  // Determine response status message
  const responseStatus = useMemo(() => {
    if (!user.rsvp) return 'Please respond';

    switch (user.rsvp.invitationResponse) {
      case InvitationResponseEnum.Interested:
        return "You're interested in attending!";
      case InvitationResponseEnum.Declined:
        return "You've declined to attend";
      default:
        return 'Please respond';
    }
  }, [user.rsvp]);

  const weddingResponseStatus = useMemo(() => {
    if (!user.rsvp) return 'Please respond';

    switch (user.rsvp.wedding) {
      case RsvpEnum.Attending:
        return "You confirmed you are attending!";
      case RsvpEnum.Declined:
        return "You've declined to attend";
      default:
        return 'Please respond';
    }
  }, [user.rsvp]);

  // Handle primary action button click
  const handleActionButtonClick = () => {
    if ((attendanceState?.atLeastOneAttending && allStepsCompleted) || 
        (user.rsvp?.invitationResponse === InvitationResponseEnum.Declined && 
         stdSteps['attendance']?.completed && 
         stdSteps['mailingAddress']?.completed)) {
      // If user is attending and all steps are completed, or
      // If user has declined and completed the required steps,
      // go back to SaveTheDate
      navigate(routes[Pages.SaveTheDate].path);
    } else if (firstIncompleteStep) {
      // If there are incomplete steps, navigate to the first incomplete step
      // Direct navigation with query parameter
      const targetPage = routes[Pages.SaveTheDate].path;
      
      // Force a hard navigation to make sure the step parameter is recognized
      window.location.href = `${window.location.origin}${targetPage}?step=${firstIncompleteStep}`;
    } else {
      // Fallback to the main SaveTheDate page
      navigate(routes[Pages.SaveTheDate].path);
    }
  };

  // Determine action button text
  const actionButtonText = useMemo(() => {
    if ((attendanceState?.atLeastOneAttending  && allStepsCompleted) || 
        (user.rsvp?.invitationResponse === InvitationResponseEnum.Declined && 
         stdSteps['attendance']?.completed && 
         stdSteps['mailingAddress']?.completed)) {
      return 'Update Survey Response';
    } 
    // else if (firstIncompleteStep) {
    //   return `${stdSteps[firstIncompleteStep].label}`;
    // } 
    else if (firstIncompleteStep) {
      return 'Continue Survey';
    }
    else if (user.rsvp?.invitationResponse === InvitationResponseEnum.Declined || 
               user.rsvp?.invitationResponse === InvitationResponseEnum.Pending) {
      return 'Complete Survey Required Info';
    }
    return isMobile ? 'Respond to Survey' : 'Respond to Save the Date Survey';
  }, [attendanceState , allStepsCompleted, firstIncompleteStep, stdSteps, user.rsvp?.invitationResponse]);

  React.useEffect(() => {
    setRsvpSteps((prev) => {
      const newSteps = { ...prev };
      newSteps.saveTheDate.stepCompleted = false;
      return newSteps;
    });
  }, []);
  
  // Effect to calculate available space and determine button position
  useEffect(() => {
    const checkAvailableSpace = () => {
      if (containerRef.current && stepperRef.current && buttonRef.current) {
        // Calculate if we have enough space
        const containerHeight = containerRef.current.clientHeight;
        const stepperHeight = stepperRef.current.clientHeight;
        const buttonHeight = buttonRef.current.clientHeight;
        const headerHeight = 48; // Approximate height of the compact header
        
        // Calculate total content height
        const totalContentHeight = headerHeight + stepperHeight + buttonHeight + 24; // Adding some padding
        
        // If content is too tall for container, move button to top
        // We're using a threshold to prevent flickering when it's close to the boundary
        const threshold = 20; // 20px threshold
        setButtonAtTop(totalContentHeight > containerHeight - threshold);
      }
    };
    
    // Check on mount and when dimensions might change
    checkAvailableSpace();
    
    // Set up ResizeObserver to respond to size changes
    const resizeObserver = new ResizeObserver(checkAvailableSpace);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    return () => {
      resizeObserver.disconnect();
    };
  }, [contentHeight, isMobile]);

  // Render action button component that can be placed at top or bottom
  const ActionButton = () => (
    <Paper
      elevation={3}
      ref={buttonRef}
      sx={{
        p: { xs: 1, sm: 1.5 },
        backgroundColor: alpha(theme.palette.background.paper, 0.15),
        backdropFilter: 'blur(10px)',
        borderTop: buttonAtTop ? 'none' : `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
        borderBottom: buttonAtTop ? `1px solid ${alpha(theme.palette.common.white, 0.1)}` : 'none',
        boxShadow: buttonAtTop 
          ? `0 4px 20px ${alpha(theme.palette.common.black, 0.2)}`
          : `0 -4px 20px ${alpha(theme.palette.common.black, 0.2)}`,
        position: 'relative',
        zIndex: 10,
        width: '100%',
        mb: buttonAtTop ? 1.5 : 0,
        mt: buttonAtTop ? 0 : 1.5,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 1.5,
          width: '100%',
        }}
      >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',  // Aligns content to the right horizontally
          alignItems: 'center',        // Centers content vertically
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontSize: '0.8rem',
            textAlign: 'right'
          }}
        >
          Complete step:
        </Typography>
      </Box>
        <Button
          variant="contained"
          color={firstIncompleteStep ? 'secondary' : 'primary'}
          size="large"
          fullWidth
          onClick={handleActionButtonClick}
          sx={{
            fontWeight: 'medium',
            py: { xs: 0.75, sm: 1.25 },
            fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' },
            wordBreak: 'break-word',
            whiteSpace: 'normal', // Allow text to wrap
            lineHeight: 1.2,
            boxShadow: `4px 4px 0px ${alpha(
              firstIncompleteStep ? '#000000' : theme.palette.primary.main,
              0.3,
            )}`,
          }}
        >
          {actionButtonText}
        </Button>
      </Box>
    </Paper>
  );

  return (
    <Box 
      ref={containerRef}
      sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      {/* Stepper section */}
      <Box
        ref={stepperRef}
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          mb: 1,
          background: alpha(theme.palette.background.paper, 0.8),
          pl: '7px',
          pr: '12px',
          borderRadius: '3px',
          maxHeight: buttonAtTop 
            ? { xs: '55vh', sm: '60vh', md: '65vh' }
            : { xs: '60vh', sm: '65vh', md: '70vh' },
        }}
      >
        <Stepper
          activeStep={activeStep}
          orientation="vertical"
          sx={{
            '& .MuiStepConnector-line': {
              minHeight: { xs: 24, sm: 32 },
              borderLeftColor: alpha(theme.palette.common.white, 0.3),
            },
            '& .MuiStepLabel-iconContainer': {
              bgcolor: alpha(theme.palette.background.paper, 0.2),
              backdropFilter: 'blur(5px)',
              borderRadius: '50%',
              p: 0.5,
            },
          }}
        >
          {/* Render only enabled steps */}
          {Object.entries(rsvpSteps)
            .filter(([_, step]) => step.enabled) // Only show steps with enabled=true
            .map(([key, step]) => (
            
            <Step key={key}>
              <StepLabel
                icon={<StickFigureIcon rotation={0} fontSize="medium" ageGroup={user.ageGroup} />}
                onClick={() => navigate(step.stepUrl || routes[Pages.SaveTheDate].path)}
                sx={{
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.common.white, 0.1),
                    borderRadius: 1,
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <Box>
                    <StephsActualFavoriteTypographyNoDropWhite
                      color="common.white"
                      fontWeight={activeStep === step.id ? 'medium' : 'normal'}
                      sx={{
                        fontSize: '1.2rem',
                        textShadow: '-2px -2px 0 #000000, -1px -1px 0 #000000'
                      }}
                    >
                      {step.label}
                    </StephsActualFavoriteTypographyNoDropWhite>
                    {/* <BlockTextTypography */ }
                    <Typography
                      variant="caption"
                      //shadowColor={'#222222'} 
                      //maxPx={2}    
                      sx={{ 
                        opacity: 1.0, 
                        display: 'block', 
                        color: theme.palette.secondary.main,
                        // pl: 0.8,
                        // pt: 0.2,
                        // pr: 0.8,
                        // borderRadius: 1,                        
                        // backgroundColor: alpha('#000000', 0.15),
                        // backdropFilter: 'blur(80px)',
                      }}
                    >
                      {step.label !== 'Wedding Day' ? 'Respond by: ' : ''} {format(step.lastDate, 'MMMM d, yyyy')}
                    </Typography>
                  </Box>
                  
                  {/* Show status badge only for the first step */}
                  {step.enabled && (
                    <Box
                      sx={{
                        display: 'inline-flex',
                        position: 'relative',
                        ml: 1,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          color: calculateChipColor(key),
                          fontWeight: 'medium',
                          fontSize: '0.7rem',
                          py: 0.6,
                          px: 1,
                          borderRadius: '16px',
                          borderWidth: '1.5px',
                          borderStyle: 'solid',
                          borderColor: calculateChipColor(key),
                          backgroundColor: alpha(theme.palette.background.paper, 0.8),
                          backdropFilter: 'blur(8px)',
                          boxShadow: `0 2px 6px ${alpha('#000', 0.3)}`,
                          textShadow: '0.5px 0.5px 1px rgba(0,0,0,0.5)',
                          letterSpacing: '0.02em',
                        }}
                      >
                        {key === 'saveTheDate' ? responseStatus : weddingResponseStatus}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </StepLabel>
              <StepContent
                sx={{
                  borderLeft: `1px solid ${alpha(theme.palette.common.white, 0.3)}`,
                  pb: 2,
                }}
              >
                <BlockTextTypographyLess 
                  variant="body2" 
                  color="common.white" 
                  sx={{ mb: 2, opacity: 0.9 }}
                  dangerouslySetInnerHTML={{ __html: step.description }}
                />
              
                {/* Action button shows at top when needed */}
                {step.enabled && <ActionButton />}
              </StepContent>

            </Step>

          ))}
        </Stepper>
      </Box>

      {/* Action button shows at bottom by default */}
      {/* {!buttonAtTop && <ActionButton />} */}
    </Box>
  );
};

export default WelcomeStepper;
