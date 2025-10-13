import type { AnimationSettings } from 'shared';
import { BiomeType } from 'shared';
import { drawOcean } from './OceanRenderer';
import { drawMountain } from './MountainRenderer';
import { drawForest } from './ForestRenderer';
import { drawBiome } from './BiomeRenderer'; // For grassland, plain, etc.

export const drawAnimatedTerrainTile = (rc: any, x: number, y: number, gridSize: number, terrainType: BiomeType, time: number, settings: AnimationSettings) => {
  const startX = x * gridSize;
  const startY = y * gridSize;

  switch (terrainType) {
    case BiomeType.WATER:
    case BiomeType.OCEAN:
    case BiomeType.RIVER:
      drawOcean(rc, startX, startY, gridSize, terrainType, time, settings);
      break;
    case BiomeType.MOUNTAIN_PEAK:
    case BiomeType.MOUNTAIN:
    case BiomeType.HILLS:
      drawMountain(rc, startX, startY, gridSize, terrainType, time, settings);
      break;
    case BiomeType.DENSE_FOREST:
    case BiomeType.FOREST:
    case BiomeType.CLEARING:
      drawForest(rc, startX, startY, gridSize, terrainType, time, settings);
      break;
    case BiomeType.GRASSLAND:
    case BiomeType.PLAIN:
    case BiomeType.FLOWER_FIELD:
    case BiomeType.ROLLING_HILLS:
    case BiomeType.ROUGH_TERRAIN:
    case BiomeType.ANCIENT_RUINS:
    case BiomeType.SNOW:
    case BiomeType.ICE:
    case BiomeType.SNOWY_HILLS:
    case BiomeType.DUNES:
    case BiomeType.OASIS:
    case BiomeType.SAND:
    case BiomeType.DENSE_JUNGLE:
    case BiomeType.JUNGLE:
    case BiomeType.DEEP_WATER:
    case BiomeType.MARSH:
    case BiomeType.SWAMP:
      drawBiome(rc, startX, startY, gridSize, terrainType, time, settings);
      break;
    default:
      console.warn('Unknown terrain type:', terrainType);
  }
};