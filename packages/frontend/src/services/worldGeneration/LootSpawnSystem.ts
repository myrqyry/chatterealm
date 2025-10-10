import { Item, ItemType, ItemRarity, Position } from 'shared';
import { BiomeType } from 'shared';
import { perlinNoise } from './NoiseGenerator';

// Terrain-based loot configuration
const TERRAIN_LOOT_CONFIG: Record<BiomeType, {
  spawnChance: number;
  preferredTypes: ItemType[];
  rarityWeights: { common: number; uncommon: number; rare: number; epic?: number; legendary?: number };
  maxItemsPerTile: number;
  lootDensityMultiplier: number;
}> = {
  [BiomeType.ANCIENT_RUINS]: {
    spawnChance: 0.35,
    preferredTypes: [ItemType.WEAPON, ItemType.ARMOR, ItemType.CONSUMABLE],
    rarityWeights: { common: 20, uncommon: 30, rare: 35, epic: 12, legendary: 3 },
    maxItemsPerTile: 3,
    lootDensityMultiplier: 2.5
  },
  [BiomeType.FOREST]: {
    spawnChance: 0.12,
    preferredTypes: [ItemType.CONSUMABLE, ItemType.WEAPON],
    rarityWeights: { common: 65, uncommon: 25, rare: 10 },
    maxItemsPerTile: 2,
    lootDensityMultiplier: 1.0
  },
  [BiomeType.DENSE_FOREST]: {
    spawnChance: 0.18,
    preferredTypes: [ItemType.CONSUMABLE, ItemType.ARMOR],
    rarityWeights: { common: 55, uncommon: 30, rare: 15 },
    maxItemsPerTile: 2,
    lootDensityMultiplier: 1.3
  },
  [BiomeType.MOUNTAIN]: {
    spawnChance: 0.15,
    preferredTypes: [ItemType.WEAPON, ItemType.ARMOR],
    rarityWeights: { common: 50, uncommon: 35, rare: 15 },
    maxItemsPerTile: 2,
    lootDensityMultiplier: 1.2
  },
  [BiomeType.MOUNTAIN_PEAK]: {
    spawnChance: 0.25,
    preferredTypes: [ItemType.WEAPON, ItemType.ARMOR],
    rarityWeights: { common: 30, uncommon: 40, rare: 25, epic: 5 },
    maxItemsPerTile: 3,
    lootDensityMultiplier: 1.8
  },
  [BiomeType.SWAMP]: {
    spawnChance: 0.08,
    preferredTypes: [ItemType.CONSUMABLE],
    rarityWeights: { common: 70, uncommon: 20, rare: 10 },
    maxItemsPerTile: 1,
    lootDensityMultiplier: 0.8
  },
  [BiomeType.SAND]: {
    spawnChance: 0.06,
    preferredTypes: [ItemType.CONSUMABLE, ItemType.ARMOR],
    rarityWeights: { common: 75, uncommon: 20, rare: 5 },
    maxItemsPerTile: 1,
    lootDensityMultiplier: 0.6
  },
  [BiomeType.DUNES]: {
    spawnChance: 0.04,
    preferredTypes: [ItemType.ARMOR, ItemType.WEAPON],
    rarityWeights: { common: 60, uncommon: 30, rare: 10 },
    maxItemsPerTile: 1,
    lootDensityMultiplier: 0.7
  },
  [BiomeType.OASIS]: {
    spawnChance: 0.45,
    preferredTypes: [ItemType.CONSUMABLE, ItemType.ARMOR],
    rarityWeights: { common: 40, uncommon: 40, rare: 15, epic: 5 },
    maxItemsPerTile: 3,
    lootDensityMultiplier: 2.0
  },
  [BiomeType.JUNGLE]: {
    spawnChance: 0.20,
    preferredTypes: [ItemType.CONSUMABLE, ItemType.WEAPON],
    rarityWeights: { common: 50, uncommon: 35, rare: 15 },
    maxItemsPerTile: 2,
    lootDensityMultiplier: 1.4
  },
  [BiomeType.DENSE_JUNGLE]: {
    spawnChance: 0.25,
    preferredTypes: [ItemType.CONSUMABLE, ItemType.ARMOR],
    rarityWeights: { common: 45, uncommon: 35, rare: 18, epic: 2 },
    maxItemsPerTile: 3,
    lootDensityMultiplier: 1.6
  },
  [BiomeType.RIVER]: {
    spawnChance: 0.10,
    preferredTypes: [ItemType.CONSUMABLE],
    rarityWeights: { common: 70, uncommon: 25, rare: 5 },
    maxItemsPerTile: 1,
    lootDensityMultiplier: 0.9
  },
  [BiomeType.DEEP_WATER]: {
    spawnChance: 0.03,
    preferredTypes: [ItemType.ARMOR],
    rarityWeights: { common: 80, uncommon: 18, rare: 2 },
    maxItemsPerTile: 1,
    lootDensityMultiplier: 0.5
  },
  [BiomeType.OCEAN]: {
    spawnChance: 0.02,
    preferredTypes: [ItemType.ARMOR],
    rarityWeights: { common: 85, uncommon: 13, rare: 2 },
    maxItemsPerTile: 1,
    lootDensityMultiplier: 0.3
  },
  [BiomeType.ICE]: {
    spawnChance: 0.05,
    preferredTypes: [ItemType.ARMOR, ItemType.CONSUMABLE],
    rarityWeights: { common: 70, uncommon: 25, rare: 5 },
    maxItemsPerTile: 1,
    lootDensityMultiplier: 0.7
  },
  [BiomeType.SNOW]: {
    spawnChance: 0.07,
    preferredTypes: [ItemType.ARMOR, ItemType.CONSUMABLE],
    rarityWeights: { common: 65, uncommon: 30, rare: 5 },
    maxItemsPerTile: 1,
    lootDensityMultiplier: 0.8
  },
  [BiomeType.SNOWY_HILLS]: {
    spawnChance: 0.12,
    preferredTypes: [ItemType.WEAPON, ItemType.ARMOR],
    rarityWeights: { common: 55, uncommon: 35, rare: 10 },
    maxItemsPerTile: 2,
    lootDensityMultiplier: 1.1
  },
  // Default for other terrain types
  [BiomeType.PLAIN]: {
    spawnChance: 0.05,
    preferredTypes: [ItemType.CONSUMABLE],
    rarityWeights: { common: 80, uncommon: 18, rare: 2 },
    maxItemsPerTile: 1,
    lootDensityMultiplier: 0.6
  },
  [BiomeType.GRASSLAND]: {
    spawnChance: 0.04,
    preferredTypes: [ItemType.CONSUMABLE],
    rarityWeights: { common: 85, uncommon: 14, rare: 1 },
    maxItemsPerTile: 1,
    lootDensityMultiplier: 0.5
  },
  [BiomeType.HILLS]: {
    spawnChance: 0.08,
    preferredTypes: [ItemType.WEAPON, ItemType.ARMOR],
    rarityWeights: { common: 65, uncommon: 30, rare: 5 },
    maxItemsPerTile: 1,
    lootDensityMultiplier: 0.9
  },
  [BiomeType.ROLLING_HILLS]: {
    spawnChance: 0.06,
    preferredTypes: [ItemType.CONSUMABLE, ItemType.ARMOR],
    rarityWeights: { common: 70, uncommon: 25, rare: 5 },
    maxItemsPerTile: 1,
    lootDensityMultiplier: 0.8
  },
  [BiomeType.WATER]: {
    spawnChance: 0.03,
    preferredTypes: [ItemType.CONSUMABLE],
    rarityWeights: { common: 85, uncommon: 14, rare: 1 },
    maxItemsPerTile: 1,
    lootDensityMultiplier: 0.4
  },
  [BiomeType.MARSH]: {
    spawnChance: 0.10,
    preferredTypes: [ItemType.CONSUMABLE, ItemType.ARMOR],
    rarityWeights: { common: 60, uncommon: 30, rare: 10 },
    maxItemsPerTile: 2,
    lootDensityMultiplier: 1.0
  },
  [BiomeType.CLEARING]: {
    spawnChance: 0.15,
    preferredTypes: [ItemType.CONSUMABLE, ItemType.WEAPON],
    rarityWeights: { common: 55, uncommon: 35, rare: 10 },
    maxItemsPerTile: 2,
    lootDensityMultiplier: 1.2
  },
  [BiomeType.ROUGH_TERRAIN]: {
    spawnChance: 0.12,
    preferredTypes: [ItemType.WEAPON, ItemType.ARMOR],
    rarityWeights: { common: 60, uncommon: 30, rare: 10 },
    maxItemsPerTile: 2,
    lootDensityMultiplier: 1.1
  },
  [BiomeType.FLOWER_FIELD]: {
    spawnChance: 0.08,
    preferredTypes: [ItemType.CONSUMABLE],
    rarityWeights: { common: 70, uncommon: 25, rare: 5 },
    maxItemsPerTile: 1,
    lootDensityMultiplier: 0.9
  },
  [BiomeType.DESERT]: {
    spawnChance: 0.06,
    preferredTypes: [ItemType.CONSUMABLE, ItemType.ARMOR],
    rarityWeights: { common: 75, uncommon: 20, rare: 5 },
    maxItemsPerTile: 1,
    lootDensityMultiplier: 0.6
  },
  [BiomeType.WASTELAND]: {
    spawnChance: 0.08,
    preferredTypes: [ItemType.WEAPON, ItemType.ARMOR],
    rarityWeights: { common: 65, uncommon: 30, rare: 5 },
    maxItemsPerTile: 1,
    lootDensityMultiplier: 0.9
  },
  [BiomeType.TOXIC_ZONE]: {
    spawnChance: 0.10,
    preferredTypes: [ItemType.CONSUMABLE],
    rarityWeights: { common: 60, uncommon: 30, rare: 10 },
    maxItemsPerTile: 2,
    lootDensityMultiplier: 1.0
  },
  [BiomeType.RADIATION_FIELD]: {
    spawnChance: 0.12,
    preferredTypes: [ItemType.WEAPON, ItemType.ARMOR],
    rarityWeights: { common: 60, uncommon: 30, rare: 10 },
    maxItemsPerTile: 2,
    lootDensityMultiplier: 1.1
  },
  [BiomeType.CRYSTAL_GARDEN]: {
    spawnChance: 0.15,
    preferredTypes: [ItemType.CONSUMABLE, ItemType.WEAPON],
    rarityWeights: { common: 55, uncommon: 35, rare: 10 },
    maxItemsPerTile: 2,
    lootDensityMultiplier: 1.2
  },
  [BiomeType.URBAN_RUINS]: {
    spawnChance: 0.18,
    preferredTypes: [ItemType.WEAPON, ItemType.ARMOR],
    rarityWeights: { common: 50, uncommon: 35, rare: 15 },
    maxItemsPerTile: 2,
    lootDensityMultiplier: 1.3
  },
  [BiomeType.INFECTED_NORMAL]: {
    spawnChance: 0.20,
    preferredTypes: [ItemType.CONSUMABLE, ItemType.ARMOR],
    rarityWeights: { common: 45, uncommon: 35, rare: 20 },
    maxItemsPerTile: 3,
    lootDensityMultiplier: 1.4
  },
  [BiomeType.INFECTED_HEAVY]: {
    spawnChance: 0.25,
    preferredTypes: [ItemType.WEAPON, ItemType.ARMOR],
    rarityWeights: { common: 40, uncommon: 35, rare: 25 },
    maxItemsPerTile: 3,
    lootDensityMultiplier: 1.5
  },
  [BiomeType.INFECTED_CORE]: {
    spawnChance: 0.30,
    preferredTypes: [ItemType.WEAPON, ItemType.ARMOR],
    rarityWeights: { common: 30, uncommon: 40, rare: 30 },
    maxItemsPerTile: 4,
    lootDensityMultiplier: 1.6
  }
};

