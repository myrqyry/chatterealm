import { PlayerClass, TerrainType, GameSettings } from '../types/game';

// Game Configuration Constants
export const GAME_CONFIG: GameSettings = {
  gridWidth: 20,
  gridHeight: 15,
  tileSize: 32, // Standard tile size in pixels for UI rendering (increased from 20px for larger canvas)
  maxPlayers: 50,
  cataclysmDuration: 300000, // 5 minutes in milliseconds
  spawnCost: 100, // channel points to spawn
  autoWanderCost: 50, // channel points for auto-wander
  baseStats: {
    [PlayerClass.KNIGHT]: {
      hp: 120,
      maxHp: 120,
      attack: 15,
      defense: 20,
      speed: 8
    },
    [PlayerClass.ROGUE]: {
      hp: 90,
      maxHp: 90,
      attack: 25,
      defense: 10,
      speed: 15
    },
    [PlayerClass.MAGE]: {
      hp: 80,
      maxHp: 80,
      attack: 30,
      defense: 5,
      speed: 10
    }
  },
  terrainConfig: {
    [TerrainType.PLAIN]: {
      movementCost: 1,
      defenseBonus: 0,
      visibilityModifier: 0,
      spawnChance: 0.6
    },
    [TerrainType.FOREST]: {
      movementCost: 2,
      defenseBonus: 5,
      visibilityModifier: -2,
      spawnChance: 0.25
    },
    [TerrainType.MOUNTAIN]: {
      movementCost: 3,
      defenseBonus: 15,
      visibilityModifier: 3,
      spawnChance: 0.15
    },
    // New terrain types with placeholder values
    [TerrainType.WATER]: {
      movementCost: 1.5,
      defenseBonus: 0,
      visibilityModifier: 0,
      spawnChance: 0.0
    },
    [TerrainType.OCEAN]: {
      movementCost: 2.0,
      defenseBonus: 0,
      visibilityModifier: 0,
      spawnChance: 0.0
    },
    [TerrainType.RIVER]: {
      movementCost: 1.2,
      defenseBonus: 0,
      visibilityModifier: 0,
      spawnChance: 0.0
    },
    [TerrainType.MOUNTAIN_PEAK]: {
      movementCost: 4,
      defenseBonus: 20,
      visibilityModifier: 4,
      spawnChance: 0.05
    },
    [TerrainType.HILLS]: {
      movementCost: 1.2,
      defenseBonus: 2,
      visibilityModifier: 0,
      spawnChance: 0.2
    },
    [TerrainType.SNOW]: {
      movementCost: 1.8,
      defenseBonus: 5,
      visibilityModifier: -1,
      spawnChance: 0.0
    },
    [TerrainType.ICE]: {
      movementCost: 2.5,
      defenseBonus: 0,
      visibilityModifier: -1.5,
      spawnChance: 0.0
    },
    [TerrainType.SNOWY_HILLS]: {
      movementCost: 2.0,
      defenseBonus: 7,
      visibilityModifier: 0,
      spawnChance: 0.1
    },
    [TerrainType.DUNES]: {
      movementCost: 1.5,
      defenseBonus: 0,
      visibilityModifier: 0.5,
      spawnChance: 0.05
    },
    [TerrainType.OASIS]: {
      movementCost: 1.0,
      defenseBonus: 1,
      visibilityModifier: 0,
      spawnChance: 0.01
    },
    [TerrainType.SAND]: {
      movementCost: 1.3,
      defenseBonus: 0,
      visibilityModifier: 0.3,
      spawnChance: 0.1
    },
    [TerrainType.DENSE_JUNGLE]: {
      movementCost: 3.0,
      defenseBonus: 10,
      visibilityModifier: -3,
      spawnChance: 0.05
    },
    [TerrainType.JUNGLE]: {
      movementCost: 2.5,
      defenseBonus: 8,
      visibilityModifier: -2.5,
      spawnChance: 0.1
    },
    [TerrainType.DEEP_WATER]: {
      movementCost: 3.0,
      defenseBonus: 0,
      visibilityModifier: -1,
      spawnChance: 0.0
    },
    [TerrainType.MARSH]: {
      movementCost: 2.0,
      defenseBonus: 3,
      visibilityModifier: -1,
      spawnChance: 0.05
    },
    [TerrainType.SWAMP]: {
      movementCost: 2.2,
      defenseBonus: 5,
      visibilityModifier: -1.5,
      spawnChance: 0.05
    },
    [TerrainType.DENSE_FOREST]: {
      movementCost: 2.8,
      defenseBonus: 12,
      visibilityModifier: -2.5,
      spawnChance: 0.1
    },
    [TerrainType.CLEARING]: {
      movementCost: 1.0,
      defenseBonus: 0,
      visibilityModifier: 0,
      spawnChance: 0.1
    },
    [TerrainType.ROLLING_HILLS]: {
      movementCost: 1.3,
      defenseBonus: 3,
      visibilityModifier: 0,
      spawnChance: 0.15
    },
    [TerrainType.FLOWER_FIELD]: {
      movementCost: 1.0,
      defenseBonus: 1,
      visibilityModifier: 0,
      spawnChance: 0.02
    },
    [TerrainType.GRASSLAND]: {
      movementCost: 1.0,
      defenseBonus: 0,
      visibilityModifier: 0,
      spawnChance: 0.3
    },
    [TerrainType.ROUGH_TERRAIN]: {
      movementCost: 2.0,
      defenseBonus: 5,
      visibilityModifier: 0,
      spawnChance: 0.08
    },
    [TerrainType.ANCIENT_RUINS]: {
      movementCost: 1.5,
      defenseBonus: 8,
      visibilityModifier: 1,
      spawnChance: 0.03
    }
  }
};

