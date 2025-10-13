import type { AnimationSettings } from 'shared';
import { BiomeType } from 'shared';

export const drawForest = (rc: any, startX: number, startY: number, gridSize: number, terrainType: BiomeType, time: number, settings: AnimationSettings) => {
  const roughness = settings?.roughness || 1.5;
  const fillStyle = settings?.fillStyle || 'hachure';
  const treeSwaySpeed = settings?.treeSwaySpeed || 0.025; // Slightly faster tree swaying

  switch (terrainType) {
    case BiomeType.DENSE_FOREST:
      // Very thick forest
      rc.rectangle(startX, startY, gridSize, gridSize, {
        fill: '#14532d',
        fillStyle: 'cross-hatch',
        stroke: '#1A5A35', // Lighter green stroke
        strokeWidth: 2, // Thicker for cohesion
        fillWeight: 2.0, // Thicker fill lines
        roughness: roughness * 0.8, // Smoother
        bowing: 0.8 // More uniform
      });
      // Dense trees
      for (let t = 0; t < 4; t++) {
        const treeX = startX + 3 + (t % 2) * 10;
        const treeY = startY + 4 + Math.floor(t / 2) * 8;
        const swayOffset = Math.sin(time * treeSwaySpeed + startX + t) * 2;
        rc.line(treeX + swayOffset, treeY + 8, treeX + swayOffset, treeY, {
          stroke: '#92400e',
          strokeWidth: 3, // Thicker trunks
          roughness: roughness * 0.9
        });
        rc.circle(treeX + swayOffset, treeY - 2, 4, {
          fill: '#166534',
          fillStyle: 'hachure',
          roughness: roughness * 1.1
        });
      }
      break;

    case BiomeType.FOREST:
      // Regular forest
      rc.rectangle(startX, startY, gridSize, gridSize, {
        fill: '#166534',
        fillStyle: 'hachure',
        stroke: '#1B703D', // Lighter green stroke
        strokeWidth: 2, // Thicker for cohesion
        fillWeight: 2.0, // Thicker fill lines
        roughness: roughness * 0.8,
        bowing: 0.8
      });
      // Forest trees
      for (let t = 0; t < 3; t++) {
        const treeX = startX + 4 + t * 6;
        const treeY = startY + 6;
        const swayOffset = Math.sin(time * treeSwaySpeed + startX + t) * 1.5;
        rc.line(treeX + swayOffset, treeY + 8, treeX + swayOffset, treeY, {
          stroke: '#a16207',
          strokeWidth: 3, // Thicker trunks
          roughness: roughness * 0.8
        });
        rc.circle(treeX + swayOffset, treeY - 2, 3.5, {
          fill: '#22c55e',
          fillStyle: 'hachure',
          roughness: roughness * 1.0
        });
      }
      break;

    case BiomeType.CLEARING:
      // Forest clearing
      rc.rectangle(startX, startY, gridSize, gridSize, {
        fill: '#84cc16',
        fillStyle: 'hachure',
        stroke: '#7AB312', // Lighter green stroke
        strokeWidth: 2, // Thicker for cohesion
        fillWeight: 2.0, // Thicker fill lines
        roughness: roughness * 0.8,
        bowing: 0.8
      });
      // Small campfire
      rc.circle(startX + 8, startY + 10, 2, {
        fill: '#f59e0b',
        fillStyle: 'solid',
        roughness: roughness * 0.4
      });
      break;
  }
};