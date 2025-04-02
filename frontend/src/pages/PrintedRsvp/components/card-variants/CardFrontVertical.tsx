import React from 'react';
import { rem } from 'polished';
import { 
  alpha,
  Box,
  Paper,
  Typography, 
  useTheme
} from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import { FamilyUnitDto } from '@/types/api';
import { StephsActualFavoriteTypographyNoDrop } from '@/components/AttendanceButton/AttendanceButton';
import ElPulpoIcon from '@/assets/favicon_big_art_transparent.png';

interface CardFrontVerticalProps {
  selectedFamily: FamilyUnitDto | null;
  exportMode?: boolean;
}

export const CardFrontVertical: React.FC<CardFrontVerticalProps> = ({
  selectedFamily,
  exportMode = false
}) => {
  const theme = useTheme();
  
  // Check if we're currently in export mode by looking for the marker class
  const isExporting = exportMode || (typeof document !== 'undefined' && document.body.classList.contains('exporting-png'));

  // Create a fancy border style
  const gradientBorder = `
    repeating-linear-gradient(
      45deg,
      #9c27b0, 
      #9c27b0 5%,
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
    const lastNames = Array.from(
      new Set(
        family.guests
          .map((user) => user.lastName)
          .filter((name): name is string => !!name) // Filters out undefined/null/empty
      )
    )
      .map((lastName) => `${lastName}`)
      .join(' & ');
  
    return lastNames;
  };
  
  // QR code URL for the selected family's invitation code
  const qrCodeUrl = selectedFamily?.invitationCode 
    ? `https://christephanie.com?inviteCode=${selectedFamily.invitationCode}`
    : "https://christephanie.com";
  
  return (
    <Paper 
      elevation={8}
      className={`card-front-vertical`}
      data-card-type={`front-vertical`}
      sx={{
        width: isExporting ? 1200 : 384, // 4 inches @ 300ppi for export, 96ppi for display
        height: isExporting ? 1800 : 576, // 6 inches @ 300ppi for export, 96ppi for display
        backgroundColor: '#121212', // Dark background matching the back side
        backgroundImage: `radial-gradient(ellipse at 30% 40%, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.2) 70%)`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        transformOrigin: 'top left',
        border: isExporting ? '0px solid transparent' : '15px solid transparent',
        borderImageSource: !isExporting ? gradientBorder : 'none',
        borderImageSlice: 1,
        boxSizing: 'border-box',
        color: 'white',
        // For print media
        '@media print': {
          width: '4in',
          height: '6in'
        }
      }}
    >
      {/* Background enhancement elements */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        //background: 'linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%)',
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
        top: 13,
        left: 0,
        right: 0,
        textAlign: 'right',
        mr: 4,
        zIndex: 1
      }}>
        <StephsActualFavoriteTypographyNoDrop 
          variant="h5" 
          sx={{ 
            zIndex: 5,
            fontSize: '1.5rem', 
            lineHeight: '1.5rem',
            color: theme.palette.secondary.main,
            mb: 2
          }}
        >
          Steph Stubler<br/>Topher Sikorra
        </StephsActualFavoriteTypographyNoDrop>
        <StephsActualFavoriteTypographyNoDrop 
          variant="h5" 
          sx={{ 
            position: 'absolute',
            top: '26px',
            left: '94px',
            fontSize: '1.5rem', 
            lineHeight: '1.2rem',
            zIndex: -10,
            color: '#9c27b0',
          }}
        >
          &
        </StephsActualFavoriteTypographyNoDrop>
        
        {/* Decorative divider */}
        <Box sx={{
          margin: '0 auto',
          width: '80%',
          height: '2px',
          background: `linear-gradient(to right, transparent, #9c27b0, transparent)`,
          mb: 1
        }} />
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-around',
          alignItems: 'center',
          pl: 2,
          pr: 3

        }} >
        {/* El Pulpo icon in top right corner */}
        <Box
          className="el-pulpo-icon-container"
            sx={{
            alignItems: 'center',
            display: 'flex',
            pl: 2,
            height: '65px', // Explicitly constrain height
          }}
        >
          <Box
            component="img"
            className="el-pulpo-icon"
            src={ElPulpoIcon}
            alt="El Pulpo"
            sx={{
              mt: 1,
              height: '100%',
              width: '100%',
              maxWidth: '65px',   // Strict max dimensions
              maxHeight: '65px',  // Strict max dimensions
              borderRadius: '50%',
              objectFit: 'contain',  // Use contain to maintain aspect ratio
              objectPosition: 'center',
              border: `2px solid ${alpha(theme.palette.secondary.main, 0.8)}`,
              // boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
            }}
          />
        </Box>

        {/* Sender Address & Wedding Details */}
        <Box sx={{ 
          position: 'relative',
          textAlign: 'center',
          mt: 2,
          mb: 1,
          zIndex: 1
        }}>
          <Typography 
            variant="body1" 
            sx={{ 
              fontFamily: 'Snowstorm, serif',
              color: '#9c27b0',
              fontWeight: 600,
              fontSize: '1.1rem',
              mb: 0.5,
              //pr: 4,
              letterSpacing: '0.08em'
            }}
          >
            are getting married
          </Typography>
          
          <Typography 
            variant="h6" 
            sx={{ 
              fontFamily: 'Snowstorm, serif',
              color: theme.palette.secondary.main,
              fontWeight: 500,
              fontSize: '0.9rem',
              mb: 0.25,
              //pr: 6,
              fontStyle: 'italic'
            }}
          >
            on July 5, 2025 at 6:00pm
          </Typography>
          
          <Typography 
            variant="body2" 
            sx={{ 
              fontFamily: 'Snowstorm, serif',
              color: '#aaa',
              fontSize: '0.8rem'
            }}
          >
            Stone Manor Inn • Lovettsville, Virginia
          </Typography>
        </Box>
      </Box>
      
      {/* Guest Address Block - fixed height regardless of content - shorter now */}
      <Box sx={{ 
        position: 'relative',
        mx: 'auto',
        mt: 2,
        mb: 2,
        width: '85%',
        height: isExporting ? 380 : 120, // Further reduced fixed height
        minHeight: isExporting ? 380 : 120, // Ensure minimum height
        maxHeight: isExporting ? 380 : 120, // Ensure maximum height
        display: 'flex',
        flexDirection: 'column',
        p: 1.5, // Reduced overall padding
        pt: 1.0,
        pb: 1.0,
        textAlign: 'center',
        borderRadius: '4px',
        border: `3px solid ${theme.palette.secondary.main}`,
        backgroundColor: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
        boxShadow: `0 0 10px ${theme.palette.secondary.dark}`,
        zIndex: 1
      }}>
        {/* First line - Family/Guest Name(s) */}
        <Typography 
          variant="body1" 
          sx={{ 
            fontFamily: 'Snowstorm, serif', 
            mb: 0.8, 
            fontWeight: 600,
            fontSize: '1.2rem',
            color: theme.palette.secondary.main,
            textShadow: '1px 1px 0px rgba(0,0,0,0.5)'
          }}
        >
          {calculateLastNames(selectedFamily || {})} Family
        </Typography>
        
        {/* Address Content Area - fixed height container with consistent centering */}
        <Box 
          sx={{ 
            flex: '1 1 auto',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            overflow: 'hidden' // Prevent content from overflowing
          }}
        >
          {selectedFamily?.mailingAddress ? (
            <>
              {/* Check for country and format accordingly */}
              {(selectedFamily.mailingAddress as any)?.country ? (
                // International address format based on country
                <>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontFamily: 'Snowstorm, serif', 
                      //letterSpacing: '1px',
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
                  
                  {/* Format based on country */}
                  {['Canada', 'Mexico', 'Thailand'].includes((selectedFamily.mailingAddress as any)?.country) ? (
                    // North American/Asian format - City, State/Province first, then postal code
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
                        {selectedFamily.mailingAddress.city}, {selectedFamily.mailingAddress.state} {selectedFamily.mailingAddress.zipCode}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontFamily: 'Snowstorm, serif', 
                          lineHeight: 1.3,
                          color: 'rgba(255,255,255,0.85)',
                          fontWeight: 'bold'
                        }}
                      >
                        {(selectedFamily.mailingAddress as any)?.country.toUpperCase()}
                      </Typography>
                    </>
                  ) : (
                    // European format (Germany/Norway)
                    <>
                      {/* Postal code and city on one line */}
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontFamily: 'Snowstorm, serif', 
                          lineHeight: 1.3,
                          mb: 0.25,
                          color: 'rgba(255,255,255,0.85)'
                        }}
                      >
                        {selectedFamily.mailingAddress.zipCode} {selectedFamily.mailingAddress.city}
                      </Typography>
                      
                      {/* Country in uppercase */}
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontFamily: 'Snowstorm, serif', 
                          lineHeight: 1.3,
                          color: 'rgba(255,255,255,0.85)'
                        }}
                      >
                        {(selectedFamily.mailingAddress as any)?.country.toUpperCase()}
                      </Typography>
                    </>
                  )}
                </>
              ) : (
                // US address format
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
              )}
            </>
          ) : (
            /* Empty address area for manual labeling */
            <Box
              sx={{
                width: '100%',
                height: '80%', // Use most of the space but not all
                //border: `1px dashed ${alpha(theme.palette.primary.main, 0.4)}`,
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'rgba(255,255,255,0.4)',
                  fontStyle: 'italic',
                  fontSize: '0.75rem',
                }}
              >
                (Address label needed)
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
      
      {/* Spacer to create distance between address box and website section */}
      <Box sx={{ height: isExporting ? 90 : 30 }} /> {/* Fixed height spacer */}
      
      {/* Website Info with QR and RSVP Seal in a row - positioned to end above corner elements */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 2,
          px: 3,
          position: 'relative',
          mt: 0, // Don't push down with margin
          mb: isExporting ? 45 : 15, // Precise margin to end just above corner elements (different for export)
          zIndex: 1
        }}
      >
        {/* Website Info with QR */}
        <Box
          sx={{
            //width: '85%',
            flexBasis: '60%',
            backgroundColor: 'rgba(0,0,0,0.8)',
            padding: '12px',
            borderRadius: '6px',
            border: `2px solid ${theme.palette.secondary.main}40`,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
            ml: 3,
            mr: -4,
            mt: -1      
            //mb: 4
          }}
        >
          <Typography
            sx={{
              color: theme.palette.common.white,
              fontSize: '0.7rem',
              fontWeight: 500,
              fontFamily: 'sans-serif',
              mb: 0.2
            }}
          >
            Visit our website to RSVP:
          </Typography>
          <Typography
            sx={{
              color: theme.palette.secondary.main,
              fontSize: '0.8rem',
              fontWeight: 600,
              fontFamily: 'sans-serif',
              mb: -1
            }}
          >
            https://christephanie.com
          </Typography>
          
          <Box sx={{ 
            mt: 1.5, 
            mb: 1.5,
            pt: 1, 
            width: '100%', 
            borderTop: `1px dashed #9c27b0 30` 
          }}>
            <Typography
              sx={{
                color: '#9c27b0',
                fontSize: '0.7rem',
                fontWeight: 600,
                fontFamily: 'sans-serif'
              }}
            >
              YOUR INVITE CODE:
            </Typography>
            <Typography
              sx={{
                color: '#fff',
                fontSize: '1rem',
                fontWeight: 600,
                fontFamily: 'sans-serif',
                letterSpacing: '0.05em'
              }}
            >
              {selectedFamily?.invitationCode || 'DEMO'}
            </Typography>
          </Box>
          
          {/* QR code */}
          <Box 
            sx={{ 
              width: '80px', 
              height: '80px', 
              border: `1px solid ${theme.palette.secondary.main}`,
              borderRadius: '4px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column',
              color: theme.palette.secondary.main,
              backgroundColor: 'rgba(0,0,0,0.5)',
              p: 0.5,
              mb: 0.5
            }}
          >
            <QRCodeSVG 
              value={qrCodeUrl}
              size={55}
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
            <Typography variant="caption" sx={{ fontSize: '0.45rem', textAlign: 'center', color: theme.palette.common.white }}>
              OR, SCAN ME
            </Typography>
          </Box>
        </Box>
        
        {/* RSVP Seal - right side */}
        <Box 
          sx={{
            width: 130,
            height: 130,
            position: 'relative',
            transform: 'rotate(-3deg)',
            flexShrink: 0,
            mr: 1
            //mb: 3
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
              border: `3px dashed ${theme.palette.secondary.main}`,
              opacity: 0.9,
              zIndex: 2
            }}
          />
          
          {/* Middle ring - now behind the text */}
          <Box 
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '85%',
              height: '85%',
              borderRadius: '50%',
              backgroundColor: 'rgba(0,0,0,0.7)',
              border: `2px solid ${theme.palette.primary.main}`,
              boxShadow: `0 0 8px ${theme.palette.primary.dark}`,
              zIndex: 2
            }}
          />
          
          {/* Text in front of the rings */}
          <Box 
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 5, // Higher z-index to ensure text is on top
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              width: '100%',
              pointerEvents: 'none' // Ensures the text doesn't block clicks
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                fontFamily: 'Snowstorm, serif',
                fontSize: '1rem',
                fontWeight: 'bold',
                color: theme.palette.secondary.main,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                textAlign: 'center',
                lineHeight: 1.2,
                mb: 0.0
              }}
            >
              RSVP
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                fontFamily: 'Snowstorm, serif',
                fontSize: '0.7rem',
                color: theme.palette.secondary.main,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                textAlign: 'center',
                lineHeight: 1.2,
                mb: 0.5
              }}
            >
              required
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                fontFamily: 'Snowstorm, serif',
                fontSize: '0.8rem',
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
              opacity: 0.7,
              zIndex: 3
            }}
          />
        </Box>
      </Box>
      
{/* No longer needed as we're now using flexbox positioning */}

      {/* Octopus image - full width with proper sizing */}
      {/* <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: 150,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-end',
          overflow: 'hidden',
          mt: 'auto', 
          //zIndex: 1
        }}
      >
        <Box
          component={'img'}
          src={ElPulpo} 
          sx={{
            width: '100%',
            minWidth: 400,
            objectFit: 'cover',
            objectPosition: 'center bottom',
            opacity: 0.9,
            transform: 'translateY(30px)', 
            zIndex: 100
          }}
        />
      </Box> */}
      
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