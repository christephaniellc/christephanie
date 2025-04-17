import { fireEvent, render, screen } from '@testing-library/react';
import RSVPStepper from './RSVPStepper';
import { BrowserRouter } from 'react-router-dom';
import { rsvpStepsState, rsvpTabIndex } from '@/store/steppers';
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
  useLocation: () => ({ search: '?step=weddingAttendance' }),
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
      atLeastOneAttending: true, // Default to someone attending
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
  weddingAttendance: {
    id: 0,
    completed: true,
    label: 'Will you be attending our wedding?',
    description: 'Please confirm your final attendance',
    component: null,
    display: true,
  },
  fourthOfJulyAttendance: {
    id: 1,
    completed: false,
    label: 'Rehearsal Dinner Attendance',
    description: 'For invited guests only',
    component: null,
    display: true,
  },
  foodPreferences: {
    id: 2,
    completed: false,
    label: 'Confirm Food Preferences',
    description: 'Review and update your meal choices',
    component: null,
    display: true,
  },
  foodAllergies: {
    id: 3,
    completed: false,
    label: 'Food Allergies',
    description: 'Let us know about any dietary restrictions',
    component: null,
    display: true,
  },
  transportation: {
    id: 4,
    completed: false,
    label: 'Transportation Needs',
    description: 'Let us know if you need transportation assistance',
    component: null,
    display: true,
  },
  accommodation: {
    id: 5,
    completed: false,
    label: 'Accommodation Plans',
    description: 'Confirm your accommodation arrangements',
    component: null,
    display: true,
  },
  comments: {
    id: 6,
    completed: false,
    label: 'Additional Comments',
    description: 'Any last questions or requests?',
    component: null,
    display: true,
  },
  summary: {
    id: 7,
    completed: true,
    label: 'RSVP Summary',
    description: 'Review your RSVP information',
    component: null,
    display: true,
  },
};

// Mock recoil state
jest.mock('recoil', () => ({
  ...jest.requireActual('recoil'),
  useRecoilState: (atom: any) => {
    if (atom === rsvpStepsState) {
      return [mockSteps, jest.fn()];
    }
    if (atom === rsvpTabIndex) {
      return [0, jest.fn()];
    }
    return [null, jest.fn()];
  },
  useRecoilValue: (atom: any) => {
    if (atom === rsvpStepsState) {
      return mockSteps;
    }
    if (atom === require('@/store/family').familyGuestsStates) {
      return {
        allUsersResponded: true,
        attendingLastNames: ['Smith'],
        callByLastNames: 'Smiths',
        guests: [],
        mailingAddressEntered: true,
        mailingAddressUspsVerified: true,
        nobodyComing: false,
        atLeastOneAttending: true, // Default to someone attending
        saveTheDateComplete: false,
        allAllergiesResponded: true
      };
    }
    return {};
  },
  atom: jest.fn().mockImplementation(() => ({
    key: 'mockedDefaultKey',
    default: {}
  })),
  selector: jest.fn().mockImplementation(() => ({
    key: 'mockedDefaultKey',
    get: jest.fn()
  })),
  RecoilRoot: ({ children }: any) => children,
}));

describe('RSVPStepper Component [wip]', () => {
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

  it('renders all steps when atLeastOneAttending is true [wip]', () => {
    // Override the mock to ensure atLeastOneAttending is true
    const originalUseRecoilValue = require('recoil').useRecoilValue;
    const mockUseRecoilValue = jest.fn().mockImplementation((atom) => {
      if (atom === require('@/store/family').familyGuestsStates) {
        return {
          allUsersResponded: true,
          attendingLastNames: ['Smith'],
          callByLastNames: 'Smiths',
          guests: [],
          mailingAddressEntered: true,
          mailingAddressUspsVerified: true,
          nobodyComing: false,
          atLeastOneAttending: true, // Someone is attending
          saveTheDateComplete: false,
          allAllergiesResponded: true
        };
      }
      return originalUseRecoilValue(atom);
    });
    
    // Replace the useRecoilValue implementation temporarily
    require('recoil').useRecoilValue = mockUseRecoilValue;
    
    render(
      <BrowserRouter>
        <RSVPStepper />
      </BrowserRouter>
    );
    
    // Check that the Stepper component renders
    expect(document.querySelector('.MuiStepper-root')).toBeInTheDocument();
    
    // Count the step buttons, should be equal to the number of steps
    const stepButtons = document.querySelectorAll('.MuiStepLabel-root');
    expect(stepButtons.length).toBe(Object.keys(mockSteps).length);
    
    // Restore original implementation
    require('recoil').useRecoilValue = originalUseRecoilValue;
  });
  
  it('renders only basic steps when atLeastOneAttending is false [wip]', () => {
    // Override the mock to set atLeastOneAttending to false
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
    
    render(
      <BrowserRouter>
        <RSVPStepper />
      </BrowserRouter>
    );
    
    // Check that the Stepper component renders
    expect(document.querySelector('.MuiStepper-root')).toBeInTheDocument();
    
    // Count the step buttons - should be equal to the number of basic steps
    // Based on code in RSVPStepper.tsx:
    // const basicSteps = useMemo(() => ['weddingAttendance', 'fourthOfJulyAttendance', 'mailingAddress', 'comments', 'summary'], []);
    const stepButtons = document.querySelectorAll('.MuiStepLabel-root');
    
    // Log information for debugging
    console.log('Step buttons found:', stepButtons.length);
    
    // This will fail because the component is filtering out steps that should be visible
    // The test is designed to highlight the issue
    expect(stepButtons.length).toBe(5); // Expected to be 5 basic steps
    
    // Restore original implementation
    require('recoil').useRecoilValue = originalUseRecoilValue;
  });
  
  it('navigates to the correct step when clicking a step button [wip]', () => {
    render(
      <BrowserRouter>
        <RSVPStepper />
      </BrowserRouter>
    );
    
    // Find all step labels
    const stepLabels = document.querySelectorAll('.MuiStepLabel-root');
    
    // Click the second step label (index 1)
    if (stepLabels.length > 1) {
      fireEvent.click(stepLabels[1]);
      
      // Verify navigation was called with the expected URL
      expect(mockNavigate).toHaveBeenCalledWith('/rsvp?step=fourthOfJulyAttendance');
    }
  });
});