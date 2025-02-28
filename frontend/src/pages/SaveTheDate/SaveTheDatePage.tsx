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

function SaveTheDatePage() {
  const [family, familyActions] = useFamily();
  const { contentHeight } = useAppLayout();
  const { user: auth0User } = useAuth0();
  const { getFamilyUnitQuery } = familyActions;
  const saveTheDateSteps = useRecoilValue(saveTheDateStepsState);
  const [tabIndex, setTabIndex] = useRecoilState(stdTabIndex);
  const stdStepper = useRecoilValue(stdStepperState);
  const { screenWidth } = useAppLayout();
  const mousePosition = useRef({ x: 0, y: 0 });
  const theme = useTheme();
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

  // useEffect(() => {
  //   if (!getFamilyUnitQuery.isPending) {
  //     familyActions.getFamily();
  //     // return <FullSizeCenteredFlexBox>Loading...</FullSizeCenteredFlexBox>
  //   }
  //
  //   // if (getFamilyUnitQuery.isError) {
  //   //   return <FullSizeCenteredFlexBox>There was an error loading your family</FullSizeCenteredFlexBox>
  //   // }
  // }, []);
  const handleMouseMove = (event: React.MouseEvent) => {
    mousePosition.current = { x: event.clientX, y: event.clientY };
  };

  const calculateShadow = () => {
    console.log('mousePosition', mousePosition.current);
    const { x, y } = mousePosition.current;
    const shadowX = 2;
    const shadowY = 2;
    return `${shadowX}px ${shadowY}px 0px ${theme.palette.error.main}`;
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
          height: `${contentHeight - 200}px`,
          overflow: 'hidden',
          paddingBottom: rem(30),
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
              // filter: `drop-shadow(${calculateShadow()})`,
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
              paddingBottom: '75px',
            }}
          >
            <Button
              variant="outlined"
              color="error"
              sx={{
                backdropFilter: 'blur(20px)',
                backgroundColor: 'rgba(0,0,0,.1)',
                // display: tabIndex > 0 ? 'inherit' : 'none',
                flexShrink: 0,
              }}
            >
              <StephsFavoriteTypography
                sx={{
                  color: stdStepper.currentStep[1].completed ? 'success.main' : 'error.main',
                }}
                onClick={() => {
                  familyActions.getFamily();
                  setTabIndex(tabIndex - 1);
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
                setTabIndex(tabIndex + 1);
              }}
            >
              <StephsFavoriteTypography
                sx={{
                  color: stdStepper.currentStep[1].completed ? 'success.main' : 'error.main',
                }}
              >
                Next
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
  maxHeight: '80vh',
  paddingBottom: '200px',
  position: 'relative',
  overflow: 'auto',
}));
