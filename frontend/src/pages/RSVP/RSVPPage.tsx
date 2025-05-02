import React, { useMemo, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { rsvpStepsState, rsvpTabIndex, rsvpStepperState } from '@/store/steppers';
import RSVPStepper from '@/components/Steppers/RSVPStepper';
import { useAppLayout } from '@/context/Providers/AppState/useAppLayout';
import { MainRSVPContent } from './components/MainRSVPContent';
import { RSVPBackground } from './components/RSVPBackground';
import { atom } from 'recoil';

// Create a new atom to trigger scroll events
export const rsvpScrollTriggerState = atom({
  key: 'rsvpScrollTriggerState',
  default: 0, // Just a counter we'll increment to trigger effects
});

// We'll use this to share the scroll trigger function across components
export let triggerRsvpScrollToTop: () => void;

function RSVPPage() {
  const { contentHeight } = useAppLayout();
  const rsvpSteps = useRecoilValue(rsvpStepsState);
  const [tabIndex] = useRecoilState(rsvpTabIndex);
  const rsvpStepper = useRecoilValue(rsvpStepperState);
  const setScrollTrigger = useSetRecoilState(rsvpScrollTriggerState);
  
  // Function to trigger scrolling throughout the app
  const triggerScrollToTop = useCallback(() => {
    // First do a window scroll to the top
    window.scrollTo(0, 0);
    
    // Find and scroll any scrollable content regions - this is the primary goal
    const scrollableBoxes = document.querySelectorAll('[role="region"][aria-label$="form section"]');
    scrollableBoxes.forEach(box => {
      if (box instanceof HTMLElement) {
        box.scrollTop = 0;
        
        // Also find and scroll any nested scrollable elements
        const nestedScrollables = box.querySelectorAll('[style*="overflow: auto"], [style*="overflow:auto"]');
        nestedScrollables.forEach(el => {
          if (el instanceof HTMLElement) {
            el.scrollTop = 0;
          }
        });
      }
    });
    
    // Try to find the BBQ info box specifically (for the 4th of July page)
    const bbqInfoBox = document.getElementById('bbq-info');
    if (bbqInfoBox) {
      // Find parent scrollable container and scroll it
      let parent = bbqInfoBox.parentElement;
      while (parent) {
        if (parent.scrollTop !== undefined && parent.style.overflow === 'auto') {
          parent.scrollTop = 0;
          break;
        }
        parent = parent.parentElement;
      }
    }
  }, []);
  
  // Assign to the exported variable so it can be used by other components
  triggerRsvpScrollToTop = triggerScrollToTop;
  
  // Expose the scroll function to the window for debugging
  useEffect(() => {
    (window as any).__scrollRSVPToTop = triggerScrollToTop;
  }, [triggerScrollToTop]);
  
  // We've removed automatic scrolling on tab index changes
  // Now scrolling is only triggered by the navigation buttons
  
  // Debug logging for component mounting
  //console.log("RSVPPage rendering, current step:", rsvpStepper.currentStep[0]);

  const genericQuestions = useMemo(
    () =>
      ['comments', 'mailingAddress', 'summary', 'weddingAttendance', 'fourthOfJulyAttendance', 'foodPreferences', 'foodAllergies', 'transportation', 'accommodation', 'communicationPreferences'].includes(
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