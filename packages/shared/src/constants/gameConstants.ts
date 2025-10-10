import { PlayerClass, GameSettings } from '../types/game';
import { BiomeType } from '../types/biomes';

// Game Configuration Constants
export const GAME_CONFIG: GameSettings = {
  gridWidth: 20,
  gridHeight: 15,
  tileSize: 32, // Standard tile size in pixels for UI rendering (increased from 20px for larger canvas)
  maxPlayers: 50,
  cataclysmDuration: 300000, // 5 minutes in milliseconds
  spawnCost: 100, // channel points to spawn
  autoWanderCost: 50, // channel points for auto-wander
  nightMode: false, // Default to day mode
  // Tarkov-style looting settings
  lootingEnabled: true,
  itemRevealTimes: {
    common: 2000, // 2 seconds
    uncommon: 4000, // 4 seconds
    rare: 8000, // 8 seconds
    epic: 15000, // 15 seconds
    legendary: 30000 // 30 seconds
  },
  maxItemsPerTile: 4, // Increased from 3
  itemSpawnRate: 0.20, // Increased from 0.15 (20% chance when terrain regenerates)
  lootInteractionRadius: 1, // Adjacent tiles
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
    [BiomeType.PLAIN]: { movementCost: 1, defenseBonus: 0, visibilityModifier: 0, spawnChance: 0.3 },
    [BiomeType.FOREST]: { movementCost: 2, defenseBonus: 5, visibilityModifier: -2, spawnChance: 0.18 },
    [BiomeType.MOUNTAIN]: { movementCost: 3, defenseBonus: 15, visibilityModifier: 3, spawnChance: 0.1 },
    [BiomeType.WATER]: { movementCost: 1.5, defenseBonus: 0, visibilityModifier: 0, spawnChance: 0.05 },
    [BiomeType.OCEAN]: { movementCost: 2.0, defenseBonus: 0, visibilityModifier: 0, spawnChance: 0.02 },
    [BiomeType.RIVER]: { movementCost: 1.2, defenseBonus: 0, visibilityModifier: 0, spawnChance: 0.03 },
    [BiomeType.MOUNTAIN_PEAK]: { movementCost: 4, defenseBonus: 20, visibilityModifier: 4, spawnChance: 0.02 },
    [BiomeType.HILLS]: { movementCost: 1.2, defenseBonus: 2, visibilityModifier: 0, spawnChance: 0.08 },
    [BiomeType.SNOW]: { movementCost: 1.8, defenseBonus: 5, visibilityModifier: -1, spawnChance: 0.01 },
    [BiomeType.ICE]: { movementCost: 2.5, defenseBonus: 0, visibilityModifier: -1.5, spawnChance: 0.01 },
    [BiomeType.SNOWY_HILLS]: { movementCost: 2.0, defenseBonus: 7, visibilityModifier: 0, spawnChance: 0.03 },
    [BiomeType.DUNES]: { movementCost: 1.5, defenseBonus: 0, visibilityModifier: 0.5, spawnChance: 0.02 },
    [BiomeType.OASIS]: { movementCost: 1.0, defenseBonus: 1, visibilityModifier: 0, spawnChance: 0.005 },
    [BiomeType.SAND]: { movementCost: 1.3, defenseBonus: 0, visibilityModifier: 0.3, spawnChance: 0.04 },
    [BiomeType.DENSE_JUNGLE]: { movementCost: 3.0, defenseBonus: 10, visibilityModifier: -3, spawnChance: 0.02 },
    [BiomeType.JUNGLE]: { movementCost: 2.5, defenseBonus: 8, visibilityModifier: -2.5, spawnChance: 0.04 },
    [BiomeType.DEEP_WATER]: { movementCost: 3.0, defenseBonus: 0, visibilityModifier: -1, spawnChance: 0.01 },
    [BiomeType.MARSH]: { movementCost: 2.0, defenseBonus: 3, visibilityModifier: -1, spawnChance: 0.02 },
    [BiomeType.SWAMP]: { movementCost: 2.2, defenseBonus: 5, visibilityModifier: -1.5, spawnChance: 0.02 },
    [BiomeType.DENSE_FOREST]: { movementCost: 2.8, defenseBonus: 12, visibilityModifier: -2.5, spawnChance: 0.03 },
    [BiomeType.CLEARING]: { movementCost: 1.0, defenseBonus: 0, visibilityModifier: 0, spawnChance: 0.02 },
    [BiomeType.ROLLING_HILLS]: { movementCost: 1.3, defenseBonus: 3, visibilityModifier: 0, spawnChance: 0.06 },
    [BiomeType.FLOWER_FIELD]: { movementCost: 1.0, defenseBonus: 1, visibilityModifier: 0, spawnChance: 0.01 },
    [BiomeType.GRASSLAND]: { movementCost: 1.0, defenseBonus: 0, visibilityModifier: 0, spawnChance: 0.08 },
    [BiomeType.ROUGH_TERRAIN]: { movementCost: 2.0, defenseBonus: 5, visibilityModifier: 0, spawnChance: 0.03 },
    [BiomeType.ANCIENT_RUINS]: { movementCost: 1.5, defenseBonus: 8, visibilityModifier: 1, spawnChance: 0.008 },
    [BiomeType.DESERT]: { movementCost: 1.5, defenseBonus: 0, visibilityModifier: 2, spawnChance: 0.02 },
    [BiomeType.WASTELAND]: { movementCost: 2.5, defenseBonus: 2, visibilityModifier: 1, spawnChance: 0.01 },
    [BiomeType.TOXIC_ZONE]: { movementCost: 3, defenseBonus: -5, visibilityModifier: -1, spawnChance: 0.005 },
    [BiomeType.RADIATION_FIELD]: { movementCost: 3, defenseBonus: -5, visibilityModifier: -1, spawnChance: 0.005 },
    [BiomeType.CRYSTAL_GARDEN]: { movementCost: 1.5, defenseBonus: 5, visibilityModifier: 2, spawnChance: 0.001 },
    [BiomeType.URBAN_RUINS]: { movementCost: 1.8, defenseBonus: 3, visibilityModifier: 0, spawnChance: 0.008 },
    [BiomeType.INFECTED_NORMAL]: { movementCost: 2, defenseBonus: 0, visibilityModifier: -1, spawnChance: 0.01 },
    [BiomeType.INFECTED_HEAVY]: { movementCost: 2.5, defenseBonus: -2, visibilityModifier: -2, spawnChance: 0.005 },
    [BiomeType.INFECTED_CORE]: { movementCost: 4, defenseBonus: -10, visibilityModifier: -3, spawnChance: 0.001 },
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
  NPC_SPAWN_CHANCE: 0.025, // Increased from 0.02
  ITEM_DROP_CHANCE: 0.18, // Increased from 0.15
  WORLD_RESET_DURATION: 30000, // 30 seconds
  MAX_ITEMS_PER_TILE: 4, // Increased from 3
  CATACLYSM_SHRINK_RATE: 0.5, // tiles per minute
  BUILDING_LOOT_BONUS: 1.5, // Multiplier for loot found in buildings
  TERRAIN_LOOT_QUALITY_ZONES: true, // Enable quality zone system
  HOTSPOT_LOOT_MULTIPLIER: 2.5, // Multiplier for loot hotspots
  CATACLYSM_LOOT_BONUS: 2.0, // Enhanced loot in cataclysm zones
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
  [BiomeType.PLAIN]: '🌱',
  [BiomeType.FOREST]: '🌲',
  [BiomeType.MOUNTAIN]: '⛰️',
  [BiomeType.WATER]: '🌊',
  [BiomeType.OCEAN]: '🌊',
  [BiomeType.RIVER]: '💧',
  [BiomeType.MOUNTAIN_PEAK]: '🏔️',
  [BiomeType.HILLS]: '🌄',
  [BiomeType.SNOW]: '❄️',
  [BiomeType.ICE]: '🧊',
  [BiomeType.SNOWY_HILLS]: '🌨️',
  [BiomeType.DUNES]: '🏜️',
  [BiomeType.OASIS]: '🏝️',
  [BiomeType.SAND]: '🏖️',
  [BiomeType.DENSE_JUNGLE]: '🌳',
  [BiomeType.JUNGLE]: '🌴',
  [BiomeType.DEEP_WATER]: '🌊',
  [BiomeType.MARSH]: '🐸',
  [BiomeType.SWAMP]: '🐊',
  [BiomeType.DENSE_FOREST]: '🌲',
  [BiomeType.CLEARING]: '☀️',
  [BiomeType.ROLLING_HILLS]: '🏞️',
  [BiomeType.FLOWER_FIELD]: '🌸',
  [BiomeType.GRASSLAND]: '🌾',
  [BiomeType.ROUGH_TERRAIN]: '🪨',
  [BiomeType.ANCIENT_RUINS]: '🏺',
  [BiomeType.DESERT]: '🌵',
  [BiomeType.WASTELAND]: '☢️',
  [BiomeType.TOXIC_ZONE]: '☣️',
  [BiomeType.RADIATION_FIELD]: '☢️',
  [BiomeType.CRYSTAL_GARDEN]: '💎',
  [BiomeType.URBAN_RUINS]: '🏚️',
  [BiomeType.INFECTED_NORMAL]: '🤢',
  [BiomeType.INFECTED_HEAVY]: '🤮',
  [BiomeType.INFECTED_CORE]: '💀',
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
    center: { x: 10, y: 8 }, // center of 20x15 grid
    radius: 20,
    isActive: false,
    shrinkRate: 1,
    nextShrinkTime: 0
  },
  worldAge: 0,
  lastResetTime: Date.now(),
  phase: 'exploration' as const
};

export const ENHANCED_RENDER_CONFIG = {
  animation: {
    enabled: true,
    frameRate: 60,
    breathingIntensity: 0.1,
    colorPulseSpeed: 0.02
  },
  performance: {
    maxBiomesPerFrame: 50,
    textureDetailDistance: 200,
    animationDistance: 300
  },
  quality: {
    roughnessQuality: 'high' as 'low' | 'medium' | 'high',
    textureDetail: 'medium' as 'low' | 'medium' | 'high',
    antiAliasing: true
  }
};