// Loot hotspot configuration for high-value areas
interface LootHotspot {
  center: Position;
  radius: number;
  bonusMultiplier: number;
  rarityBonus: number; // Shifts rarity distribution toward higher tiers
}

// Generate terrain-based loot for the world
export const generateTerrainLoot = (
  terrainGrid: any[][],
  worldWidth: number,
  worldHeight: number,
  lootHotspots: LootHotspot[] = []
): Item[] => {
  const items: Item[] = [];

  for (let y = 0; y < worldHeight; y++) {
    for (let x = 0; x < worldWidth; x++) {
      const terrain = terrainGrid[y]?.[x];
      if (!terrain) continue;

      const config = TERRAIN_LOOT_CONFIG[terrain.type as BiomeType];
      if (!config) continue;

      // Calculate loot density based on noise patterns
      const densityNoise = perlinNoise(x * 0.1, y * 0.1, 1);
      const rarityNoise = perlinNoise(x * 0.05, y * 0.05, 2);
      
      // Check if we're in a loot hotspot
      const hotspot = lootHotspots.find(h => 
        Math.sqrt(Math.pow(x - h.center.x, 2) + Math.pow(y - h.center.y, 2)) <= h.radius
      );

      let spawnChance = config.spawnChance;
      let rarityWeights = { ...config.rarityWeights };
      
      // Apply hotspot bonuses
      if (hotspot) {
        spawnChance *= hotspot.bonusMultiplier;
        // Shift rarity weights toward higher tiers
        Object.keys(rarityWeights).forEach(rarity => {
          if (rarity !== 'common') {
            const key = rarity as keyof typeof rarityWeights;
            rarityWeights[key] = (rarityWeights[key] || 0) * (1 + hotspot.rarityBonus);
          }
        });
      }

      // Apply density multiplier based on noise
      if (densityNoise > 0.6) {
        spawnChance *= config.lootDensityMultiplier;
      }

      // Check if loot spawns at this location
      if (Math.random() < spawnChance) {
        const numItems = Math.min(
          Math.floor(Math.random() * config.maxItemsPerTile) + 1,
          config.maxItemsPerTile
        );

        for (let i = 0; i < numItems; i++) {
          const item = generateTerrainItem(x, y, terrain.type as BiomeType, config, rarityWeights, rarityNoise);
          if (item) {
            items.push(item);
          }
        }
      }
    }
  }

  return items;
};

