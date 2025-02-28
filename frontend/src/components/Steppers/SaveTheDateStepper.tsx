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
import { GuestDto, InvitationResponseEnum, SleepPreferenceEnum } from '@/types/api';
import AttendanceButton from '@/components/AttendanceButton';
import AddressEnvelope from '@/components/AddressEnvelope/AddressEnvelope';
import { ButtonsContainer } from '@/pages/SaveTheDate/SaveTheDatePage';
import IconButton from '@mui/material/IconButton';
import { Check, Circle, CloseTwoTone } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import Stepper from '@mui/material/Stepper';
import StepLabel from '@mui/material/StepLabel';
import Step from '@mui/material/Step';
import StickFigureIcon from '@/components/StickFigureIcon';
import {
  SaveTheDateStep,
  saveTheDateStepsState,
  stdStepperState,
  stdTabIndex,
} from '@/store/steppers/steppers';
import MinHeightTextarea from '@/components/TextArea/AutosizedTextArea';
import FoodAllergies from '@/components/FoodPreferences';
import { userState } from '@/store/user';
import CommunicationPreferences from '@/components/CommunicationPreferences/CommunicationPreferences';
import { useAuth0 } from '@auth0/auth0-react';
import CampingPreferences from '@/components/CampingPreferences/CampingPreferences';
import Container from '@mui/material/Container';

export default function SaveTheDateStepper() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const [family, familyActions] = useFamily();
  const [urlParams, setUrlParams] = useState<URLSearchParams | null>(null);
  const [saveTheDateSteps, updateSteps] = useRecoilState(saveTheDateStepsState);
  const [tabIndex, setTabIndex] = useRecoilState(stdTabIndex);
  const stdStepper = useRecoilValue(stdStepperState);

  const [interestedStep, setInterestedStep] = useState<number>(1);
  const [pendingSteps, setPendingSteps] = useState<number>(1);
  const [declinedSteps, setDeclinedSteps] = useState<number>(1);

  const guests = useMemo(() => family?.guests, [family]);

  useEffect(() => {
    if (urlParams) {
      const step = urlParams.get('step');
      if (step) {
        const index = Object.keys(saveTheDateSteps).indexOf(step);
        setTabIndex(index);
      }
    }
  }, [saveTheDateSteps, urlParams]);

  useEffect(() => {
    setUrlParams(new URLSearchParams(location.search));
  }, [location]);

  const handleNavigateToStep = (step: string) => {
    familyActions.getFamily();
    setTabIndex(Object.keys(saveTheDateSteps).indexOf(step));
    navigate(`/save-the-date?step=${step}`);
  };

  return (
    <Box
      component={Container}
      pt={4}
      display="flex"
      alignItems="center"
      justifyContent="space-between"
    >
      <Box flexGrow={1} display="flex" alignItems="center" width="100%">
        <Stepper
          activeStep={tabIndex}
          nonLinear
          orientation="horizontal"
          connector={<StyledConnector />}
        >
          {Object.entries(saveTheDateSteps).map(([key, step]) => (
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
        flexGrow={1}
        minWidth={40}
        justifyContent="flex-end"
        pr={2}
        width="100%"
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
      {completed ? <Check color="success" /> : <Circle color="secondary" />}
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
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    fontSize: '0.8rem',
    ...theme.applyStyles('dark', {}),
  },

  [`& .${stepLabelClasses.completed}`]: {
    color: theme.palette.success.main,
  },
}));
