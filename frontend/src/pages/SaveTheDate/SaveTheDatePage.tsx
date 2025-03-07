import { useAuth0 } from '@auth0/auth0-react';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import { familyState, useFamily } from '@/store/family';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import ElPulpo from '@/assets/el_pulpo_cabeza.jpg';
import { FullSizeCenteredFlexBox } from '@/components/styled';
import SaveTheDateStepper from '@/components/Steppers/SaveTheDateStepper';
import { GuestViewModel, InvitationResponseEnum } from '@/types/api';
import AttendanceButton from '@/components/AttendanceButton';
import { ButtonBase, darken, Typography, useTheme } from '@mui/material';
import { useRecoilState, useRecoilValue } from 'recoil';
import { saveTheDateStepsState, stdStepperState, stdTabIndex } from '@/store/steppers/steppers';
import AddressEnvelope from '@/components/AddressEnvelope';
import AutosizedTextArea from '@/components/TextArea';
import {
  StephsActualFavoriteTypography,
  StephsFavoriteTypography,
} from '@/components/AttendanceButton/AttendanceButton';
import Button from '@mui/material/Button';
import { useAppLayout } from '@/context/Providers/AppState/useAppLayout';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import LoadingBox from '@/components/LoadingBox';
import { rem } from 'polished';
import { useBoxShadow } from '@/hooks/useBoxShadow';
import { useNavigate } from 'react-router-dom';
import { dark } from '@mui/material/styles/createPalette';
import MtvAnimatedTitle from '@/components/MtvAnimatedTitle';

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
    () => ['comments', 'mailingAddress'].includes(stdStepper.currentStep[0]),
    [stdStepper.currentStep],
  );
  const FamilyQueryQuestion = useMemo(() => {
    switch (stdStepper.currentStep[0]) {
      case 'comments':
        return <AutosizedTextArea />;
      case 'mailingAddress':
        return <AddressEnvelope />;
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
    return genericQuestions ? '100%' : `${contentHeight - 155}px`
  }, [contentHeight, genericQuestions]);

  return (
    <Box>
      <SaveTheDateStepper />
      <Box
        component={Container}
        onMouseMove={handleMouseMove}
        pb={10}
        px={2}
        sx={{
          zIndex: 50,
          display: 'flex',
          flexWrap: 'wrap',
          backdropFilter: 'blur(20px)',
          position: 'relative',
          height: contentHeightWithStepper,
          overflow: 'hidden',
        }}
      >
        <MtvAnimatedTitle />
        <ButtonsContainer>
          {familyActions.getFamilyUnitQuery.isFetching && !family && <LoadingBox />}
          {!genericQuestions && family && family.guests.length === 0 && (
            <AttendanceButton guestId={'0'} />
          )}
          {!genericQuestions &&
            family &&
            family.guests &&
            family.guests.length > 1 &&
            family.guests.map((guest: GuestViewModel) => (
              <AttendanceButton guestId={guest.guestId} key={guest.guestId} />
            ))}
          {genericQuestions && <>{FamilyQueryQuestion}</>}
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
          height: 400,
          zIndex: 49,
        }}
      >
        {tabIndex < 10 && (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-end',
              paddingBottom: '85px',
              // Ensure buttons are always visible on mobile
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 100,
              px: 3
            }}
          >
            <Button
              variant="outlined"
              color="error"
              sx={{
                backdropFilter: 'blur(20px)',
                backgroundColor: 'rgba(0,0,0,.8)',
                display: tabIndex > 0 ? 'inherit' : 'none',
                flexShrink: 0,
              }}
            >
              <StephsActualFavoriteTypography
                sx={{
                  textShadow: `3px 3px 0 ${darken(stdStepper.currentStep[1].completed ? theme.palette.success.dark : theme.palette.error.dark, 0.5)}`,
                  color: stdStepper.currentStep[1].completed ? 'success.main' : 'error.main',
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
                Wait, go back
              </StephsActualFavoriteTypography>
            </Button>
            <Box id={'spacer'} display={'flex'} width={1}></Box>
            <Button
              variant="outlined"
              color={
                stdStepper.currentStep[1].completed ? 'success' : ('error' as 'success' | 'error')
              }
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

export const ButtonsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'space-between',
  gap: 16,
  justifyContent: 'center',
  width: '100%',
  mx: 'auto',
  maxHeight: '100%',
  height: '100%',
  paddingBottom: rem('40px'),
  position: 'relative',
  overflow: 'auto',
}));
