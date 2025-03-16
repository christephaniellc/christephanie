import { fireEvent, render, screen } from '@testing-library/react';
import SaveTheDateStepper from './SaveTheDateStepper';
import { useTheme } from '@mui/material/styles';
import { BrowserRouter } from 'react-router-dom';
import { userState } from '@/store/user';
import { saveTheDateStepsState, stdTabIndex } from '@/store/steppers/steppers';
import { mockUseTheme } from '../../../test-utils/mockContextProviders';

// Mock theme hook
jest.mock('@mui/material/styles', () => ({
  ...jest.requireActual('@mui/material/styles'),
  useTheme: jest.fn(),
  styled: jest.requireActual('@mui/material/styles').styled,
  stepConnectorClasses: {
    alternativeLabel: 'alternativeLabel-class',
    active: 'active-class',
    completed: 'completed-class',
    line: 'line-class',
  },
  stepLabelClasses: {
    label: 'label-class',
    completed: 'completed-class',
  },
  linearProgressClasses: {
    colorPrimary: 'colorPrimary-class',
    bar: 'bar-class',
  },
}));

// Mock navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ search: '?step=attendance' }),
}));

// Mock the useFamily hook
jest.mock('@/store/family', () => ({
  useFamily: () => [
    { guests: [] },
    { getFamily: jest.fn() }
  ]
}));

// Mock user state
jest.mock('@/store/user', () => ({
  userState: {
    key: 'userState',
    default: {
      auth0Id: 'test-user',
      guestId: 'test-guest-id',
      ageGroup: 'Adult',
      rsvp: {
        invitationResponse: 'Pending'
      }
    }
  }
}));

// Mock steps state
const mockSteps = {
  attendance: {
    id: 0,
    completed: false,
    label: 'Are you interested?',
    description: '',
    component: null,
    display: true,
  },
  ageGroup: {
    id: 1,
    completed: false,
    label: 'Age group',
    description: '',
    component: null,
    display: true,
  },
  foodPreferences: {
    id: 2,
    completed: true,
    label: 'Food preferences',
    description: '',
    component: null,
    display: true,
  }
};

// Mock recoil state
jest.mock('recoil', () => ({
  ...jest.requireActual('recoil'),
  useRecoilState: (atom: any) => {
    if (atom === saveTheDateStepsState) {
      return [mockSteps, jest.fn()];
    }
    if (atom === stdTabIndex) {
      return [0, jest.fn()];
    }
    return [null, jest.fn()];
  },
  useRecoilValue: (atom: any) => {
    if (atom === userState) {
      return { auth0Id: 'test-user', ageGroup: 'Adult' };
    }
    if (atom === saveTheDateStepsState) {
      return mockSteps;
    }
    return {};
  },
  useSetRecoilState: () => jest.fn(),
  RecoilRoot: ({ children }: any) => children,
}));

describe('SaveTheDateStepper Component [wip]', () => {
  beforeEach(() => {
    // Mock the theme hook
    mockUseTheme({
      palette: {
        mode: 'light',
        primary: {
          main: '#3f51b5',
        },
        secondary: {
          main: '#E9950C',
        },
        success: {
          main: '#4caf50',
        },
        error: {
          main: '#f44336',
        },
        grey: {
          200: '#eeeeee',
          800: '#424242',
        },
      },
      // Add other theme props that the component uses
      applyStyles: () => ({
        backgroundColor: '#f5f5f5',
        borderColor: '#e0e0e0',
      }),
    });
  });

  it('renders step buttons that are clickable [wip]', () => {
    render(
      <BrowserRouter>
        <SaveTheDateStepper />
      </BrowserRouter>
    );
    
    // Find all StepButtons
    const stepButtons = document.querySelectorAll('.MuiStepButton-root');
    
    // Verify we have the expected number of steps
    expect(stepButtons.length).toBe(3);
    
    // Click on a step button
    if (stepButtons[1]) {
      fireEvent.click(stepButtons[1]);
      
      // Verify navigation was called with the correct step
      expect(mockNavigate).toHaveBeenCalledWith('/save-the-date?step=ageGroup');
    }
  });
});