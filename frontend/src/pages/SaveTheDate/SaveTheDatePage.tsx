import { useAuth0 } from '@auth0/auth0-react';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import { familyState, useFamily } from '@/store/family';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import ElPulpo from '@/assets/el_pulpo_cabeza.jpg';
import { FullSizeCenteredFlexBox } from '@/components/styled';
import SaveTheDateStepper from '@/components/Steppers/SaveTheDateStepper';
import { GuestDto, InvitationResponseEnum } from '@/types/api';
import AttendanceButton from '@/components/AttendanceButton';
import { ButtonBase, Typography, useTheme } from '@mui/material';
import { useRecoilState, useRecoilValue } from 'recoil';
import { saveTheDateStepsState, stdStepperState, stdTabIndex } from '@/store/steppers/steppers';
import AddressEnvelope from '@/components/AddressEnvelope';
import AutosizedTextArea from '@/components/TextArea';
import { StephsFavoriteTypography } from '@/components/AttendanceButton/AttendanceButton';
import Button from '@mui/material/Button';
import { useAppLayout } from '@/context/Providers/AppState/useAppLayout';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import LoadingBox from '@/components/LoadingBox';
import { rem } from 'polished';
import { useBoxShadow } from '@/hooks/useBoxShadow';
import { useNavigate } from 'react-router-dom';

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
          height: rem(`${contentHeight - 155}px`),
          overflow: 'hidden',
        }}
      >
        <Box p={2} height={85}>
          <StephsFavoriteTypography
            variant="h4"
            sx={{
              ml: 'auto',
              mr: 'auto',
              mb: 2,
              width: 'fit-content',
              color: stdStepper.currentStep[1].completed ? 'success.main' : 'error.main',
              fontSize: '1.5rem',
              [theme.breakpoints.up('md')]: {
                pl: '200px',
              },
              filter: `drop-shadow(${boxShadow})`,
            }}
          >
            {Object.values(saveTheDateSteps)[tabIndex]?.label}
          </StephsFavoriteTypography>
        </Box>
        <ButtonsContainer>
          {familyActions.getFamilyUnitQuery.isFetching && !family && <LoadingBox />}
          {!genericQuestions && family && family.guests.length === 0 && (
            <AttendanceButton guestId={'0'} />
          )}
          {!genericQuestions &&
            family &&
            family.guests &&
            family.guests.length > 1 &&
            family.guests.map((guest: GuestDto) => (
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
            }}
          >
            <Button
              variant="outlined"
              color="error"
              sx={{
                backdropFilter: 'blur(20px)',
                backgroundColor: 'rgba(0,0,0,.1)',
                display: tabIndex > 0 ? 'inherit' : 'none',
                flexShrink: 0,
              }}
            >
              <StephsFavoriteTypography
                sx={{
                  color: stdStepper.currentStep[1].completed ? 'success.main' : 'error.main',
                }}
                onClick={() => {
                  familyActions.getFamily();
                  handleNavigateToStep(Object.keys(saveTheDateSteps)[tabIndex - 1]);
                }}
              >
                Wait, go back
              </StephsFavoriteTypography>
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
                backgroundColor: 'rgba(0,0,0,.1)',
                display: tabIndex < stdStepper.totalTabs ? 'inherit' : 'none',
              }}
              onClick={() => {
                familyActions.getFamily();
                tabIndex < stdStepper.totalTabs - 1 ? handleNavigateToStep(Object.keys(saveTheDateSteps)[tabIndex + 1]) :
                  navigate('/');
              }}
            >
              <StephsFavoriteTypography
                sx={{
                  color: stdStepper.currentStep[1].completed ? 'success.main' : 'error.main',
                }}
              >
                {tabIndex < stdStepper.totalTabs - 1 ? 'Next' : 'Finish'}
              </StephsFavoriteTypography>
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
  maxHeight: '84vh',
  paddingBottom: rem('200px'),
  position: 'relative',
  overflow: 'auto',
}));
