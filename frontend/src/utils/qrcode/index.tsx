import React from 'react';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';
import { Box, Typography, useTheme } from '@mui/material';
import ElPulpo from '@/assets/el_pulpo_cabeza.jpg';

/**
 * Generates a URL with query parameters for creating a QR code
 * 
 * @param baseUrl - The base URL to encode in the QR code
 * @param params - Object of query parameters to add to the URL
 * @returns The URL string for the QR code
 */
export const generateQRCodeUrl = (baseUrl: string, params: Record<string, string | undefined>) => {
  const queryParams = new URLSearchParams();
  
  // Add any defined parameters to the URL
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      queryParams.append(key, value);
    }
  });
  
  const queryString = queryParams.toString();
  return `${baseUrl}${queryString ? `?${queryString}` : ''}`;
};

interface StyledQRCodeProps {
  value: string;
  size?: number;
  style?: 'postage' | 'circular' | 'wedding' | 'basic';
  title?: string;
  subtitle?: string;
  logoImage?: string;
  showCorners?: boolean;
}

/**
 * Enhanced styled QR code component with different visual styles
 */
export const StyledQRCode: React.FC<StyledQRCodeProps> = ({
  value,
  size = 120,
  style = 'postage',
  title,
  subtitle,
  logoImage,
  showCorners = true,
}) => {
  const theme = useTheme();
  const qrSize = Math.floor(size * 0.6);
  const imageSize = Math.floor(qrSize * 0.2);
  
  // Postage stamp style QR code
  if (style === 'postage') {
    return (
      <Box
        sx={{
          position: 'relative',
          width: size,
          height: size,
          border: `1px solid ${theme.palette.secondary.main}`,
          borderRadius: '4px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          color: theme.palette.secondary.main,
          backgroundColor: 'rgba(0,0,0,0.7)',
          transform: 'rotate(2deg)',
          boxShadow: '0 3px 12px rgba(0,0,0,0.4)',
          padding: '8px',
          overflow: 'hidden',
        }}
      >
        {/* Decorative corners */}
        {showCorners && (
          <>
            <Box sx={{ 
              position: 'absolute', 
              top: 5, 
              left: 5, 
              width: 8, 
              height: 8, 
              borderTop: `1px solid ${theme.palette.primary.main}`, 
              borderLeft: `1px solid ${theme.palette.primary.main}` 
            }} />
            <Box sx={{ 
              position: 'absolute', 
              top: 5, 
              right: 5, 
              width: 8, 
              height: 8, 
              borderTop: `1px solid ${theme.palette.primary.main}`, 
              borderRight: `1px solid ${theme.palette.primary.main}` 
            }} />
            <Box sx={{ 
              position: 'absolute', 
              bottom: 5, 
              left: 5, 
              width: 8, 
              height: 8, 
              borderBottom: `1px solid ${theme.palette.primary.main}`, 
              borderLeft: `1px solid ${theme.palette.primary.main}` 
            }} />
            <Box sx={{ 
              position: 'absolute', 
              bottom: 5, 
              right: 5, 
              width: 8, 
              height: 8, 
              borderBottom: `1px solid ${theme.palette.primary.main}`, 
              borderRight: `1px solid ${theme.palette.primary.main}` 
            }} />
          </>
        )}

        {/* Title if provided */}
        {title && (
          <Typography 
            variant="caption" 
            sx={{ 
              color: theme.palette.secondary.light,
              fontWeight: 600,
              fontSize: Math.max(size/15, 10),
              mb: 0.5,
              textAlign: 'center'
            }}
          >
            {title}
          </Typography>
        )}
        
        {/* QR code with perforated border effect */}
        <Box
          sx={{
            position: 'relative',
            padding: '4px',
            background: 'rgba(255,255,255,0.97)',
            borderRadius: '2px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            boxShadow: 'inset 0 0 4px rgba(0,0,0,0.2)',
            mb: title ? 0 : 0.5,
          }}
        >
          <QRCodeSVG 
            value={value}
            size={qrSize}
            level="M"
            includeMargin={false}
            bgColor="white"
            fgColor="#000"
          />
        </Box>
        
        {/* Subtitle if provided */}
        {subtitle && (
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'rgba(255,255,255,0.9)',
              fontSize: Math.max(size/20, 8),
              mt: 0.5,
              textAlign: 'center',
              fontWeight: 600,
              letterSpacing: '0.05em',
            }}
          >
            {subtitle}
          </Typography>
        )}
        
        {/* Logo */}
        <Box 
          component="img" 
          src={logoImage || ElPulpo}
          alt="" 
          sx={{ 
            position: 'absolute',
            bottom: 2,
            right: 2,
            width: imageSize,
            height: imageSize,
            borderRadius: '50%',
            objectFit: 'cover',
            border: `1px solid ${theme.palette.secondary.main}30`,
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
          }} 
        />
      </Box>
    );
  }
  
  // Circular style QR code
  if (style === 'circular') {
    return (
      <Box
        sx={{
          position: 'relative',
          width: size,
          height: size,
          borderRadius: '50%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          backgroundColor: 'rgba(0,0,0,0.8)',
          boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
          padding: '8px',
          overflow: 'hidden',
          border: `2px solid ${theme.palette.primary.main}`,
        }}
      >
        {/* Outer dashed border */}
        <Box 
          sx={{
            position: 'absolute',
            top: 4,
            left: 4,
            right: 4,
            bottom: 4,
            borderRadius: '50%',
            border: `1px dashed ${theme.palette.secondary.main}`,
            opacity: 0.7,
          }}
        />
        
        {/* Title if provided */}
        {title && (
          <Typography 
            variant="caption" 
            sx={{ 
              color: theme.palette.secondary.main,
              fontWeight: 700,
              fontSize: Math.max(size/15, 10),
              mb: 0.5,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              textAlign: 'center',
            }}
          >
            {title}
          </Typography>
        )}
        
        {/* QR code with rounded corners */}
        <Box
          sx={{
            position: 'relative',
            padding: '3px',
            background: 'rgba(255,255,255,0.97)',
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: 'inset 0 0 4px rgba(0,0,0,0.2), 0 2px 5px rgba(0,0,0,0.15)',
            transform: 'rotate(-3deg)',
          }}
        >
          <QRCodeSVG 
            value={value}
            size={qrSize}
            level="M"
            includeMargin={false}
            bgColor="white"
            fgColor="#000"
          />
        </Box>
        
        {/* Subtitle if provided */}
        {subtitle && (
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'rgba(255,255,255,0.9)',
              fontSize: Math.max(size/20, 8),
              mt: 0.7,
              textAlign: 'center',
              fontFamily: 'Snowstorm, serif',
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
    );
  }
  
  // Wedding style QR code
  if (style === 'wedding') {
    return (
      <Box
        sx={{
          position: 'relative',
          width: size,
          height: size,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          backgroundColor: '#121212',
          backgroundImage: `radial-gradient(ellipse at 30% 40%, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.2) 70%)`,
          boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
          padding: '8px',
          overflow: 'hidden',
          borderRadius: '8px',
          border: `1px solid ${theme.palette.primary.main}`,
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
          top: -10,
          right: -10,
          width: size/3,
          height: size/3,
          background: `radial-gradient(circle, ${theme.palette.primary.main}30 0%, transparent 70%)`,
          opacity: 0.5,
          zIndex: 0
        }} />
        
        {/* Title if provided */}
        {title && (
          <Typography 
            variant="caption" 
            sx={{ 
              position: 'relative',
              zIndex: 1,
              color: theme.palette.secondary.main,
              fontFamily: 'Snowstorm, serif',
              fontWeight: 600,
              fontSize: Math.max(size/12, 12),
              mb: 0.5,
              textAlign: 'center',
            }}
          >
            {title}
          </Typography>
        )}
        
        {/* Decorative divider */}
        <Box sx={{
          position: 'relative',
          zIndex: 1,
          margin: '0 auto',
          width: '80%',
          height: '1px',
          background: `linear-gradient(to right, transparent, ${theme.palette.primary.main}, transparent)`,
          mb: 1
        }} />
        
        {/* QR code with fancy border */}
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            padding: '6px',
            background: 'white',
            borderRadius: '4px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            border: `1px solid ${theme.palette.primary.light}`,
            boxShadow: '0 3px 8px rgba(0,0,0,0.25)',
          }}
        >
          <QRCodeSVG 
            value={value}
            size={qrSize}
            level="M"
            includeMargin={false}
            bgColor="white"
            fgColor="#000"
          />
        </Box>
        
        {/* Subtitle if provided */}
        {subtitle && (
          <Typography 
            variant="caption" 
            sx={{ 
              position: 'relative',
              zIndex: 1,
              color: theme.palette.primary.light,
              fontSize: Math.max(size/18, 10),
              mt: 1,
              textAlign: 'center',
              fontFamily: 'Snowstorm, serif',
            }}
          >
            {subtitle}
          </Typography>
        )}
        
        {/* Decorative corner elements */}
        {showCorners && (
          <>
            <Box sx={{ 
              position: 'absolute', 
              top: 6, 
              left: 6, 
              width: 10, 
              height: 10, 
              borderTop: `1px solid ${theme.palette.primary.main}`, 
              borderLeft: `1px solid ${theme.palette.primary.main}`,
              zIndex: 1
            }} />
            <Box sx={{ 
              position: 'absolute', 
              top: 6, 
              right: 6, 
              width: 10, 
              height: 10, 
              borderTop: `1px solid ${theme.palette.primary.main}`, 
              borderRight: `1px solid ${theme.palette.primary.main}`,
              zIndex: 1
            }} />
            <Box sx={{ 
              position: 'absolute', 
              bottom: 6, 
              left: 6, 
              width: 10, 
              height: 10, 
              borderBottom: `1px solid ${theme.palette.primary.main}`, 
              borderLeft: `1px solid ${theme.palette.primary.main}`,
              zIndex: 1
            }} />
            <Box sx={{ 
              position: 'absolute', 
              bottom: 6, 
              right: 6, 
              width: 10, 
              height: 10, 
              borderBottom: `1px solid ${theme.palette.primary.main}`, 
              borderRight: `1px solid ${theme.palette.primary.main}`,
              zIndex: 1
            }} />
          </>
        )}
      </Box>
    );
  }
  
  // Basic style (default fallback)
  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {title && (
        <Typography variant="caption" sx={{ mb: 0.5 }}>
          {title}
        </Typography>
      )}
      
      <QRCodeSVG 
        value={value}
        size={qrSize}
        level="M"
        includeMargin
        bgColor="white"
        fgColor="black"
      />
      
      {subtitle && (
        <Typography variant="caption" sx={{ mt: 0.5 }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  );
};

/**
 * Export QR code components from qrcode.react
 */
export { QRCodeCanvas, QRCodeSVG };