// Game Balance Constants
export const COMBAT_CONSTANTS = {
  BASE_DAMAGE_MULTIPLIER: 1.2,
  CRITICAL_HIT_CHANCE: 0.1,
  CRITICAL_DAMAGE_MULTIPLIER: 2.0,
  MIN_DAMAGE: 5,
  MAX_DAMAGE: 50,
  EXPERIENCE_PER_LEVEL: 100,
  LEVEL_SCALING_FACTOR: 1.15
};

export const MOVEMENT_CONSTANTS = {
  BASE_MOVE_COOLDOWN: 1000, // 1 second
  AUTO_WANDER_INTERVAL: 5000, // 5 seconds
  MAX_MOVE_DISTANCE: 1,
  MAX_ADJACENT_MOUNTAINS: 2 // Maximum number of adjacent mountain tiles for a valid spawn position
};

export const WORLD_CONSTANTS = {
  NPC_SPAWN_CHANCE: 0.02,
  ITEM_DROP_CHANCE: 0.15,
  WORLD_RESET_DURATION: 30000, // 30 seconds
  MAX_ITEMS_PER_TILE: 3,
  CATACLYSM_SHRINK_RATE: 0.5, // tiles per minute
  EXTREMELY_MOUNTAIN_THRESHOLD: 70 // Threshold (percentage) above which map is considered extremely mountainous for spawn fallback
};

// Class-specific abilities and descriptions
export const CLASS_INFO = {
  [PlayerClass.KNIGHT]: {
    name: 'Knight',
    description: 'High defense and HP, excels at tanking damage',
    abilities: ['Shield Bash', 'Taunt', 'Heavy Armor'],
    emoji: '⚔️'
  },
  [PlayerClass.ROGUE]: {
    name: 'Rogue',
    description: 'High attack and speed, masters of quick strikes',
    abilities: ['Backstab', 'Stealth', 'Poison Blade'],
    emoji: '🗡️'
  },
  [PlayerClass.MAGE]: {
    name: 'Mage',
    description: 'High magic damage, controls the battlefield',
    abilities: ['Fireball', 'Teleport', 'Heal'],
    emoji: '🔮'
  }
};

// Item rarity colors for UI
export const RARITY_COLORS = {
  common: '#9CA3AF',
  uncommon: '#10B981',
  rare: '#3B82F6',
  epic: '#8B5CF6',
  legendary: '#F59E0B'
};

// Chat command prefixes
export const CHAT_COMMANDS = {
  SPAWN: '!spawn',
  MOVE: '!move',
  CLAIM: '!claim',
  STATUS: '!status',
  INVENTORY: '!inv',
  HELP: '!help',
  WANDER: '!wander'
};

// Terrain emojis for visual representation
export const TERRAIN_EMOJIS = {
  [TerrainType.PLAIN]: '🌱',
  [TerrainType.FOREST]: '🌲',
  [TerrainType.MOUNTAIN]: '⛰️',
  [TerrainType.WATER]: '🌊',
  [TerrainType.OCEAN]: ' OCEANA',
  [TerrainType.RIVER]: 'RIVER',
  [TerrainType.MOUNTAIN_PEAK]: 'MOUNTAIN_PEAK',
  [TerrainType.HILLS]: 'HILLS',
  [TerrainType.SNOW]: 'SNOW',
  [TerrainType.ICE]: 'ICE',
  [TerrainType.SNOWY_HILLS]: 'SNOWY_HILLS',
  [TerrainType.DUNES]: 'DUNES',
  [TerrainType.OASIS]: 'OASIS',
  [TerrainType.SAND]: 'SAND',
  [TerrainType.DENSE_JUNGLE]: 'DENSE_JUNGLE',
  [TerrainType.JUNGLE]: 'JUNGLE',
  [TerrainType.DEEP_WATER]: 'DEEP_WATER',
  [TerrainType.MARSH]: 'MARSH',
  [TerrainType.SWAMP]: 'SWAMP',
  [TerrainType.DENSE_FOREST]: 'DENSE_FOREST',
  [TerrainType.CLEARING]: 'CLEARING',
  [TerrainType.ROLLING_HILLS]: 'ROLLING_HILLS',
  [TerrainType.FLOWER_FIELD]: 'FLOWER_FIELD',
  [TerrainType.GRASSLAND]: 'GRASSLAND',
  [TerrainType.ROUGH_TERRAIN]: 'ROUGH_TERRAIN',
  [TerrainType.ANCIENT_RUINS]: 'ANCIENT_RUINS',
};

// Achievement definitions
export const ACHIEVEMENTS = {
  FIRST_BLOOD: {
    id: 'first_blood',
    name: 'First Blood',
    description: 'Win your first battle',
    title: '[Warrior]'
  },
  SURVIVOR: {
    id: 'survivor',
    name: 'Survivor',
    description: 'Survive a cataclysm',
    title: '[Survivor]'
  },
  GLADIATOR: {
    id: 'gladiator',
    name: 'Gladiator',
    description: 'Win 10 battles',
    title: '[Gladiator]'
  },
  EXPLORER: {
    id: 'explorer',
    name: 'Explorer',
    description: 'Visit every terrain type',
    title: '[Explorer]'
  }
};

// Default world configuration
export const DEFAULT_WORLD_CONFIG = {
  cataclysmCircle: {
    center: { x: 10, y: 7 }, // center of 20x15 grid
    radius: 20,
    isActive: false,
    shrinkRate: 1,
    nextShrinkTime: 0
  },
  worldAge: 0,
  lastResetTime: Date.now(),
  phase: 'exploration' as const
};
