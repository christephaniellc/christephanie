import { LogoutOptions, useAuth0 } from '@auth0/auth0-react';
import { useRecoilValue } from 'recoil';
import { userState } from '@/store/user';

export function Profile() {
  const { isAuthenticated, user, isLoading, loginWithRedirect, logout } = useAuth0();
  const guest = useRecoilValue(userState)


  if (isLoading) {
    return <div>Loading user...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div>
        <p>You’re not authenticated.</p>
        <button onClick={() => loginWithRedirect({ authorizationParams: {state: JSON.stringify({guest_id: guest?.guestId })}})}>Log In with Popup</button>
        {/* Or loginWithRedirect if you prefer */}
      </div>
    );
  }

  return (
    <div>
      <h1>Welcome, {user?.name || 'User'}!</h1>
      <p>Email: {user?.email}</p>
      <button onClick={() => logout({ returnTo: window.location.origin } as LogoutOptions)}>
        Log Out
      </button>
    </div>
  );
}