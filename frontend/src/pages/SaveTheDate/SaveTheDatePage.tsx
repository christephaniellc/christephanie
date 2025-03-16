import React, { useMemo } from 'react';
import Box from '@mui/material/Box';
import { useFamily } from '@/store/family';
import { useAuth0 } from '@auth0/auth0-react';
import ElPulpo from '@/assets/el_pulpo_cabeza.jpg';
import SaveTheDateStepper from '@/components/Steppers/SaveTheDateStepper';
import { GuestViewModel } from '@/types/api';
import AttendanceButton from '@/components/AttendanceButton';
import { darken, useTheme } from '@mui/material';
import { useRecoilState, useRecoilValue } from 'recoil';
import { saveTheDateStepsState, stdStepperState, stdTabIndex } from '@/store/steppers/steppers';
import AddressEnvelope from '@/components/AddressEnvelope';
import AutosizedTextArea from '@/components/TextArea';
import SummaryView from '@/components/SummaryView';
import { StephsActualFavoriteTypography } from '@/components/AttendanceButton/AttendanceButton';
import Button from '@mui/material/Button';
import { useAppLayout } from '@/context/Providers/AppState/useAppLayout';
import Container from '@mui/material/Container';
import LoadingBox from '@/components/LoadingBox';
import { useBoxShadow } from '@/hooks/useBoxShadow';
import { useNavigate } from 'react-router-dom';
import MtvAnimatedTitle from '@/components/MtvAnimatedTitle';
import { ButtonsContainer } from '@/components/Steppers/StyledComponents';

