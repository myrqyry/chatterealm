import { Building, BuildingType, TerrainType, Position } from '../../../../shared/src/types/game';
import { perlinNoise } from './NoiseGenerator';

// Building configurations with emoji representations
const BUILDING_CONFIGS: Record<BuildingType, {
  emoji: string;
  name: string;
  description: string;
  size: { width: number; height: number };
  spawnChance: number;
  terrainPreference: TerrainType[];
  isAccessible: boolean;
}> = {
  [BuildingType.HOUSE]: {
    emoji: '🏠',
    name: 'Cozy House',
    description: 'A simple dwelling for villagers',
    size: { width: 1, height: 1 },
    spawnChance: 0.15,
    terrainPreference: [TerrainType.PLAIN, TerrainType.GRASSLAND, TerrainType.FOREST],
    isAccessible: true
  },
  [BuildingType.CASTLE]: {
    emoji: '🏰',
    name: 'Grand Castle',
    description: 'A fortified stronghold',
    size: { width: 3, height: 3 },
    spawnChance: 0.02,
    terrainPreference: [TerrainType.HILLS, TerrainType.MOUNTAIN],
    isAccessible: true
  },
  [BuildingType.TOWER]: {
    emoji: '🏗️',
    name: 'Watch Tower',
    description: 'A tall observation tower',
    size: { width: 1, height: 2 },
    spawnChance: 0.05,
    terrainPreference: [TerrainType.HILLS, TerrainType.MOUNTAIN, TerrainType.PLAIN],
    isAccessible: true
  },
  [BuildingType.SHOP]: {
    emoji: '🏪',
    name: 'General Store',
    description: 'A place to buy and sell goods',
    size: { width: 2, height: 1 },
    spawnChance: 0.08,
    terrainPreference: [TerrainType.PLAIN, TerrainType.GRASSLAND],
    isAccessible: true
  },
  [BuildingType.TAVERN]: {
    emoji: '🏨',
    name: 'Rusty Tavern',
    description: 'A place for rest and rumors',
    size: { width: 2, height: 2 },
    spawnChance: 0.06,
    terrainPreference: [TerrainType.PLAIN, TerrainType.GRASSLAND, TerrainType.FOREST],
    isAccessible: true
  },
  [BuildingType.TEMPLE]: {
    emoji: '⛩️',
    name: 'Ancient Temple',
    description: 'A sacred place of worship',
    size: { width: 2, height: 2 },
    spawnChance: 0.04,
    terrainPreference: [TerrainType.MOUNTAIN, TerrainType.HILLS, TerrainType.FOREST],
    isAccessible: true
  },
  [BuildingType.FARM]: {
    emoji: '🚜',
    name: 'Working Farm',
    description: 'Fields of crops and livestock',
    size: { width: 3, height: 2 },
    spawnChance: 0.12,
    terrainPreference: [TerrainType.GRASSLAND, TerrainType.PLAIN, TerrainType.ROLLING_HILLS],
    isAccessible: true
  },
  [BuildingType.MILL]: {
    emoji: '🏭',
    name: 'Water Mill',
    description: 'Powered by flowing water',
    size: { width: 2, height: 2 },
    spawnChance: 0.03,
    terrainPreference: [TerrainType.RIVER, TerrainType.PLAIN],
    isAccessible: true
  },
  [BuildingType.BRIDGE]: {
    emoji: '🌉',
    name: 'Stone Bridge',
    description: 'Spans rivers and ravines',
    size: { width: 3, height: 1 },
    spawnChance: 0.07,
    terrainPreference: [TerrainType.RIVER, TerrainType.PLAIN],
    isAccessible: true
  },
  [BuildingType.WALL]: {
    emoji: '🏛️',
    name: 'City Wall',
    description: 'Protective fortifications',
    size: { width: 5, height: 1 },
    spawnChance: 0.02,
    terrainPreference: [TerrainType.PLAIN, TerrainType.HILLS],
    isAccessible: false
  },
  [BuildingType.GATE]: {
    emoji: '🚪',
    name: 'City Gate',
    description: 'Entrance to settlements',
    size: { width: 1, height: 2 },
    spawnChance: 0.03,
    terrainPreference: [TerrainType.PLAIN, TerrainType.HILLS],
    isAccessible: true
  },
  [BuildingType.RUINS]: {
    emoji: '🏛️',
    name: 'Ancient Ruins',
    description: 'Remnants of a lost civilization',
    size: { width: 2, height: 2 },
    spawnChance: 0.08,
    terrainPreference: [TerrainType.ANCIENT_RUINS, TerrainType.FOREST, TerrainType.MOUNTAIN],
    isAccessible: true
  },
  [BuildingType.SHRINE]: {
    emoji: '⛩️',
    name: 'Forest Shrine',
    description: 'A small place of contemplation',
    size: { width: 1, height: 1 },
    spawnChance: 0.10,
    terrainPreference: [TerrainType.FOREST, TerrainType.DENSE_FOREST, TerrainType.MOUNTAIN],
    isAccessible: true
  },
  [BuildingType.WATCHTOWER]: {
    emoji: '🗼',
    name: 'Watch Tower',
    description: 'Scans the horizon for threats',
    size: { width: 1, height: 2 },
    spawnChance: 0.04,
    terrainPreference: [TerrainType.HILLS, TerrainType.MOUNTAIN, TerrainType.PLAIN],
    isAccessible: true
  },
  [BuildingType.STABLES]: {
    emoji: '🏇',
    name: 'Horse Stables',
    description: 'Home for noble steeds',
    size: { width: 2, height: 2 },
    spawnChance: 0.05,
    terrainPreference: [TerrainType.GRASSLAND, TerrainType.PLAIN],
    isAccessible: true
  },
  [BuildingType.BLACKSMITH]: {
    emoji: '⚒️',
    name: 'Blacksmith Forge',
    description: 'Where weapons and armor are crafted',
    size: { width: 2, height: 1 },
    spawnChance: 0.06,
    terrainPreference: [TerrainType.PLAIN, TerrainType.GRASSLAND],
    isAccessible: true
  },
  [BuildingType.LIBRARY]: {
    emoji: '📚',
    name: 'Ancient Library',
    description: 'Repository of knowledge and magic',
    size: { width: 2, height: 2 },
    spawnChance: 0.03,
    terrainPreference: [TerrainType.ANCIENT_RUINS, TerrainType.FOREST],
    isAccessible: true
  },
  [BuildingType.LABORATORY]: {
    emoji: '⚗️',
    name: 'Alchemist Lab',
    description: 'Where potions and experiments happen',
    size: { width: 2, height: 1 },
    spawnChance: 0.04,
    terrainPreference: [TerrainType.MOUNTAIN, TerrainType.FOREST, TerrainType.ANCIENT_RUINS],
    isAccessible: true
  }
};

