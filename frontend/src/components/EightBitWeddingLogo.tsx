import React from 'react';
import { useTheme } from '@mui/material';

type EightBitWeddingLogoProps = {
  /** Optional inline styles for the SVG wrapper */
  style?: React.CSSProperties;
};

const EightBitWeddingLogo: React.FC<EightBitWeddingLogoProps> = ({ style }) => {
  const theme = useTheme();

  const backgroundColor = theme.palette.background.default;

  return (
    <svg
      width="100%"
      height="80"
      viewBox="0 0 125 80"
      xmlns="http://www.w3.org/2000/svg"
      style={style}
    >
      {/* Background */}
      <rect
        x="0"
        y="0"
        width="125"
        height="80"
        fill={backgroundColor}
      />

      {/* BRIDE */}
      {/* Hair (row 0) */}
      <rect x="20" y="0"  width="5" height="5" fill="#9D00FF" />
      <rect x="25" y="0"  width="5" height="5" fill="#9D00FF" />

      {/* Face (row 1) */}
      <rect x="20" y="5"  width="5" height="5" fill="#E9950C" />
      <rect x="25" y="5"  width="5" height="5" fill="#E9950C" />

      {/* Upper Dress (row 2) */}
      <rect x="20" y="10" width="5" height="5" fill="#ffffff" />
      <rect x="25" y="10" width="5" height="5" fill="#ffffff" />

      {/* Dress middle (row 3) */}
      <rect x="15" y="15" width="5" height="5" fill="#ffffff" />
      <rect x="20" y="15" width="5" height="5" fill="#ffffff" />
      <rect x="25" y="15" width="5" height="5" fill="#ffffff" />
      <rect x="30" y="15" width="5" height="5" fill="#ffffff" />

      {/* Dress middle (row 4) */}
      <rect x="15" y="20" width="5" height="5" fill="#ffffff" />
      <rect x="20" y="20" width="5" height="5" fill="#ffffff" />
      <rect x="25" y="20" width="5" height="5" fill="#ffffff" />
      <rect x="30" y="20" width="5" height="5" fill="#ffffff" />

      {/* Bouquet (row 5) */}
      <rect x="15" y="25" width="5" height="5" fill="#ffffff" />
      <rect x="20" y="25" width="5" height="5" fill="#E9950C" />
      <rect x="25" y="25" width="5" height="5" fill="#E9950C" />
      <rect x="30" y="25" width="5" height="5" fill="#ffffff" />

      {/* Dress bottom (rows 6,7) */}
      <rect x="20" y="30" width="5" height="5" fill="#ffffff" />
      <rect x="25" y="30" width="5" height="5" fill="#ffffff" />
      <rect x="20" y="35" width="5" height="5" fill="#ffffff" />
      <rect x="25" y="35" width="5" height="5" fill="#ffffff" />

      {/* GROOM */}
      {/* Hair (row 0) */}
      <rect x="95" y="0"  width="5" height="5" fill="#09020E" />
      <rect x="100" y="0" width="5" height="5" fill="#09020E" />

      {/* Face (row 1) */}
      <rect x="95" y="5"  width="5" height="5" fill="#E9950C" />
      <rect x="100" y="5" width="5" height="5" fill="#E9950C" />

      {/* Suit & tie (row 2) */}
      <rect x="95"  y="10" width="5" height="5" fill="#09020E" />
      <rect x="100" y="10" width="5" height="5" fill="#9D00FF" />

      {/* Suit (rows 3-7) */}
      <rect x="95"  y="15" width="5" height="5" fill="#09020E" />
      <rect x="100" y="15" width="5" height="5" fill="#09020E" />
      <rect x="95"  y="20" width="5" height="5" fill="#09020E" />
      <rect x="100" y="20" width="5" height="5" fill="#09020E" />
      <rect x="95"  y="25" width="5" height="5" fill="#09020E" />
      <rect x="100" y="25" width="5" height="5" fill="#09020E" />
      <rect x="95"  y="30" width="5" height="5" fill="#09020E" />
      <rect x="100" y="30" width="5" height="5" fill="#09020E" />
      <rect x="95"  y="35" width="5" height="5" fill="#09020E" />
      <rect x="100" y="35" width="5" height="5" fill="#09020E" />
    </svg>
  );
};

export default EightBitWeddingLogo;
