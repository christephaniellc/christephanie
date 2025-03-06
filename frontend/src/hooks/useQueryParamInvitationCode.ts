import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useUser } from '@/store/user';
import useNotifications from '@/store/notifications';
import { Notification } from '@/store/notifications/types';

/**
 * Hook that looks for query_key and firstName in URL and sets them to user state if found
 * Shows a notification to the user when parameters are detected
 */
export const useQueryParamInvitationCode = () => {
  const location = useLocation();
  const [user, userActions] = useUser();
  const [notifications, notificationActions] = useNotifications();
  const processedRef = useRef<boolean>(false);

  useEffect(() => {
    // Only process once per page load to prevent duplicate notifications
    if (processedRef.current) {
      return;
    }
    
    const queryParams = new URLSearchParams(location.search);
    // Handle both query_key and code parameters
    const queryKey = queryParams.get('query_key') || queryParams.get('code');
    const firstName = queryParams.get('firstName') || queryParams.get('name');
    
    const updatedUser = { ...user };
    let parameterFound = false;

    if (queryKey && queryKey.trim() !== '') {
      updatedUser.invitationCode = queryKey;
      parameterFound = true;
    }

    if (firstName && firstName.trim() !== '') {
      updatedUser.firstName = firstName;
      parameterFound = true;
    }

    if (parameterFound) {
      // Set the updated user state
      userActions.setUser(updatedUser);

      // Check if notification already exists in queue
      const existingNotification = notifications.find(
        (notification: Notification) => notification.message === 'Information copied from URL',
      );

      if (!existingNotification) {
        // Show notification to the user with custom variant
        notificationActions.push({
          message: 'Information copied from URL',
          options: {
            variant: 'primary', // We'll use our custom variant
            autoHideDuration: 4000,
          },
        });
      }
      
      // Mark as processed to prevent duplicate processing
      processedRef.current = true;
    }
  }, [location.search]);
};
