import React, { useContext, useEffect } from 'react';
import Api, { ApiError } from '@/api/Api';
import { useAuth0 } from '@auth0/auth0-react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { userState } from '@/store/user';
import { useMutation, UseMutationResult, useQuery, UseQueryResult } from '@tanstack/react-query';
import { AddressDto, FamilyUnitDto, GuestDto } from '@/types/api';
import { familyState } from '@/store/family';
import { addressState } from '@/store/address';

interface ApiContextProps {
  findUserIdQuery: UseQueryResult<string | undefined, ApiError>;
  getMeQuery: UseQueryResult<GuestDto, ApiError>;
  getFamilyUnitQuery: UseQueryResult<FamilyUnitDto, ApiError>;
  updateFamilyMutation: UseMutationResult<FamilyUnitDto, ApiError, { updatedFamily: FamilyUnitDto }, unknown>;
  validateAddressMutation: UseMutationResult<AddressDto, ApiError, AddressDto, unknown>;
}


export const ApiContext = React.createContext({} as ApiContextProps);

export const ApiContextProvider = (props: { children: JSX.Element }) => {
  const user = useRecoilValue(userState);
  const [family, setFamily] = useRecoilState(familyState);
  const address = useRecoilValue(addressState);

  const { getAccessTokenSilently, user: auth0User } = useAuth0();

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

  const queryKey = `invitationCode=${user?.invitationCode}&firstName=${user?.firstName}`;

  const findUserIdQuery = useQuery<string | undefined, ApiError>({
    queryKey: [`findUserIdQuery`, `${queryKey}`],
    queryFn: () => apiRef.current?.findUserId(queryKey),
    retry: false,
    enabled: false,
  });

  const getMeQuery = useQuery<GuestDto, ApiError>({
    queryKey: ['getMeQuery', `${user.guestNumber}`],
    queryFn: () => apiRef.current!.getMe(),
    retry: false,
    enabled: !!auth0User && !user.lastActivity && !!apiRef.current.getMe,
  });

  const getFamilyUnitQuery = useQuery<FamilyUnitDto, ApiError>({
    queryKey: [`getFamilyUnit`, `${auth0User?.sub}`],
    queryFn: () => apiRef.current!.getFamilyUnit(),
    retry: false,
    enabled: !!auth0User,
  });

  const updateFamilyMutation = useMutation<FamilyUnitDto, ApiError, { updatedFamily: FamilyUnitDto }, unknown>({
    mutationKey: ['updateFamilyUnit', JSON.stringify(family)],
    mutationFn: ({ updatedFamily }: {updatedFamily: FamilyUnitDto}) => apiRef.current.updateFamilyUnit(updatedFamily),
    onSuccess: data => setFamily(data),
    onError: (error: ApiError) => {
      console.error('Failed to update family', error);
      setFamily(family);
    },
  });

  const validateAddressMutation = useMutation<AddressDto, ApiError, AddressDto, unknown>({
    mutationKey: ['validateFamilyAddress', JSON.stringify(address)],
    mutationFn: (newAddress: AddressDto) => apiRef.current!.validateAddress(newAddress),
    onSuccess: data => {
      updateFamilyMutation.mutate({ updatedFamily: { ...family, mailingAddress: { ...data, uspsVerified: true } } });
    },
    onError: (error) => console.error('Failed to validate address', error),
  });

  return (
    <ApiContext.Provider value={{ findUserIdQuery, getMeQuery, validateAddressMutation, getFamilyUnitQuery, updateFamilyMutation }}>
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