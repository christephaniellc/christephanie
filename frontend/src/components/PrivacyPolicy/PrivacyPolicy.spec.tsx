import { render, screen } from '@testing-library/react';
import PrivacyPolicy, { privacyPolicyItems } from './PrivacyPolicy';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import { RecoilRoot } from 'recoil';
import { BrowserRouter } from 'react-router-dom';

// Mock the useAppLayout hook
jest.mock('@/context/Providers/AppState/useAppLayout', () => ({
  useAppLayout: () => ({
    contentHeight: '100vh',
  }),
}));

const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#E9950C',
    },
    background: {
      paper: '#121212',
    },
    common: {
      white: '#ffffff',
      black: '#000000'
    }
  },
});

// Helper function for rendering with necessary providers
const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <ThemeProvider theme={theme}>
      <RecoilRoot>
        <BrowserRouter>
          {component}
        </BrowserRouter>
      </RecoilRoot>
    </ThemeProvider>
  );
};

describe('Bureaucracy component [wip]', () => {
  it('renders the privacy policy title [wip]', () => {
    renderWithProviders(<PrivacyPolicy />);
    
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
  });
  
  it('renders the privacy policy introduction [wip]', () => {
    renderWithProviders(<PrivacyPolicy />);
    
    // Check that the introduction text is present
    const introText = privacyPolicyItems.privacyPolicy.content[0].subheader;
    expect(screen.getByText(introText)).toBeInTheDocument();
  });
  
  it('renders all section headers [wip]', () => {
    renderWithProviders(<PrivacyPolicy />);
    
    // Check that all section headers are rendered
    Object.values(privacyPolicyItems).forEach(section => {
      expect(screen.getByText(section.subheader)).toBeInTheDocument();
    });
  });
  
  it('renders nested content correctly [wip]', () => {
    renderWithProviders(<PrivacyPolicy />);
    
    // Check for specific nested content like phase headers
    expect(screen.getByText('Save the Date Phase:')).toBeInTheDocument();
    expect(screen.getByText('RSVP Phase:')).toBeInTheDocument();
    expect(screen.getByText('Wedding Event Phase:')).toBeInTheDocument();
  });
  
  it('contains all required privacy policy sections [wip]', () => {
    renderWithProviders(<PrivacyPolicy />);
    
    // Check that all important privacy policy elements are present
    expect(screen.getByText('What Information We Collect')).toBeInTheDocument();
    expect(screen.getByText('How We Use Your Information')).toBeInTheDocument();
    expect(screen.getByText('Data Security and Retention')).toBeInTheDocument();
    expect(screen.getByText('Your Rights')).toBeInTheDocument();
    expect(screen.getByText('Contact Us')).toBeInTheDocument();
  });
  
  it('has proper container structure [wip]', () => {
    renderWithProviders(<PrivacyPolicy />);
    
    // Verify the container exists with the right test ID
    const container = screen.getByTestId('privacy-policy-container');
    expect(container).toBeInTheDocument();
    
    // Verify list structure
    const listItems = screen.getAllByRole('listitem');
    expect(listItems.length).toBeGreaterThan(0);
  });
});