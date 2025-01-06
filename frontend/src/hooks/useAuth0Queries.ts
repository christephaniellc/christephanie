import { useAuth0 } from '@auth0/auth0-react';
import { getConfig } from '@/auth_config';
import { useRecoilValue } from 'recoil';
import { userIdQueryState } from '@/store/user';

export const useAuth0Queries = () => {
  const { getAccessTokenSilently } = useAuth0();
  const config = getConfig();
  const user = useRecoilValue(userState);

  const getAccessTokenPleasePleasePlease = async () => {
    if (!user?.data?.firstName) return;
    try {
      await getAccessTokenSilently({
        authorizationParams: {
          audience: config.audience,
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

  return { getAccessTokenPleasePleasePlease };
}