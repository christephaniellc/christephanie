import React, { useContext, useEffect } from 'react';
import Api, { ApiError } from '@/api/Api';
import { useAuth0 } from '@auth0/auth0-react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { userState } from '@/store/user';
import { useMutation, UseMutationResult, useQuery, UseQueryResult } from '@tanstack/react-query';
import {
  AddressDto,
  FamilyUnitDto,
  FamilyUnitViewModel,
  FindUserResponse,
  GuestDto,
  PatchFamilyUnitRequest,
  PatchGuestRequest,
} from '@/types/api';
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
}

export const ApiContext = React.createContext({} as ApiContextProps);

export const ApiContextProvider = (props: { children: JSX.Element }) => {
  const user = useRecoilValue(userState);
  const [family, setFamily] = useRecoilState(familyState);
  const address = useRecoilValue(addressState);

  const { getAccessTokenSilently, user: auth0User, logout } = useAuth0();

  const getTokenFunc = React.useCallback(async () => {
    try {
      console.log('getting token');
      return await getAccessTokenSilently();
    } catch (err) {
      console.error('Failed to get token:', err);
      console.info('Attempting to login with Auth0');
      return null;
    }
  }, [getAccessTokenSilently, user]);

  const apiRef = React.useRef(new Api(getTokenFunc));

  useEffect(() => {
    apiRef.current = new Api(getTokenFunc);
  }, [user]);

  const queryKey = `invitationCode=${user?.invitationCode.trim()}&firstName=${user?.firstName.trim()}`;

  const findUserIdQuery = useQuery<FindUserResponse | undefined, ApiError>({
    queryKey: [`findUserIdQuery`, `${queryKey}`],
    queryFn: () => apiRef.current?.findUserId(queryKey),
    retry: false,
    enabled: false,
  }) as UseQueryResult<FindUserResponse | undefined, ApiError>;

  const getMeQuery = useQuery<GuestDto, ApiError>({
    queryKey: ['getMeQuery', `${user.guestNumber}`],
    queryFn: () => apiRef.current!.getMe(),
      retry: (failureCount, error) => {
        if (error.status === 401) {
          logout();
        }
        if (failureCount > 2) {
          return false;
        }
      },
    enabled: !!auth0User && !user.lastActivity && !!apiRef.current.getMe,
  }) as UseQueryResult<GuestDto, ApiError>;

  const getFamilyUnitQuery = useQuery<FamilyUnitViewModel, ApiError>({
    queryKey: [`getFamilyUnit`],
    queryFn: () => apiRef.current!.getFamilyUnit(),
    retry: false,
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
        const sortedGuests = reorderArrayByKey(prev.guests, 'guestId', auth0User.sub);
        return { ...prev, guests: prev.guests.map((g) => (g.guestId === data.guestId ? data : g)) };
      });
    },
    onError: (error: ApiError) => {
      console.error('Failed to update family', error);
      const sortedGuests = reorderArrayByKey(
        family.guests,
        'guestId',
        auth0User.sub
      )
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
      const sortedGuests = reorderArrayByKey(
        data.guests,
        'guestId',
        auth0User.sub
      )
      setFamily({...data, guests: sortedGuests})
    },
    onError: (error: ApiError) => {
      console.error('Failed to update family', error);
      const sortedGuests = reorderArrayByKey(
        family.guests,
        'guestId',
        auth0User.sub
      )
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

  return (
    <ApiContext.Provider
      value={{
        findUserIdQuery,
        getMeQuery,
        validateAddressMutation,
        getFamilyUnitQuery,
        patchFamilyMutation,
        patchFamilyGuestMutation,
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
