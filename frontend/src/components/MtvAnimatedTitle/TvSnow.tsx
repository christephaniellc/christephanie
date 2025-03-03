// TvSnow.jsx
import React, { useRef, useEffect } from 'react';

const TvSnow = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set the canvas dimensions to match its rendered size.
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const ctx = canvas.getContext('2d');
    const blockSize = 4; // Adjust this value for more/less chunky noise.
    const { width, height } = canvas;
    const centerX = width / 2;
    const centerY = height / 2;
    // Maximum distance from center to a corner.
    const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);
    const baseOpacity = 0.1; // Base opacity (minimum) at the edges.

    // Iterate over the canvas in grid steps.
    for (let y = 0; y < height; y += blockSize) {
      for (let x = 0; x < width; x += blockSize) {
        // Compute the center of the current block.
        const blockCenterX = x + blockSize / 2;
        const blockCenterY = y + blockSize / 2;
        const dx = blockCenterX - centerX;
        const dy = blockCenterY - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        // Compute a radial factor that is 1 at the center and 0 at maxDistance.
        const radial = 1 - Math.min(distance / maxDistance, 1);
        // Final opacity ramps from baseOpacity at the edges to 1 at the center.
        const finalOpacity = baseOpacity + (1 - baseOpacity) * radial;

        // Choose randomly between black or white for the chunky effect.
        const value = Math.random() < 0.5 ? 0 : 255;
        ctx.fillStyle = `rgba(${value}, ${value}, ${value}, ${finalOpacity})`;
        ctx.fillRect(x, y, blockSize, blockSize);
      }
    }
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        opacity: 0.2,
      }}
    />
  );
};

export default TvSnow;