// Generate buildings for the world
export const generateBuildings = (terrainGrid: any[][], worldWidth: number, worldHeight: number): Building[] => {
  const buildings: Building[] = [];
  const occupiedPositions = new Set<string>();

  // Generate buildings based on terrain suitability
  for (let y = 0; y < worldHeight; y++) {
    for (let x = 0; x < worldWidth; x++) {
      const terrain = terrainGrid[y]?.[x];
      if (!terrain) continue;

      // Check if this position is suitable for building generation
      const buildingType = getSuitableBuildingType(terrain.type, x, y, worldWidth, worldHeight);
      if (!buildingType) continue;

      const config = BUILDING_CONFIGS[buildingType];

      // Check spawn chance
      if (Math.random() > config.spawnChance) continue;

      // Check if area is clear for building
      if (!isAreaClear(x, y, config.size.width, config.size.height, occupiedPositions, worldWidth, worldHeight)) {
        continue;
      }

      // Create the building
      const building: Building = {
        id: `building_${x}_${y}_${Date.now()}`,
        type: buildingType,
        emoji: config.emoji,
        position: { x, y },
        name: config.name,
        description: config.description,
        size: config.size,
        isAccessible: config.isAccessible,
        spawnChance: config.spawnChance,
        terrainPreference: config.terrainPreference
      };

      buildings.push(building);

      // Mark area as occupied
      for (let by = y; by < y + config.size.height; by++) {
        for (let bx = x; bx < x + config.size.width; bx++) {
          occupiedPositions.add(`${bx},${by}`);
        }
      }
    }
  }

  return buildings;
};

// Determine if a building type is suitable for the given terrain
const getSuitableBuildingType = (terrainType: TerrainType, x: number, y: number, worldWidth: number, worldHeight: number): BuildingType | null => {
  // Use noise to create natural clustering
  const clusterNoise = perlinNoise(x * 0.05, y * 0.05, 5);
  const rarityNoise = perlinNoise(x * 0.1, y * 0.1, 6);

  // Find all building types that prefer this terrain
  const suitableTypes = Object.entries(BUILDING_CONFIGS)
    .filter(([_, config]) => config.terrainPreference.includes(terrainType))
    .map(([type, _]) => type as BuildingType);

  if (suitableTypes.length === 0) return null;

  // Weight selection by spawn chance and clustering
  const weightedTypes = suitableTypes.map(type => {
    const config = BUILDING_CONFIGS[type];
    let weight = config.spawnChance;

    // Add clustering factor
    if (clusterNoise > 0.6) {
      weight *= 1.5; // More likely in clusters
    }

    // Add rarity factor
    if (rarityNoise > 0.8 && config.spawnChance < 0.05) {
      weight *= 2; // Rare buildings more likely in special areas
    }

    return { type, weight };
  });

  // Select based on weights
  const totalWeight = weightedTypes.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;

  for (const item of weightedTypes) {
    random -= item.weight;
    if (random <= 0) {
      return item.type;
    }
  }

  return null;
};

// Check if the area is clear for building placement
const isAreaClear = (
  startX: number,
  startY: number,
  width: number,
  height: number,
  occupiedPositions: Set<string>,
  worldWidth: number,
  worldHeight: number
): boolean => {
  // Check bounds
  if (startX + width > worldWidth || startY + height > worldHeight) {
    return false;
  }

  // Check if any position in the area is occupied
  for (let y = startY; y < startY + height; y++) {
    for (let x = startX; x < startX + width; x++) {
      if (occupiedPositions.has(`${x},${y}`)) {
        return false;
      }
    }
  }

  return true;
};

// Get building at position
export const getBuildingAtPosition = (buildings: Building[], x: number, y: number): Building | null => {
  return buildings.find(building => {
    return x >= building.position.x &&
           x < building.position.x + building.size.width &&
           y >= building.position.y &&
           y < building.position.y + building.size.height;
  }) || null;
};

// Check if position is inside a building
export const isPositionInBuilding = (buildings: Building[], x: number, y: number): boolean => {
  return getBuildingAtPosition(buildings, x, y) !== null;
};