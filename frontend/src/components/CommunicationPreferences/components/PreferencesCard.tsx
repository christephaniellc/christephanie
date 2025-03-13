import { Card, List, Divider, Box, useTheme, alpha } from '@mui/material';
import { ContactPreferenceItem } from './ContactPreferenceItem';
import { VerificationSection } from './VerificationSection';
import { ComingSoonBanner } from './ComingSoonBanner';
import { NotificationPreferenceEnum } from '@/types/api';

interface PreferencesCardProps {
  contactPreferences: string[];
  isEmailOptedIn: boolean;
  isTextOptedIn: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  isEmailVerificationEnabled: boolean;
  isSmsVerificationEnabled: boolean;
  guestEmailAddress: string | undefined;
  guestPhoneNumber: string | undefined;
  needsEmailVerification: boolean;
  needsPhoneVerification: boolean;
  isSendingEmailCode: boolean;
  isSendingPhoneCode: boolean;
  isPending: boolean;
  onToggleEmail: () => void;
  onToggleText: () => void;
  onEditEmail: () => void;
  onEditPhone: () => void;
  onVerifyEmail: () => void;
  onVerifyPhone: () => void;
}

export const PreferencesCard = ({
  contactPreferences,
  isEmailOptedIn,
  isTextOptedIn,
  emailVerified,
  phoneVerified,
  isEmailVerificationEnabled,
  isSmsVerificationEnabled,
  guestEmailAddress,
  guestPhoneNumber,
  needsEmailVerification,
  needsPhoneVerification,
  isSendingEmailCode,
  isSendingPhoneCode,
  isPending,
  onToggleEmail,
  onToggleText,
  onEditEmail,
  onEditPhone,
  onVerifyEmail,
  onVerifyPhone
}: PreferencesCardProps) => {
  const theme = useTheme();
  
  return (
    <Card 
      elevation={2}
      sx={{
        background: alpha(theme.palette.background.paper, 0.8),
        backdropFilter: 'blur(10px)',
        borderRadius: 2,
        overflow: 'visible'
      }}
    >
      <List disablePadding>
        {contactPreferences.map((value, index) => {
          const isEmail = value === 'Email';
          const isEnabled = isEmail ? isEmailOptedIn : isTextOptedIn;
          const isVerified = isEmail ? emailVerified : phoneVerified;
          const needsVerification = isEmail ? needsEmailVerification : needsPhoneVerification;
          const isComingSoon = !isEmail && !isSmsVerificationEnabled;
          const contactValue = isEmail ? guestEmailAddress : guestPhoneNumber;
          
          return (
            <Box key={value}>
              <ContactPreferenceItem 
                value={value}
                isEnabled={isEnabled}
                isVerified={isVerified}
                needsVerification={needsVerification}
                isComingSoon={isComingSoon}
                contactValue={contactValue}
                isPending={isPending}
                onToggle={isEmail ? onToggleEmail : onToggleText}
                onEdit={isEmail ? onEditEmail : onEditPhone}
              />
              
              {isEmail && needsEmailVerification && (
                <VerificationSection 
                  type="email"
                  contactValue={guestEmailAddress}
                  isSending={isSendingEmailCode}
                  onVerify={onVerifyEmail}
                />
              )}
              
              {!isEmail && needsPhoneVerification && (
                <VerificationSection 
                  type="phone"
                  contactValue={guestPhoneNumber}
                  isSending={isSendingPhoneCode}
                  onVerify={onVerifyPhone}
                />
              )}
              
              {index < contactPreferences.length - 1 && (
                <Divider variant="fullWidth" component="li" sx={{ mx: 2 }} />
              )}
            </Box>
          );
        })}
      </List>

      {/* SMS Verification Coming Soon Banner - when verification isn't enabled but opted in */}
      {isTextOptedIn && !phoneVerified && !isSmsVerificationEnabled && (
        <ComingSoonBanner feature="SMS" />
      )}
    </Card>
  );
};