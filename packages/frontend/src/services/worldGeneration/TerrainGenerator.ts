import { perlinNoise } from './NoiseGenerator';
import { getBiome } from './BiomeGenerator';
import { WORLD_WIDTH, WORLD_HEIGHT } from './WorldTypes';
import type { GameWorld, Terrain } from '../../../../shared/src/types/game';

export const generateTerrain = (x: number, y: number): Terrain => {
  const biome = getBiome(x, y);
  const elevation = perlinNoise(x * 0.8, y * 0.8, 1);
  const roughness = perlinNoise(x * 1.5, y * 1.5, 2);
  const moisture = perlinNoise(x * 0.6, y * 0.6, 3);

  let terrainType = 'plain';
  let movementCost = 1;
  let defenseBonus = 0;
  let visibilityModifier = 1;
  let resources: string[] = [];
  let specialFeatures: string[] = [];

  // Biome-specific terrain generation
  switch (biome) {
    case 'ocean':
      terrainType = 'water';
      movementCost = 999; // Impassable
      visibilityModifier = 0.9;
      break;

    case 'mountain_range':
      if (elevation > 0.8) {
        terrainType = 'mountain_peak';
        movementCost = 4;
        defenseBonus = 3;
        visibilityModifier = 1.2;
        resources = ['ore', 'gems'];
      } else if (elevation > 0.6) {
        terrainType = 'mountain';
        movementCost = 3;
        defenseBonus = 2;
        visibilityModifier = 1.1;
        resources = ['stone'];
      } else {
        terrainType = 'hills';
        movementCost = 1.5;
        defenseBonus = 1;
        resources = ['stone'];
      }
      break;

    case 'tundra':
      if (roughness > 0.7) {
        terrainType = 'ice';
        movementCost = 2;
        visibilityModifier = 0.9;
      } else if (elevation > 0.5) {
        terrainType = 'snowy_hills';
        movementCost = 1.8;
        defenseBonus = 1;
      } else {
        terrainType = 'snow';
        movementCost = 1.2;
        resources = ['fur'];
      }
      break;

    case 'desert':
      if (roughness > 0.8) {
        terrainType = 'dunes';
        movementCost = 2;
        visibilityModifier = 0.8;
        resources = ['sand'];
      } else if (perlinNoise(x * 2, y * 2, 5) > 0.85) {
        terrainType = 'oasis';
        movementCost = 0.8;
        visibilityModifier = 1.0;
        resources = ['water'];
        specialFeatures = ['healing'];
      } else {
        terrainType = 'sand';
        movementCost = 1.3;
        resources = ['sand'];
      }
      break;

    case 'jungle':
      if (roughness > 0.75) {
        terrainType = 'dense_jungle';
        movementCost = 2.5;
        defenseBonus = 2;
        visibilityModifier = 0.5;
        resources = ['exotic_wood', 'rare_herbs'];
      } else {
        terrainType = 'jungle';
        movementCost = 1.8;
        defenseBonus = 1;
        visibilityModifier = 0.7;
        resources = ['wood', 'herbs'];
      }
      break;

    case 'swamp':
      if (moisture > 0.8) {
        terrainType = 'deep_water';
        movementCost = 999;
        visibilityModifier = 0.8;
      } else if (roughness > 0.6) {
        terrainType = 'marsh';
        movementCost = 2;
        defenseBonus = 1;
        visibilityModifier = 0.8;
        resources = ['reeds'];
      } else {
        terrainType = 'swamp';
        movementCost = 1.5;
        resources = ['reeds', 'herbs'];
      }
      break;

    case 'temperate_forest':
      if (roughness > 0.7) {
        terrainType = 'dense_forest';
        movementCost = 2;
        defenseBonus = 2;
        visibilityModifier = 0.6;
        resources = ['wood', 'mushrooms'];
      } else if (perlinNoise(x * 1.5, y * 1.5, 6) > 0.8) {
        terrainType = 'clearing';
        movementCost = 0.9;
        visibilityModifier = 1.1;
        specialFeatures = ['camp'];
      } else {
        terrainType = 'forest';
        movementCost = 1.5;
        defenseBonus = 1;
        visibilityModifier = 0.8;
        resources = ['wood'];
      }
      break;

    case 'grassland':
      if (roughness > 0.65) {
        terrainType = 'rolling_hills';
        movementCost = 1.3;
        defenseBonus = 1;
        resources = ['grass'];
      } else if (perlinNoise(x * 2.5, y * 2.5, 7) > 0.9) {
        terrainType = 'flower_field';
        movementCost = 1.0;
        visibilityModifier = 1.0;
        resources = ['flowers', 'herbs'];
        specialFeatures = ['beautiful'];
      } else {
        terrainType = 'grassland';
        movementCost = 1.0;
        resources = ['grass', 'herbs'];
      }
      break;

    default: // plain
      if (roughness > 0.6) {
        terrainType = 'rough_terrain';
        movementCost = 1.2;
        resources = ['stones'];
      } else if (perlinNoise(x * 1.8, y * 1.8, 8) > 0.85) {
        terrainType = 'ancient_ruins';
        movementCost = 1.1;
        visibilityModifier = 1.0;
        resources = ['ancient_artifacts'];
        specialFeatures = ['mysterious'];
      } else {
        terrainType = 'plain';
        resources = ['grass'];
      }
  }

  // Add rivers with some probability
  const riverNoise = perlinNoise(x * 0.2, y * 0.2, 9);
  const riverBranch = perlinNoise(x * 0.15, y * 0.15, 10);

  if ((riverNoise > 0.75 && riverBranch > 0.6) || (riverNoise > 0.85)) {
    if (terrainType !== 'ocean' && terrainType !== 'water' && terrainType !== 'mountain_peak') {
      terrainType = 'river';
      movementCost = 2;
      visibilityModifier = 0.9;
      resources = ['water', 'fish'];
      specialFeatures = ['water_source'];
    }
  }

  // Add roads occasionally
  const roadNoise = perlinNoise(x * 0.1, y * 0.1, 11);
  if (roadNoise > 0.92 && movementCost < 3) {
    movementCost = Math.max(0.7, movementCost * 0.8);
    specialFeatures.push('road');
  }

  return {
    type: terrainType,
    position: { x, y },
    biome,
    elevation,
    roughness,
    moisture,
    movementCost,
    defenseBonus,
    visibilityModifier,
    resources,
    specialFeatures,
    // Additional gameplay properties
    fertility: moisture * (1 - roughness),
    strategicValue: defenseBonus + (resources.length * 0.5),
    explorationBonus: specialFeatures.length * 0.2,
  } as Terrain; // Type assertion
};