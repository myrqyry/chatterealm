import type { AnimationSettings } from 'shared/src/types/game';
import { TerrainType } from 'shared/src/types/game';

export const drawMountain = (rc: any, startX: number, startY: number, gridSize: number, terrainType: TerrainType, time: number, settings: AnimationSettings) => {
  const roughness = settings?.roughness || 1.5;

  switch (terrainType) {
    case TerrainType.MOUNTAIN_PEAK:
      // Snow-capped mountain peaks
      rc.rectangle(startX, startY, gridSize, gridSize, {
        fill: '#64748b',
        fillStyle: 'solid',
        stroke: '#475569',
        strokeWidth: 1,
        roughness: roughness * 1.5
      });
      // Peak details
      rc.polygon([
        [startX + 2, startY + 15],
        [startX + 10, startY + 2],
        [startX + 18, startY + 15]
      ], {
        fill: '#f1f5f9',
        fillStyle: 'solid',
        roughness: roughness * 1.2
      });
      break;

    case TerrainType.MOUNTAIN:
      // Rocky mountains with shadow
      rc.rectangle(startX, startY, gridSize, gridSize, {
        fill: '#78716c',
        fillStyle: 'solid',
        stroke: '#57534e',
        strokeWidth: 1,
        roughness: roughness * 1.8
      });
      // Mountain silhouette
      rc.polygon([
        [startX, startY + 18],
        [startX + 8, startY + 5],
        [startX + 16, startY + 12],
        [startX + gridSize, startY + 18]
      ], {
        fill: '#374151',
        fillStyle: 'solid',
        roughness: roughness * 1.3
      });
      break;

    case TerrainType.HILLS:
      // Rolling hills
      rc.rectangle(startX, startY, gridSize, gridSize, {
        fill: '#a3a3a3',
        fillStyle: 'solid',
        stroke: '#737373',
        strokeWidth: 1,
        roughness: roughness * 1.2
      });
      // Hill contours
      rc.ellipse(startX + 8, startY + 12, 12, 6, {
        fill: '#d4d4d8',
        fillStyle: 'solid',
        roughness: roughness * 0.8
      });
      break;
  }
};