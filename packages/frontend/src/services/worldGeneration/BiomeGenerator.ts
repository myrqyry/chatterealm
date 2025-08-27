import { perlinNoise } from './NoiseGenerator';

// Biome generation - create distinct regions with much less ocean
export const getBiome = (x: number, y: number) => {
  const continentNoise = perlinNoise(x, y, 2) * 0.9 + 0.05;
  const temperature = perlinNoise(x * 0.3, y * 0.3, 3) * 0.9 + 0.05;
  const humidity = perlinNoise(x * 0.4, y * 0.4, 4) * 0.9 + 0.05;

  // Continental plates - significantly reduced ocean for maximum land
  if (continentNoise > 0.85) return 'mountain_range';
  if (continentNoise < 0.08) return 'ocean'; // Reduced to 8% ocean coverage

  // Climate-based biomes with better distribution
  if (temperature < 0.2) return 'tundra';
  if (temperature > 0.8 && humidity > 0.7) return 'jungle';
  if (temperature > 0.7 && humidity < 0.3) return 'desert';
  if (humidity > 0.8) return 'swamp';
  if (temperature > 0.6) return 'grassland';

  return 'temperate_forest';
};