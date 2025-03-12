import React from 'react';
import { Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { CalendarMonth, LocationOn } from '@mui/icons-material';
import { 
  WeddingInfoContainer, 
  WeddingInfoLayout,
  MarriageAnnouncementBox, 
  WeddingDetailsBox, 
  DateBox, 
  LocationBox, 
  CountdownBox,
  SideCountdownContainer,
  LocationText, 
  DateText
} from '../styled';
import Countdowns from '@/components/Countdowns';
import { InvitationResponseEnum } from '@/types/api';
import RollingRingsAnimation from './RollingRingsAnimation';

interface WeddingInfoSectionProps {
  randomGettingMarriedQuote: string;
  user: any; // Replace with proper type if available
}

const WeddingInfoSection: React.FC<WeddingInfoSectionProps> = ({ 
  randomGettingMarriedQuote,
  user 
}) => {
  const theme = useTheme();
  const isMediumScreen = useMediaQuery(theme.breakpoints.up('md'));
  
  return (
    <WeddingInfoContainer>
      <WeddingInfoLayout>
        {/* Marriage announcement with rolling rings animation */}
        <MarriageAnnouncementBox>
          <Typography variant="h6" color="common.white">
            {randomGettingMarriedQuote}!
            {/*<RollingRingsAnimation />*/}
          </Typography>
        </MarriageAnnouncementBox>

        {/* Wedding details with date and location */}
        <WeddingDetailsBox>
          {/* Date Section */}
          <DateBox>
            <CalendarMonth 
              sx={{ 
                mr: 1,
                color: theme.palette.secondary.main
              }} 
            />
            <DateText variant="h6">
              July 5, 2025
            </DateText>
          </DateBox>
          
          {/* Location Section */}
          <LocationBox>
            <LocationOn 
              sx={{ 
                mr: 1,
                color: theme.palette.secondary.main
              }} 
            />
            <LocationText>
              Lovettsville, VA
            </LocationText>
          </LocationBox>
        </WeddingDetailsBox>
      </WeddingInfoLayout>
    </WeddingInfoContainer>
  );
};

export default WeddingInfoSection;