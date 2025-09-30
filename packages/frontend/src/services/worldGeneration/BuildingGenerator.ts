import { Building, BuildingType, TerrainType, Position, Item, ItemType, ItemRarity } from '../../../../shared/src/types/game';
import { perlinNoise } from './NoiseGenerator';

// Enhanced building configurations with loot generation capabilities
const BUILDING_CONFIGS: Record<BuildingType, {
  emoji: string;
  name: string;
  description: string;
  size: { width: number; height: number };
  spawnChance: number;
  terrainPreference: TerrainType[];
  isAccessible: boolean;
  lootSpawnChance?: number; // Chance to spawn loot inside/around building
  maxLootItems?: number; // Maximum loot items per building
  preferredLootTypes?: ItemType[]; // Types of loot this building prefers
  lootRarityWeights?: { common: number; uncommon: number; rare: number; epic?: number; legendary?: number };
}> = {
  [BuildingType.HOUSE]: {
    emoji: '🏠',
    name: 'Cozy House',
    description: 'A simple dwelling for villagers',
    size: { width: 1, height: 1 },
    spawnChance: 0.18, // Increased from 0.15
    terrainPreference: [TerrainType.PLAIN, TerrainType.GRASSLAND, TerrainType.FOREST],
    isAccessible: true,
    lootSpawnChance: 0.25,
    maxLootItems: 2,
    preferredLootTypes: [ItemType.CONSUMABLE, ItemType.ARMOR],
    lootRarityWeights: { common: 70, uncommon: 25, rare: 5 }
  },
  [BuildingType.CASTLE]: {
    emoji: '🏰',
    name: 'Grand Castle',
    description: 'A fortified stronghold',
    size: { width: 3, height: 3 },
    spawnChance: 0.025, // Slightly increased from 0.02
    terrainPreference: [TerrainType.HILLS, TerrainType.MOUNTAIN],
    isAccessible: true,
    lootSpawnChance: 0.85,
    maxLootItems: 6,
    preferredLootTypes: [ItemType.WEAPON, ItemType.ARMOR],
    lootRarityWeights: { common: 20, uncommon: 40, rare: 30, epic: 8, legendary: 2 }
  },
  [BuildingType.TOWER]: {
    emoji: '🏗️',
    name: 'Watch Tower',
    description: 'A tall observation tower',
    size: { width: 1, height: 2 },
    spawnChance: 0.06, // Increased from 0.05
    terrainPreference: [TerrainType.HILLS, TerrainType.MOUNTAIN, TerrainType.PLAIN],
    isAccessible: true,
    lootSpawnChance: 0.35,
    maxLootItems: 2,
    preferredLootTypes: [ItemType.WEAPON, ItemType.CONSUMABLE],
    lootRarityWeights: { common: 50, uncommon: 35, rare: 15 }
  },
  [BuildingType.SHOP]: {
    emoji: '🏪',
    name: 'General Store',
    description: 'A place to buy and sell goods',
    size: { width: 2, height: 1 },
    spawnChance: 0.10, // Increased from 0.08
    terrainPreference: [TerrainType.PLAIN, TerrainType.GRASSLAND],
    isAccessible: true,
    lootSpawnChance: 0.45,
    maxLootItems: 4,
    preferredLootTypes: [ItemType.CONSUMABLE, ItemType.ARMOR, ItemType.WEAPON],
    lootRarityWeights: { common: 60, uncommon: 30, rare: 10 }
  },
  [BuildingType.TAVERN]: {
    emoji: '🏨',
    name: 'Rusty Tavern',
    description: 'A place for rest and rumors',
    size: { width: 2, height: 2 },
    spawnChance: 0.08, // Increased from 0.06
    terrainPreference: [TerrainType.PLAIN, TerrainType.GRASSLAND, TerrainType.FOREST],
    isAccessible: true,
    lootSpawnChance: 0.30,
    maxLootItems: 3,
    preferredLootTypes: [ItemType.CONSUMABLE],
    lootRarityWeights: { common: 65, uncommon: 25, rare: 10 }
  },
    [BuildingType.TEMPLE]: {
    emoji: '⛩️',
    name: 'Ancient Temple',
    description: 'A sacred place of worship',
    size: { width: 2, height: 2 },
    spawnChance: 0.05, // Increased from 0.04
    terrainPreference: [TerrainType.MOUNTAIN, TerrainType.HILLS, TerrainType.FOREST],
    isAccessible: true,
    lootSpawnChance: 0.60,
    maxLootItems: 4,
    preferredLootTypes: [ItemType.ARMOR, ItemType.CONSUMABLE],
    lootRarityWeights: { common: 30, uncommon: 40, rare: 25, epic: 5 }
  },
  [BuildingType.FARM]: {
    emoji: '🚜',
    name: 'Working Farm',
    description: 'Fields of crops and livestock',
    size: { width: 3, height: 2 },
    spawnChance: 0.14, // Increased from 0.12
    terrainPreference: [TerrainType.GRASSLAND, TerrainType.PLAIN, TerrainType.ROLLING_HILLS],
    isAccessible: true,
    lootSpawnChance: 0.20,
    maxLootItems: 3,
    preferredLootTypes: [ItemType.CONSUMABLE],
    lootRarityWeights: { common: 80, uncommon: 18, rare: 2 }
  },
  [BuildingType.MILL]: {
    emoji: '🏭',
    name: 'Water Mill',
    description: 'Powered by flowing water',
    size: { width: 2, height: 2 },
    spawnChance: 0.04, // Increased from 0.03
    terrainPreference: [TerrainType.RIVER, TerrainType.PLAIN],
    isAccessible: true,
    lootSpawnChance: 0.25,
    maxLootItems: 2,
    preferredLootTypes: [ItemType.CONSUMABLE, ItemType.ARMOR],
    lootRarityWeights: { common: 70, uncommon: 25, rare: 5 }
  },
  [BuildingType.BRIDGE]: {
    emoji: '🌉',
    name: 'Stone Bridge',
    description: 'Spans rivers and ravines',
    size: { width: 3, height: 1 },
    spawnChance: 0.08, // Increased from 0.07
    terrainPreference: [TerrainType.RIVER, TerrainType.PLAIN],
    isAccessible: true,
    lootSpawnChance: 0.15,
    maxLootItems: 1,
    preferredLootTypes: [ItemType.WEAPON, ItemType.ARMOR],
    lootRarityWeights: { common: 60, uncommon: 30, rare: 10 }
  },
  [BuildingType.WALL]: {
    emoji: '�️',
    name: 'City Wall',
    description: 'Protective fortifications',
    size: { width: 5, height: 1 },
    spawnChance: 0.025, // Increased from 0.02
    terrainPreference: [TerrainType.PLAIN, TerrainType.HILLS],
    isAccessible: false,
    lootSpawnChance: 0.10,
    maxLootItems: 1,
    preferredLootTypes: [ItemType.WEAPON, ItemType.ARMOR],
    lootRarityWeights: { common: 55, uncommon: 35, rare: 10 }
  },
  [BuildingType.GATE]: {
    emoji: '�',
    name: 'City Gate',
    description: 'Entrance to settlements',
    size: { width: 1, height: 2 },
    spawnChance: 0.04, // Increased from 0.03
    terrainPreference: [TerrainType.PLAIN, TerrainType.HILLS],
    isAccessible: true,
    lootSpawnChance: 0.20,
    maxLootItems: 2,
    preferredLootTypes: [ItemType.WEAPON, ItemType.ARMOR],
    lootRarityWeights: { common: 50, uncommon: 35, rare: 15 }
  },
  [BuildingType.RUINS]: {
    emoji: '�️',
    name: 'Ancient Ruins',
    description: 'Remnants of a lost civilization',
    size: { width: 2, height: 2 },
    spawnChance: 0.10, // Increased from 0.08
    terrainPreference: [TerrainType.ANCIENT_RUINS, TerrainType.FOREST, TerrainType.MOUNTAIN],
    isAccessible: true,
    lootSpawnChance: 0.75,
    maxLootItems: 5,
    preferredLootTypes: [ItemType.WEAPON, ItemType.ARMOR, ItemType.CONSUMABLE],
    lootRarityWeights: { common: 25, uncommon: 35, rare: 30, epic: 8, legendary: 2 }
  },
  [BuildingType.SHRINE]: {
    emoji: '⛩️',
    name: 'Forest Shrine',
    description: 'A small place of contemplation',
    size: { width: 1, height: 1 },
    spawnChance: 0.12, // Increased from 0.10
    terrainPreference: [TerrainType.FOREST, TerrainType.DENSE_FOREST, TerrainType.MOUNTAIN],
    isAccessible: true,
    lootSpawnChance: 0.40,
    maxLootItems: 2,
    preferredLootTypes: [ItemType.CONSUMABLE, ItemType.ARMOR],
    lootRarityWeights: { common: 40, uncommon: 40, rare: 20 }
  },
  [BuildingType.WATCHTOWER]: {
    emoji: '🗼',
    name: 'Watch Tower',
    description: 'Scans the horizon for threats',
    size: { width: 1, height: 2 },
    spawnChance: 0.05, // Increased from 0.04
    terrainPreference: [TerrainType.HILLS, TerrainType.MOUNTAIN, TerrainType.PLAIN],
    isAccessible: true,
    lootSpawnChance: 0.45,
    maxLootItems: 3,
    preferredLootTypes: [ItemType.WEAPON, ItemType.ARMOR],
    lootRarityWeights: { common: 40, uncommon: 40, rare: 20 }
  },
  [BuildingType.STABLES]: {
    emoji: '🏇',
    name: 'Horse Stables',
    description: 'Home for noble steeds',
    size: { width: 2, height: 2 },
    spawnChance: 0.06, // Increased from 0.05
    terrainPreference: [TerrainType.GRASSLAND, TerrainType.PLAIN],
    isAccessible: true,
    lootSpawnChance: 0.25,
    maxLootItems: 3,
    preferredLootTypes: [ItemType.ARMOR, ItemType.CONSUMABLE],
    lootRarityWeights: { common: 60, uncommon: 30, rare: 10 }
  },
  [BuildingType.BLACKSMITH]: {
    emoji: '⚒️',
    name: 'Blacksmith Forge',
    description: 'Where weapons and armor are crafted',
    size: { width: 2, height: 1 },
    spawnChance: 0.08, // Increased from 0.06
    terrainPreference: [TerrainType.PLAIN, TerrainType.GRASSLAND],
    isAccessible: true,
    lootSpawnChance: 0.70,
    maxLootItems: 4,
    preferredLootTypes: [ItemType.WEAPON, ItemType.ARMOR],
    lootRarityWeights: { common: 30, uncommon: 45, rare: 20, epic: 5 }
  },
  [BuildingType.LIBRARY]: {
    emoji: '📚',
    name: 'Ancient Library',
    description: 'Repository of knowledge and magic',
    size: { width: 2, height: 2 },
    spawnChance: 0.04, // Increased from 0.03
    terrainPreference: [TerrainType.ANCIENT_RUINS, TerrainType.FOREST],
    isAccessible: true,
    lootSpawnChance: 0.65,
    maxLootItems: 4,
    preferredLootTypes: [ItemType.CONSUMABLE, ItemType.ARMOR],
    lootRarityWeights: { common: 20, uncommon: 40, rare: 30, epic: 10 }
  },
  [BuildingType.LABORATORY]: {
    emoji: '⚗️',
    name: 'Alchemist Lab',
    description: 'Where potions and experiments happen',
    size: { width: 2, height: 1 },
    spawnChance: 0.05, // Increased from 0.04
    terrainPreference: [TerrainType.MOUNTAIN, TerrainType.FOREST, TerrainType.ANCIENT_RUINS],
    isAccessible: true,
    lootSpawnChance: 0.80,
    maxLootItems: 5,
    preferredLootTypes: [ItemType.CONSUMABLE],
    lootRarityWeights: { common: 25, uncommon: 35, rare: 30, epic: 8, legendary: 2 }
  }
};

