import React from 'react';
import { render, screen } from '@testing-library/react';
import CustomNotification from './CustomNotification';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const mockTheme = createTheme();

// Mock minimal props required by component
const baseProps = {
  id: 'test-notification',
  style: {},
  className: 'test-class'
};

describe('CustomNotification Component', () => {
  it('should render with primary variant .locked', () => {
    render(
      <ThemeProvider theme={mockTheme}>
        <CustomNotification 
          {...baseProps}
          message="Test notification" 
          variant="primary" 
        />
      </ThemeProvider>
    );
    
    expect(screen.getByText('Test notification')).toBeInTheDocument();
  });

  it('should render with error variant .locked', () => {
    render(
      <ThemeProvider theme={mockTheme}>
        <CustomNotification 
          {...baseProps}
          message="Error notification" 
          variant="error" 
        />
      </ThemeProvider>
    );
    
    expect(screen.getByText('Error notification')).toBeInTheDocument();
  });

  it('should render with title when provided .locked', () => {
    render(
      <ThemeProvider theme={mockTheme}>
        <CustomNotification 
          {...baseProps}
          message="Notification with title" 
          variant="info" 
          title="Important Notice" 
        />
      </ThemeProvider>
    );
    
    expect(screen.getByText('Important Notice')).toBeInTheDocument();
    expect(screen.getByText('Notification with title')).toBeInTheDocument();
  });
});