import React from 'react';
import { Box, Button, useTheme, useMediaQuery, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { darken, alpha, lighten } from '@mui/system';
import { StephsStyledTypography } from '@/components/AttendanceButton/components/StyledComponents';
import { RsvpEnum } from '@/types/api';

const IconContainer = styled(Box)(() => ({
  fontSize: '2rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

interface FourthOfJulyButtonProps {
  currentResponse: RsvpEnum;
  response: RsvpEnum;
  color: 'success' | 'error' | 'info';
  icons: React.ReactNode;
  label: string;
  onClick: (response: RsvpEnum) => void;
  disabled: boolean;
  isBreakpointUpMin: boolean;
  loading?: boolean;
}

const FourthOfJulyButton: React.FC<FourthOfJulyButtonProps> = ({
  currentResponse,
  response,
  color,
  icons,
  label,
  onClick,
  disabled,
  isBreakpointUpMin,
  loading = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Custom styling based on the button type
  const getButtonStyles = () => {
    const isSelected = currentResponse === response;
    
    // For the "Not sure yet" button (Pending)
    if (response === RsvpEnum.Pending) {
      return {
        button: {
          backgroundColor: isSelected ? alpha('#ffffff', 0.9) : 'transparent',
          color: isSelected ? theme.palette.grey[900] : theme.palette.common.white,
          borderColor: '#ffffff',
          '&:hover': {
            backgroundColor: isSelected ? alpha('#ffffff', 0.8) : alpha('#ffffff', 0.1),
          },
        },
        typography: {
          textColor: isSelected ? theme.palette.grey[900] : undefined,
          shadowColor: isSelected ? theme.palette.grey[400] : undefined,
          textShadow: isSelected ? `3px 3px 0 ${theme.palette.grey[400]}` : 'none',
        }
      };
    }
    
    // For the "Yes, I'll be there!" button (Attending)
    if (response === RsvpEnum.Attending) {
      // Navy blue color - using Sapphire from the app's tier colors
      const navyBlue = '#0F52BA'; // Sapphire - deep navy blue
      const darkNavyBlue = darken(navyBlue, 0.2);
      return {
        button: {
          backgroundColor: isSelected ? navyBlue : 'transparent',
          color: isSelected ? '#ffffff' : navyBlue,
          borderColor: navyBlue,
          '&:hover': {
            backgroundColor: isSelected ? darkNavyBlue : alpha(navyBlue, 0.1),
          },
        },
        typography: {
          textColor: isSelected ? '#ffffff' : undefined,
          shadowColor: isSelected ? darkNavyBlue : undefined,
          textShadow: isSelected ? `3px 3px 0 ${darkNavyBlue}` : 'none',
        }
      };
    }
    
    // For the "Can't make it" button (Declined) - keep original red theme
    return {
      button: {
        // Use default button styling based on the color prop
      },
      typography: {
        shadowColor: isSelected ? darken(theme.palette[color].dark, 0.5) : undefined,
        textShadow: isSelected ? `3px 3px 0 ${darken(theme.palette[color].dark, 0.5)}` : 'none',
      }
    };
  };

  const styles = getButtonStyles();

  return (
    <Button
      variant={currentResponse === response ? 'contained' : 'outlined'}
      color={color}
      onClick={(e) => {
        e.stopPropagation();
        onClick(response);
      }}
      disabled={disabled}
      sx={{
        lineHeight: 1.2,
        justifyContent: 'center',
        paddingY: { xs: 1, sm: 1.5 },
        paddingX: { xs: 1, sm: 2 },
        width: isBreakpointUpMin ? '33.33%' : '100%',
        height: !isBreakpointUpMin ? '33.33%' : '100%',
        ...styles.button
      }}
    >
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        gap={{ xs: 0.5, sm: 1 }}
        height={{ xs: 60, sm: 80 }}
        sx={{ width: '100%', position: 'relative' }}
      >
        <IconContainer sx={{ 
          opacity: loading ? 0.4 : 1,
          fontSize: { xs: '1.5rem', sm: '2rem' }
        }}>
          {icons}
        </IconContainer>
        <StephsStyledTypography
          fontSize="1.5rem"
          useWhite={response !== RsvpEnum.Pending || currentResponse !== response}
          animate={false}
          textColor={styles.typography.textColor}
          shadowColor={styles.typography.shadowColor}
          sx={{
            lineHeight: { xs: '1.2rem', sm: '1.4rem' },
            textShadow: styles.typography.textShadow,
            opacity: loading ? 0.4 : 1,
          }}
        >
          {label}
        </StephsStyledTypography>
        
        {loading && (
          <CircularProgress 
            size={isMobile ? 24 : 28} 
            color={color} 
            sx={{ 
              position: 'absolute',
              left: '50%',
              top: '50%',
              marginLeft: isMobile ? '-12px' : '-14px',
              marginTop: isMobile ? '-12px' : '-14px',
              zIndex: 10,
            }} 
          />
        )}
      </Box>
    </Button>
  );
};

export default FourthOfJulyButton;