// Generate buildings for the world with loot spawns
export const generateBuildings = (terrainGrid: any[][], worldWidth: number, worldHeight: number): { buildings: Building[], items: Item[] } => {
  const buildings: Building[] = [];
  const items: Item[] = [];
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

      // Generate loot for this building
      if (config.lootSpawnChance && Math.random() < config.lootSpawnChance) {
        const lootItems = generateBuildingLoot(building, config);
        items.push(...lootItems);
      }

      // Mark area as occupied
      for (let by = y; by < y + config.size.height; by++) {
        for (let bx = x; bx < x + config.size.width; bx++) {
          occupiedPositions.add(`${bx},${by}`);
        }
      }
    }
  }

  return { buildings, items };
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

// Generate loot items for a building
const generateBuildingLoot = (building: Building, config: any): Item[] => {
  const items: Item[] = [];
  const maxItems = config.maxLootItems || 1;
  const numItems = Math.floor(Math.random() * maxItems) + 1;

  for (let i = 0; i < numItems; i++) {
    // Select item type
    const preferredTypes = config.preferredLootTypes || [ItemType.WEAPON, ItemType.ARMOR, ItemType.CONSUMABLE];
    const itemType = preferredTypes[Math.floor(Math.random() * preferredTypes.length)];

    // Select rarity based on building's loot weights
    const rarity = selectItemRarity(config.lootRarityWeights);

    // Generate position within or around building
    const lootPosition = generateLootPosition(building);

    const item: Item = {
      id: `building_loot_${building.id}_${i}_${Date.now()}`,
      name: generateItemName(itemType, rarity),
      type: itemType,
      rarity,
      description: generateItemDescription(itemType, rarity, building.type),
      position: lootPosition,
      stats: generateItemStats(itemType, rarity),
      isHidden: true,
      revealDuration: getRevealDuration(rarity),
      revealProgress: 0.0,
      canBeLooted: false
    };

    items.push(item);
  }

  return items;
};

