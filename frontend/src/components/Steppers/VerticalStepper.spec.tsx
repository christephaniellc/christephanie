import { render, screen } from '@testing-library/react';
import WelcomePageStepper from './WelcomePageStepper';
import { RecoilRoot } from 'recoil';
import { BrowserRouter } from 'react-router-dom';
import { userState } from '@/store/user';
import { saveTheDateStepsState } from '@/store/steppers/steppers';
import { InvitationResponseEnum, RsvpEnum } from '@/types/api';

// Mock components and data
jest.mock('@/components/StickFigureIcon', () => () => <div data-testid="mock-stick-figure" />);

const mockUserAttending = {
  rsvp: {
    invitationResponse: InvitationResponseEnum.Interested,
    wedding: RsvpEnum.Attending
  }
};

const mockUserNotAttending = {
  rsvp: {
    invitationResponse: InvitationResponseEnum.Declined,
    wedding: RsvpEnum.Declined
  }
};

const mockCompletedSteps = {
  attendance: {
    id: 0,
    completed: true,
    label: 'Attendance',
    description: '',
    component: null,
    display: true,
  },
  ageGroup: {
    id: 1,
    completed: true,
    label: 'Age Group',
    description: '',
    component: null,
    display: true,
  }
};

const mockIncompleteSteps = {
  attendance: {
    id: 0,
    completed: true,
    label: 'Attendance',
    description: '',
    component: null,
    display: true,
  },
  ageGroup: {
    id: 1,
    completed: false,
    label: 'Age Group',
    description: '',
    component: null,
    display: true,
  }
};

const renderWithProviders = (
  ui, 
  { 
    userValue = {}, 
    stepsValue = mockCompletedSteps
  } = {}
) => {
  return render(
    <RecoilRoot initializeState={({ set }) => {
      set(userState, userValue);
      set(saveTheDateStepsState, stepsValue);
    }}>
      <BrowserRouter>
        {ui}
      </BrowserRouter>
    </RecoilRoot>
  );
};

describe('<WelcomePageStepper />', () => {
  it('should render without crashing', () => {
    renderWithProviders(<WelcomePageStepper data-testid="vertical-stepper" />);
    expect(screen.getByText(/Wedding Day/i)).toBeInTheDocument();
  });

  it('should show RSVP button when user is attending and all steps completed', () => {
    renderWithProviders(
      <WelcomePageStepper />,
      { 
        userValue: mockUserAttending, 
        stepsValue: mockCompletedSteps 
      }
    );
    
    expect(screen.getByText('RSVP')).toBeInTheDocument();
  });

  it('should not show RSVP button when user is not attending', () => {
    renderWithProviders(
      <WelcomePageStepper />,
      { 
        userValue: mockUserNotAttending, 
        stepsValue: mockCompletedSteps 
      }
    );
    
    expect(screen.queryByText('RSVP')).not.toBeInTheDocument();
  });

  it('should show "Finish" button when steps are incomplete', () => {
    renderWithProviders(
      <WelcomePageStepper />,
      { 
        userValue: mockUserAttending, 
        stepsValue: mockIncompleteSteps 
      }
    );
    
    expect(screen.getByText(/Finish Age Group/i)).toBeInTheDocument();
  });
});