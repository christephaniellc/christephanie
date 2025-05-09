import React, { useMemo, useRef, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { useAuth0 } from '@auth0/auth0-react';
import { useRecoilValue } from 'recoil';
import { rsvpStepperState } from '@/store/steppers';
import MtvAnimatedTitle from '@/components/MtvAnimatedTitle';
import { ButtonsContainer } from '@/components/Steppers/StyledComponents';
import { useBoxShadow } from '@/hooks/useBoxShadow';
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
import { KeyboardArrowDown } from '@mui/icons-material';

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
  const scrollableContentRef = useRef<HTMLDivElement | null>(null);
  const [isScrollable, setIsScrollable] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  
  // Check if content is scrollable
  useEffect(() => {
    const checkScrollable = () => {
      if (scrollableContentRef.current) {
        const { scrollHeight, clientHeight } = scrollableContentRef.current;
        setIsScrollable(scrollHeight > clientHeight);
      }
    };

    // Check initially and after content might change
    checkScrollable();
    
    // Add resize observer to detect content changes
    const resizeObserver = new ResizeObserver(checkScrollable);
    if (scrollableContentRef.current) {
      resizeObserver.observe(scrollableContentRef.current);
    }

    // Set up scroll listener to detect when user has scrolled
    const handleScroll = () => {
      if (scrollableContentRef.current && scrollableContentRef.current.scrollTop > 20) {
        setHasScrolled(true);
      }
    };

    if (scrollableContentRef.current) {
      scrollableContentRef.current.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (scrollableContentRef.current) {
        scrollableContentRef.current.removeEventListener('scroll', handleScroll);
        resizeObserver.unobserve(scrollableContentRef.current);
      }
    };
  }, [rsvpStepper.currentStep, family]);
  
  // Current step name for accessibility labels
  const currentStepName = rsvpStepper.currentStep[0] || 'welcome';
  
  const FamilyQueryQuestion = useMemo(() => {
    const currentStep = rsvpStepper.currentStep[0];
    //console.log("Rendering content for step:", currentStep);
    
    // Special handling for debug
    if (currentStep === 'communicationPreferences' || currentStep === 'communicationPreference') {
      //console.log("🔍 Found communication step:", currentStep);
      //console.log("⚠️ Rendering CommunicationSection");
      return <CommunicationSection />;
    }
    
    switch (currentStep) {
      case 'comments':
        return <CommentsSection />;
      case 'mailingAddress':
        return <MailingAddressSection />;
      case 'communicationPreferences':
        return <CommunicationSection />;
      case 'summary':
        return <SummarySection />;
      case 'weddingAttendance':
        return <WelcomeSection />;
      case 'fourthOfJulyAttendance':
        return <RehearsalDinnerSection />;
      case 'foodPreferences':
        return <FoodPreferencesSection />;
      case 'foodAllergies':
        return <FoodAllergiesSection />;
      // case 'transportation':
      //   return <TransportationSection />;
      case 'accommodation':
        return <AccommodationSection />;
      default:
        //console.log("No matching case found, returning empty fragment");
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
                position="relative"
                height={remainingQuestionHeight}
              >
                <Box
                  ref={scrollableContentRef}
                  height="100%"
                  sx={{ 
                    overflow: 'auto',
                    scrollbarWidth: 'thin',
                    '&::-webkit-scrollbar': {
                      width: '8px',
                      backgroundColor: 'rgba(0, 0, 0, 0.05)',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: 'rgba(0, 0, 0, 0.2)',
                      borderRadius: '4px',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      },
                    },
                    paddingBottom: '30px' // Extra padding at bottom to avoid content being cut off
                  }}
                  role="region"
                  aria-label={`${currentStepName} form section`}
                >
                  {FamilyQueryQuestion}
                </Box>
                {isScrollable && (
                  <>
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '30px',
                        background: 'linear-gradient(to top, rgba(255,255,255,0.5), transparent)',
                        pointerEvents: 'none',
                        display: { xs: 'block', sm: 'block' },
                        zIndex: 1
                      }}
                      aria-hidden="true"
                    />
                    {!hasScrolled && (
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: '5px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          zIndex: 2,
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          borderRadius: '8px',
                          padding: '4px 8px',
                          display: 'flex',
                          alignItems: 'center',
                          animation: 'pulse 2s infinite',
                          '@keyframes pulse': {
                            '0%': { opacity: 0.7 },
                            '50%': { opacity: 1 },
                            '100%': { opacity: 0.7 }
                          }
                        }}
                      >
                        <KeyboardArrowDown color="primary" />
                        <Box component="span" 
                        fontSize="0.75rem" 
                        color="primary.main"
                        ml={0.5}>Scroll for more</Box>
                      </Box>
                    )}
                  </>
                )}
              </Box>
          )}
          </>
        )}
      </ButtonsContainer>
    </Box>
  );
};

export default MainRSVPContent;