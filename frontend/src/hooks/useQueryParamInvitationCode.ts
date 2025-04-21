import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { useUser } from '@/store/user';
import useNotifications from '@/store/notifications';
import { Notification } from '@/store/notifications/types';
import { stdTabIndex, saveTheDateStepsState } from '@/store/steppers/saveTheDateStepper';

/**
 * Hook that looks for query parameters in URL:
 * - inviteCode and firstName: sets them to user state if found
 * - step: sets the active step in the stepper
 * Shows a notification to the user when parameters are detected
 */
export const useQueryParamInvitationCode = () => {
  const location = useLocation();
  const [user, userActions] = useUser();
  const [tabIndex, setTabIndex] = useRecoilState(stdTabIndex);
  const [saveTheDateSteps, setSaveTheDateSteps] = useRecoilState(saveTheDateStepsState);
  
  // Handle invitation code and name parameters
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    // Handle both inviteCode and firstName parameters
    const inviteCode = queryParams.get('inviteCode');
    const firstName = queryParams.get('firstName');
    
    const updatedUser = { ...user };
    let parameterFound = false;

    if (inviteCode && inviteCode.trim() !== '') {
      updatedUser.invitationCode = inviteCode;
      parameterFound = true;
    }

    if (firstName && firstName.trim() !== '') {
      updatedUser.firstName = firstName;
      parameterFound = true;
    }

    if (parameterFound) {
      // Set the updated user state
      userActions.setUser(updatedUser);
    }
  }, [location.search]);
  
  // Handle step parameter
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const stepParam = queryParams.get('step');
    
    if (stepParam && Object.keys(saveTheDateSteps).includes(stepParam)) {
      const stepIndex = Object.keys(saveTheDateSteps).indexOf(stepParam);
      if (stepIndex !== -1 && stepIndex !== tabIndex) {
        //console.log(`Setting active step to ${stepParam} (index: ${stepIndex})`);
        setTabIndex(stepIndex);
      }
    }
  }, [location.search, saveTheDateSteps]);
};