import { useAuth0 } from '@auth0/auth0-react';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import { useFamily } from '@/store/family';
import React, { useEffect, useMemo } from 'react';
import ElPulpo from '@/assets/el_pulpo_cabeza.jpg';
import { FullSizeCenteredFlexBox } from '@/components/styled';
import SaveTheDateStepper from '@/components/Steppers/SaveTheDateStepper';
import { GuestDto } from '@/types/api';
import AttendanceButton from '@/components/AttendanceButton';
import { Typography } from '@mui/material';
import { useRecoilValue } from 'recoil';
import { saveTheDateStepsState, stdStepperState, stdTabIndex } from '@/store/steppers/steppers';
import AddressEnvelope from '@/components/AddressEnvelope';
import AutosizedTextArea from '@/components/TextArea';

function SaveTheDatePage() {
  const [family, familyActions] = useFamily();
  const { user: auth0User } = useAuth0();
  const { getFamilyUnitQuery } = familyActions;
  const saveTheDateSteps = useRecoilValue(saveTheDateStepsState);
  const tabIndex = useRecoilValue(stdTabIndex);
  const stdStepper = useRecoilValue(stdStepperState);

  const genericQuestions = useMemo(() => ['comments', 'mailingAddress'].includes(stdStepper.currentStep[0]), [stdStepper.currentStep]);
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


  useEffect(() => {
    if (!getFamilyUnitQuery.isPending) {
      familyActions.getFamily();
      // return <FullSizeCenteredFlexBox>Loading...</FullSizeCenteredFlexBox>
    }

    // if (getFamilyUnitQuery.isError) {
    //   return <FullSizeCenteredFlexBox>There was an error loading your family</FullSizeCenteredFlexBox>
    // }
  }, []);


  return (
    <Box display="flex" flexDirection="column" justifyContent="" pb={10} border={'0px dashed yellow'} pt={2}>
      {(!family?.guests || !family?.guests.length) &&
        <div onClick={() => familyActions.getFamily()}>No guests found</div>}
      <SaveTheDateStepper />
      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        {Object.values(saveTheDateSteps)[tabIndex]?.label}
      </Typography>
      <ButtonsContainer>
        {!genericQuestions && family.guests.map((guest: GuestDto) => (
          <AttendanceButton guestId={guest.guestId} key={guest.guestId} />
        ))}
        {genericQuestions && <>{FamilyQueryQuestion}</>}
      </ButtonsContainer>
      <Box position="absolute" bottom={0} left={0} right={0} sx={{
        backgroundImage: `url(${ElPulpo})`,
        backgroundSize: 'cover',
        backgroundPosition: 'top',
        height: 400,
        zIndex: -1,
      }}>
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
}));