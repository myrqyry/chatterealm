// Extend existing BiomeType enum with post-apocalyptic variants
export enum BiomeType {
  WATER = 'water',
  OCEAN = 'ocean',
  RIVER = 'river',
  MOUNTAIN_PEAK = 'mountain_peak',
  MOUNTAIN = 'mountain',
  HILLS = 'hills',
  SNOW = 'snow',
  ICE = 'ice',
  SNOWY_HILLS = 'snowy_hills',
  DUNES = 'dunes',
  OASIS = 'oasis',
  SAND = 'sand',
  DENSE_JUNGLE = 'dense_jungle',
  JUNGLE = 'jungle',
  DEEP_WATER = 'deep_water',
  MARSH = 'marsh',
  SWAMP = 'swamp',
  DENSE_FOREST = 'dense_forest',
  FOREST = 'forest',
  CLEARING = 'clearing',
  ROLLING_HILLS = 'rolling_hills',
  FLOWER_FIELD = 'flower_field',
  GRASSLAND = 'grassland',
  DESERT = 'desert',
  ROUGH_TERRAIN = 'rough_terrain',
  ANCIENT_RUINS = 'ancient_ruins',
  PLAIN = 'plain',

  // Add new post-apocalyptic biomes
  WASTELAND = 'wasteland',
  TOXIC_ZONE = 'toxic_zone',
  RADIATION_FIELD = 'radiation_field',
  CRYSTAL_GARDEN = 'crystal_garden',
  URBAN_RUINS = 'urban_ruins',
  INFECTED_NORMAL = 'infected_normal',
  INFECTED_HEAVY = 'infected_heavy',
  INFECTED_CORE = 'infected_core'
}

// Create comprehensive biome configuration
export interface BiomeRenderConfig {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    border: string;
  };
  roughnessBase: number;
  bowingBase: number;
  fillPattern: 'solid' | 'hachure' | 'cross-hatch' | 'zigzag-line' | 'dots';
  hachureAngle: number;
  hachureGap: number;
  strokeWidth: number;
  textureOverlay?: {
    type: 'trees' | 'rocks' | 'crystals' | 'ruins' | 'corruption';
    density: number;
    size: number;
  };
  animationProperties?: {
    breathingIntensity: number;
    colorPulse: number;
    roughnessVariation: number;
  };
}