import {atom, useRecoilState} from "recoil";
import { invitationCodeState, firstNameState } from '@/store/invitationInputs';
import { useMutation } from '@tanstack/react-query';
import { useApi } from '@/context/ApiContext';
import { useMemo } from 'react';
import { GuestDto } from '@/types/api';
import { useAuth0 } from '@auth0/auth0-react';

export const userState = atom<Partial<GuestDto> | null>({
  key: 'user',
  default: { } as GuestDto,
})

function useUser() {
  const { api } = useApi();
  const [user, setUser] = useRecoilState(userState);
  const [invitationCode] = useRecoilState(invitationCodeState);
  const [firstName] = useRecoilState(firstNameState);
  const {loginWithPopup} = useAuth0();



  const _setUserId = (guestId: string) => {
    setUser({...user, guestId});
  }

  const _setUserRsvpCodeAndFirstName = (rsvpCode: string, firstName: string) => {
    setUser({...user, rsvpCode, firstName});
  }

  const findUserMutation = useMutation({
    mutationKey: [`findUser-${invitationCode}-${firstName}`],
    mutationFn: () => api.findUser(invitationCode, firstName),
    onSuccess: (data) => {
      console.log('data', data);
      _setUserId(data);
      _setUserRsvpCodeAndFirstName(invitationCode, firstName);
      // set the validated invitationCode and firstName to localstorage
      loginWithPopup({

        authorizationParams: {
          screen_hint: 'signup'
        }
      });
    }
  })

  const actions = useMemo(() => ({ findUserMutation }), [findUserMutation]);


  return [user, actions];
}

export default useUser;