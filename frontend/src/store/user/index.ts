import { atom, useRecoilState } from 'recoil';
import { FindUserResponse, GuestDto } from '@/types/api';
import { UseMutationResult, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useMemo } from 'react';
import { useApiContext } from '@/context/ApiContext';
import { ApiError } from '@/api/Api';

export const userIdQueryState = atom<Partial<UseQueryResult<FindUserResponse | undefined, ApiError>> | null>({
  key: 'userIdQueryState',
  default: null,
});


export const userState = atom<Partial<GuestDto>>({
  key: 'userState',
  default: {
    guestId: '',
    firstName: '',
    invitationCode: '',
  } as GuestDto,
});

export const userMutationState = atom<Partial<UseMutationResult<GuestDto>> | null>({
  key: 'userMutationState',
  default: null,
});

export const useUser = () => {
  const { findUserIdQuery, getMeQuery } = useApiContext();
  const [user, setUser] = useRecoilState(userState);
  // doing this so we can check its state within a recoil selector;
  const [userIdQuery, setUserIdQuery] = useRecoilState(userIdQueryState);
  const queryClient = useQueryClient();
  const { user: auth0User } = useAuth0();

  useEffect(() => {
    if (findUserIdQuery.isLoading) {
      setUserIdQuery(findUserIdQuery);
    }
  }, [findUserIdQuery.isLoading]);

  useEffect(() => {
    if (findUserIdQuery.status === 'success') {
      setUserIdQuery(findUserIdQuery);
    }
  }, [findUserIdQuery.status]);

  useEffect(() => {
    if (findUserIdQuery.error) {
      setUserIdQuery(findUserIdQuery);
      console.log(findUserIdQuery.error);
    }
  }, [findUserIdQuery.error, setUserIdQuery]);

  useEffect(() => {
    if (findUserIdQuery.data) {
      const newUser = {
        ...user,
        guestId: findUserIdQuery.data.guestId,
        auth0Id: findUserIdQuery.data.auth0Id,
      };
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
    }
  }, [findUserIdQuery.data, setUserIdQuery]);

  useEffect(() => {
    if (auth0User && !getMeQuery.data && !getMeQuery.isLoading) {
      console.log('refetching me')
      getMeQuery.refetch()
        .then((res) => {
          if (res.data) {
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
          }
        })
        .catch((err) => {
          console.error('Failed to get user', err);
        })
    }
  }, [auth0User]);

  useEffect(() => {
    setUserIdQuery({ ...userIdQuery, error: null } as UseQueryResult<string | undefined, ApiError>);
    queryClient.resetQueries({ queryKey: [`findUserIdQuery`] });
  }, [user.firstName, user.invitationCode]);


  const userActions = useMemo(() => ({ findUserIdQuery, setUser }), [findUserIdQuery, setUser]);

  return [user, userActions] as const;
};