import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  linearProgressClasses,
  StepConnector,
  stepConnectorClasses,
  stepLabelClasses,
  StepIconProps,
  StepLabelProps,
  useTheme,
  StepButton,
} from '@mui/material';
import { useRecoilState, useRecoilValue } from 'recoil';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';

import { useFamily, familyGuestsStates } from '@/store/family';
import IconButton from '@mui/material/IconButton';
import {
  Check, CheckCircleOutlineTwoTone,
  Circle,
  CloseTwoTone, Publish,
  PublishedWithChangesTwoTone, RadioButtonChecked, RadioButtonUnchecked, TaskAltTwoTone, TripOrigin,
  Unpublished,
  UnpublishedTwoTone,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import Stepper from '@mui/material/Stepper';
import StepLabel from '@mui/material/StepLabel';
import Step from '@mui/material/Step';
import {
  SaveTheDateStep,
  saveTheDateStepsState,
  stdStepperState,
  stdTabIndex,
} from '@/store/steppers/steppers';
import { userState } from '@/store/user';
import Container from '@mui/material/Container';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

export default function SaveTheDateStepper() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: auth0User } = useAuth0();
  const [_, familyActions] = useFamily();
  const familyState = useRecoilValue(familyGuestsStates);
  const [saveTheDateSteps, updateSteps] = useRecoilState(saveTheDateStepsState);
  const [tabIndex, setTabIndex] = useRecoilState(stdTabIndex);

  const [initialUrlProcessed, setInitialUrlProcessed] = useState(false);
  const [visibleStepIndex, setVisibleStepIndex] = useState(0);

  // Define which steps are relevant based on attendance status
  const basicSteps = useMemo(() => ['attendance', 'mailingAddress', 'comments', 'summary'], []);
  
  // Compute the visible steps based on attendance status
  const visibleSteps = useMemo(() => {
    if (!familyState) return Object.entries(saveTheDateSteps);
    
    // Filter steps based on whether at least one person in the family is attending
    const relevantSteps = familyState.atLeastOneAttending
      ? Object.entries(saveTheDateSteps).filter(([_, step]) => step.display)
      : Object.entries(saveTheDateSteps).filter(([key, step]) => 
          basicSteps.includes(key) && step.display
        );
        
    // Debug the filtering conditions
    // console.log('Step filtering info:', {
    //   atLeastOneAttending: familyState.atLeastOneAttending,
    //   basicSteps,
    //   allSteps: Object.keys(saveTheDateSteps),
    //   filteredSteps: relevantSteps.map(([key]) => key)
    // });
        
    // When attendance status changes, we need to update the visibleStepIndex in the next render
    const currentStepKey = Object.keys(saveTheDateSteps)[tabIndex];
    const newVisibleIndex = relevantSteps.findIndex(([key]) => key === currentStepKey);
    if (newVisibleIndex !== -1 && newVisibleIndex !== visibleStepIndex) {
      // Use setTimeout to avoid state updates during render
      setTimeout(() => {
        setVisibleStepIndex(newVisibleIndex);
      }, 0);
    }
        
    return relevantSteps;
  }, [saveTheDateSteps, familyState, basicSteps, tabIndex]);

  // Effect that runs on initial load and when the location changes
  // This will check for the step query parameter and set the active step
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const step = params.get('step');
    
    if (step && Object.keys(saveTheDateSteps).includes(step)) {
      // Check if the step should be visible based on attendance status
      const isStepVisible = familyState?.atLeastOneAttending 
        ? saveTheDateSteps[step].display
        : basicSteps.includes(step) && saveTheDateSteps[step].display;
      
      if (isStepVisible) {
        // Set the global tab index for this step
        const index = Object.keys(saveTheDateSteps).indexOf(step);
        //console.log('Setting step index from URL params:', step, index);
        setTabIndex(index);
        
        // Also update the visible index for this step
        const visibleIndex = visibleSteps.findIndex(([key]) => key === step);
        if (visibleIndex !== -1) {
          //console.log('Setting visibleStepIndex to', visibleIndex, 'for step', step);
          setVisibleStepIndex(visibleIndex);
        }
      } else {
        // If the step shouldn't be visible, redirect to the first visible step
        const firstVisibleStep = visibleSteps[0]?.[0] || 'attendance';
        const firstVisibleIndex = Object.keys(saveTheDateSteps).indexOf(firstVisibleStep);
        //console.log('Redirecting to first visible step:', firstVisibleStep);
        setTabIndex(firstVisibleIndex);
        setVisibleStepIndex(0); // First visible step
        navigate(`/save-the-date?step=${firstVisibleStep}`, { replace: true });
      }
      setInitialUrlProcessed(true);
    } else if (!initialUrlProcessed) {
      // No step in URL, initialize to the first visible step
      const firstVisibleStep = visibleSteps[0]?.[0] || 'attendance';
      const firstVisibleIndex = Object.keys(saveTheDateSteps).indexOf(firstVisibleStep);
      setTabIndex(firstVisibleIndex);
      setVisibleStepIndex(0);
      setInitialUrlProcessed(true);
    }
  }, [location.search, saveTheDateSteps, setTabIndex, initialUrlProcessed, familyState, visibleSteps, basicSteps]);
  
  // Effect to update the visibleStepIndex when tabIndex, visibleSteps, or URL changes
  useEffect(() => {
    if (!initialUrlProcessed) return;
    
    // Get the current step from the URL or tabIndex
    const params = new URLSearchParams(location.search);
    const stepFromUrl = params.get('step');
    
    // Prioritize step from URL if it exists
    const currentStepKey = stepFromUrl || Object.keys(saveTheDateSteps)[tabIndex];
    
    // Find the index of the current step in the visible steps array
    const visibleIndex = visibleSteps.findIndex(([key]) => key === currentStepKey);
    
    if (visibleIndex !== -1) {
      // Current step is visible
      if (visibleIndex !== visibleStepIndex) {
        setVisibleStepIndex(visibleIndex);
        //console.log('Setting visibleStepIndex to', visibleIndex, 'for step', currentStepKey);
      }
    } else {
      // Current step is not visible, set to the first visible step
      if (visibleStepIndex !== 0) {
        setVisibleStepIndex(0);
        //console.log('Step not found in visible steps, setting to 0');
        
        // Update URL to match the first visible step
        const firstVisibleStep = visibleSteps[0]?.[0];
        if (firstVisibleStep) {
          navigate(`/save-the-date?step=${firstVisibleStep}`, { replace: true });
        }
      }
    }
  }, [tabIndex, visibleSteps, saveTheDateSteps, initialUrlProcessed, location.search]);

  // Effect to update URL when tab changes - only after initial URL is processed
  useEffect(() => {
    // Only update URL after we've processed the initial URL parameter
    if (initialUrlProcessed) {
      const currentStepKey = Object.keys(saveTheDateSteps)[tabIndex];
      const params = new URLSearchParams(location.search);
      const currentUrlStep = params.get('step');
      
      // If the current step is not visible based on attendance status, redirect
      const isStepVisible = familyState?.atLeastOneAttending 
        ? saveTheDateSteps[currentStepKey]?.display
        : basicSteps.includes(currentStepKey) && saveTheDateSteps[currentStepKey]?.display;
      
      if (!isStepVisible) {
        // Redirect to the first visible step
        const firstVisibleStep = visibleSteps[0]?.[0] || 'attendance';
        const firstVisibleIndex = Object.keys(saveTheDateSteps).indexOf(firstVisibleStep);
        //console.log('Current step not visible, redirecting to:', firstVisibleStep);
        setTabIndex(firstVisibleIndex);
        const newUrl = `/save-the-date?step=${firstVisibleStep}`;
        window.history.replaceState(null, '', newUrl);
      } else if (currentStepKey && currentUrlStep !== currentStepKey) {
        //console.log('Updating URL to match current step:', currentStepKey);
        // Use history.replaceState to update URL without adding new history entry
        const newUrl = `/save-the-date?step=${currentStepKey}`;
        window.history.replaceState(null, '', newUrl);
      }
    }
  }, [tabIndex, saveTheDateSteps, location.search, initialUrlProcessed, familyState, visibleSteps, basicSteps]);

  const handleNavigateToStep = (step: string) => {
    // Check if the step should be visible based on attendance status
    const isStepVisible = familyState?.atLeastOneAttending 
      ? saveTheDateSteps[step].display
      : basicSteps.includes(step) && saveTheDateSteps[step].display;
    
    if (isStepVisible) {
      familyActions.getFamily();
      // Set the global tab index
      setTabIndex(Object.keys(saveTheDateSteps).indexOf(step));
      
      // Find the index in visibleSteps as well
      const newVisibleIndex = visibleSteps.findIndex(([key]) => key === step);
      if (newVisibleIndex !== -1) {
        setVisibleStepIndex(newVisibleIndex);
      }
      
      navigate(`/save-the-date?step=${step}`);
    } else {
      //console.log('Attempted to navigate to invisible step:', step);
    }
  };

  // Debug log to help troubleshoot step index issues
  // console.log('SaveTheDateStepper render state:', {
  //   visibleStepIndex,
  //   tabIndex,
  //   currentStepKey: Object.keys(saveTheDateSteps)[tabIndex],
  //   currentUrlStep: new URLSearchParams(location.search).get('step'),
  //   visibleSteps: visibleSteps.map(([key, step], index) => ({
  //     key,
  //     completed: step.completed,
  //     active: index === visibleStepIndex
  //   })),
  // });

  // Get the theme for styling
  const theme = useTheme();

  // Explicitly calculate active step from URL for absolute certainty
  const currentUrlStep = new URLSearchParams(location.search).get('step');
  const actualActiveIndex = currentUrlStep 
    ? visibleSteps.findIndex(([key]) => key === currentUrlStep)
    : visibleStepIndex;
  
  // Use the explicitly calculated index if valid, otherwise default to visibleStepIndex
  const activeIndex = actualActiveIndex !== -1 ? actualActiveIndex : visibleStepIndex;
  
  return (
    <Box
      component={Container}
      pt={2}
      display="flex"
      alignItems="center"
      height={60}
      justifyContent="space-between"
    >
      <Box flexGrow={2} display="flex" alignItems="center" width="100%" >
        <Stepper
          sx={{ width: '100%', height: 40 }}
          activeStep={activeIndex}
          nonLinear
          orientation="horizontal"
          connector={<StyledConnector />}
        >
          {/* Use the pre-computed visibleSteps instead of filtering here */}
          {visibleSteps.map(([key, step], index) => {
            const isStepActive = index === activeIndex;
            return (
              <Step 
                completed={!isStepActive && step.completed} 
                key={key} 
                active={isStepActive ? true : undefined}
              >
                <CustomStepLabel
                  onClick={() => handleNavigateToStep(key)}
                  sx={{
                    cursor: 'pointer',
                  }}
                  StepIconComponent={StepperIcon}
                  active={isStepActive ? "true" : undefined}
                ></CustomStepLabel>
              </Step>
            );
          })}
        </Stepper>
      </Box>
      <Box
        display={'flex'}
        flexGrow={0}
        minWidth={40}
        justifyContent="flex-end"
        px={2}
      >
        <IconButton onClick={() => navigate('/')}>
          <CloseTwoTone />
        </IconButton>
      </Box>
    </Box>
  );
}

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 0,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: theme.palette.grey[200],
    ...theme.applyStyles('dark', {
      backgroundColor: theme.palette.grey[800],
    }),
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 0,
    backgroundColor: theme.palette.primary.main,
    ...theme.applyStyles('dark', {
      backgroundColor: theme.palette.primary.dark,
    }),
  },
}));

const StyledConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 10,
    left: 'calc(-50% + 16px)',
    right: 'calc(50% + 16px)',
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: '#784af4',
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: theme.palette.success.main,
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    borderColor: '#eaeaf0',
    borderTopWidth: 3,
    borderRadius: 1,
    ...theme.applyStyles('dark', {
      borderColor: theme.palette.grey[800],
    }),
  },
}));

function StepperIcon(props: StepIconProps) {
  const { active, completed, className } = props;
  const theme = useTheme();
  
  // Log the props to help debug
  //console.log('StepperIcon props:', { active, completed });
  
  // Use explicit Material-UI icons for better distinction
  return (
    <StepperIconRoot ownerState={{ active: active || false }} className={className}>
      {active ? (
        <Box position="relative" display="flex">
          <TripOrigin color="primary" style={{ transform: 'scale(1.1)' }} />
          <Box 
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            transform: 'scale(0.6)',
            color: 'white'
          }}>
            <FiberManualRecordIcon 
              fontSize="small"
          />
         </Box>
        </Box>
      ) : completed ? (
        // Completed step
        <CheckCircleOutlineTwoTone fontWeight={800} color="success" />
      ) : (
        // Inactive, uncompleted step
        <TripOrigin color="secondary" />
      )}
    </StepperIconRoot>
  );
}

