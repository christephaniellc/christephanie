import React from 'react';
import { Box, useTheme, CircularProgress, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { InvitationResponseEnum } from '@/types/api';

interface StepperCircleProps {
  active: boolean;
  status: 'pending' | 'interested' | 'declined';
  filled?: boolean;
}

// Styled circle component for the stepper
const StepperCircle = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'active' && prop !== 'status' && prop !== 'filled',
})<StepperCircleProps>(({ theme, active, status, filled }) => {
  // Define colors based on status
  const getColor = () => {
    switch (status) {
      case 'pending':
        return theme.palette.secondary.main;
      case 'interested':
        return theme.palette.primary.main;
      case 'declined':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[400];
    }
  };

  return {
    width: 18,
    height: 18,
    borderRadius: '50%',
    border: `2px solid ${active ? getColor() : theme.palette.grey[400]}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: active && filled ? getColor() : 'transparent',
    transition: theme.transitions.create(['border-color', 'background-color'], {
      duration: theme.transitions.duration.standard,
    }),
    '&::after': filled
      ? {
          content: '""',
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: theme.palette.common.white,
          display: active ? 'block' : 'none',
        }
      : {},
  };
});

// Styled connector line between circles
const StepperConnector = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'active' && prop !== 'status',
})<{ active: boolean; status: string }>(({ theme, active, status }) => {
  // Define colors based on status
  const getColor = () => {
    switch (status) {
      case 'pending':
        return theme.palette.secondary.main;
      case 'interested':
        return theme.palette.primary.main;
      case 'declined':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[400];
    }
  };

  return {
    width: 2,
    height: 20,
    backgroundColor: active ? getColor() : theme.palette.grey[400],
    transition: theme.transitions.create('background-color', {
      duration: theme.transitions.duration.standard,
    }),
  };
});

interface AttendanceStatusStepperProps {
  currentStatus: InvitationResponseEnum;
  onStatusChange?: (status: InvitationResponseEnum) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export const AttendanceStatusStepper: React.FC<AttendanceStatusStepperProps> = ({ 
  currentStatus,
  onStatusChange,
  disabled = false,
  isLoading = false
}) => {
  const theme = useTheme();
  
  const handleStatusClick = (status: InvitationResponseEnum) => {
    if (disabled || isLoading || !onStatusChange) return;
    onStatusChange(status);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '75%',
        ml: { xs: 1, sm: 2 },
        py: 2,
      }}
      aria-label="Invitation response options stepper"
      role="list"
      >

        {/* Interested Step - First */}
        <Tooltip title={isLoading && currentStatus === InvitationResponseEnum.Interested ? "Updating..." : ""} arrow>
          <Box 
            role="listitem" 
            aria-label="Interested option"
            onClick={() => handleStatusClick(InvitationResponseEnum.Interested)}
            sx={{ 
              cursor: disabled || isLoading ? 'default' : 'pointer',
              opacity: disabled ? 0.7 : 1,
              transition: 'transform 0.2s',
              position: 'relative',
              '&:hover': {
                transform: disabled || isLoading ? 'none' : 'scale(1.1)'
              }
            }}
          >
              <StepperCircle
                active={currentStatus === InvitationResponseEnum.Interested}
                status="interested"
                filled={currentStatus === InvitationResponseEnum.Interested}
              />
          </Box>
        </Tooltip>
        
        <StepperConnector
            active={
                currentStatus === InvitationResponseEnum.Interested ||
                currentStatus === InvitationResponseEnum.Declined
            }
            status={
                currentStatus === InvitationResponseEnum.Declined
                    ? 'declined'
                    : 'interested'
            }
        />
      
      {/* Declined Step - Second */}
      <Tooltip title={isLoading && currentStatus === InvitationResponseEnum.Declined ? "Updating..." : ""} arrow>
        <Box 
          role="listitem" 
          aria-label="Declined option"
          onClick={() => handleStatusClick(InvitationResponseEnum.Declined)}
          sx={{ 
            cursor: disabled || isLoading ? 'default' : 'pointer',
            opacity: disabled ? 0.7 : 1,
            transition: 'transform 0.2s',
            position: 'relative',
            '&:hover': {
              transform: disabled || isLoading ? 'none' : 'scale(1.1)'
            }
          }}
        >
            <StepperCircle
              active={currentStatus === InvitationResponseEnum.Declined}
              status="declined"
              filled={currentStatus === InvitationResponseEnum.Declined}
            />
        </Box>
      </Tooltip>

          <StepperConnector
              active={
                  currentStatus === InvitationResponseEnum.Pending ||
                  currentStatus === InvitationResponseEnum.Declined
              }
              status={
                  currentStatus === InvitationResponseEnum.Pending
                      ? 'pending'
                      : 'declined'
              }
          />

          {/* Pending Step - Last */}
          <Tooltip title={isLoading && currentStatus === InvitationResponseEnum.Pending ? "Updating..." : ""} arrow>
            <Box 
              role="listitem" 
              aria-label="Pending option"
              onClick={() => handleStatusClick(InvitationResponseEnum.Pending)}
              sx={{ 
                cursor: disabled || isLoading ? 'default' : 'pointer',
                opacity: disabled ? 0.7 : 1,
                transition: 'transform 0.2s',
                position: 'relative',
                '&:hover': {
                  transform: disabled || isLoading ? 'none' : 'scale(1.1)'
                }
              }}
            >
              <StepperCircle
                active={currentStatus === InvitationResponseEnum.Pending}
                status="pending"
                filled={currentStatus === InvitationResponseEnum.Pending}
              />
            </Box>
          </Tooltip>
    </Box>
  );
};