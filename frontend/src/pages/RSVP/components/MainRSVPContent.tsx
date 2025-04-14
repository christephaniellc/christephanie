import React, { useMemo } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { useAuth0 } from '@auth0/auth0-react';
import { useRecoilValue } from 'recoil';
import { rsvpStepperState } from '@/store/steppers';
import MtvAnimatedTitle from '@/components/MtvAnimatedTitle';
import { ButtonsContainer } from '@/components/Steppers/StyledComponents';
import { useBoxShadow } from '@/hooks/useBoxShadow';
import { useAppLayout } from '@/context/Providers/AppState/useAppLayout';
import { LoadingSection } from './LoadingSection';
import { CommentsSection } from './CommentsSection';
import { MailingAddressSection } from './MailingAddressSection';
import { SummarySection } from './SummarySection';
import { AttendanceSection } from './AttendanceSection';
import { RehearsalDinnerSection } from './RehearsalDinnerSection';
import { FoodPreferencesSection } from './FoodPreferencesSection';
import { TransportationSection } from './TransportationSection';
import { AccommodationSection } from './AccommodationSection';
import { WelcomeSection } from './WelcomeSection';
import { useFamily } from '@/store/family';

interface MainRSVPContentProps {
  contentHeightWithStepper: string | number;
  remainingQuestionHeight: string | number;
  genericQuestions: boolean;
}

export const MainRSVPContent: React.FC<MainRSVPContentProps> = ({
  contentHeightWithStepper,
  remainingQuestionHeight,
  genericQuestions
}) => {
  const { handleMouseMove } = useBoxShadow();
  const { user } = useAuth0();
  const [family, familyActions] = useFamily();
  const rsvpStepper = useRecoilValue(rsvpStepperState);
  
  // Current step name for accessibility labels
  const currentStepName = rsvpStepper.currentStep[0] || 'welcome';

  const FamilyQueryQuestion = useMemo(() => {
    switch (rsvpStepper.currentStep[0]) {
      case 'comments':
        return <CommentsSection />;
      case 'mailingAddress':
        return <MailingAddressSection />;
      case 'summary':
        return <SummarySection />;
      case 'weddingAttendance':
        return <WelcomeSection />;
      case 'fourthOfJulyAttendance':
        return <RehearsalDinnerSection />;
      case 'foodPreferences':
        return <FoodPreferencesSection />;
      case 'transportation':
        return <TransportationSection />;
      case 'accommodation':
        return <AccommodationSection />;
      default:
        return <></>;
    }
  }, [rsvpStepper.currentStep, family]);

  return (
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
      <ButtonsContainer>
        {(!user && (
          <LoadingSection isError={true} errorMessage={'Please log in to continue.'} />
        )) || (
          <>
            {familyActions.getFamilyUnitQuery.isFetching && !family && <LoadingSection />}
            {familyActions.getFamilyUnitQuery.isError && (
              <LoadingSection
                isError={true}
                errorMessage={
                  familyActions.getFamilyUnitQuery.error?.description ||
                  'Your session has expired. Please refresh and try again.'
                }
              />
            )}
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
  );
};

export default MainRSVPContent;