import { atom, useRecoilState } from 'recoil';
import { invitationCodeState, firstNameState } from '@/store/invitationInputs';
import { useMutation } from '@tanstack/react-query';
import { useApi } from '@/context/ApiContext';
import { useEffect, useMemo } from 'react';
import { GuestDto } from '@/types/api';
import { useAuth0 } from '@auth0/auth0-react';
import { getConfig } from '@/browser-config';

export const userState = atom<Partial<GuestDto> | null>({
  key: 'user',
  default: {} as GuestDto,
});

function useUser() {
  const { api } = useApi();
  const [user, setUser] = useRecoilState(userState);
  const [invitationCode] = useRecoilState(invitationCodeState);
  const [firstName] = useRecoilState(firstNameState);
  const { loginWithPopup } = useAuth0();
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const config = getConfig();

  const _setUserId = (guestId: string) => {
    setUser({ ...user, guestId });
  };

  const _setUserRsvpCodeAndFirstName = (rsvpCode: string, firstName: string) => {
    setUser({ ...user, rsvpCode, firstName });
  };

  const findUserMutation = useMutation({
    mutationKey: [`findUser-${invitationCode}-${firstName}`],
    mutationFn: () => api.findUser(invitationCode, firstName),
    onSuccess: (data) => {
      console.log('data', data.data);
      _setUserId(data.data);
      _setUserRsvpCodeAndFirstName(invitationCode, firstName);
      // set the validated invitationCode and firstName to localstorage
      loginWithPopup({
        authorizationParams: {
          screen_hint: 'signup',
          guest_id: data.data,
        },
      }).then(() => {
        console.log('logged in');
      });
    },
  });

  const actions = useMemo(() => ({ findUserMutation }), [findUserMutation]);

  // Auth
  useEffect(() => {
    const getAccessTokenPleasePleasePlease = async () => {
      if (!user?.firstName) return;
      try {
        await getAccessTokenSilently({
          authorizationParams: {
            audience: config.audience,
            scope: config.scope,
          }
        })
          .then((value) => {
            localStorage.setItem('jwt', value);
          })
          .catch((reason) => console.log(`I am a failure: ${reason}`));
      } catch (reason) {
        console.log(`I am a failure: ${reason}`);
      }
    };

    if (isAuthenticated && user?.firstName) getAccessTokenPleasePleasePlease();
  }, [isAuthenticated, user]);

  return [user, actions];
}

export default useUser;