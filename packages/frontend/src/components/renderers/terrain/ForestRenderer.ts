import type { AnimationSettings } from 'shared';
import { TerrainType } from 'shared';

export const drawForest = (rc: any, startX: number, startY: number, gridSize: number, terrainType: TerrainType, time: number, settings: AnimationSettings) => {
  const roughness = settings?.roughness || 1.5;
  const treeSwaySpeed = settings?.treeSwaySpeed || 0.03;

  switch (terrainType) {
    case TerrainType.DENSE_FOREST:
      // Very thick forest
      rc.rectangle(startX, startY, gridSize, gridSize, {
        fill: '#14532d',
        fillStyle: 'solid',
        stroke: '#166534',
        strokeWidth: 1,
        roughness: roughness * 2.2
      });
      // Dense trees
      for (let t = 0; t < 4; t++) {
        const treeX = startX + 3 + (t % 2) * 10;
        const treeY = startY + 4 + Math.floor(t / 2) * 8;
        const swayOffset = Math.sin(time * treeSwaySpeed + startX + t) * 2;
        rc.line(treeX + swayOffset, treeY + 8, treeX + swayOffset, treeY, {
          stroke: '#92400e',
          strokeWidth: 2,
          roughness: roughness * 1.2
        });
        rc.circle(treeX + swayOffset, treeY - 2, 4, {
          fill: '#166534',
          fillStyle: 'solid',
          roughness: roughness * 1.5
        });
      }
      break;

    case TerrainType.FOREST:
      // Regular forest
      rc.rectangle(startX, startY, gridSize, gridSize, {
        fill: '#166534',
        fillStyle: 'solid',
        stroke: '#15803d',
        strokeWidth: 1,
        roughness: roughness * 1.7
      });
      // Forest trees
      for (let t = 0; t < 3; t++) {
        const treeX = startX + 4 + t * 6;
        const treeY = startY + 6;
        const swayOffset = Math.sin(time * treeSwaySpeed + startX + t) * 1.5;
        rc.line(treeX + swayOffset, treeY + 8, treeX + swayOffset, treeY, {
          stroke: '#a16207',
          strokeWidth: 2,
          roughness: roughness * 1.0
        });
        rc.circle(treeX + swayOffset, treeY - 2, 3.5, {
          fill: '#22c55e',
          fillStyle: 'solid',
          roughness: roughness * 1.3
        });
      }
      break;

    case TerrainType.CLEARING:
      // Forest clearing
      rc.rectangle(startX, startY, gridSize, gridSize, {
        fill: '#84cc16',
        fillStyle: 'solid',
        stroke: '#65a30d',
        strokeWidth: 1,
        roughness: roughness * 0.8
      });
      // Small campfire
      rc.circle(startX + 8, startY + 10, 2, {
        fill: '#f59e0b',
        fillStyle: 'solid',
        roughness: roughness * 0.5
      });
      break;
  }
};