// Generate a single item for terrain-based loot
const generateTerrainItem = (
  x: number,
  y: number,
  terrainType: BiomeType,
  config: any,
  rarityWeights: any,
  rarityNoise: number
): Item | null => {
  // Select item type
  const itemType = config.preferredTypes[Math.floor(Math.random() * config.preferredTypes.length)];
  
  // Select rarity with noise influence
  let adjustedWeights = { ...rarityWeights };
  if (rarityNoise > 0.8) {
    // High noise areas have better loot
    Object.keys(adjustedWeights).forEach(rarity => {
      if (rarity !== 'common') {
        adjustedWeights[rarity] *= 1.5;
      }
    });
  }
  
  const rarity = selectItemRarity(adjustedWeights);

  const item: Item = {
    id: `terrain_loot_${x}_${y}_${Date.now()}_${Math.random()}`,
    name: generateTerrainItemName(itemType, rarity, terrainType),
    type: itemType,
    rarity,
    description: generateTerrainItemDescription(itemType, rarity, terrainType),
    position: { x, y },
    stats: generateTerrainItemStats(itemType, rarity, terrainType),
    isHidden: true,
    revealDuration: getRevealDuration(rarity),
    revealProgress: 0.0,
    canBeLooted: false
  };

  return item;
};

// Generate terrain-specific item names
const generateTerrainItemName = (type: ItemType, rarity: ItemRarity, terrainType: BiomeType): string => {
  const terrainModifiers = {
    [BiomeType.ANCIENT_RUINS]: ['Ancient', 'Ruined', 'Lost', 'Forgotten'],
    [BiomeType.FOREST]: ['Wooden', 'Natural', 'Forest', 'Wild'],
    [BiomeType.MOUNTAIN]: ['Stone', 'Mountain', 'Rocky', 'Dwarven'],
    [BiomeType.SAND]: ['Desert', 'Sand', 'Sun-bleached', 'Nomad'],
    [BiomeType.SWAMP]: ['Murky', 'Bog', 'Swamp', 'Poisonous'],
    [BiomeType.ICE]: ['Frozen', 'Ice', 'Crystal', 'Arctic']
  };

  const rarityPrefixes = {
    [ItemRarity.COMMON]: ['Worn', 'Simple', 'Basic'],
    [ItemRarity.UNCOMMON]: ['Quality', 'Fine', 'Enhanced'],
    [ItemRarity.RARE]: ['Superior', 'Excellent', 'Masterwork'],
    [ItemRarity.EPIC]: ['Legendary', 'Mythical', 'Ancient'],
    [ItemRarity.LEGENDARY]: ['Divine', 'Immortal', 'Godly']
  };

  const typeNames = {
    [ItemType.WEAPON]: ['Blade', 'Sword', 'Axe', 'Staff', 'Bow', 'Dagger'],
    [ItemType.ARMOR]: ['Shield', 'Helm', 'Armor', 'Boots', 'Gauntlets'],
    [ItemType.CONSUMABLE]: ['Potion', 'Elixir', 'Herb', 'Essence', 'Extract']
  };

  const terrainMod = terrainModifiers[terrainType]?.[Math.floor(Math.random() * terrainModifiers[terrainType].length)] || '';
  const rarityPrefix = rarityPrefixes[rarity][Math.floor(Math.random() * rarityPrefixes[rarity].length)];
  const typeName = typeNames[type][Math.floor(Math.random() * typeNames[type].length)];

  return terrainMod ? `${rarityPrefix} ${terrainMod} ${typeName}` : `${rarityPrefix} ${typeName}`;
};

