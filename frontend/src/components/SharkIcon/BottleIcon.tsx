import React from 'react';
import { useTheme } from '@mui/material/styles';

const BabyBottleIcon = (props) => {
  const theme = useTheme();
  const fillColor = theme.palette.common.black;

  return (
    <div style={{ transform: 'rotate(45deg)' }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width={props.size || 24}
        height={props.size || 24}
        {...props}
      >
        {/* Bottle Nipple */}
        <path
          d="M11 1C11 0.45 11.45 0 12 0C12.55 0 13 0.45 13 1V2.5C13 2.78 12.78 3 12.5 3H11.5C11.22 3 11 2.78 11 2.5V1Z"
          fill={fillColor}
          stroke="#555555"
          strokeWidth="0.4"
        />

        {/* Bottle Collar/Cap */}
        <path
          d="M9 3C9 3 8.5 3.5 8.5 4C8.5 4.5 9 5.5 10 5.5H14C15 5.5 15.5 4.5 15.5 4C15.5 3.5 15 3 15 3H9Z"
          fill={fillColor}
          stroke="#555555"
          strokeWidth="0.4"
        />

        {/* Bottle's Outer Edge (filled) */}
        <path
          d="M7.5 7V20C7.5 21.65 8.85 22.5 10.5 22.5H13.5C15.15 22.5 16.5 21.65 16.5 20V7C16.5 6.2 16 5.7 15.5 5.5H8.5C8 5.7 7.5 6.2 7.5 7ZM15.5 7V20C15.5 20.82 14.82 21.5 14 21.5H10C9.18 21.5 8.5 20.82 8.5 20V7H15.5Z"
          fill={fillColor}
          stroke="none"
        />

        {/* Bottle Body (transparent) */}
        <path
          d="M8.5 7H15.5V20C15.5 20.82 14.82 21.5 14 21.5H10C9.18 21.5 8.5 20.82 8.5 20V7Z"
          fill="transparent"
          stroke="#555555"
          strokeWidth="0.4"
        />

        {/* Bottle Liquid */}
        <path
          d="M8.5 16H15.5V20C15.5 20.82 14.82 21.5 14 21.5H10C9.18 21.5 8.5 20.82 8.5 20V16Z"
          fill={props.liquidFill || theme.palette.secondary.light}
          stroke="#555555"
          strokeWidth="0.2"
        />

        {/* Measurement Lines */}
        <line x1="9" y1="9" x2="11" y2="9" stroke="#777777" strokeWidth="0.3" />
        <line x1="9" y1="12" x2="11" y2="12" stroke="#777777" strokeWidth="0.3" />
        <line x1="9" y1="15" x2="11" y2="15" stroke="#777777" strokeWidth="0.3" />
        <line x1="9" y1="18" x2="11" y2="18" stroke="#777777" strokeWidth="0.3" />

        {/* Bottle Outline */}
        <path
          d="M13 1C13 0.45 12.55 0 12 0C11.45 0 11 0.45 11 1V2.5C11 2.78 11.22 3 11.5 3H12.5C12.78 3 13 2.78 13 2.5V1Z"
          fill="none"
          stroke="#555555"
          strokeWidth="0.5"
        />
      </svg>
    </div>
  );
};

export default BabyBottleIcon;
