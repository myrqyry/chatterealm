import { BiomeRenderConfig, BiomeType } from '../types/biomes';

export const BIOME_RENDER_CONFIGS: Record<BiomeType, BiomeRenderConfig> = {
  [BiomeType.GRASSLAND]: {
    name: 'Grassland',
    colors: { primary: '#90EE90', secondary: '#7CFC00', border: '#228B22' },
    roughnessBase: 1.2,
    bowingBase: 0.8,
    fillPattern: 'zigzag-line',
    hachureAngle: 45,
    hachureGap: 4,
    strokeWidth: 1.5,
    textureOverlay: { type: 'trees', density: 0.05, size: 8 },
  },
  [BiomeType.FOREST]: {
    name: 'Forest',
    colors: { primary: '#228B22', secondary: '#006400', border: '#000' },
    roughnessBase: 1.5,
    bowingBase: 1,
    fillPattern: 'hachure',
    hachureAngle: -45,
    hachureGap: 5,
    strokeWidth: 2,
    textureOverlay: { type: 'trees', density: 0.2, size: 10 },
  },
  [BiomeType.DESERT]: {
    name: 'Desert',
    colors: { primary: '#F4A460', secondary: '#D2B48C', border: '#8B4513' },
    roughnessBase: 0.8,
    bowingBase: 0.2,
    fillPattern: 'dots',
    hachureAngle: 0,
    hachureGap: 10,
    strokeWidth: 1,
  },
  [BiomeType.WASTELAND]: {
    name: 'Wasteland',
    colors: { primary: '#A9A9A9', secondary: '#808080', border: '#696969' },
    roughnessBase: 2.5,
    bowingBase: 2,
    fillPattern: 'cross-hatch',
    hachureAngle: 45,
    hachureGap: 8,
    strokeWidth: 2,
    textureOverlay: { type: 'rocks', density: 0.1, size: 6 },
  },
  [BiomeType.TOXIC_ZONE]: {
    name: 'Toxic Zone',
    colors: { primary: '#7FFF00', secondary: '#ADFF2F', border: '#32CD32' },
    roughnessBase: 3,
    bowingBase: 2.5,
    fillPattern: 'solid',
    hachureAngle: 0,
    hachureGap: 0,
    strokeWidth: 1,
    animationProperties: { breathingIntensity: 0.3, colorPulse: 0.5, roughnessVariation: 1.5 },
  },
  [BiomeType.RADIATION_FIELD]: {
    name: 'Radiation Field',
    colors: { primary: '#FFFF00', secondary: '#FFD700', border: '#DAA520' },
    roughnessBase: 1,
    bowingBase: 3,
    fillPattern: 'zigzag-line',
    hachureAngle: 0,
    hachureGap: 6,
    strokeWidth: 2,
    animationProperties: { breathingIntensity: 0.5, colorPulse: 0.8, roughnessVariation: 2 },
  },
  [BiomeType.CRYSTAL_GARDEN]: {
    name: 'Crystal Garden',
    colors: { primary: '#AFEEEE', secondary: '#40E0D0', border: '#00CED1' },
    roughnessBase: 0.5,
    bowingBase: 0.5,
    fillPattern: 'hachure',
    hachureAngle: 60,
    hachureGap: 3,
    strokeWidth: 1,
    textureOverlay: { type: 'crystals', density: 0.15, size: 12 },
    animationProperties: { breathingIntensity: 0.1, colorPulse: 0.2, roughnessVariation: 0.5 },
  },
  [BiomeType.URBAN_RUINS]: {
    name: 'Urban Ruins',
    colors: { primary: '#696969', secondary: '#808080', border: '#000' },
    roughnessBase: 2,
    bowingBase: 0.2,
    fillPattern: 'cross-hatch',
    hachureAngle: 90,
    hachureGap: 10,
    strokeWidth: 2.5,
    textureOverlay: { type: 'ruins', density: 0.08, size: 15 },
  },
  [BiomeType.INFECTED_NORMAL]: {
    name: 'Infected Territory',
    colors: { primary: '#E6E6FA', secondary: '#D8BFD8', border: '#8A2BE2' },
    roughnessBase: 3.5,
    bowingBase: 4,
    fillPattern: 'hachure',
    hachureAngle: 15,
    hachureGap: 7,
    strokeWidth: 2,
    textureOverlay: { type: 'corruption', density: 0.1, size: 5 },
    animationProperties: { breathingIntensity: 0.7, colorPulse: 0.3, roughnessVariation: 2.5 },
  },
  [BiomeType.INFECTED_HEAVY]: {
    name: 'Heavily Infected Territory',
    colors: { primary: '#DDA0DD', secondary: '#DA70D6', border: '#BA55D3' },
    roughnessBase: 4.5,
    bowingBase: 5,
    fillPattern: 'cross-hatch',
    hachureAngle: 30,
    hachureGap: 6,
    strokeWidth: 2.5,
    textureOverlay: { type: 'corruption', density: 0.25, size: 8 },
    animationProperties: { breathingIntensity: 1, colorPulse: 0.5, roughnessVariation: 3.5 },
  },
  [BiomeType.INFECTED_CORE]: {
    name: 'Infection Core',
    colors: { primary: '#9932CC', secondary: '#8B008B', border: '#4B0082' },
    roughnessBase: 6,
    bowingBase: 7,
    fillPattern: 'solid',
    hachureAngle: 0,
    hachureGap: 0,
    strokeWidth: 3,
    textureOverlay: { type: 'corruption', density: 0.5, size: 12 },
    animationProperties: { breathingIntensity: 1.5, colorPulse: 1, roughnessVariation: 5 },
  },
  // Adding configs for other existing biomes for completeness
  [BiomeType.WATER]: {
    name: 'Water',
    colors: { primary: '#1E90FF', secondary: '#4169E1', border: '#00008B' },
    roughnessBase: 0.5, bowingBase: 2, fillPattern: 'solid', hachureAngle: 0, hachureGap: 0, strokeWidth: 1
  },
  [BiomeType.OCEAN]: {
    name: 'Ocean',
    colors: { primary: '#0000CD', secondary: '#000080', border: '#000000' },
    roughnessBase: 1, bowingBase: 3, fillPattern: 'solid', hachureAngle: 0, hachureGap: 0, strokeWidth: 1
  },
  [BiomeType.RIVER]: {
    name: 'River',
    colors: { primary: '#87CEEB', secondary: '#00BFFF', border: '#1E90FF' },
    roughnessBase: 0.2, bowingBase: 4, fillPattern: 'solid', hachureAngle: 0, hachureGap: 0, strokeWidth: 1
  },
  [BiomeType.MOUNTAIN_PEAK]: {
    name: 'Mountain Peak',
    colors: { primary: '#DCDCDC', secondary: '#FFFFFF', border: '#808080' },
    roughnessBase: 4, bowingBase: 1, fillPattern: 'hachure', hachureAngle: 45, hachureGap: 10, strokeWidth: 3
  },
  [BiomeType.MOUNTAIN]: {
    name: 'Mountain',
    colors: { primary: '#A9A9A9', secondary: '#808080', border: '#696969' },
    roughnessBase: 3, bowingBase: 1, fillPattern: 'cross-hatch', hachureAngle: 45, hachureGap: 12, strokeWidth: 2.5
  },
  [BiomeType.HILLS]: {
    name: 'Hills',
    colors: { primary: '#BDB76B', secondary: '#F0E68C', border: '#8B4513' },
    roughnessBase: 1.5, bowingBase: 0.5, fillPattern: 'hachure', hachureAngle: 20, hachureGap: 6, strokeWidth: 1.5
  },
  [BiomeType.SNOW]: {
    name: 'Snow',
    colors: { primary: '#FFFAFA', secondary: '#F5F5F5', border: '#D3D3D3' },
    roughnessBase: 0.8, bowingBase: 0.8, fillPattern: 'solid', hachureAngle: 0, hachureGap: 0, strokeWidth: 1
  },
  [BiomeType.ICE]: {
    name: 'Ice',
    colors: { primary: '#F0FFFF', secondary: '#E0FFFF', border: '#AFEEEE' },
    roughnessBase: 0.3, bowingBase: 0.2, fillPattern: 'cross-hatch', hachureAngle: 45, hachureGap: 15, strokeWidth: 0.8
  },
  [BiomeType.SNOWY_HILLS]: {
    name: 'Snowy Hills',
    colors: { primary: '#E6E6FA', secondary: '#FFFFFF', border: '#B0C4DE' },
    roughnessBase: 1.8, bowingBase: 1, fillPattern: 'hachure', hachureAngle: -20, hachureGap: 8, strokeWidth: 1.5
  },
  [BiomeType.DUNES]: {
    name: 'Dunes',
    colors: { primary: '#FFE4B5', secondary: '#FFDAB9', border: '#CD853F' },
    roughnessBase: 1, bowingBase: 1.5, fillPattern: 'zigzag-line', hachureAngle: 0, hachureGap: 8, strokeWidth: 1.2
  },
  [BiomeType.OASIS]: {
    name: 'Oasis',
    colors: { primary: '#20B2AA', secondary: '#3CB371', border: '#2E8B57' },
    roughnessBase: 0.7, bowingBase: 1, fillPattern: 'solid', hachureAngle: 0, hachureGap: 0, strokeWidth: 1,
    textureOverlay: { type: 'trees', density: 0.3, size: 7 }
  },
  [BiomeType.SAND]: {
    name: 'Sand',
    colors: { primary: '#F5DEB3', secondary: '#DEB887', border: '#D2B48C' },
    roughnessBase: 0.5, bowingBase: 0.5, fillPattern: 'dots', hachureAngle: 0, hachureGap: 15, strokeWidth: 1
  },
  [BiomeType.DENSE_JUNGLE]: {
    name: 'Dense Jungle',
    colors: { primary: '#008000', secondary: '#006400', border: '#2F4F4F' },
    roughnessBase: 2.2, bowingBase: 1.8, fillPattern: 'hachure', hachureAngle: -55, hachureGap: 4, strokeWidth: 2.5,
    textureOverlay: { type: 'trees', density: 0.4, size: 12 }
  },
  [BiomeType.JUNGLE]: {
    name: 'Jungle',
    colors: { primary: '#2E8B57', secondary: '#3CB371', border: '#6B8E23' },
    roughnessBase: 1.8, bowingBase: 1.5, fillPattern: 'hachure', hachureAngle: -50, hachureGap: 5, strokeWidth: 2,
    textureOverlay: { type: 'trees', density: 0.25, size: 10 }
  },
  [BiomeType.DEEP_WATER]: {
    name: 'Deep Water',
    colors: { primary: '#000080', secondary: '#191970', border: '#000000' },
    roughnessBase: 1.2, bowingBase: 3.5, fillPattern: 'solid', hachureAngle: 0, hachureGap: 0, strokeWidth: 1
  },
  [BiomeType.MARSH]: {
    name: 'Marsh',
    colors: { primary: '#556B2F', secondary: '#6B8E23', border: '#808000' },
    roughnessBase: 1.3, bowingBase: 2, fillPattern: 'zigzag-line', hachureAngle: 10, hachureGap: 7, strokeWidth: 1.5
  },
  [BiomeType.SWAMP]: {
    name: 'Swamp',
    colors: { primary: '#808000', secondary: '#556B2F', border: '#2F4F4F' },
    roughnessBase: 1.6, bowingBase: 2.5, fillPattern: 'cross-hatch', hachureAngle: 80, hachureGap: 9, strokeWidth: 1.8
  },
  [BiomeType.DENSE_FOREST]: {
    name: 'Dense Forest',
    colors: { primary: '#006400', secondary: '#004d00', border: '#000' },
    roughnessBase: 2, bowingBase: 1.2, fillPattern: 'hachure', hachureAngle: -45, hachureGap: 4, strokeWidth: 2.2,
    textureOverlay: { type: 'trees', density: 0.35, size: 11 }
  },
  [BiomeType.CLEARING]: {
    name: 'Clearing',
    colors: { primary: '#D2B48C', secondary: '#DEB887', border: '#8B4513' },
    roughnessBase: 0.7, bowingBase: 0.4, fillPattern: 'solid', hachureAngle: 0, hachureGap: 0, strokeWidth: 1
  },
  [BiomeType.ROLLING_HILLS]: {
    name: 'Rolling Hills',
    colors: { primary: '#B8860B', secondary: '#DAA520', border: '#808000' },
    roughnessBase: 1.4, bowingBase: 0.8, fillPattern: 'hachure', hachureAngle: 10, hachureGap: 7, strokeWidth: 1.3
  },
  [BiomeType.FLOWER_FIELD]: {
    name: 'Flower Field',
    colors: { primary: '#FFB6C1', secondary: '#FF69B4', border: '#C71585' },
    roughnessBase: 0.6, bowingBase: 0.6, fillPattern: 'zigzag-line', hachureAngle: 45, hachureGap: 5, strokeWidth: 1,
    textureOverlay: { type: 'trees', density: 0.02, size: 5 }
  },
  [BiomeType.ROUGH_TERRAIN]: {
    name: 'Rough Terrain',
    colors: { primary: '#A0522D', secondary: '#8B4513', border: '#5A2D0C' },
    roughnessBase: 2.8, bowingBase: 1.5, fillPattern: 'cross-hatch', hachureAngle: 45, hachureGap: 8, strokeWidth: 2.2,
    textureOverlay: { type: 'rocks', density: 0.15, size: 7 }
  },
  [BiomeType.ANCIENT_RUINS]: {
    name: 'Ancient Ruins',
    colors: { primary: '#778899', secondary: '#708090', border: '#2F4F4F' },
    roughnessBase: 2.1, bowingBase: 0.3, fillPattern: 'cross-hatch', hachureAngle: 90, hachureGap: 12, strokeWidth: 2.5,
    textureOverlay: { type: 'ruins', density: 0.12, size: 18 }
  },
  [BiomeType.PLAIN]: {
    name: 'Plain',
    colors: { primary: '#98FB98', secondary: '#90EE90', border: '#3CB371' },
    roughnessBase: 1, bowingBase: 0.5, fillPattern: 'solid', hachureAngle: 0, hachureGap: 0, strokeWidth: 1
  }
};