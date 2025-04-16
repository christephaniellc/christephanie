import React, { useMemo } from 'react';
import Box from '@mui/material/Box';
import { useRecoilState, useRecoilValue } from 'recoil';
import { rsvpStepsState, rsvpTabIndex, rsvpStepperState } from '@/store/steppers';
import RSVPStepper from '@/components/Steppers/RSVPStepper';
import { useAppLayout } from '@/context/Providers/AppState/useAppLayout';
import { MainRSVPContent } from './components/MainRSVPContent';
import { RSVPBackground } from './components/RSVPBackground';

function RSVPPage() {
  const { contentHeight } = useAppLayout();
  const rsvpSteps = useRecoilValue(rsvpStepsState);
  const [tabIndex] = useRecoilState(rsvpTabIndex);
  const rsvpStepper = useRecoilValue(rsvpStepperState);

  const genericQuestions = useMemo(
    () =>
      ['comments', 'mailingAddress', 'summary', 'weddingAttendance', 'fourthOfJulyAttendance', 'foodPreferences', 'foodAllergies', 'transportation', 'accommodation'].includes(
        rsvpStepper.currentStep[0],
      ),
    [rsvpStepper.currentStep],
  );

  const contentHeightWithStepper = useMemo(() => {
    // Use full height for generic questions to allow scrolling
    return genericQuestions ? '100%' : `${contentHeight - 140}px`;
  }, [contentHeight, genericQuestions]);

  const remainingQuestionHeight = useMemo(() => {
    return genericQuestions ? `${contentHeight - 230}px` : 0;
  }, [contentHeight, genericQuestions]);

  return (
    <Box role="main" aria-label="RSVP form">
      <RSVPStepper />
      <MainRSVPContent 
        contentHeightWithStepper={contentHeightWithStepper}
        remainingQuestionHeight={remainingQuestionHeight}
        genericQuestions={genericQuestions}
      />
      <RSVPBackground tabIndex={tabIndex} />
    </Box>
  );
}

export default RSVPPage;