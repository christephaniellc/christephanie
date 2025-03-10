import React from 'react';
import { Box, Typography } from '@mui/material';
import { StepperContainer } from '../styled';
import InvitationCodeInputs from '@/components/InvitationCodeInputs';
import WelcomeStepper from '@/components/WelcomeStepper';

interface StepperSectionProps {
  auth0User: any; // Replace with proper type if available
}

const StepperSection: React.FC<StepperSectionProps> = ({ auth0User }) => {
  // We no longer need stepperHeight as the container is flex-based
  return (
    <StepperContainer>
      {(!auth0User && <InvitationCodeInputs />) || <WelcomeStepper />}
    </StepperContainer>
  );
};

export default StepperSection;