// Select item rarity based on weights
const selectItemRarity = (weights: any): ItemRarity => {
  if (!weights) return ItemRarity.COMMON;

  const totalWeight = Object.values(weights).reduce((sum: number, weight: any) => sum + (weight as number), 0) as number;
  let random = Math.random() * totalWeight;
  
  for (const [rarity, weight] of Object.entries(weights)) {
    random -= (weight as number);
    if (random <= 0) {
      return rarity as ItemRarity;
    }
  }
  
  return ItemRarity.COMMON;
};

// Generate position for loot within building area
const generateLootPosition = (building: Building): Position => {
  const offsetX = Math.floor(Math.random() * building.size.width);
  const offsetY = Math.floor(Math.random() * building.size.height);
  
  return {
    x: building.position.x + offsetX,
    y: building.position.y + offsetY
  };
};

// Generate item name based on type and rarity
const generateItemName = (type: ItemType, rarity: ItemRarity): string => {
  const rarityPrefixes = {
    [ItemRarity.COMMON]: ['Basic', 'Simple', 'Plain', 'Worn'],
    [ItemRarity.UNCOMMON]: ['Good', 'Quality', 'Enhanced', 'Fine'],
    [ItemRarity.RARE]: ['Superior', 'Excellent', 'Masterwork', 'Pristine'],
    [ItemRarity.EPIC]: ['Legendary', 'Mythical', 'Ancient', 'Heroic'],
    [ItemRarity.LEGENDARY]: ['Divine', 'Immortal', 'Godly', 'Eternal']
  };

  const typeNames = {
    [ItemType.WEAPON]: ['Sword', 'Dagger', 'Axe', 'Staff', 'Bow', 'Mace', 'Spear'],
    [ItemType.ARMOR]: ['Shield', 'Helmet', 'Armor', 'Boots', 'Gloves', 'Cloak', 'Belt'],
    [ItemType.CONSUMABLE]: ['Potion', 'Elixir', 'Scroll', 'Herb', 'Bread', 'Wine', 'Medicine']
  };

  const prefix = rarityPrefixes[rarity][Math.floor(Math.random() * rarityPrefixes[rarity].length)];
  const typeName = typeNames[type][Math.floor(Math.random() * typeNames[type].length)];
  
  return `${prefix} ${typeName}`;
};

