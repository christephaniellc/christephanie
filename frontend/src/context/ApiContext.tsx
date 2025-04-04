import React, { useCallback, useContext, useEffect, useRef } from 'react';
import Api, { ApiError } from '@/api/Api';
import { useAuth0 } from '@auth0/auth0-react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { userState } from '@/store/user';
import { useMutation, UseMutationResult, useQuery, UseQueryResult } from '@tanstack/react-query';
import {
  AddressDto,
  ClientInfoDto,
  FamilyUnitDto,
  FamilyUnitViewModel,
  FindUserResponse,
  GuestDto,
  NotificationPreferenceEnum,
  PatchFamilyUnitRequest,
  PatchGuestRequest,
  StatsViewModel,
  VerifyEmailResponse,
} from '@/types/api';
import { collectClientInfo } from '@/utils/utils';
import { familyState, reorderArrayByKey } from '@/store/family';
import { addressState } from '@/store/address';
import { useAuth0Queries } from '@/hooks/useAuth0Queries';

interface ApiContextProps {
  findUserIdQuery: UseQueryResult<FindUserResponse | undefined, ApiError>;
  getMeQuery: UseQueryResult<GuestDto, ApiError>;
  getFamilyUnitQuery: UseQueryResult<FamilyUnitViewModel, ApiError>;
  patchFamilyMutation: UseMutationResult<
    FamilyUnitDto,
    ApiError,
    { updatedFamily: PatchFamilyUnitRequest },
    unknown
  >;

  patchFamilyGuestMutation: UseMutationResult<
    FamilyUnitDto,
    ApiError,
    { updatedGuest: PatchGuestRequest },
    unknown
  >;

  validateAddressMutation: UseMutationResult<AddressDto, ApiError, AddressDto, unknown>;
  validatePhoneMutation: UseMutationResult<
    { success: boolean },
    ApiError,
    { phoneNumber: string, code?: string, action?: string },
    unknown
  >;
  validateEmailMutation: UseMutationResult<
    { success: boolean } | { response: VerifyEmailResponse },
    ApiError,
    { email: string, token?: string, action?: string },
    unknown
  >;
  
  getMaskedValueQuery: (guestId: string, type: 'email' | 'text') => UseQueryResult<{ value: string, verified: boolean }, ApiError>;
  getStats: () => Promise<StatsViewModel>;
  adminGetAllFamilies: () => Promise<FamilyUnitDto[]>;
  updateClientInfo: () => Promise<void>;
  clearTokenCache: () => boolean; // Function to manually clear token cache
  apiInstance?: Api; // Expose the API instance for direct access
}

