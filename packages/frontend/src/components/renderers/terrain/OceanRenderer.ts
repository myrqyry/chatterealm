import { TerrainType, AnimationSettings } from 'shared/src/types/game'; // Import from shared

export const drawOcean = (rc: any, startX: number, startY: number, gridSize: number, terrainType: TerrainType, time: number, settings: AnimationSettings) => {
  const roughness = settings?.roughness || 1.5;
  const bowing = settings?.bowing || 1.2;

  switch (terrainType) {
    case TerrainType.WATER:
    case TerrainType.OCEAN:
      // Ocean/deep water with wave animation
      rc.rectangle(startX, startY, gridSize, gridSize, {
        fill: '#1e40af',
        fillStyle: 'solid',
        stroke: '#1e3a8a',
        strokeWidth: 1,
        roughness: roughness * 0.5
      });
      // Animated waves
      for (let w = 0; w < 3; w++) {
        const waveOffset = Math.sin(time * 0.08 + startX * 0.5 + w) * 2;
        rc.line(startX, startY + 5 + w * 8 + waveOffset, startX + gridSize, startY + 5 + w * 8 + waveOffset, {
          stroke: '#3b82f6',
          strokeWidth: 1,
          roughness: roughness * 0.8,
          bowing: bowing * 0.5
        });
      }
      break;

    case TerrainType.RIVER:
      // Flowing river with current animation
      rc.rectangle(startX, startY, gridSize, gridSize, {
        fill: '#3b82f6',
        fillStyle: 'solid',
        stroke: '#1d4ed8',
        strokeWidth: 1,
        roughness: roughness * 0.7
      });
      // Animated current
      const currentOffset = Math.sin(time * 0.12 + startY) * 3;
      rc.line(startX + 2, startY + 5 + currentOffset, startX + gridSize - 2, startY + 10 + currentOffset, {
        stroke: '#60a5fa',
        strokeWidth: 2,
        roughness: roughness * 0.6,
        bowing: bowing * 0.8
      });
      break;
  }
};