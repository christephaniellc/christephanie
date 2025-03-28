import React from 'react';
import { 
  Box,
  Paper,
  Typography, 
  useTheme
} from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import { FamilyUnitDto } from '@/types/api';
import { StephsActualFavoriteTypographyNoDrop } from '@/components/AttendanceButton/AttendanceButton';
import ElPulpo from '@/assets/el_pulpo_cabeza.jpg';

interface CardFrontHorizontalProps {
  selectedFamily: FamilyUnitDto | null;
  exportMode?: boolean;
}

export const CardFrontHorizontal: React.FC<CardFrontHorizontalProps> = ({
  selectedFamily,
  exportMode = false
}) => {
  const theme = useTheme();

  // Create a fancy border style
  const gradientBorder = `
    repeating-linear-gradient(
      45deg,
      ${theme.palette.primary.main}, 
      ${theme.palette.primary.main} 5%,
      #121212 5%, 
      #121212 10%,
      ${theme.palette.secondary.main} 10%, 
      ${theme.palette.secondary.main} 15%
    )
  `;
  
  // Calculate if family has individual guests or just a family unit
  const hasIndividualGuests = selectedFamily?.guests?.some(
    guest => guest.firstName && guest.lastName
  );
  
  // Calculate last names
  const calculateLastNames = (family: FamilyUnitDto): string => {
    if (!family.guests?.length) return 'Demo';
    const lastNames = Array.from(new Set(family.guests?.map((user) => user.lastName)))
    .map((lastName) => `${lastName}`)
    .join(' & ');
    return lastNames;
  };
  
  // QR code URL for the selected family's invitation code
  const qrCodeUrl = selectedFamily?.invitationCode 
    ? `https://christephanie.com?inviteCode=${selectedFamily.invitationCode}${selectedFamily.guests?.[0]?.firstName ? `&firstName=${selectedFamily.guests[0].firstName}` : ''}`
    : "https://christephanie.com?inviteCode=DEMO";
  
  return (
    <Paper 
      elevation={8}
      className={`card-front-horizontal`}
      sx={{
        width: 576, // 6 inches @ 96ppi
        height: 384, // 4 inches @ 96ppi
        backgroundColor: '#121212', // Dark background matching the back side
        backgroundImage: `radial-gradient(ellipse at 30% 40%, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.2) 70%)`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        transformOrigin: 'top left',
        border: '10px solid transparent',
        borderImageSource: gradientBorder,
        borderImageSlice: 1,
        boxSizing: 'border-box',
        color: 'white'
      }}
    >
      {/* Background enhancement elements */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%)',
        zIndex: 0
      }} />
      
      {/* Subtle corner glow */}
      <Box sx={{
        position: 'absolute',
        top: -20,
        right: -20,
        width: 150,
        height: 150,
        background: `radial-gradient(circle, ${theme.palette.primary.main}30 0%, transparent 70%)`,
        opacity: 0.5,
        zIndex: 0
      }} />
      
      {/* Ornamental Header */}
      <Box sx={{
        position: 'relative',
        top: 10,
        left: 0,
        right: 0,
        textAlign: 'center',
        zIndex: 1
      }}>
        <StephsActualFavoriteTypographyNoDrop 
          variant="h5" 
          sx={{ 
            fontSize: '1.3rem', 
            color: theme.palette.secondary.main,
            mb: 0.5
          }}
        >
          RSVP
        </StephsActualFavoriteTypographyNoDrop>
        
        {/* Decorative divider */}
        <Box sx={{
          margin: '0 auto',
          width: '80%',
          height: '2px',
          background: `linear-gradient(to right, transparent, ${theme.palette.primary.main}, transparent)`,
          mb: 1
        }} />
      </Box>

      {/* Sender Address & Wedding Details */}
      <Box sx={{ 
        position: 'relative',
        textAlign: 'center',
        mt: 1,
        zIndex: 1
      }}>
        <Typography 
          variant="body1" 
          sx={{ 
            fontFamily: 'Snowstorm, serif',
            color: theme.palette.primary.light,
            fontWeight: 600,
            fontSize: '1rem',
            mb: 0.5,
            letterSpacing: '0.05em'
          }}
        >
          Topher & Steph
        </Typography>
        
        <Typography 
          variant="h6" 
          sx={{ 
            fontFamily: 'Snowstorm, serif',
            color: theme.palette.secondary.light,
            fontWeight: 500,
            fontSize: '0.85rem',
            mb: 0.25,
            fontStyle: 'italic'
          }}
        >
          July 5, 2025 at 6:00pm
        </Typography>
        
        <Typography 
          variant="body2" 
          sx={{ 
            fontFamily: 'Snowstorm, serif',
            color: '#aaa',
            fontSize: '0.7rem'
          }}
        >
          Stone Manor Inn • Lovettsville, Virginia
        </Typography>
      </Box>
      
      {/* Guest Address Block */}
      <Box sx={{ 
        position: 'relative',
        mx: 'auto',
        mt: 2,
        width: '85%',
        p: 2,
        pt: 1.5,
        pb: 1.5,
        textAlign: 'center',
        borderRadius: '4px',
        border: `1px solid ${theme.palette.primary.main}`,
        backgroundColor: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
        boxShadow: `0 0 10px ${theme.palette.primary.dark}`,
        zIndex: 1
      }}>
        {/* First line - Family/Guest Name(s) */}
        <Typography 
          variant="body1" 
          sx={{ 
            fontFamily: 'Snowstorm, serif', 
            mb: 0.5, 
            fontWeight: 600,
            fontSize: '1.1rem',
            color: theme.palette.secondary.main,
            textShadow: '1px 1px 0px rgba(0,0,0,0.5)'
          }}
        >
          {calculateLastNames(selectedFamily || {})} Family
        </Typography>
        
        {/* Individual guest names if available */}
        {hasIndividualGuests && (
          <Box sx={{ mb: 0.75 }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontFamily: 'Snowstorm, serif', 
                  fontSize: '0.8rem',
                  color: '#ddd',
                }}
              > 
                {selectedFamily?.guests
                  ?.sort((a, b) => (a.guestNumber || 0) - (b.guestNumber || 0))
                  .map(guest => guest.firstName)
                  .reduce((result, name, index, array) => {
                    if (array.length === 1) return name;
                    if (index === 0) return name;
                    if (index === array.length - 1) return `${result} and ${name}`;
                    return `${result}, ${name}`;
                  }, '')}
              </Typography>
          </Box>
        )}
        
        {/* Street Address */}
        {selectedFamily?.mailingAddress ? (
          <>
            <Typography 
              variant="body2" 
              sx={{ 
                fontFamily: 'Snowstorm, serif', 
                lineHeight: 1.3,
                mb: 0.25,
                color: 'rgba(255,255,255,0.85)'
              }}
            >
              {selectedFamily.mailingAddress.streetAddress}
            </Typography>
            
            {selectedFamily.mailingAddress.secondaryAddress && (
              <Typography 
                variant="body2" 
                sx={{ 
                  fontFamily: 'Snowstorm, serif', 
                  lineHeight: 1.3,
                  mb: 0.25,
                  color: 'rgba(255,255,255,0.85)'
                }}
              >
                {selectedFamily.mailingAddress.secondaryAddress}
              </Typography>
            )}
            
            {/* City, State ZIP */}
            <Typography 
              variant="body2" 
              sx={{ 
                fontFamily: 'Snowstorm, serif', 
                lineHeight: 1.3,
                color: 'rgba(255,255,255,0.85)'
              }}
            >
              {selectedFamily.mailingAddress.city}, {selectedFamily.mailingAddress.state} {selectedFamily.mailingAddress.postalCode || selectedFamily.mailingAddress.zipCode}
            </Typography>
          </>
        ) : (
          <>
            {/* Address placeholder with prompt */}
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'rgba(255,255,255,0.5)',
                fontStyle: 'italic',
                fontSize: '0.75rem'
              }}
            >
              Please complete your mailing address in the RSVP form
            </Typography>
          </>
        )}
      </Box>
      
      {/* QR code stamp */}
      <Box 
        sx={{ 
          position: 'absolute', 
          top: 15, 
          right: 15, 
          width: '80px', 
          height: '80px', 
          border: `1px solid ${theme.palette.secondary.main}`,
          borderRadius: '4px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          color: theme.palette.secondary.main,
          backgroundColor: 'rgba(0,0,0,0.7)',
          transform: 'rotate(3deg)',
          boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
          p: 0.5
        }}
      >
        <QRCodeSVG 
          value={qrCodeUrl}
          size={50}
          level="M"
          includeMargin={false}
          bgColor="rgba(0,0,0,0.5)"
          fgColor={theme.palette.common.white}
          style={{
            borderRadius: '2px',
            padding: '2px',
            marginBottom: '2px'
          }}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 0.25 }}>
          <Box 
            component="img" 
            src="/favicon_big_art_transparent.png" 
            alt="Logo" 
            sx={{ 
              width: '16px', 
              height: '16px', 
              objectFit: 'contain',
              mr: 0.5,
              filter: 'brightness(1.2)'
            }} 
          />
          <Typography variant="caption" sx={{ fontSize: '0.45rem', textAlign: 'center' }}>
            SCAN ME
          </Typography>
        </Box>
      </Box>
      
      {/* RSVP Circular Seal */}
      <Box 
        sx={{
          position: 'absolute',
          bottom: 25,
          left: '80%',
          transform: 'translateX(-50%) rotate(-3deg)',
          width: 130,
          height: 130,
          zIndex: 1
        }}
      >
        {/* Outer ring */}
        <Box 
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: 'transparent',
            border: `2px dashed ${theme.palette.secondary.main}`,
            opacity: 0.7
          }}
        />
        
        {/* Middle ring with text */}
        <Box 
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '85%',
            height: '85%',
            borderRadius: '50%',
            backgroundColor: 'rgba(0,0,0,0.6)',
            border: `2px solid ${theme.palette.primary.main}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column'
          }}
        >
          <Typography 
            variant="h6" 
            sx={{ 
              fontFamily: 'Snowstorm, serif',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              color: theme.palette.secondary.main,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              textAlign: 'center',
              lineHeight: 1.2,
              mb: 0.5
            }}
          >
            RSVP
          </Typography>
          
          <Typography 
            variant="body2" 
            sx={{ 
              fontFamily: 'Snowstorm, serif',
              fontSize: '0.7rem',
              color: '#FFFFFF',
              textAlign: 'center'
            }}
          >
            by May 19, 2025
          </Typography>
        </Box>
        
        {/* Inner decorative element */}
        <Box 
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '40%',
            height: '40%',
            borderRadius: '50%',
            border: `1px solid ${theme.palette.primary.main}`,
            opacity: 0.5
          }}
        />
      </Box>
      
      {/* Octopus image */}
      <Box
        component={'img'}
        src={ElPulpo} 
        sx={{
          position: 'absolute',
          bottom: -80,
          left: -80,
          width: 180,
          height: 180,
          objectFit: 'contain',
          opacity: 0.7,
          transform: 'rotate(-15deg)'
        }}
      />

      {/* URL Info */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 15,
          left: 15,
          filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.5))'
        }}
      >
        <Typography
          sx={{
            color: theme.palette.secondary.main,
            fontSize: '0.8rem',
            fontFamily: 'sans-serif'
          }}
        >
          https://christephanie.com?inviteCode={selectedFamily?.invitationCode || 'DEMO'}
        </Typography>
      </Box>
      
      {/* Decorative corner elements */}
      <Box sx={{ 
        position: 'absolute', 
        top: 10, 
        left: 10, 
        width: 15, 
        height: 15, 
        borderTop: `1px solid ${theme.palette.primary.main}`, 
        borderLeft: `1px solid ${theme.palette.primary.main}` 
      }} />
      <Box sx={{ 
        position: 'absolute', 
        top: 10, 
        right: 10, 
        width: 15, 
        height: 15, 
        borderTop: `1px solid ${theme.palette.primary.main}`, 
        borderRight: `1px solid ${theme.palette.primary.main}` 
      }} />
      <Box sx={{ 
        position: 'absolute', 
        bottom: 10, 
        left: 10, 
        width: 15, 
        height: 15, 
        borderBottom: `1px solid ${theme.palette.primary.main}`, 
        borderLeft: `1px solid ${theme.palette.primary.main}` 
      }} />
      <Box sx={{ 
        position: 'absolute', 
        bottom: 10, 
        right: 10, 
        width: 15, 
        height: 15, 
        borderBottom: `1px solid ${theme.palette.primary.main}`, 
        borderRight: `1px solid ${theme.palette.primary.main}` 
      }} />
    </Paper>
  );
};