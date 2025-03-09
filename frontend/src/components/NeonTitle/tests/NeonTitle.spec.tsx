import { render, screen } from '@testing-library/react';
import NeonTitle from '../NeonTitle';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';

// Create a test theme
const theme = createTheme({
  palette: {
    secondary: {
      main: '#E9950C',
    },
  },
});

describe('NeonTitle component.wip', () => {
  it('renders the title text correctly.wip', () => {
    render(
      <ThemeProvider theme={theme}>
        <NeonTitle text="Test Title" />
      </ThemeProvider>
    );
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });
  
  it('renders with subtitle text when provided.wip', () => {
    render(
      <ThemeProvider theme={theme}>
        <NeonTitle text="Main Title" subText="Subtitle Text" />
      </ThemeProvider>
    );
    
    expect(screen.getByText('Main Title')).toBeInTheDocument();
    expect(screen.getByText('Subtitle Text')).toBeInTheDocument();
  });
  
  it('applies custom font size when provided.wip', () => {
    render(
      <ThemeProvider theme={theme}>
        <NeonTitle text="Custom Size" fontSize="3rem" />
      </ThemeProvider>
    );
    
    const title = screen.getByText('Custom Size');
    expect(title).toHaveStyle('font-size: 3rem');
  });
  
  it('renders with pulsate animation by default.wip', () => {
    render(
      <ThemeProvider theme={theme}>
        <NeonTitle text="Pulsating Text" />
      </ThemeProvider>
    );
    
    // Verify that the style tag with keyframes is rendered
    expect(document.querySelector('style')).toHaveTextContent('@keyframes pulsate');
  });
  
  it('applies flicker animation when specified.wip', () => {
    render(
      <ThemeProvider theme={theme}>
        <NeonTitle text="Flickering Text" flicker={true} pulsate={false} />
      </ThemeProvider>
    );
    
    // Verify that the style tag with keyframes is rendered
    expect(document.querySelector('style')).toHaveTextContent('@keyframes flicker');
  });
});