// Generate terrain-specific item descriptions
const generateTerrainItemDescription = (type: ItemType, rarity: ItemRarity, terrainType: BiomeType): string => {
  const terrainContext = {
    [BiomeType.ANCIENT_RUINS]: 'discovered among ancient ruins',
    [BiomeType.FOREST]: 'found deep in the forest',
    [BiomeType.MOUNTAIN]: 'carved from mountain stone',
    [BiomeType.SAND]: 'buried in desert sands',
    [BiomeType.SWAMP]: 'recovered from murky swamplands',
    [BiomeType.ICE]: 'preserved in eternal ice'
  };

  const context = terrainContext[terrainType] || 'found in the wilderness';
  return `A ${rarity} ${type} ${context}.`;
};

// Generate terrain-specific item stats with environmental bonuses
const generateTerrainItemStats = (type: ItemType, rarity: ItemRarity, terrainType: BiomeType): any => {
  const rarityMultipliers = {
    [ItemRarity.COMMON]: 1,
    [ItemRarity.UNCOMMON]: 1.5,
    [ItemRarity.RARE]: 2.5,
    [ItemRarity.EPIC]: 4,
    [ItemRarity.LEGENDARY]: 6
  };

  const multiplier = rarityMultipliers[rarity];
  
  // Terrain-specific bonuses
  const terrainBonuses = {
    [BiomeType.ANCIENT_RUINS]: 1.3,
    [BiomeType.MOUNTAIN]: 1.1,
    [BiomeType.MOUNTAIN_PEAK]: 1.15
  };

  const terrainMultiplier = terrainBonuses[terrainType] || 1.0;
  const finalMultiplier = multiplier * terrainMultiplier;

  switch (type) {
    case ItemType.WEAPON:
      return { 
        attack: Math.floor(5 * finalMultiplier + Math.random() * 3)
      };
    case ItemType.ARMOR:
      return { 
        defense: Math.floor(3 * finalMultiplier + Math.random() * 2),
        ...(terrainType === BiomeType.ICE && { coldResistance: Math.floor(2 * multiplier) })
      };
    case ItemType.CONSUMABLE:
      return { 
        hp: Math.floor(20 * finalMultiplier + Math.random() * 10),
        ...(terrainType === BiomeType.FOREST && { naturalHealing: true })
      };
    default:
      return {};
  }
};

