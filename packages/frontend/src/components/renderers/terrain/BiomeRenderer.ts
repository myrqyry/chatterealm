import type { AnimationSettings } from 'shared';
import { TerrainType } from 'shared';

export const drawBiome = (rc: any, startX: number, startY: number, gridSize: number, terrainType: TerrainType, time: number, settings: AnimationSettings) => {
  // Simplified Rough.js options to avoid errors
  const roughness = settings?.roughness || 1.5;
  const fillStyle = settings?.fillStyle || 'hachure';

  // Get biome-specific fill styles
  const getBiomeFillStyle = (terrainType: TerrainType): string => {
    switch (terrainType) {
      case TerrainType.SNOW:
      case TerrainType.ICE:
      case TerrainType.SNOWY_HILLS:
        return 'cross-hatch';
      case TerrainType.DUNES:
      case TerrainType.SAND:
      case TerrainType.OASIS:
        return 'hachure';
      case TerrainType.DENSE_JUNGLE:
      case TerrainType.JUNGLE:
        return 'cross-hatch';
      case TerrainType.DEEP_WATER:
      case TerrainType.MARSH:
      case TerrainType.SWAMP:
        return 'dots';
      default:
        return fillStyle;
    }
  };

  // Get biome-specific colors
  const getBiomeColor = (terrainType: TerrainType): { fill: string, stroke: string } => {
    switch (terrainType) {
      case TerrainType.PLAIN:
        return { fill: '#90EE90', stroke: '#228B22' };
      case TerrainType.GRASSLAND:
        return { fill: '#84cc16', stroke: '#65a30d' };
      case TerrainType.FOREST:
        return { fill: '#166534', stroke: '#14532d' };
      case TerrainType.MOUNTAIN:
        return { fill: '#a8a29e', stroke: '#78716c' };
      case TerrainType.SNOW:
      case TerrainType.ICE:
        return { fill: '#f8fafc', stroke: '#e2e8f0' };
      case TerrainType.DUNES:
      case TerrainType.SAND:
        return { fill: '#f4a460', stroke: '#d2691e' };
      case TerrainType.WATER:
      case TerrainType.OCEAN:
      case TerrainType.RIVER:
        return { fill: '#1e293b', stroke: '#334155' };
      default:
        return { fill: '#90EE90', stroke: '#228B22' };
    }
  };

  const colors = getBiomeColor(terrainType);

  // Simple rectangle with basic Rough.js options
  rc.rectangle(startX, startY, gridSize, gridSize, {
    fill: colors.fill,
    fillStyle: getBiomeFillStyle(terrainType),
    stroke: colors.stroke,
    strokeWidth: 1.5,
    roughness: roughness,
    bowing: 1.2
  });
};