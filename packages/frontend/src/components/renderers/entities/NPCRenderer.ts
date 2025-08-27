export const drawAnimatedNPC = (rc: any, x: number, y: number, gridSize: number, time: number) => {
  const centerX = x * gridSize + gridSize / 2;
  const centerY = y * gridSize + gridSize / 2;

  // Breathing animation
  const breathScale = 1 + Math.sin(time * 0.05) * 0.1;

  // Pulsing danger aura
  const auraRadius = 14 + Math.sin(time * 0.1) * 2;
  rc.circle(centerX, centerY, auraRadius, {
    fill: '#DC143C',
    fillStyle: 'solid',
    stroke: '#8B0000',
    strokeWidth: 1,
    roughness: 2
  });

  // Main NPC body with breathing animation
  rc.circle(centerX, centerY, 8 * breathScale, {
    fill: '#DC143C',
    fillStyle: 'solid',
    stroke: '#8B0000',
    strokeWidth: 2,
    roughness: 1.5
  });

  // Angry eyes that follow movement
  const eyeOffset = Math.sin(time * 0.03) * 2;
  rc.circle(centerX - 3, centerY - 2 + eyeOffset, 1.5, {
    fill: '#FFF',
    fillStyle: 'solid'
  });
  rc.circle(centerX + 3, centerY - 2 + eyeOffset, 1.5, {
    fill: '#FFF',
    fillStyle: 'solid'
  });

  // Pupil
  rc.circle(centerX - 3, centerY - 2 + eyeOffset, 0.8, {
    fill: '#000',
    fillStyle: 'solid'
  });
  rc.circle(centerX + 3, centerY - 2 + eyeOffset, 0.8, {
    fill: '#000',
    fillStyle: 'solid'
  });

  // Spikes/horns using polygon
  for (let s = 0; s < 4; s++) {
    const angle = (s * Math.PI * 2) / 4;
    const spikeX = centerX + Math.cos(angle) * 10;
    const spikeY = centerY + Math.sin(angle) * 10;
    rc.polygon([
      [spikeX - 2, spikeY - 2],
      [spikeX + 2, spikeY - 2],
      [spikeX, spikeY + 2]
    ], {
      fill: '#8B0000',
      fillStyle: 'solid',
      roughness: 1
    });
  }
};