import type { AnimationSettings } from 'shared';
import { BiomeType } from 'shared';

export const drawBiome = (rc: any, startX: number, startY: number, gridSize: number, terrainType: BiomeType, time: number, settings: AnimationSettings) => {
  // Simplified Rough.js options to avoid errors
  const roughness = settings?.roughness || 1.5;
  const fillStyle = settings?.fillStyle || 'hachure';

  // Get biome-specific fill styles
  const getBiomeFillStyle = (terrainType: BiomeType): string => {
    switch (terrainType) {
      case BiomeType.SNOW:
      case BiomeType.ICE:
      case BiomeType.SNOWY_HILLS:
        return 'cross-hatch';
      case BiomeType.DUNES:
      case BiomeType.SAND:
      case BiomeType.OASIS:
        return 'hachure';
      case BiomeType.DENSE_JUNGLE:
      case BiomeType.JUNGLE:
        return 'cross-hatch';
      case BiomeType.DEEP_WATER:
      case BiomeType.MARSH:
      case BiomeType.SWAMP:
        return 'dots';
      default:
        return fillStyle;
    }
  };

  // Get biome-specific colors with unified styling
  const getBiomeColor = (terrainType: BiomeType): { fill: string, stroke: string } => {
    switch (terrainType) {
      case BiomeType.PLAIN:
        return { fill: '#90EE90', stroke: '#7BC97B' }; // Lighter green stroke
      case BiomeType.GRASSLAND:
        return { fill: '#84cc16', stroke: '#6BA312' }; // Darker green stroke
      case BiomeType.FOREST:
        return { fill: '#166534', stroke: '#0F4A2A' }; // Darker green stroke
      case BiomeType.MOUNTAIN:
        return { fill: '#a8a29e', stroke: '#8B8682' }; // Slightly darker gray
      case BiomeType.SNOW:
      case BiomeType.ICE:
        return { fill: '#f8fafc', stroke: '#E8ECF0' }; // Very light blue-gray
      case BiomeType.DUNES:
      case BiomeType.SAND:
        return { fill: '#f4a460', stroke: '#D4A050' }; // Golden brown
      case BiomeType.WATER:
      case BiomeType.OCEAN:
      case BiomeType.RIVER:
        return { fill: '#1e293b', stroke: '#2A3441' }; // Slightly lighter blue
      default:
        return { fill: '#90EE90', stroke: '#7BC97B' };
    }
  };

  const colors = getBiomeColor(terrainType);

  // Simple rectangle with unified styling - thicker strokes for better visibility
  rc.rectangle(startX, startY, gridSize, gridSize, {
    fill: colors.fill,
    fillStyle: getBiomeFillStyle(terrainType),
    stroke: colors.stroke,
    strokeWidth: 2, // Thicker for better visibility
    fillWeight: 2.0, // Thicker fill lines
    roughness: roughness * 0.8, // Slightly smoother edges
    bowing: 0.8 // Reduced bowing for more uniform shapes
  });
};