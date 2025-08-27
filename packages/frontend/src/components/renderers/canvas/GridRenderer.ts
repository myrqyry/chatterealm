export const drawAnimatedGridLines = (rc: any, numTilesX: number, numTilesY: number, gridSize: number, time: number) => {
  const pulseIntensity = 0.5 + Math.sin(time * 0.05) * 0.3;

  // Draw grid lines with subtle animation
  for (let x = 0; x <= numTilesX; x++) {
    rc.line(x * gridSize, 0, x * gridSize, numTilesY * gridSize, {
      stroke: `rgba(255, 255, 255, ${0.1 + pulseIntensity * 0.1})`,
      strokeWidth: 1
    });
  }
  for (let y = 0; y <= numTilesY; y++) {
    rc.line(0, y * gridSize, numTilesX * gridSize, y * gridSize, {
      stroke: `rgba(255, 255, 255, ${0.1 + pulseIntensity * 0.1})`,
      strokeWidth: 1
    });
  }
};