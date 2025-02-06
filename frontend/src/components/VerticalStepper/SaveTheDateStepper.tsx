import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  linearProgressClasses,
  StepConnector, stepConnectorClasses, stepLabelClasses, StepIconProps, StepLabelProps, useTheme, StepButton,
} from '@mui/material';
import { useRecoilState, useRecoilValue } from 'recoil';
import { useLocation, useNavigate } from 'react-router-dom';

import { familyGuestsStates, useFamily } from '@/store/family';
import { GuestDto } from '@/types/api';
import AttendanceButton from '@/components/AttendanceButton';
import AddressEnvelope from '@/components/AddressEnvelope/AddressEnvelope';
import { ButtonsContainer } from '@/pages/SaveTheDate/SaveTheDatePage';
import IconButton from '@mui/material/IconButton';
import { Check, CloseTwoTone } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import Stepper from '@mui/material/Stepper';
import StepLabel from '@mui/material/StepLabel';
import Step from '@mui/material/Step';
import StickFigureIcon from '@/components/StickFigureIcon';
import { SaveTheDateStep, saveTheDateStepperState } from '@/store/steppers/steppers';
import MinHeightTextarea from '@/components/TextArea/AutosizedTextArea';
import FoodAllergies from '@/components/FoodPreferences';
import { userState } from '@/store/user';
import CommunicationPreferences from '@/components/CommunicationPreferences/CommunicationPreferences';
import { useAuth0 } from '@auth0/auth0-react';
import CampingPreferences from '@/components/CampingPreferences/CampingPreferences';

