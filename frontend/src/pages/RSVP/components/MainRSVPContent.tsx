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
import { CommunicationSection } from './CommunicationSection';
import { SummarySection } from './SummarySection';
import { AttendanceSection } from './AttendanceSection';
import { RehearsalDinnerSection } from './RehearsalDinnerSection';
import { FoodPreferencesSection } from './FoodPreferencesSection';
import { FoodAllergiesSection } from './FoodAllergiesSection';
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
  console.log('DEBUG - Current RSVP Step:', currentStepName);
  // Debug the current step
  console.log("Current step before switch:", rsvpStepper.currentStep[0], "Type:", typeof rsvpStepper.currentStep[0]);
  
  const FamilyQueryQuestion = useMemo(() => {
    const currentStep = rsvpStepper.currentStep[0];
    console.log("Inside memo - evaluating step:", currentStep);
    
    // Special handling for debug
    if (currentStep === 'communicationPreferences' || currentStep === 'communicationPreference') {
      console.log("🔍 Found communication step:", currentStep);
      console.log("⚠️ Returning CommunicationSection");
      return <CommunicationSection />;
    }
    
    switch (currentStep) {
      case 'comments':
        console.log("Returning CommentsSection");
        return <CommentsSection />;
      case 'mailingAddress':
        console.log("Returning MailingAddressSection");
        return <MailingAddressSection />;
      // Keeping this for completeness, but the special handler above will catch it first
      case 'communicationPreferences':
        console.log("Returning CommunicationSection");
        return <CommunicationSection />;
      case 'summary':
        console.log("Returning SummarySection");
        return <SummarySection />;
      case 'weddingAttendance':
        console.log("Returning WelcomeSection");
        return <WelcomeSection />;
      case 'fourthOfJulyAttendance':
        console.log("Returning RehearsalDinnerSection");
        return <RehearsalDinnerSection />;
      case 'foodPreferences':
        console.log("Returning FoodPreferencesSection");
        return <FoodPreferencesSection />;
      case 'foodAllergies':
        console.log("Returning FoodAllergiesSection");
        return <FoodAllergiesSection />;
      // case 'transportation':
      //   return <TransportationSection />;
      case 'accommodation':
        console.log("Returning AccommodationSection");
        return <AccommodationSection />;
      default:
        console.log("No matching case found, returning empty fragment");
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
              <>
                {console.log("About to render component in Box, genericQuestions=true")}
                <Box
                  height={remainingQuestionHeight}
                  sx={{ overflow: 'auto' }}
                  role="region"
                  aria-label={`${currentStepName} form section`}
                >
                  {console.log("Inside Box before rendering FamilyQueryQuestion")}
                  {FamilyQueryQuestion}
                  {console.log("After rendering FamilyQueryQuestion")}
                </Box>
              </>
            )}
            {!genericQuestions && (
              <div style={{color: 'red', fontWeight: 'bold'}}>
                Debug: genericQuestions is FALSE for {currentStepName}
              </div>
            )}
          </>
        )}
      </ButtonsContainer>
    </Box>
  );
};

export default MainRSVPContent;