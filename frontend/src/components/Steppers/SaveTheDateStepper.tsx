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

import { useFamily } from '@/store/family';
import IconButton from '@mui/material/IconButton';
import {
  Check, CheckCircleOutlineTwoTone,
  Circle,
  CloseTwoTone, Publish,
  PublishedWithChangesTwoTone, RadioButtonUnchecked, TaskAltTwoTone, TripOrigin,
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

export default function SaveTheDateStepper() {
  const navigate = useNavigate();
  const location = useLocation();

  const [_, familyActions] = useFamily();
  const [saveTheDateSteps, updateSteps] = useRecoilState(saveTheDateStepsState);
  const [tabIndex, setTabIndex] = useRecoilState(stdTabIndex);

  const [initialUrlProcessed, setInitialUrlProcessed] = useState(false);


  // Effect that runs on initial load and when the location changes
  // This will check for the step query parameter and set the active step
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const step = params.get('step');
    
    if (step && Object.keys(saveTheDateSteps).includes(step)) {
      const index = Object.keys(saveTheDateSteps).indexOf(step);
      console.log('Setting step index from URL params:', step, index);
      setTabIndex(index);
      setInitialUrlProcessed(true);
    } else if (!initialUrlProcessed) {
      setInitialUrlProcessed(true);
    }
  }, [location.search, saveTheDateSteps, setTabIndex, initialUrlProcessed]);
  
  // Effect to update URL when tab changes - only after initial URL is processed
  useEffect(() => {
    // Only update URL after we've processed the initial URL parameter
    if (initialUrlProcessed) {
      const currentStep = Object.keys(saveTheDateSteps)[tabIndex];
      const params = new URLSearchParams(location.search);
      const currentUrlStep = params.get('step');
      
      if (currentStep && currentUrlStep !== currentStep) {
        console.log('Updating URL to match current step:', currentStep);
        // Use history.replaceState to update URL without adding new history entry
        const newUrl = `/save-the-date?step=${currentStep}`;
        window.history.replaceState(null, '', newUrl);
      }
    }
  }, [tabIndex, saveTheDateSteps, location.search, initialUrlProcessed]);

  const handleNavigateToStep = (step: string) => {
    familyActions.getFamily();
    setTabIndex(Object.keys(saveTheDateSteps).indexOf(step));
    navigate(`/save-the-date?step=${step}`);
  };

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
          activeStep={tabIndex}
          nonLinear
          orientation="horizontal"
          connector={<StyledConnector />}
        >
          {Object.entries(saveTheDateSteps)
            .filter(([key, step]) => step.display)
            .map(([key, step]) => (
            <Step completed={step.completed} key={key}>
              <CustomStepLabel
                onClick={() => handleNavigateToStep(key)}
                sx={{
                  cursor: 'pointer',
                }}
                StepIconComponent={StepperIcon}
              ></CustomStepLabel>
            </Step>
          ))}
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
  const user = useRecoilValue(userState);
  return (
    <StepperIconRoot ownerState={{ active }} className={className}>
      {completed ? <CheckCircleOutlineTwoTone fontWeight={800} color="success" /> : <TripOrigin color="secondary" />}
    </StepperIconRoot>
  );
}

const StepperIconRoot = styled('div')<{ ownerState: { active?: boolean } }>(({ theme }) => ({
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
  ...theme.applyStyles('dark', {
    color: theme.palette.grey[700],
  }),
  variants: [
    {
      props: ({ ownerState }) => ownerState.active,
      style: {
        color: '#784af4',
      },
    },
  ],
}));

const CustomStepLabel = styled(StepLabel)<StepLabelProps>(({ theme }) => ({
  [`& .${stepLabelClasses.label}`]: {
    ...theme.applyStyles('dark', {}),
  },
  [`& .Mui-active`]: {
    color: `${theme.palette.primary.main} !important`,
    '& svg': {
      fill: theme.palette.primary.main,
      width: 30,
      height: 30,
    }
  },
  [`& .${stepLabelClasses.completed}`]: {
    color: theme.palette.success.main,
  },
}));