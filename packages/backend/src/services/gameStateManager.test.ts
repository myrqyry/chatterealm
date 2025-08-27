import { GameStateManager } from './gameStateManager';
import { GameWorld, Player, PlayerClass, TerrainType, Position } from 'shared/src/types/game';
import { GAME_CONFIG } from 'shared/src/constants/gameConstants';

// Mock the GameWorld for testing
const createMockGameWorld = (): GameWorld => {
  const grid = Array(GAME_CONFIG.gridHeight).fill(null).map(() =>
    Array(GAME_CONFIG.gridWidth).fill(null).map(() => ({
      type: TerrainType.PLAIN,
      position: { x: 0, y: 0 },
      movementCost: 1,
      defenseBonus: 0,
      visibilityModifier: 1,
    }))
  );

  for (let y = 0; y < GAME_CONFIG.gridHeight; y++) {
    for (let x = 0; x < GAME_CONFIG.gridWidth; x++) {
      grid[y][x].position = { x, y };
    }
  }

  return {
    id: 'test-world',
    worldAge: 0,
    lastResetTime: 0,
    phase: 'exploration',
    players: [],
    npcs: [],
    items: [],
    grid,
    cataclysmCircle: {
      isActive: false,
      center: { x: 50, y: 50 },
      radius: 50,
      shrinkRate: 1,
      nextShrinkTime: 0,
    },
  };
};

const createMockPlayer = (id: string, displayName: string, position: Position): Player => ({
  id,
  displayName,
  twitchUsername: displayName,
  avatar: '👤',
  position,
  class: PlayerClass.KNIGHT,
  health: 100,
  mana: 100,
  stamina: 100,
  hunger: 100,
  thirst: 100,
  stats: { hp: 100, maxHp: 100, attack: 10, defense: 5, speed: 5 },
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

describe('GameStateManager', () => {
  let gameStateManager: GameStateManager;
  let gameWorld: GameWorld;

  beforeEach(() => {
    gameWorld = createMockGameWorld();
    gameStateManager = new GameStateManager(gameWorld);
  });

  describe('addPlayer', () => {
    it('should add a player to an empty world and update occupied positions', () => {
      const player = createMockPlayer('1', 'testPlayer', { x: 0, y: 0 });
      const result = gameStateManager.addPlayer(player);

      expect(result.success).toBe(true);
      expect(gameWorld.players).toHaveLength(1);
      expect(gameWorld.players[0]).toEqual(player);
      // @ts-ignore - private property access for testing
      expect(gameStateManager.occupiedPositions.has(`${player.position.x},${player.position.y}`)).toBe(true);
    });

    it('should not add a player if no spawn position is available', () => {
      // Fill the entire grid
      for (let y = 0; y < GAME_CONFIG.gridHeight; y++) {
        for (let x = 0; x < GAME_CONFIG.gridWidth; x++) {
          const p = createMockPlayer(`p_${x}_${y}`, `p_${x}_${y}`, { x, y });
          gameStateManager.addPlayer(p);
        }
      }

      const extraPlayer = createMockPlayer('extra', 'extraPlayer', { x: 0, y: 0 });
      const result = gameStateManager.addPlayer(extraPlayer);

      expect(result.success).toBe(false);
      expect(result.message).toBe('No available spawn position');
    });
  });

  describe('movePlayer', () => {
    it('should allow a player to move to an empty space and update occupied positions', () => {
      const player = createMockPlayer('1', 'testPlayer', { x: 5, y: 5 });
      gameStateManager.addPlayer(player);

      const oldPositionKey = '5,5';
      const newPositionKey = '5,6';

      // @ts-ignore
      expect(gameStateManager.occupiedPositions.has(oldPositionKey)).toBe(true);
      // @ts-ignore
      expect(gameStateManager.occupiedPositions.has(newPositionKey)).toBe(false);

      const result = gameStateManager.movePlayer('1', 'down');

      expect(result.success).toBe(true);
      expect(player.position).toEqual({ x: 5, y: 6 });
      // @ts-ignore
      expect(gameStateManager.occupiedPositions.has(oldPositionKey)).toBe(false);
      // @ts-ignore
      expect(gameStateManager.occupiedPositions.has(newPositionKey)).toBe(true);
    });

    it('should not allow a player to move to an occupied space', () => {
      const player1 = createMockPlayer('1', 'player1', { x: 5, y: 5 });
      const player2 = createMockPlayer('2', 'player2', { x: 5, y: 6 });
      gameStateManager.addPlayer(player1);
      gameStateManager.addPlayer(player2);

      const result = gameStateManager.movePlayer('1', 'down');

      expect(result.success).toBe(false);
      expect(result.message).toContain('Position occupied');
      expect(player1.position).toEqual({ x: 5, y: 5 });
      // @ts-ignore
      expect(gameStateManager.occupiedPositions.has('5,5')).toBe(true);
      // @ts-ignore
      expect(gameStateManager.occupiedPositions.has('5,6')).toBe(true);
    });
  });
});
