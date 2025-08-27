import { GameWorld, Player, NPC, Item, Terrain, TerrainType, PlayerClass, ItemType, ItemRarity } from 'shared/src/types/game';
import { GAME_CONFIG } from 'shared/src/constants/gameConstants';

// Mock terrain grid with varied terrain types
const createMockGrid = (): Terrain[][] => {
  const grid: Terrain[][] = [];

  for (let y = 0; y < GAME_CONFIG.gridHeight; y++) {
    grid[y] = [];
    for (let x = 0; x < GAME_CONFIG.gridWidth; x++) {
      let terrainType = TerrainType.PLAIN;

      // Create some patterns for interesting terrain
      if ((x + y) % 7 === 0) {
        terrainType = TerrainType.FOREST;
      } else if (x % 8 === 0 && y % 6 === 0) {
        terrainType = TerrainType.MOUNTAIN;
      }

      const config = GAME_CONFIG.terrainConfig[terrainType];
      grid[y][x] = {
        type: terrainType,
        position: { x, y },
        movementCost: config.movementCost,
        defenseBonus: config.defenseBonus,
        visibilityModifier: config.visibilityModifier
      };
    }
  }

  return grid;
};

// Mock players with different classes
const createMockPlayers = (): Player[] => [
  {
    id: 'player_1',
    twitchUsername: 'gamer123',
    displayName: 'Gamer123',
    avatar: '🤠',
    position: { x: 5, y: 3 },
    class: PlayerClass.KNIGHT,
    stats: {
      hp: 110,
      maxHp: 120,
      attack: 18,
      defense: 25,
      speed: 6
    },
    level: 2,
    experience: 150,
    inventory: [],
    equipment: {},
    achievements: ['first_blood'],
    titles: ['[Warrior]'],
    isAlive: true,
    lastMoveTime: Date.now() - 2000,
    spawnTime: Date.now() - 300000
  },
  {
    id: 'player_2',
    twitchUsername: 'rogueMaster',
    displayName: 'RogueMaster',
    avatar: '🗡️',
    position: { x: 12, y: 8 },
    class: PlayerClass.ROGUE,
    stats: {
      hp: 85,
      maxHp: 90,
      attack: 28,
      defense: 12,
      speed: 16
    },
    level: 3,
    experience: 280,
    inventory: [],
    equipment: {},
    achievements: ['first_blood', 'survivor'],
    titles: ['[Gladiator]', '[Survivor]'],
    isAlive: true,
    lastMoveTime: Date.now() - 5000,
    spawnTime: Date.now() - 450000
  },
  {
    id: 'player_3',
    twitchUsername: 'mageWizard',
    displayName: 'MageWizard',
    avatar: '🔮',
    position: { x: 8, y: 10 },
    class: PlayerClass.MAGE,
    stats: {
      hp: 75,
      maxHp: 80,
      attack: 32,
      defense: 8,
      speed: 11
    },
    level: 1,
    experience: 45,
    inventory: [],
    equipment: {},
    achievements: [],
    titles: [],
    isAlive: true,
    lastMoveTime: Date.now() - 1000,
    spawnTime: Date.now() - 120000
  }
];

// Mock NPCs scattered around the map
const createMockNPCs = (): NPC[] => [
  {
    id: 'goblin_1',
    name: 'Goblin Scout',
    type: 'goblin',
    position: { x: 15, y: 5 },
    stats: {
      hp: 55,
      maxHp: 60,
      attack: 10,
      defense: 6,
      speed: 14
    },
    behavior: 'wandering',
    lootTable: [],
    isAlive: true,
    lastMoveTime: Date.now() - 3000
  },
  {
    id: 'goblin_2',
    name: 'Goblin Warrior',
    type: 'goblin',
    position: { x: 3, y: 12 },
    stats: {
      hp: 70,
      maxHp: 70,
      attack: 15,
      defense: 10,
      speed: 10
    },
    behavior: 'aggressive',
    lootTable: [],
    isAlive: true,
    lastMoveTime: Date.now() - 1500
  },
  {
    id: 'orc_1',
    name: 'Orc Berserker',
    type: 'orc',
    position: { x: 18, y: 14 },
    stats: {
      hp: 100,
      maxHp: 100,
      attack: 20,
      defense: 12,
      speed: 8
    },
    behavior: 'aggressive',
    lootTable: [],
    isAlive: true,
    lastMoveTime: Date.now() - 4000
  }
];

// Mock items scattered around the map
const createMockItems = (): Item[] => [
  {
    id: 'sword_1',
    name: 'Iron Sword',
    type: ItemType.WEAPON,
    rarity: ItemRarity.UNCOMMON,
    description: 'A well-balanced iron sword',
    stats: { attack: 5 },
    position: { x: 7, y: 6 }
  },
  {
    id: 'potion_1',
    name: 'Health Potion',
    type: ItemType.CONSUMABLE,
    rarity: ItemRarity.COMMON,
    description: 'Restores 50 HP',
    stats: { hp: 50 },
    position: { x: 10, y: 9 }
  },
  {
    id: 'shield_1',
    name: 'Wooden Shield',
    type: ItemType.ARMOR,
    rarity: ItemRarity.COMMON,
    description: 'Basic wooden protection',
    stats: { defense: 3 },
    position: { x: 14, y: 11 }
  },
  {
    id: 'boots_1',
    name: 'Swift Boots',
    type: ItemType.ARMOR,
    rarity: ItemRarity.RARE,
    description: 'Increases movement speed',
    stats: { speed: 2 },
    specialEffect: 'increases movement speed',
    position: { x: 2, y: 8 }
  }
];

// Create the complete mock game world
export const createMockGameWorld = (): GameWorld => {
  return {
    id: 'mock_world_1',
    grid: createMockGrid(),
    players: createMockPlayers(),
    npcs: createMockNPCs(),
    items: createMockItems(),
    cataclysmCircle: {
      center: { x: 10, y: 7 },
      radius: 20,
      isActive: false,
      shrinkRate: 1,
      nextShrinkTime: Date.now() + 300000 // 5 minutes from now
    },
    worldAge: 0,
    lastResetTime: Date.now(),
    phase: 'exploration'
  };
};

// Export individual mock data for testing
export const mockGrid = createMockGrid();
export const mockPlayers = createMockPlayers();
export const mockNPCs = createMockNPCs();
export const mockItems = createMockItems();
