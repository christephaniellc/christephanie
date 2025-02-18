// ForestBackground.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useRecoilValue } from 'recoil';
import ForestIcon from '@mui/icons-material/Forest';        // Tree icon (MUI)
import WhatshotIcon from '@mui/icons-material/Whatshot';
import { currentPaletteSelector } from '@/store/theme/paletteState';
import { generateTreeClusters } from '@/components/ForestBackground/treePlacement';
import Box from '@mui/material/Box';
import StickFigureIcon from '@/components/StickFigureIcon';    // Fire icon

interface ForestBackgroundProps {
  figureCount?: number;  // optional number of stick figure attendees to display
}

const ForestBackground: React.FC<ForestBackgroundProps> = ({ figureCount = 0 }) => {
  // Track window dimensions to update layout on resize
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get the active color palette from Recoil (based on current response state)
  const palette = useRecoilValue(currentPaletteSelector);
  // Helper to pick a random color from the palette
  const getRandomPaletteColor = (): string => {
    if (palette.length === 0) return '#000';
    const idx = Math.floor(Math.random() * palette.length);
    return palette[idx];
  };

  // Determine tree clusters for current window size
  const clusters = generateTreeClusters(windowSize.width, windowSize.height);

  // Enforce dense forest rule: if very wide screen, limit visible stick figures to 1 or 2
  let displayFigures = figureCount;
  if (windowSize.width > 1600 && displayFigures > 2) {
    displayFigures = 2;
  }

  // Prepare JSX for tree clusters
  const treeClusterElements = useCallback(() => {
    clusters.map((cluster, i) => (
      <div
        key={`trees-${i}`}
        style={{
          display: 'flex',
          justifyContent: cluster.alignment,
          flexWrap: 'wrap',
          alignItems: 'flex-end',  /* align tree icons by their bottom for a natural look */
        }}
      >
        {/* Large trees */}
        {Array.from({ length: cluster.largeCount }).map((_, j) => (
          <ForestIcon
            key={`tree-large-${i}-${j}`}
            style={{ fontSize: cluster.largeSize, color: getRandomPaletteColor(), marginBottom: Math.random() * 10 }}
          />
        ))}
        {/* Medium trees */}
        {Array.from({ length: cluster.mediumCount }).map((_, j) => (
          <ForestIcon
            key={`tree-medium-${i}-${j}`}
            style={{ fontSize: cluster.mediumSize, color: getRandomPaletteColor() }}
          />
        ))}
        {/* Small trees */}
        {Array.from({ length: cluster.smallCount }).map((_, j) => (
          <ForestIcon
            key={`tree-small-${i}-${j}`}
            style={{ fontSize: cluster.smallSize, color: getRandomPaletteColor() }}
          />
        ))}
      </div>
    ));
  }, [clusters, getRandomPaletteColor]);


  // Prepare JSX for stick figure clusters (if any)
  const figureElements: JSX.Element[] = [];
  if (displayFigures > 0) {
    if (displayFigures >= 3) {
      // Group some figures around a campfire (take 3 people for the group)
      const groupSize = 3;
      displayFigures -= groupSize;
      figureElements.push(
        <div
          key="campfire-group"
          style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '8px' }}
        >
          {/* One person on left of fire */}
          <StickFigureIcon size={"24px"} sx={{ marginRight: '4px', color: getRandomPaletteColor() }} />
          {/* Fire icon in the center */}
          <WhatshotIcon size={"28px"} sx={{ margin: '0 4px', color: '#FF5722' }} />
          {/* Two people on right of fire */}
          <StickFigureIcon size={"24px"} sx={{margin: '0 4px', color: getRandomPaletteColor() }} />
          <StickFigureIcon size={"24px"} sx={{ marginLeft: '4px', color: getRandomPaletteColor() }} />
        </div>,
      );
    }
    // Any remaining figures are placed as single, dispersed individuals
    for (let k = 0; k < displayFigures; k++) {
      const alignStyle = Math.random() < 0.5 ? 'flex-start' : 'flex-end';
      figureElements.push(
        <div
          key={`single-figure-${k}`}
          style={{ display: 'flex', justifyContent: alignStyle, marginTop: '4px' }}
        >
          <StickFigureIcon style={{ fontSize: 20, color: getRandomPaletteColor() }} />
        </div>,
      );
    }
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-end',
      flexWrap: 'wrap',
      width: '100%',
      height: '100%',
    }}>
      {/* Render tree clusters from top to bottom */}
      {treeClusterElements()}
      {/* Render figure clusters (campfire group and singles) at the bottom if any */}
      {figureElements}
    </div>
  );
};

export default ForestBackground;