// Helper functions from BuildingGenerator (shared functionality)
const selectItemRarity = (weights: Record<string, number>): ItemRarity => {
  if (!weights) return ItemRarity.COMMON;
  
  const totalWeight: number = Object.values(weights).reduce((sum: number, weight: number) => {
    return sum + weight;
  }, 0);
  
  let random = Math.random() * totalWeight;
  
  for (const [rarity, weight] of Object.entries(weights)) {
    random -= weight;
    if (random <= 0) {
      return rarity as ItemRarity;
    }
  }
  
  return ItemRarity.COMMON;
};

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

// Generate loot hotspots for high-value areas
export const generateLootHotspots = (worldWidth: number, worldHeight: number): LootHotspot[] => {
  const hotspots: LootHotspot[] = [];
  const numHotspots = Math.floor((worldWidth * worldHeight) / 200); // One hotspot per ~200 tiles

  for (let i = 0; i < numHotspots; i++) {
    const center = {
      x: Math.floor(Math.random() * worldWidth),
      y: Math.floor(Math.random() * worldHeight)
    };

    const hotspot: LootHotspot = {
      center,
      radius: 3 + Math.floor(Math.random() * 4), // 3-6 tile radius
      bonusMultiplier: 2 + Math.random() * 2, // 2x to 4x spawn rate
      rarityBonus: 0.5 + Math.random() * 0.5 // 50% to 100% rarity boost
    };

    hotspots.push(hotspot);
  }

  return hotspots;
};

export type { LootHotspot };