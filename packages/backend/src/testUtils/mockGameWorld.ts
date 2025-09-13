import { GameWorld, TerrainType, PlayerClass, Player, GAME_CONFIG } from 'shared';

export const createMockGameWorld = (gridWidth: number, gridHeight: number): GameWorld => {
  const grid: TerrainType[][] = [];
  for (let y = 0; y < gridHeight; y++) {
    grid[y] = [];
    for (let x = 0; x < gridWidth; x++) {
      grid[y][x] = TerrainType.PLAIN;
    }
  }

  return {
    id: 'mock_world',
    grid: grid.map((row, y) => row.map((type, x) => ({
      type,
      position: { x, y },
      movementCost: 1,
      defenseBonus: 0,
      visibilityModifier: 1,
    }))),
    players: [],
    npcs: [],
    items: [],
    cataclysmCircle: {
      center: { x: Math.floor(gridWidth / 2), y: Math.floor(gridHeight / 2) },
      radius: Math.max(gridWidth, gridHeight),
      isActive: false,
      shrinkRate: 1,
      nextShrinkTime: 0,
    },
    cataclysmRoughnessMultiplier: 1.0,
    worldAge: 0,
    lastResetTime: Date.now(),
    phase: 'exploration',
  };
};

export const createMockPlayer = (id: string, displayName: string, position: { x: number, y: number } = { x: 0, y: 0 }): Player => ({
  id,
  displayName,
  twitchUsername: `twitch_${id}`,
  avatar: '👤',
  position,
  class: PlayerClass.KNIGHT,
  health: 100,
  mana: 100,
  stamina: 100,
  hunger: 100,
  thirst: 100,
  stats: {
    hp: 100,
    maxHp: 100,
    attack: 10,
    defense: 5,
    speed: 5,
  },
  level: 1,
  experience: 0,
  inventory: [],
  equipment: {},
  achievements: [],
  titles: [],
  isAlive: true,
  lastMoveTime: 0,
  spawnTime: Date.now(),
  connected: true,
  lastActive: Date.now(),
});