export const ApiContext = React.createContext({} as ApiContextProps);
export const ApiContextProvider = (props: { children: JSX.Element }) => {
  const user = useRecoilValue(userState);
  const [family, setFamily] = useRecoilState(familyState);
  const address = useRecoilValue(addressState);
  const { getAccessTokenSilently, user: auth0User, logout } = useAuth0();

  // Function to get access token - keeping it simple and letting Auth0 handle token management
  const getTokenFunc = React.useCallback(async () => {
    try {
      return await getAccessTokenSilently();
    } catch (err) {
      console.error('Failed to get token:', err);
      return null;
    }
  }, [getAccessTokenSilently]);

  const apiRef = React.useRef(new Api(getTokenFunc));

  useEffect(() => {
    apiRef.current = new Api(getTokenFunc);
    console.log('API initialized or updated');
  }, [getTokenFunc]);

  const queryKey = `invitationCode=${user?.invitationCode.trim()}&firstName=${user?.firstName.trim()}`;
  const findUserIdQuery = useQuery<FindUserResponse | undefined, ApiError>({
    queryKey: [`findUserIdQuery`, `${queryKey}`],
    queryFn: () => apiRef.current?.findUserId(queryKey),
    retry: false,
    enabled: false,
  }) as UseQueryResult<FindUserResponse | undefined, ApiError>;

  const { getAccessTokenPleasePleasePlease } = useAuth0Queries();

  // Reference to track if token refresh is in progress
  const tokenRefreshInProgress = useRef(false);
  const tokenRefreshPromise = useRef<Promise<string | null> | null>(null);

  // Helper function to handle token expiration with retry logic
  const handleTokenExpiration = useCallback((failureCount: number, error: any) => {
    console.log(`API error occurred (attempt ${failureCount}):`, error);
    
    // Check if it's an authentication or authorization error (401 or 403)
    if (error.status === 401 || error.status === 403) {
      console.log(`${error.status} error detected, attempting to refresh token...`);
      
      // On first retry, try to refresh the token
      if (failureCount <= 1) {
        // Implement a single refresh promise pattern to avoid multiple refreshes
        if (!tokenRefreshInProgress.current) {
          tokenRefreshInProgress.current = true;
          
          // Create a token refresh promise that can be reused by concurrent requests
          tokenRefreshPromise.current = getAccessTokenPleasePleasePlease()
            .then(token => {
              console.log('Token refresh completed successfully');
              tokenRefreshInProgress.current = false;
              return token;
            })
            .catch(refreshError => {
              console.error('Failed to refresh token:', refreshError);
              tokenRefreshInProgress.current = false;
              
              // If refresh fails and we've tried multiple times, log out
              if (failureCount > 1) {
                logout();
              }
              return null;
            });
        } else {
          console.log('Token refresh already in progress, waiting for it to complete');
        }
        
        return true; // Retry the request after token refresh
      } else {
        // After multiple failures, log out the user
        console.error('Multiple authentication failures, logging out');
        logout();
        return false; // Stop retrying
      }
    }
    
    // For other errors, retry a few times then give up
    return failureCount < 3;
  }, [getAccessTokenPleasePleasePlease, logout]);

  const getMeQuery = useQuery<GuestDto, ApiError>({
    queryKey: ['getMeQuery', `${user.guestNumber}`],
    queryFn: () => apiRef.current!.getMe(),
    retry: handleTokenExpiration,
    enabled: !!auth0User && !user.lastActivity && !!apiRef.current.getMe,
  }) as UseQueryResult<GuestDto, ApiError>;

  const getFamilyUnitQuery = useQuery<FamilyUnitViewModel, ApiError>({
    queryKey: [`getFamilyUnit`],
    queryFn: async () => {
      try {
        // Add detailed logging for this particular endpoint
        console.log('Making getFamilyUnit request');
        const result = await apiRef.current!.getFamilyUnit();
        console.log('getFamilyUnit request succeeded');
        return result;
      } catch (error: any) {
        console.error('getFamilyUnit request failed:', error);
        
        // If we get a 403, we should try to refresh the token and retry once
        if (error.status === 403 && !tokenRefreshInProgress.current) {
          console.log('Got 403 from getFamilyUnit, attempting token refresh');
          try {
            // Force a token refresh
            await getAccessTokenPleasePleasePlease();
            // After refresh, retry the request once
            console.log('Token refreshed, retrying getFamilyUnit request');
            return await apiRef.current!.getFamilyUnit();
          } catch (refreshError) {
            console.error('Token refresh failed, cannot retry getFamilyUnit:', refreshError);
            throw error; // Throw the original error
          }
        }
        
        throw error;
      }
    },
    retry: handleTokenExpiration,
    enabled: !!auth0User,
    // Add a small staleTime to prevent excessive refetching
    staleTime: 30000, // 30 seconds
  }) as UseQueryResult<FamilyUnitViewModel, ApiError>;

  const patchFamilyGuestMutation = useMutation<
    GuestDto,
    ApiError,
    { updatedGuest: PatchGuestRequest },
    unknown
  >({
    mutationKey: ['patchFamilyGuest', JSON.stringify(family)],
    mutationFn: ({ updatedGuest }: { updatedGuest: PatchGuestRequest }) =>
      apiRef.current.patchGuestDto(updatedGuest),
    onSuccess: (data) => {
      console.log('patchFamilyGuestMutation success', data);

      setFamily((prev) => {
        if (!prev || !prev.guests) return prev;
        const sortedGuests = reorderArrayByKey([...prev.guests], 'auth0Id', auth0User?.sub);
        return { ...prev, guests: sortedGuests.map((g) => (g.guestId === data.guestId ? data : g)) };
      });
    },
    onError: (error: ApiError) => {
      console.error('Failed to update family', error);
      if (!family || !family.guests) return;
      const sortedGuests = reorderArrayByKey(
        [...family.guests],
        'auth0Id',
        auth0User?.sub
      );
      setFamily({ ...family, guests: sortedGuests });
    },
  });

  const patchFamilyMutation = useMutation<
    FamilyUnitDto,
    ApiError,
    { updatedFamily: PatchFamilyUnitRequest },
    unknown
  >({
    mutationKey: ['updateFamilyUnit', JSON.stringify(family)],
    mutationFn: ({ updatedFamily }: { updatedFamily: PatchFamilyUnitRequest }) =>
      apiRef.current.patchFamilyUnit(updatedFamily),
    onSuccess: (data) => {
      if (!data || !data.guests) return;
      const sortedGuests = reorderArrayByKey(
        [...data.guests],
        'auth0Id',
        auth0User?.sub
      );
      setFamily({...data, guests: sortedGuests});
    },

    onError: (error: ApiError) => {
      console.error('Failed to update family', error);
      if (!family || !family.guests) return;
      const sortedGuests = reorderArrayByKey(
        [...family.guests],
        'auth0Id',
        auth0User?.sub
      );
      setFamily({...family, guests: sortedGuests});
    },
  });

  const validateAddressMutation = useMutation<AddressDto, ApiError, AddressDto, unknown>({
    mutationKey: ['validateFamilyAddress', JSON.stringify(address)],
    mutationFn: (newAddress: AddressDto) => apiRef.current!.validateAddress(newAddress),
    onSuccess: (data) => {
      patchFamilyMutation.mutate({
        updatedFamily: { mailingAddress: { ...data, uspsVerified: true } },
      });
    },
    onError: (error) => console.error('Failed to validate address', error),
  });  

  const validatePhoneMutation = useMutation<
    { success: boolean }, 
    ApiError, 
    { phoneNumber: string, code?: string, action?: string },
    unknown
  >({
    mutationKey: ['validatePhone'],
    mutationFn: ({ phoneNumber, code, action }) => apiRef.current.validatePhone(phoneNumber, code, action),
    onSuccess: (data) => {
      console.log('Phone validation successful', data);
      // Refresh the family data to show updated verification status
      getFamilyUnitQuery.refetch();
    },

    onError: (error) => console.error('Failed to validate phone', error),
  });

  // Rate limiting cache for email validation
  const emailRequestCache = useRef<Record<string, number>>({});
  
  const validateEmailMutation = useMutation<
    { success: boolean } | { response: VerifyEmailResponse },
    ApiError,
    { email: string, token?: string, action?: string },
    unknown
  >({
    mutationKey: ['validateEmail'],
    // Don't auto-retry to prevent infinite loops
    retry: 0,
    // Add gcTime (formerly cacheTime) to prevent duplicates
    gcTime: 60000, // 1 minute cache
    mutationFn: ({ email, token, action }) => {    
      
      // Create a rate-limiting implementation with proper cache
      if (action === 'register' || action === 'resendcode') {
        // Validate inputs
        if (!email) {
          console.error("Cannot validate email: No email provided");
          return Promise.reject(new Error("No email provided"));
        }
        const now = Date.now();
        const cacheKey = `${email}:${action}`;
        const lastCallTime = emailRequestCache.current[cacheKey] || 0;
        const timeSinceLastCall = now - lastCallTime;
        
        // Only allow one call per email every 5 minutes (300,000ms)
        if (timeSinceLastCall < 300000) {
          console.log(`Rate limiting email registration call for ${email}, last called ${Math.round(timeSinceLastCall/1000)}s ago`);
          // Return fake success to avoid breaking UI, but don't make the actual API call
          return Promise.resolve({ success: true });
        }
        
        // Update timestamp for this email+action
        emailRequestCache.current[cacheKey] = now;
        console.log(`Allowing email registration call for ${email}`);
        
        // These actions still use the validateEmail endpoint
        return apiRef.current.validateEmail(email, token, action);
      }
      
      // For token validation, use the new verifyEmail endpoint
      if (action === 'validate') {
        // Require a token for validation
        if (!token) {
          console.warn('Attempted to validate email without a token');
          return Promise.reject(new Error("No validation token provided"));
        }
        
        const now = Date.now();
        
        // Create a cache key for this specific token validation
        const validationCacheKey = `validate:${email}:${token.substring(0, 8)}`;
        const lastCallTime = emailRequestCache.current[validationCacheKey] || 0;
        const timeSinceLastCall = now - lastCallTime;
        
        // Only allow a specific token to be validated once every 10 seconds
        // This prevents duplicate API calls when component re-renders or races occur
        if (lastCallTime > 0 && timeSinceLastCall < 10000) {
          console.log(`Deduplicating token validation for ${email}, last attempted ${Math.round(timeSinceLastCall/1000)}s ago`);
          return Promise.resolve({ success: true });
        }
        
        // Update the validation timestamp
        emailRequestCache.current[validationCacheKey] = now;
        console.log(`Processing token validation for ${email}`);
        
        // Make the actual API call to the new verifyEmail endpoint
        return apiRef.current.verifyEmail(token);
      }
      
      // Default case - this should not happen in normal operation
      console.warn(`Unknown email action: ${action}, falling back to validateEmail`);
      return apiRef.current.validateEmail(email, token, action);
    },
    onSuccess: (data) => {
      console.log('Email validation successful', data);
      // Refresh the family data after a delay to avoid race conditions
      setTimeout(() => {
        getFamilyUnitQuery.refetch();
      }, 1000);
    },
    onError: (error) => console.error('Failed to validate email', error),
  });

  // Function to get unmasked email or phone
  const getMaskedValueQuery = (guestId: string, type: 'email' | 'text') => {
    const maskedValueType = type === 'email' ? NotificationPreferenceEnum.Email : NotificationPreferenceEnum.Text;

    return useQuery<{ value: string, verified: boolean }, ApiError>({
      queryKey: ['getMaskedValue', guestId, type],
      queryFn: () => apiRef.current.getMaskedValue(guestId, maskedValueType),
      enabled: !!guestId,
    });
  };

  // Get stats (public function accessible to any logged-in user)
  const getStats = async (): Promise<StatsViewModel> => {
    try {
      return await apiRef.current.getStats();
    } catch (error) {
      console.error('Failed to get wedding stats:', error);
      throw error;
    }
  };

  // Get all families (admin function)
  const adminGetAllFamilies = async (): Promise<FamilyUnitViewModel[]> => {
    try {
      return await apiRef.current.adminGetAllFamilies();
    } catch (error) {
      console.error('Failed to get all families:', error);
      throw error;
    }
  };

  // Update client info - non-blocking
  const updateClientInfo = async (): Promise<void> => {
    try {
      if (!apiRef.current) {
        console.log('API not initialized yet, skipping client info update');
        return;
      }
      const clientInfo = collectClientInfo();
      // Fire and forget pattern - don't block the UI
      apiRef.current.patchUser(clientInfo)
        .then(() => console.log('Client info updated successfully'))
        .catch(err => console.error('Client info update failed:', err));
      return Promise.resolve();
    } catch (error) {
      console.error('Failed to update client info:', error);
      return Promise.resolve(); // Don't break the app if this fails
    }
  };
  
  // Add function to manually clear token cache
  const clearTokenCache = () => {
    if (apiRef.current && typeof apiRef.current.clearTokenCache === 'function') {
      console.log('Manually clearing token cache');
      apiRef.current.clearTokenCache();
      return true;
    }
    return false;
  };

  return (
    <ApiContext.Provider
      value={{
        findUserIdQuery,
        getMeQuery,
        validateAddressMutation,
        validatePhoneMutation,
        validateEmailMutation,
        getFamilyUnitQuery,
        patchFamilyMutation,
        patchFamilyGuestMutation,
        getMaskedValueQuery,
        getStats,
        adminGetAllFamilies,
        updateClientInfo,
        clearTokenCache, // Add the clearTokenCache function
        apiInstance: apiRef.current, // Expose the API instance
      }}
    >
      {props.children}
    </ApiContext.Provider>
  );
};

export const useApiContext = () => {
  const api = useContext(ApiContext);
  if (api === undefined) {
    throw new Error('useApi must be used within a ApiContextProvider');
  }

  return api;
};