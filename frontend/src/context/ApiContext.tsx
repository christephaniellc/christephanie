import React, { useCallback, useContext, useEffect } from 'react';
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
    { success: boolean },
    ApiError,
    { email: string, code?: string, action?: string },
    unknown
  >;
  
  getMaskedValueQuery: (guestId: string, type: 'email' | 'text') => UseQueryResult<{ value: string, verified: boolean }, ApiError>;
  getAllFamilies: () => Promise<FamilyUnitViewModel[]>;
  updateClientInfo: () => Promise<void>;
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

  // Helper function to handle token expiration with retry logic
  const handleTokenExpiration = useCallback((failureCount: number, error: ApiError) => {
    console.log(`API error occurred (attempt ${failureCount}):`, error);
    
    // If we have a 401 Unauthorized error (token expired)
    if (error.status === 401) {
      console.log('Token expired or authentication error detected, attempting to refresh...');
      
      // On first retry, try to refresh the token
      if (failureCount <= 1) {
        // Schedule token refresh as a side effect
        getAccessTokenPleasePleasePlease()
          .catch(refreshError => {
            console.error('Failed to refresh token:', refreshError);
            // If refresh fails and we've tried multiple times, log out
            if (failureCount > 1) {
              logout();
            }
          });
        return true; // Retry the request
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
    queryFn: () => apiRef.current!.getFamilyUnit(),
    retry: handleTokenExpiration,
    enabled: !!auth0User,
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

  const validateEmailMutation = useMutation<
    { success: boolean },
    ApiError,
    { email: string, code?: string, action?: string },
    unknown
  >({
    mutationKey: ['validateEmail'],
    mutationFn: ({ email, code, action }) => apiRef.current.validateEmail(email, code, action),
    onSuccess: (data) => {
      console.log('Email validation successful', data);
      // Refresh the family data to show updated verification status
      getFamilyUnitQuery.refetch();
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

  // Get all families (admin function)
  const getAllFamilies = async (): Promise<FamilyUnitViewModel[]> => {
    try {
      return await apiRef.current.getAllFamilies();
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
        getAllFamilies,
        updateClientInfo,
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