// Generate item description
const generateItemDescription = (type: ItemType, rarity: ItemRarity, buildingType: BuildingType): string => {
  const buildingContext = {
    [BuildingType.BLACKSMITH]: 'forged in the fires of the blacksmith',
    [BuildingType.LIBRARY]: 'discovered among ancient tomes',
    [BuildingType.TEMPLE]: 'blessed by divine power',
    [BuildingType.CASTLE]: 'fit for nobility',
    [BuildingType.LABORATORY]: 'enhanced by alchemical processes',
    [BuildingType.RUINS]: 'recovered from ancient ruins'
  };

  const context = buildingContext[buildingType] || 'found in a mysterious location';
  return `A ${rarity} ${type} ${context}.`;
};

// Generate item stats based on type and rarity
const generateItemStats = (type: ItemType, rarity: ItemRarity): any => {
  const rarityMultipliers = {
    [ItemRarity.COMMON]: 1,
    [ItemRarity.UNCOMMON]: 1.5,
    [ItemRarity.RARE]: 2.5,
    [ItemRarity.EPIC]: 4,
    [ItemRarity.LEGENDARY]: 6
  };

  const multiplier = rarityMultipliers[rarity];

  switch (type) {
    case ItemType.WEAPON:
      return { attack: Math.floor(5 * multiplier + Math.random() * 3) };
    case ItemType.ARMOR:
      return { defense: Math.floor(3 * multiplier + Math.random() * 2) };
    case ItemType.CONSUMABLE:
      return { hp: Math.floor(20 * multiplier + Math.random() * 10) };
    default:
      return {};
  }
};

// Get reveal duration based on rarity
const getRevealDuration = (rarity: ItemRarity): number => {
  const durations = {
    [ItemRarity.COMMON]: 2000,
    [ItemRarity.UNCOMMON]: 4000,
    [ItemRarity.RARE]: 8000,
    [ItemRarity.EPIC]: 15000,
    [ItemRarity.LEGENDARY]: 30000
  };
  
  return durations[rarity] || 2000;
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