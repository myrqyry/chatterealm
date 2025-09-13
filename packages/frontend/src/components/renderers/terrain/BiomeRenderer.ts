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

  // Get biome-specific colors with unified styling
  const getBiomeColor = (terrainType: TerrainType): { fill: string, stroke: string } => {
    switch (terrainType) {
      case TerrainType.PLAIN:
        return { fill: '#90EE90', stroke: '#7BC97B' }; // Lighter green stroke
      case TerrainType.GRASSLAND:
        return { fill: '#84cc16', stroke: '#6BA312' }; // Darker green stroke
      case TerrainType.FOREST:
        return { fill: '#166534', stroke: '#0F4A2A' }; // Darker green stroke
      case TerrainType.MOUNTAIN:
        return { fill: '#a8a29e', stroke: '#8B8682' }; // Slightly darker gray
      case TerrainType.SNOW:
      case TerrainType.ICE:
        return { fill: '#f8fafc', stroke: '#E8ECF0' }; // Very light blue-gray
      case TerrainType.DUNES:
      case TerrainType.SAND:
        return { fill: '#f4a460', stroke: '#D4A050' }; // Golden brown
      case TerrainType.WATER:
      case TerrainType.OCEAN:
      case TerrainType.RIVER:
        return { fill: '#1e293b', stroke: '#2A3441' }; // Slightly lighter blue
      default:
        return { fill: '#90EE90', stroke: '#7BC97B' };
    }
  };

  const colors = getBiomeColor(terrainType);

  // Simple rectangle with unified styling - thinner strokes for better cohesion
  rc.rectangle(startX, startY, gridSize, gridSize, {
    fill: colors.fill,
    fillStyle: getBiomeFillStyle(terrainType),
    stroke: colors.stroke,
    strokeWidth: 1.5, // Reduced from 3.0 for more unified appearance
    roughness: roughness * 0.8, // Slightly smoother edges
    bowing: 0.8 // Reduced bowing for more uniform shapes
  });
};