const StepperIconRoot = styled('div')<{ ownerState: { active?: boolean } }>(({ theme, ownerState }) => ({
  color: '#eaeaf0',
  display: 'flex',
  height: 22,
  alignItems: 'center',
  '& .QontoStepIcon-completedIcon': {
    color: '#784af4',
    zIndex: 1,
    fontSize: 18,
  },
  '& .QontoStepIcon-circle': {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: 'currentColor',
  },
  '& svg': {
    transition: 'all 0.2s ease-in-out',
  },
  ...theme.applyStyles('dark', {
    color: theme.palette.grey[700],
  }),
  ...(ownerState?.active ? {
    color: theme.palette.primary.main,
    '& svg': {
      filter: `drop-shadow(0 0 2px ${theme.palette.primary.main})`,
    },
  } : {}),
}));

const CustomStepLabel = styled(StepLabel)<StepLabelProps & { active?: string | undefined }>(({ theme, active }) => ({
  [`& .${stepLabelClasses.label}`]: {
    ...theme.applyStyles('dark', {}),
  },
  // Generic MUI active class
  [`& .Mui-active`]: {
    color: `${theme.palette.primary.main} !important`,
    '& svg': {
      filter: `drop-shadow(0 0 4px ${theme.palette.primary.main})`,
      transform: 'scale(1.5)',
    }
  },
  // For our active prop passed directly
  ...(active === "true" ? {
    color: `${theme.palette.primary.main} !important`,
    fontWeight: 'bold',
    '& svg': {
      filter: `drop-shadow(0 0 4px ${theme.palette.primary.main})`,
      transform: 'scale(1.5)',
    },
    // Add a pseudo-element to highlight the active step
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: '-8px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '6px',
      height: '6px',
      borderRadius: '50%',
      backgroundColor: theme.palette.primary.main,
      boxShadow: `0 0 4px ${theme.palette.primary.main}`,
    }
  } : {}),
  // Completed step styling
  [`& .${stepLabelClasses.completed}`]: {
    color: theme.palette.success.main,
  },
}));