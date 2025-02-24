import { useAuth0 } from '@auth0/auth0-react';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import { familyState, useFamily } from '@/store/family';
import React, { useEffect, useMemo } from 'react';
import ElPulpo from '@/assets/el_pulpo_cabeza.jpg';
import { FullSizeCenteredFlexBox } from '@/components/styled';
import SaveTheDateStepper from '@/components/Steppers/SaveTheDateStepper';
import { GuestDto } from '@/types/api';
import AttendanceButton from '@/components/AttendanceButton';
import { ButtonBase, Typography } from '@mui/material';
import { useRecoilState, useRecoilValue } from 'recoil';
import { saveTheDateStepsState, stdStepperState, stdTabIndex } from '@/store/steppers/steppers';
import AddressEnvelope from '@/components/AddressEnvelope';
import AutosizedTextArea from '@/components/TextArea';
import { StephsFavoriteTypography } from '@/components/AttendanceButton/AttendanceButton';
import Button from '@mui/material/Button';
import { useAppLayout } from '@/context/Providers/AppState/useAppLayout';
import Container from '@mui/material/Container';

function SaveTheDatePage() {
  const [family, familyActions] = useFamily();
  const { user: auth0User } = useAuth0();
  const { getFamilyUnitQuery } = familyActions;
  const saveTheDateSteps = useRecoilValue(saveTheDateStepsState);
  const [tabIndex, setTabIndex] = useRecoilState(stdTabIndex);
  const stdStepper = useRecoilValue(stdStepperState);
  const { screenWidth } = useAppLayout();

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

  return (
    <Box
      component={Container}
      display="flex"
      flexDirection="column"
      justifyContent=""
      pb={10}
      border={'0px dashed yellow'}
      pt={2}
      px={2}
    >
      <Box mb={4}>
        <SaveTheDateStepper />
      </Box>
      <StephsFavoriteTypography
        variant="h4"
        sx={{
          ml: 'auto',
          pl: screenWidth > 830 ? '200px' : 0,
          mr: 'auto',
          mb: 2,
          color: stdStepper.currentStep[1].completed ? 'success.main' : 'error.main',
          fontSize: screenWidth > 830 ? '2.5rem' : '1.5rem',
        }}
      >
        {Object.values(saveTheDateSteps)[tabIndex]?.label}
      </StephsFavoriteTypography>
      <ButtonsContainer>
        {!genericQuestions && family && family.guests.length === 0 && (
          <AttendanceButton guestId={'0'} />
        )}
        {!genericQuestions && family && family.guests.length &&
          family.guests.map((guest: GuestDto) => (
            <AttendanceButton guestId={guest.guestId} key={guest.guestId} />
          ))}
        {genericQuestions && <>{FamilyQueryQuestion}</>}
        {tabIndex < 7 && (
          <Box
            width={'100%'}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            pt={4}
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
                display: tabIndex > 0 && tabIndex < 6 ? 'inherit' : 'none',
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
      </ButtonsContainer>
      <Box
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        sx={{
          backgroundImage: `url(${ElPulpo})`,
          backgroundSize: 'cover',
          backgroundPosition: 'top',
          height: 400,
          zIndex: -1,
        }}
      ></Box>
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
}));
