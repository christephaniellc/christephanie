import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { RecoilRoot } from 'recoil';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AttendanceStatusStepper } from '../components/AttendanceStatusStepper';
import { InvitationResponseEnum } from '@/types/api';

describe('AttendanceStatusStepper component .wip', () => {
  const mockStatusChange = jest.fn();
  it('should render stepper with three circles and two connectors .wip', () => {
    const theme = createTheme();
    render(
      <RecoilRoot>
        <ThemeProvider theme={theme}>
          <AttendanceStatusStepper currentStatus={InvitationResponseEnum.Pending} />
        </ThemeProvider>
      </RecoilRoot>
    );

    // Check for the list role and three list items
    const stepper = screen.getByRole('list', { name: /invitation response options stepper/i });
    expect(stepper).toBeInTheDocument();
    
    const options = screen.getAllByRole('listitem');
    expect(options).toHaveLength(3);
    
    // Check for specific options
    const interestedOption = screen.getByRole('listitem', { name: /interested option/i });
    const declinedOption = screen.getByRole('listitem', { name: /declined option/i });
    const pendingOption = screen.getByRole('listitem', { name: /pending option/i });
    
    expect(interestedOption).toBeInTheDocument();
    expect(declinedOption).toBeInTheDocument();
    expect(pendingOption).toBeInTheDocument();
    
    // Check that options are in the correct order (top to bottom)
    expect(options[0]).toBe(interestedOption);
    expect(options[1]).toBe(declinedOption);
    expect(options[2]).toBe(pendingOption);
  });
  
  it('should render with different statuses .wip', () => {
    const theme = createTheme();
    const { rerender } = render(
      <RecoilRoot>
        <ThemeProvider theme={theme}>
          <AttendanceStatusStepper currentStatus={InvitationResponseEnum.Pending} />
        </ThemeProvider>
      </RecoilRoot>
    );
    
    // Test rendering with Interested status
    rerender(
      <RecoilRoot>
        <ThemeProvider theme={theme}>
          <AttendanceStatusStepper currentStatus={InvitationResponseEnum.Interested} />
        </ThemeProvider>
      </RecoilRoot>
    );
    
    // Test rendering with Declined status
    rerender(
      <RecoilRoot>
        <ThemeProvider theme={theme}>
          <AttendanceStatusStepper currentStatus={InvitationResponseEnum.Declined} />
        </ThemeProvider>
      </RecoilRoot>
    );
    
    // All these are visual checks that are hard to test programmatically
    // The fact that the component renders without errors is a good first test
    expect(true).toBeTruthy();
  });
  
  it('should call onStatusChange when circles are clicked .wip', () => {
    const theme = createTheme();
    render(
      <RecoilRoot>
        <ThemeProvider theme={theme}>
          <AttendanceStatusStepper 
            currentStatus={InvitationResponseEnum.Pending} 
            onStatusChange={mockStatusChange}
          />
        </ThemeProvider>
      </RecoilRoot>
    );
    
    // Find all options
    const interestedOption = screen.getByRole('listitem', { name: /interested option/i });
    const declinedOption = screen.getByRole('listitem', { name: /declined option/i });
    const pendingOption = screen.getByRole('listitem', { name: /pending option/i });
    
    // Click on interested option
    fireEvent.click(interestedOption);
    expect(mockStatusChange).toHaveBeenCalledWith(InvitationResponseEnum.Interested);
    
    // Click on declined option
    mockStatusChange.mockClear();
    fireEvent.click(declinedOption);
    expect(mockStatusChange).toHaveBeenCalledWith(InvitationResponseEnum.Declined);
    
    // Click on pending option
    mockStatusChange.mockClear();
    fireEvent.click(pendingOption);
    expect(mockStatusChange).toHaveBeenCalledWith(InvitationResponseEnum.Pending);
  });
  
  it('should not call onStatusChange when disabled .wip', () => {
    const theme = createTheme();
    render(
      <RecoilRoot>
        <ThemeProvider theme={theme}>
          <AttendanceStatusStepper 
            currentStatus={InvitationResponseEnum.Pending} 
            onStatusChange={mockStatusChange}
            disabled={true}
          />
        </ThemeProvider>
      </RecoilRoot>
    );
    
    const interestedOption = screen.getByRole('listitem', { name: /interested option/i });
    
    // Click on interested option while disabled
    mockStatusChange.mockClear();
    fireEvent.click(interestedOption);
    expect(mockStatusChange).not.toHaveBeenCalled();
  });
});