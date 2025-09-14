import type { AnimationSettings } from 'shared';
import { TerrainType } from 'shared'; // Import from shared

export const drawOcean = (rc: any, startX: number, startY: number, gridSize: number, terrainType: TerrainType, time: number, settings: AnimationSettings) => {
  const roughness = settings?.roughness || 1.5;
  const bowing = settings?.bowing || 1.2;
  const seed = settings?.seed || 1;

  switch (terrainType) {
    case TerrainType.WATER:
    case TerrainType.OCEAN:
      // Ocean/deep water with wave animation
      rc.rectangle(startX, startY, gridSize, gridSize, {
        fill: '#1e40af',
        fillStyle: 'dots',
        stroke: '#2A4A8A', // Lighter blue stroke for better cohesion
        strokeWidth: 2, // Thicker
        roughness: roughness * 0.8, // Smoother edges
        bowing: 0.8, // More uniform shapes
        seed: seed + startX + startY * 1000
      });
      // Animated waves
      for (let w = 0; w < 3; w++) {
        const waveOffset = Math.sin(time * 0.015 + startX * 0.5 + w) * 2; // Much slower, gentler waves
        rc.line(startX, startY + 5 + w * 10 + waveOffset, startX + gridSize, startY + 5 + w * 10 + waveOffset, { // More spaced waves
          stroke: '#3b82f6',
          strokeWidth: 3, // Thicker
          roughness: roughness * 0.6,
          bowing: bowing * 0.4,
          seed: seed + startX + startY * 1000 + w * 10
        });
      }
      break;

    case TerrainType.RIVER:
      // Flowing river with current animation
      rc.rectangle(startX, startY, gridSize, gridSize, {
        fill: '#3b82f6',
        fillStyle: 'hachure',
        stroke: '#2D5AA8', // Lighter blue stroke
        strokeWidth: 2, // Thicker for cohesion
        fillWeight: 2.0, // Thicker fill lines
        roughness: roughness * 0.8,
        bowing: 0.8,
        seed: seed + startX + startY * 1000
      });
      // Animated current
      const currentOffset = Math.sin(time * 0.02 + startY) * 3; // Much slower, gentler current
      rc.line(startX + 2, startY + 5 + currentOffset, startX + gridSize - 2, startY + 12 + currentOffset, { // Longer current line
        stroke: '#60a5fa',
        strokeWidth: 4, // Thicker current
        roughness: roughness * 0.5,
        bowing: bowing * 0.6,
        seed: seed + startX + startY * 1000 + 100
      });
      break;
  }
};