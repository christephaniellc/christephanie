import { atom, useRecoilState } from 'recoil';
import { GuestDto } from '@/types/api';
import { UseMutationResult, useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useMemo } from 'react';
import { useApiContext } from '@/context/ApiContext';

export const userIdQueryState = atom<Partial<UseQueryResult<string | null>>>({
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

export const refetchUserState = atom<() => void>({
  key: 'refetchUserState',
  default: false,
});

export const userMutationState = atom<Partial<UseMutationResult<GuestDto | null>>>({
  key: 'userMutationState',
  default: null,
});

export const useUser = () => {
  const api = useApiContext();
  const [user, setUser] = useRecoilState(userState);
  // doing this so we can check its state within a recoil selector;
  const [userIdQuery, setUserIdQuery] = useRecoilState(userIdQueryState);
  const queryClient = useQueryClient();
  const { user: auth0User } = useAuth0();

  const queryKey = `invitationCode=${user?.invitationCode}&firstName=${user?.firstName}`;

  const findUserIdQuery = useQuery({
    queryKey: [`findUserIdQuery`, `${queryKey}`],
    queryFn: () => api.findUserId(queryKey),
    retry: false,
    enabled: false,
  });

  const getMeQuery = useQuery({
    queryKey: ['getMeQuery'],
    queryFn: () => api.getMe(),
    retry: false,
    enabled: false,
  });

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
        guestId: findUserIdQuery.data,
      };
      setUser(newUser);
    }
  }, [findUserIdQuery.data, setUserIdQuery]);

  useEffect(() => {
    if (auth0User) {
      getMeQuery.refetch()
        .then((res) => {
          if (res.data) {
            setUser(res.data);
          }
        })
        .catch((err) => {
          console.error('Failed to get user', err);
        })
    }
  }, [auth0User]);

  useEffect(() => {
    setUserIdQuery({ ...userIdQuery, error: null } as UseQueryResult<string | null>);
    queryClient.resetQueries({ queryKey: [`findUserIdQuery`] });
  }, [user.firstName, user.invitationCode]);


  const userActions = useMemo(() => ({ findUserIdQuery, setUser }), [findUserIdQuery, setUser]);

  return [user, userActions] as const;
};