import { render, screen } from '@testing-library/react';
import Welcome from '../Welcome';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import { RecoilRoot } from 'recoil';
import * as AppLayoutHook from '@/context/Providers/AppState/useAppLayout';
import * as Auth0React from '@auth0/auth0-react';

// Mock components and hooks
jest.mock('@/components/InvitationCodeInputs', () => ({
  __esModule: true,
  default: () => <div data-testid="invitation-code-inputs">Invitation Code Inputs</div>
}));

jest.mock('@/components/Steppers/WelcomePageStepper', () => ({
  __esModule: true,
  default: () => <div data-testid="welcome-page-stepper">Welcome Page Stepper</div>
}));

jest.mock('@/components/Countdowns', () => ({
  __esModule: true,
  default: () => <div data-testid="countdowns">Countdowns Component</div>
}));

jest.mock('@/components/NeonTitle', () => ({
  __esModule: true,
  default: ({ text }) => <div data-testid="neon-title">{text}</div>
}));

jest.mock('@/hooks/useQueryParamInvitationCode', () => ({
  useQueryParamInvitationCode: jest.fn()
}));

jest.mock('@/store/user', () => ({
  useUser: () => [
    { rsvp: { invitationResponse: 'Pending' } },
    jest.fn()
  ]
}));

jest.mock('@/store/family', () => ({
  useFamily: () => [
    null,
    { getFamily: jest.fn(), getFamilyUnitQuery: { isFetching: false } }
  ],
  familyState: { value: null }
}));

// Create a test theme
const theme = createTheme({
  palette: {
    secondary: {
      main: '#E9950C',
    },
    background: {
      paper: '#171717',
    },
    common: {
      white: '#ffffff'
    }
  },
  shape: {
    borderRadius: 4
  }
});

describe('Welcome page.wip', () => {
  beforeEach(() => {
    // Mock useAppLayout hook
    jest.spyOn(AppLayoutHook, 'useAppLayout').mockReturnValue({
      contentHeight: 1000,
      screenWidth: 1200
    });
    
    // Mock useAuth0 hook
    jest.spyOn(Auth0React, 'useAuth0').mockReturnValue({
      isAuthenticated: false,
      user: null,
      loginWithRedirect: jest.fn(),
      logout: jest.fn(),
      getAccessTokenSilently: jest.fn(),
      getAccessTokenWithPopup: jest.fn(),
      getIdTokenClaims: jest.fn(),
      loginWithPopup: jest.fn(),
      isLoading: false,
      error: undefined
    });
  });
  
  it('renders the neon title.wip', () => {
    render(
      <ThemeProvider theme={theme}>
        <RecoilRoot>
          <Welcome />
        </RecoilRoot>
      </ThemeProvider>
    );
    
    const neonTitle = screen.getByTestId('neon-title');
    expect(neonTitle).toBeInTheDocument();
    expect(neonTitle).toHaveTextContent('Steph & Topher');
  });
  
  it('renders invitation code inputs when not authenticated.wip', () => {
    render(
      <ThemeProvider theme={theme}>
        <RecoilRoot>
          <Welcome />
        </RecoilRoot>
      </ThemeProvider>
    );
    
    expect(screen.getByTestId('invitation-code-inputs')).toBeInTheDocument();
  });
  
  it('renders welcome page stepper when authenticated.wip', () => {
    // Mock authenticated user
    jest.spyOn(Auth0React, 'useAuth0').mockReturnValue({
      isAuthenticated: true,
      user: { sub: 'test-user-id' },
      loginWithRedirect: jest.fn(),
      logout: jest.fn(),
      getAccessTokenSilently: jest.fn(),
      getAccessTokenWithPopup: jest.fn(),
      getIdTokenClaims: jest.fn(),
      loginWithPopup: jest.fn(),
      isLoading: false,
      error: undefined
    });
    
    render(
      <ThemeProvider theme={theme}>
        <RecoilRoot>
          <Welcome />
        </RecoilRoot>
      </ThemeProvider>
    );
    
    expect(screen.getByTestId('welcome-page-stepper')).toBeInTheDocument();
  });
  
  it('renders date and location information.wip', () => {
    render(
      <ThemeProvider theme={theme}>
        <RecoilRoot>
          <Welcome />
        </RecoilRoot>
      </ThemeProvider>
    );
    
    expect(screen.getByText('July 5, 2025')).toBeInTheDocument();
    expect(screen.getByText('Lovettsville, VA')).toBeInTheDocument();
  });
  
  it('renders the countdowns component.wip', () => {
    render(
      <ThemeProvider theme={theme}>
        <RecoilRoot>
          <Welcome />
        </RecoilRoot>
      </ThemeProvider>
    );
    
    expect(screen.getByTestId('countdowns')).toBeInTheDocument();
  });
});