import {atom, useRecoilState} from "recoil";
import { GuestDto, UserApi } from '@/services/apiService';
import { invitationCodeState, firstNameState } from '@/store/invitationInputs';
import { useMutation } from '@tanstack/react-query';
import { useApi } from '@/context/ApiContext';

const userState = atom<Partial<GuestDto> | null>({
  key: 'user',
  default: { } as GuestDto,
})

function useUser() {
  const { userApi } = useApi();
  const [user, setUser] = useRecoilState(userState);
  const [invitationCode] = useRecoilState(invitationCodeState);
  const [firstName] = useRecoilState(firstNameState);


  const _setUserId = (guestId: string) => {
    setUser({...user, guestId});
  }

  const _setUserRsvpCodeAndFirstName = (rsvpCode: string, firstName: string) => {
    setUser({...user, rsvpCode, firstName});
  }

  const findUserMutation = useMutation({
    mutationKey: [`findUser-${invitationCode}-${firstName}`],
    mutationFn: () => userApi.apiUserFindGet(invitationCode, firstName),
    onSuccess: (data) => {
      console.log('data', data);
      _setUserId(data);
      _setUserRsvpCodeAndFirstName(invitationCode, firstName);
    }
  })

  return [user, findUserMutation];
}

export default useUser;