export default function SavetheDateStepper() {
  const theme = useTheme();
  const familyStates = useRecoilValue(familyGuestsStates);
  const [family, _familyActions] = useFamily();
  const navigate = useNavigate();
  const location = useLocation();
  // Local state to track which "tab" (formerly "step") is active
  const [tabIndex, setTabIndex] = React.useState(0);
  const [urlParams, setUrlParams] = useState<URLSearchParams | null>(null);
  const { guests, callByLastNames, nobodyComing } = familyStates;
  const { user } = useAuth0();
  const [saveTheDateStepper, setStepper] = useRecoilState(saveTheDateStepperState);
  const guestId = useMemo(() => family && family.guests && family.guests.find( (guest) => guest.auth0Id === user?.sub)?.guestId || null, [family, user?.sub]);

  useEffect(() => {
    if (urlParams) {
      const step = urlParams.get('step');
      if (step) {
        const index = Object.keys(saveTheDateStepper).indexOf(step);
        setTabIndex(index);
      }
    }
  }, [saveTheDateStepper, urlParams]);

  useEffect(() => {
    setUrlParams(new URLSearchParams(location.search));
  }, [location]);

  // For a determinate progress bar, you can base the percentage on
  // which tab is active vs. the total number of tabs.
  // Example: if we have 2 steps, step 0 = 0%, step 1 = 50%, step 2 (if we had 3 steps) = 100%, etc.
  useEffect(() => {
    if (!familyStates || !saveTheDateStepper) return;
    setStepper((prev: Record<string, SaveTheDateStep>) => {
      return {
        ...prev,
        attendance: {
          ...prev.attendance,
          id: prev.attendance.id, // Ensure the id is included
          completed: familyStates?.allUsersResponded || false,
          label: familyStates?.allUsersResponded ? familyStates?.nobodyComing ? 'Nobody is coming' : 'Everyone has responded' : 'Who\'s Interested?',
          component: (
            <Box textAlign="center">
              {guests && !!guests.length && (
                <>
                  {!nobodyComing && (
                    <Typography sx={{
                      mb: 2,
                      [theme.breakpoints.down('sm')]: {
                        fontSize: 0,
                      },
                    }}>
                      {guests.length === 1 ? 'I' : 'We'} are excited to celebrate with you, {callByLastNames}!
                    </Typography>
                  )}
                  {nobodyComing && (
                    <Typography sx={{ mb: 2 }}>
                      {guests.length === 1 ? 'I' : 'We'} hope you can make it, {callByLastNames}!
                    </Typography>
                  )}
                  <ButtonsContainer>
                    {guests.map((guest: GuestDto) => (
                      <AttendanceButton guestId={guest.guestId!} key={guest.guestId} />
                    ))}
                  </ButtonsContainer>
                </>
              )}
            </Box>
          ),
        },
        mailingAddress: {
          ...prev.mailingAddress,
          id: prev.mailingAddress.id, // Ensure the id is included
          label: familyStates?.mailingAddressUspsVerified ? 'Address Confirmed' : 'Where should we send your invitation?',
          completed: familyStates?.mailingAddressUspsVerified || false,
          component: (
            <AddressEnvelope />
          ),
        },
        foodAllergies: {
          ...prev.foodAllergies,
          id: prev.foodAllergies.id, // Ensure the id is included
          completed: familyStates?.allAllergiesResponded || false,
          label: 'Any food allergies?',
          component: (
            <>
              {guests.map(guest => <div key={guest.guestId}><FoodAllergies guestId={guest.guestId} /></div>)}
            </>
          ),
        },
        communicationPreference: {
          ...prev.communicationPreference,
          id: prev.communicationPreference.id, // Ensure the id is included
          completed: false,
          label: 'How should we contact you?',
          description: '',
          component: <Box>{guests.map(guest => <CommunicationPreferences key={guest.guestId} guestId={guest.guestId} />)}</Box>,
        },
        camping: {
          ...prev.camping,
          id: prev.camping.id, // Ensure the id is included
          completed: false,
          label: 'Camping',
          description: '',
          component: <Box>{guests.map(guest => <CampingPreferences key={guest.guestId} guestId={guest.guestId} />)}</Box>,
        },
        comments: {
          ...prev.comments,
          id: prev.comments.id, // Ensure the id is included
          completed: true,
          label: 'Any comments?',
          component: (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>Any comments for us?</Typography>
              <MinHeightTextarea />
            </Box>
          ),
        },
      };
    });
  }, [setStepper, familyStates]);

  // This determines how many tabs there are
  const totalTabs = Object.values(saveTheDateStepper).length;

  const handleNavigateToStep = (step: string) => {
    navigate(`/save-the-date?step=${step}`);
  };

  return (
    <Box sx={{ width: '100%', mx: 'auto' }} border={'0px dotted red'} display="flex" flexDirection="column"
         alignItems="center">
      <Box display={'flex'} justifyContent="flex-end" mb={2} pr={4} width="100%">
        <IconButton onClick={() => navigate('/')}>
          <CloseTwoTone />
        </IconButton>
      </Box>
      {/* Linear Progress across top */}
      <Stepper
        activeStep={tabIndex}
        alternativeLabel
        nonLinear
        orientation="horizontal"
        sx={{ pl: 2, width: '90vw' }}
        connector={<StyledConnector />
        }>
        {Object.entries(saveTheDateStepper).map(([key, step]) => (
          <Step
            completed={step.completed}
            key={key}>
            <CustomStepLabel
              component={StepButton}
              onClick={() => handleNavigateToStep(key)}
              sx={{
                cursor: 'pointer',
              }}
              StepIconComponent={StepperIcon}
            >
              <Box display="flex" alignItems="flex-end">{step.label}</Box>
            </CustomStepLabel>
          </Step>
        ))}
      </Stepper>

      <Box maxWidth={600} mx="auto" border={'0px solid blue'}>
        <Box sx={{ p: 2 }}>
          <Box>
            {tabIndex < totalTabs && (
              <>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  {Object.values(saveTheDateStepper)[tabIndex]?.description}
                </Typography>
                {Object.values(saveTheDateStepper)[tabIndex]?.component}
              </>
            )}
          </Box>

          {/* Optional: Next / Back Buttons */}
        </Box>

        {/* If you want a "finished" state after the last tab, you can conditionally render it:
          {tabIndex === totalTabs && (
            <Paper square elevation={0} sx={{ p: 3 }}>
              <Typography>All steps completed - you’re finished</Typography>
              <Button onClick={() => setTabIndex(0)} sx={{ mt: 1, mr: 1 }}>
                Reset
              </Button>
            </Paper>
          )}
      */}
      </Box>
      {/*<Box*/}
      {/*  sx={{*/}
      {/*    left: 0, right: 0,*/}
      {/*    position: 'absolute',*/}
      {/*    bottom: 200,*/}
      {/*    width: '100vw',*/}
      {/*  }}>*/}
      {/*  <Box*/}
      {/*    maxWidth={600}*/}
      {/*    sx={{*/}
      {/*      mx: 'auto',*/}
      {/*    display: 'flex',*/}
      {/*    justifyContent: 'space-between',*/}
      {/*    }}*/}
      {/*  >*/}
      {/*    <Button color="secondary" variant="outlined" onClick={handleBack} disabled={tabIndex <= 0}>*/}
      {/*      Back*/}
      {/*    </Button>*/}
      {/*    <Button color="secondary" variant="outlined" onClick={handleNext} disabled={tabIndex >= totalTabs - 1}>*/}
      {/*      Next*/}
      {/*    </Button>*/}
      {/*  </Box>*/}
      {/*</Box>*/}
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
  const user = useRecoilValue(userState)
  return (
    <StepperIconRoot ownerState={{ active }} className={className}>
      {completed ? (
        <Check color="success" />
      ) : (
        <Box color={'gold'} display={'flex'} flexDirection="column" mb={3}>
          <Typography variant="caption"></Typography>
          <StickFigureIcon rotation={0} ageGroup={user.ageGroup} />
        </Box>
      )}
    </StepperIconRoot>
  );
}

const StepperIconRoot = styled('div')<{ ownerState: { active?: boolean } }>(
  ({ theme }) => ({
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
  }),
);

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