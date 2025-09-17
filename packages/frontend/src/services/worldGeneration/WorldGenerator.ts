import { GameWorld, ItemType, ItemRarity } from '../../../../shared/src/types/game';
import { WORLD_WIDTH, WORLD_HEIGHT } from './WorldTypes';
import { generateTerrain } from './TerrainGenerator';
import { generateBuildings } from './BuildingGenerator';

export const createMockGameWorld = (): GameWorld => {
  const grid: any[][] = [];

  for (let y = 0; y < WORLD_HEIGHT; y++) {
    grid[y] = [];
    for (let x = 0; x < WORLD_WIDTH; x++) {
      grid[y][x] = generateTerrain(x, y);
    }
  }

  const buildings = generateBuildings(grid, WORLD_WIDTH, WORLD_HEIGHT);

  return {
    id: 'mock_world_1',
    grid,
    players: [{
      id: 'player1',
      twitchUsername: 'testuser',
      displayName: 'Test User',
      avatar: '🤠',
      position: { x: 5, y: 5 },
      class: 'knight' as any,
      health: 100,
      mana: 50,
      stamina: 100,
      hunger: 100,
      thirst: 100,
      stats: { hp: 100, maxHp: 120, attack: 15, defense: 20, speed: 8 },
      level: 1,
      experience: 0,
      inventory: [],
      equipment: {},
      achievements: [],
      titles: [],
      isAlive: true,
      lastMoveTime: Date.now(),
      spawnTime: Date.now(),
      connected: true,
      lastActive: Date.now()
    }],
    npcs: [{
      id: 'goblin1',
      name: 'Goblin Scout',
      type: 'goblin',
      position: { x: 12, y: 8 },
      stats: { hp: 60, maxHp: 60, attack: 10, defense: 6, speed: 14 },
      behavior: 'wandering',
      lootTable: [],
      isAlive: true,
      lastMoveTime: Date.now()
    }],
    items: [{
      id: 'sword1',
      name: 'Iron Sword',
      type: ItemType.WEAPON,
      rarity: ItemRarity.UNCOMMON,
      description: 'A well-balanced iron sword',
      stats: { attack: 5 },
      position: { x: 8, y: 6 },
      isHidden: false,
      revealDuration: 0,
      revealProgress: 1.0,
      canBeLooted: true
    }],
    buildings,
    cataclysmCircle: {
  center: { x: 20, y: 15 },
  radius: 40,
      isActive: false,
      shrinkRate: 1,
      nextShrinkTime: Date.now() + 300000
    },
    cataclysmRoughnessMultiplier: 1.0,
    worldAge: 0,
    lastResetTime: Date.now(),
    phase: 'exploration'
  };
};