function SaveTheDatePage() {
  const [family, familyActions] = useFamily();
  const { handleMouseMove, boxShadow } = useBoxShadow();
  const { contentHeight } = useAppLayout();
  const { user: auth0User } = useAuth0();
  const { getFamilyUnitQuery } = familyActions;
  const saveTheDateSteps = useRecoilValue(saveTheDateStepsState);
  const [tabIndex, setTabIndex] = useRecoilState(stdTabIndex);
  const stdStepper = useRecoilValue(stdStepperState);
  const { screenWidth } = useAppLayout();
  const theme = useTheme();
  const navigate = useNavigate();
  const genericQuestions = useMemo(
    () => ['comments', 'mailingAddress', 'summary'].includes(stdStepper.currentStep[0]),
    [stdStepper.currentStep],
  );
  const FamilyQueryQuestion = useMemo(() => {
    switch (stdStepper.currentStep[0]) {
      case 'comments':
        return <AutosizedTextArea />;
      case 'mailingAddress':
        return <AddressEnvelope />;
      case 'summary':
        return <SummaryView />;
      default:
        return <></>;
    }
  }, [stdStepper.currentStep]);

  const handleNavigateToStep = (step: string) => {
    familyActions.getFamily();
    setTabIndex(Object.keys(saveTheDateSteps).indexOf(step));
    navigate(`/save-the-date?step=${step}`);
  };

  const contentHeightWithStepper = useMemo(() => {
    // Use full height for generic questions to allow scrolling
    return genericQuestions ? '100%' : `${contentHeight - 140}px`;
  }, [contentHeight, genericQuestions]);

  const remainingQuestionHeight = useMemo(() => {
    return genericQuestions ? `${contentHeight - 230}px` : 0;
  }, [contentHeight, genericQuestions]);

  // Current step name for accessibility labels
  const currentStepName = stdStepper.currentStep[0] || 'attendance';
  
  return (
    <Box role="main" aria-label="Save the date form">
      <SaveTheDateStepper />
      <Box
        component={Container}
        onMouseMove={handleMouseMove}
        pb={genericQuestions ? 2 : 10}
        px={2}
        role="region"
        aria-label={`${currentStepName} section`}
        sx={{
          zIndex: 50,
          display: 'flex',
          flexWrap: 'wrap',
          position: 'relative',
          height: contentHeightWithStepper,
          overflow: 'hidden',
        }}
      >
        <MtvAnimatedTitle />
        <ButtonsContainer sx={{}}>
          {(!auth0User && (
            <LoadingBox isError={true} errorMessage={'Please log in to continue.'} />
          )) || (
            <>
              {familyActions.getFamilyUnitQuery.isFetching && !family && <LoadingBox />}
              {familyActions.getFamilyUnitQuery.isError && (
                <LoadingBox
                  isError={true}
                  errorMessage={
                    familyActions.getFamilyUnitQuery.error?.description ||
                    'Your session has expired. Please refresh and try again.'
                  }
                />
              )}
              {!genericQuestions &&
                !familyActions.getFamilyUnitQuery.isError &&
                family &&
                family.guests.length === 0 && <AttendanceButton guestId={'0'} />}
              {!genericQuestions &&
                !familyActions.getFamilyUnitQuery.isError &&
                family &&
                family.guests &&
                family.guests.length > 0 &&
                family.guests.map((guest: GuestViewModel) => (
                  <AttendanceButton guestId={guest.guestId} key={guest.guestId} />
                ))}
              {genericQuestions && !familyActions.getFamilyUnitQuery.isError && (
                <Box 
                  height={remainingQuestionHeight} 
                  sx={{ overflow: 'auto' }}
                  role="region"
                  aria-label={`${currentStepName} form section`}
                >
                  {FamilyQueryQuestion}
                </Box>
              )}
            </>
          )}
        </ButtonsContainer>
      </Box>
      <Box
        position="absolute"
        component={Container}
        bottom={0}
        left={0}
        right={0}
        sx={{
          backgroundImage: `url(${ElPulpo})`,
          backgroundSize: 'cover',
          backgroundPosition: 'top',
          height: 500, // Increased height for better mobile appearance
          zIndex: 49,
        }}
      >
        {tabIndex < 10 && (
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
                familyActions.getFamily();

                // Find previous visible step
                const stepsArray = Object.entries(saveTheDateSteps);
                let prevIndex = tabIndex - 1;

                // Find the previous visible step
                while (prevIndex >= 0 && !stepsArray[prevIndex][1].display) {
                  prevIndex--;
                }

                // If we found a previous visible step, navigate to it
                if (prevIndex >= 0) {
                  handleNavigateToStep(stepsArray[prevIndex][0]);
                }
              }}
            >
              <StephsActualFavoriteTypography
                sx={{
                  textShadow: `3px 3px 0 ${darken(
                    stdStepper.currentStep[1].completed
                      ? theme.palette.success.dark
                      : theme.palette.error.dark,
                    0.5,
                  )}`,
                  color: stdStepper.currentStep[1].completed ? 'success.main' : 'error.main',
                }}
              >
                Wait, go back
              </StephsActualFavoriteTypography>
            </Button>
            <Box id={'spacer'} display={'flex'} width={1}></Box>
            <Button
              variant="outlined"
              color={
                stdStepper.currentStep[1].completed ? 'success' : ('error' as 'success' | 'error')
              }
              aria-label={tabIndex < stdStepper.totalTabs - 1 ? "Continue to next step" : "Finish and submit form"}
              sx={{
                flexShrink: 0,
                backdropFilter: 'blur(20px)',
                backgroundColor: 'rgba(0,0,0,.8)',
                display: tabIndex < stdStepper.totalTabs ? 'inherit' : 'none',
              }}
              onClick={() => {
                familyActions.getFamily();

                // If we're at the last tab, navigate home
                if (tabIndex >= stdStepper.totalTabs - 1) {
                  navigate('/');
                  return;
                }

                // We don't want to use the all declined/pending logic to skip directly to the end
                // The user should go through each step in order
                // This allows them to see the mailing address step even if declined/pending
                
                // If we're at the comments step (last step before summary), navigate to summary
                if (stdStepper.currentStep[0] === 'comments') {
                  handleNavigateToStep('summary');
                } else {
                  // Otherwise find next visible step
                  const stepsArray = Object.entries(saveTheDateSteps);
                  let nextIndex = tabIndex + 1;
  
                  // Find the next visible step
                  while (nextIndex < stepsArray.length && !stepsArray[nextIndex][1].display) {
                    nextIndex++;
                  }
  
                  // If we found a next visible step, navigate to it
                  if (nextIndex < stepsArray.length) {
                    handleNavigateToStep(stepsArray[nextIndex][0]);
                  } else {
                    // If no more visible steps, navigate home
                    navigate('/');
                  }
                }
              }}
            >
              <StephsActualFavoriteTypography
                sx={{
                  textShadow: `3px 3px 0 ${darken(
                    stdStepper.currentStep[1].completed
                      ? theme.palette.success.dark
                      : theme.palette.error.dark,
                    0.5,
                  )}`,
                  color: stdStepper.currentStep[1].completed ? 'success.main' : 'error.main',
                }}
              >
                {tabIndex < stdStepper.totalTabs - 1 ? 'Next' : 'Finish'}
              </StephsActualFavoriteTypography>
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default SaveTheDatePage;
