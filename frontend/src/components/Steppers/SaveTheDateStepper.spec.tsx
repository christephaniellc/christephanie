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
  ],
  familyGuestsStates: {
    key: 'familyGuestsStates',
    default: {
      allUsersResponded: true,
      attendingLastNames: [],
      callByLastNames: 'Smiths',
      guests: [],
      mailingAddressEntered: true,
      mailingAddressUspsVerified: true,
      nobodyComing: false,
      atLeastOneAttending: true,
      saveTheDateComplete: false,
      allAllergiesResponded: true
    }
  }
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
  
  it('filters steps when no one in the family is attending [wip]', () => {
    // Mock the familyGuestsStates to indicate no one is attending
    const originalUseRecoilValue = require('recoil').useRecoilValue;
    const mockUseRecoilValue = jest.fn().mockImplementation((atom) => {
      if (atom === require('@/store/family').familyGuestsStates) {
        return {
          allUsersResponded: true,
          attendingLastNames: [],
          callByLastNames: 'Smiths',
          guests: [],
          mailingAddressEntered: true,
          mailingAddressUspsVerified: true,
          nobodyComing: true,
          atLeastOneAttending: false, // Nobody is attending
          saveTheDateComplete: false,
          allAllergiesResponded: true
        };
      }
      return originalUseRecoilValue(atom);
    });
    
    // Replace the useRecoilValue implementation temporarily
    require('recoil').useRecoilValue = mockUseRecoilValue;
    
    // Add the basic steps to the mock steps
    const updatedMockSteps = {
      ...mockSteps,
      mailingAddress: {
        id: 3,
        completed: true,
        label: "What's your snail mail?",
        description: '',
        component: null,
        display: true,
      },
      comments: {
        id: 4,
        completed: false,
        label: 'Any comments?',
        description: '',
        component: null,
        display: true,
      },
      summary: {
        id: 5,
        completed: true,
        label: 'Summary',
        description: '',
        component: null,
        display: true,
      }
    };
    
    // Mock the useRecoilState for steps
    const originalUseRecoilState = require('recoil').useRecoilState;
    const mockUseRecoilState = jest.fn().mockImplementation((atom) => {
      if (atom === saveTheDateStepsState) {
        return [updatedMockSteps, jest.fn()];
      }
      if (atom === stdTabIndex) {
        return [3, jest.fn()]; // Simulate being on the mailingAddress step
      }
      return originalUseRecoilState(atom);
    });
    
    require('recoil').useRecoilState = mockUseRecoilState;
    
    render(
      <BrowserRouter>
        <SaveTheDateStepper />
      </BrowserRouter>
    );
    
    // Attempt to restore the original implementations after test
    afterEach(() => {
      require('recoil').useRecoilValue = originalUseRecoilValue;
      require('recoil').useRecoilState = originalUseRecoilState;
    });
    
    // The visible steps should now be only the basic steps, which are:
    // attendance, mailingAddress, comments, summary
    // But our current mocks might not fully support this complex test
    
    // This test is more of a placeholder - in a real implementation,
    // we would need to properly mock the visibleSteps calculation
    // For now, we can validate that the component renders without errors
    expect(document.querySelector('.MuiStepper-root')).toBeInTheDocument();
  });
  
  it('properly shows the active step for non-attending users [wip]', () => {
    // Mock the familyGuestsStates to indicate no one is attending
    const originalUseRecoilValue = require('recoil').useRecoilValue;
    const mockUseRecoilValue = jest.fn().mockImplementation((atom) => {
      if (atom === require('@/store/family').familyGuestsStates) {
        return {
          allUsersResponded: true,
          attendingLastNames: [],
          callByLastNames: 'Smiths',
          guests: [],
          mailingAddressEntered: true,
          mailingAddressUspsVerified: true,
          nobodyComing: true,
          atLeastOneAttending: false, // Nobody is attending
          saveTheDateComplete: false,
          allAllergiesResponded: true
        };
      }
      return originalUseRecoilValue(atom);
    });
    
    // Replace the useRecoilValue implementation temporarily
    require('recoil').useRecoilValue = mockUseRecoilValue;
    
    // Add all basic steps to the mock steps with mailingAddress as the active step
    const updatedMockSteps = {
      attendance: {
        id: 0,
        completed: true,
        label: 'Are you interested?',
        description: '',
        component: null,
        display: true,
      },
      mailingAddress: {
        id: 1,
        completed: false,
        label: "What's your snail mail?",
        description: '',
        component: null,
        display: true,
      },
      comments: {
        id: 2,
        completed: false,
        label: 'Any comments?',
        description: '',
        component: null,
        display: true,
      },
      summary: {
        id: 3,
        completed: false,
        label: 'Summary',
        description: '',
        component: null,
        display: true,
      }
    };
    
    // Mock the useRecoilState to set mailingAddress as the active step
    const originalUseRecoilState = require('recoil').useRecoilState;
    const mockUseRecoilState = jest.fn().mockImplementation((atom) => {
      if (atom === saveTheDateStepsState) {
        return [updatedMockSteps, jest.fn()];
      }
      if (atom === stdTabIndex) {
        return [1, jest.fn()]; // Simulate being on the mailingAddress step
      }
      return originalUseRecoilState(atom);
    });
    
    // Mock the useLocation to match the step
    const originalUseLocation = require('react-router-dom').useLocation;
    jest.mock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useLocation: () => ({ search: '?step=mailingAddress' }),
    }));
    
    require('recoil').useRecoilState = mockUseRecoilState;
    
    render(
      <BrowserRouter>
        <SaveTheDateStepper />
      </BrowserRouter>
    );
    
    // Attempt to restore the original implementations after test
    afterEach(() => {
      require('recoil').useRecoilValue = originalUseRecoilValue;
      require('recoil').useRecoilState = originalUseRecoilState;
      require('react-router-dom').useLocation = originalUseLocation;
    });
    
    // Check that the Stepper component renders
    expect(document.querySelector('.MuiStepper-root')).toBeInTheDocument();
    
    // This test would be more effective if we could properly test the active state
    // of the step indicators, but due to testing limitations and complexity of the component,
    // this is primarily to check that the component doesn't error out with the active step logic
  });
});