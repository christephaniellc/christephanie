import { useAuth0 } from '@auth0/auth0-react';
import { getConfig } from '@/auth_config';
import { useRecoilState } from 'recoil';
import { userState } from '@/store/user';
import { useEffect } from 'react';

export const useAuth0Queries = () => {
  const { getAccessTokenSilently, loginWithPopup, user: auth0User, isAuthenticated, logout } = useAuth0();
  const config = getConfig();
  const [user, setUser] = useRecoilState(userState);

  const logOutFromAuth0 = async () => {
    return await logout().then(() => {
      localStorage.removeItem('jwt');
    });
  };

  const getAccessTokenPleasePleasePlease = async () => {
    try {
      if (!isAuthenticated) throw Error('User is not authenticated');
    } catch (_e) {
      await loginWithPopup();
    } finally {
      console.log('getting access token');
      await getAccessTokenSilently({
        authorizationParams: {
          audience: config.audience,
        },
      })
    }
  };

  useEffect(() => {
    if (auth0User) {
      const newUser = {
        ...user,
        auth0Id: auth0User?.sub,
      };
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
    }
    if (!auth0User) {
      setUser({ ...user, auth0Id: null });
    }
  }, [auth0User]);

  return { getAccessTokenPleasePleasePlease, logOutFromAuth0 };
};