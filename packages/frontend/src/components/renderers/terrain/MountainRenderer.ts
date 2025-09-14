import type { AnimationSettings } from 'shared';
import { TerrainType } from 'shared';

export const drawMountain = (rc: any, startX: number, startY: number, gridSize: number, terrainType: TerrainType, time: number, settings: AnimationSettings) => {
  const roughness = settings?.roughness || 1.5;
  const seed = settings?.seed || 1;

  switch (terrainType) {
    case TerrainType.MOUNTAIN_PEAK:
      // Snow-capped mountain peaks
      rc.rectangle(startX, startY, gridSize, gridSize, {
        fill: '#64748b',
        fillStyle: 'cross-hatch',
        stroke: '#5A6B7D', // Lighter slate stroke
        strokeWidth: 2, // Thicker for cohesion
        fillWeight: 2.0, // Thicker fill lines
        roughness: roughness * 0.8, // Smoother
        bowing: 0.8, // More uniform
        seed: seed + startX + startY * 1000
      });
      // Peak details
      rc.polygon([
        [startX + 2, startY + 15],
        [startX + 10, startY + 2],
        [startX + 18, startY + 15]
      ], {
        fill: '#f1f5f9',
        fillStyle: 'hachure',
        fillWeight: 2.0, // Thicker fill lines
        roughness: roughness * 0.9,
        seed: seed + startX + startY * 1000 + 1
      });
      break;

    case TerrainType.MOUNTAIN:
      // Rocky mountains with shadow
      rc.rectangle(startX, startY, gridSize, gridSize, {
        fill: '#78716c',
        fillStyle: 'cross-hatch',
        stroke: '#6B6763', // Lighter stone stroke
        strokeWidth: 2, // Thicker for cohesion
        fillWeight: 2.0, // Thicker fill lines
        roughness: roughness * 0.8,
        bowing: 0.8,
        seed: seed + startX + startY * 1000
      });
      // Mountain silhouette
      rc.polygon([
        [startX, startY + 18],
        [startX + 8, startY + 5],
        [startX + 16, startY + 12],
        [startX + gridSize, startY + 18]
      ], {
        fill: '#374151',
        fillStyle: 'hachure',
        fillWeight: 2.0, // Thicker fill lines
        roughness: roughness * 1.0,
        seed: seed + startX + startY * 1000 + 2
      });
      break;

    case TerrainType.HILLS:
      // Rolling hills
      rc.rectangle(startX, startY, gridSize, gridSize, {
        fill: '#a3a3a3',
        fillStyle: 'hachure',
        stroke: '#858585', // Lighter gray stroke
        strokeWidth: 2, // Thicker for cohesion
        fillWeight: 2.0, // Thicker fill lines
        roughness: roughness * 0.8,
        bowing: 0.8,
        seed: seed + startX + startY * 1000
      });
      // Hill contours
      rc.ellipse(startX + 8, startY + 12, 12, 6, {
        fill: '#d4d4d8',
        fillStyle: 'hachure',
        fillWeight: 2.0, // Thicker fill lines
        roughness: roughness * 0.6,
        seed: seed + startX + startY * 1000 + 3
      });
      break;
  }
};