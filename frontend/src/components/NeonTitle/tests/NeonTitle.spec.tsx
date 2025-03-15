import { render, screen } from '@testing-library/react';
import NeonTitle from '../NeonTitle';
import { useTheme } from '@mui/material/styles';
import { mockUseTheme } from '../../../../test-utils/mockContextProviders';

// Mock the useTheme hook
jest.mock('@mui/material/styles', () => ({
  ...jest.requireActual('@mui/material/styles'),
  useTheme: jest.fn(),
  styled: jest.requireActual('@mui/material/styles').styled,
}));

describe('NeonTitle component.wip', () => {
  beforeEach(() => {
    // Set up the mock theme for each test
    mockUseTheme({
      palette: {
        mode: 'light',
        secondary: {
          main: '#E9950C',
          light: '#ffb74d',
          dark: '#f57c00',
          contrastText: '#fff'
        },
      },
    });
  });

  it('renders the title text correctly.wip', () => {
    render(<NeonTitle text="Test Title" />);
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });
  
  it('renders with subtitle text when provided.wip', () => {
    render(<NeonTitle text="Main Title" subText="Subtitle Text" />);
    
    expect(screen.getByText('Main Title')).toBeInTheDocument();
    expect(screen.getByText('Subtitle Text')).toBeInTheDocument();
  });
  
  it('applies custom font size when provided.wip', () => {
    render(<NeonTitle text="Custom Size" fontSize="3rem" />);
    
    const title = screen.getByText('Custom Size');
    expect(title).toHaveStyle('font-size: 3rem');
  });
  
  it('renders with pulsate animation by default.wip', () => {
    render(<NeonTitle text="Pulsating Text" />);
    
    // Verify that the style tag with keyframes is rendered
    expect(document.querySelector('style')).toHaveTextContent('@keyframes pulsate');
  });
  
  it('applies flicker animation when specified.wip', () => {
    render(<NeonTitle text="Flickering Text" flicker={true} pulsate={false} />);
    
    // Verify that the style tag with keyframes is rendered
    expect(document.querySelector('style')).toHaveTextContent('@keyframes flicker');
  });
});