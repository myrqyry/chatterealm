import type { AnimationSettings } from 'shared/src/types/game';
import { TerrainType } from 'shared/src/types/game';
import { drawOcean } from './OceanRenderer';
import { drawMountain } from './MountainRenderer';
import { drawForest } from './ForestRenderer';
import { drawBiome } from './BiomeRenderer'; // For grassland, plain, etc.

export const drawAnimatedTerrainTile = (rc: any, x: number, y: number, gridSize: number, terrainType: TerrainType, time: number, settings: AnimationSettings) => {
  const startX = x * gridSize;
  const startY = y * gridSize;

  switch (terrainType) {
    case TerrainType.WATER:
    case TerrainType.OCEAN:
    case TerrainType.RIVER:
      drawOcean(rc, startX, startY, gridSize, terrainType, time, settings);
      break;
    case TerrainType.MOUNTAIN_PEAK:
    case TerrainType.MOUNTAIN:
    case TerrainType.HILLS:
      drawMountain(rc, startX, startY, gridSize, terrainType, time, settings);
      break;
    case TerrainType.DENSE_FOREST:
    case TerrainType.FOREST:
    case TerrainType.CLEARING:
      drawForest(rc, startX, startY, gridSize, terrainType, time, settings);
      break;
    case TerrainType.GRASSLAND:
    case TerrainType.PLAIN:
    case TerrainType.FLOWER_FIELD:
    case TerrainType.ROLLING_HILLS:
    case TerrainType.ROUGH_TERRAIN:
    case TerrainType.ANCIENT_RUINS:
    case TerrainType.SNOW:
    case TerrainType.ICE:
    case TerrainType.SNOWY_HILLS:
    case TerrainType.DUNES:
    case TerrainType.OASIS:
    case TerrainType.SAND:
    case TerrainType.DENSE_JUNGLE:
    case TerrainType.JUNGLE:
    case TerrainType.DEEP_WATER:
    case TerrainType.MARSH:
    case TerrainType.SWAMP:
      drawBiome(rc, startX, startY, gridSize, terrainType, time, settings);
      break;
    default:
      console.warn('Unknown terrain type:', terrainType);
  }
};