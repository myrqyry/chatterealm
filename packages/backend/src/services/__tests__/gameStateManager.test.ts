import { GameStateManager } from '../gameStateManager';
import { GameWorld, Player, TerrainType, PlayerClass, Position } from 'shared/src/types/game';
import { GAME_CONFIG } from 'shared/src/constants';

// Mock the GameWorld for testing
const createMockGameWorld = (gridWidth: number, gridHeight: number): GameWorld => {
  const grid = Array.from({ length: gridHeight }, (_, y) =>
    Array.from({ length: gridWidth }, (_, x) => ({
      type: TerrainType.PLAIN,
      position: { x, y },
      movementCost: 1,
      defenseBonus: 0,
      visibilityModifier: 1,
    }))
  );

  return {
    id: 'test-world',
    grid,
    players: [],
    npcs: [],
    items: [],
    cataclysmCircle: {
      center: { x: Math.floor(gridWidth / 2), y: Math.floor(gridHeight / 2) },
      radius: 100,
      isActive: false,
      shrinkRate: 1,
      nextShrinkTime: 0,
    },
    worldAge: 0,
    lastResetTime: Date.now(),
    phase: 'exploration',
  };
};

const createMockPlayer = (id: string, displayName: string, position: Position = { x: -1, y: -1 }): Player => ({
  id,
  twitchUsername: id,
  displayName,
  avatar: '🤖',
  position,
  class: PlayerClass.KNIGHT,
  health: 100,
  mana: 50,
  stamina: 100,
  hunger: 100,
  thirst: 100,
  stats: {
    hp: 100,
    maxHp: 100,
    attack: 10,
    defense: 5,
    speed: 2,
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

describe('GameStateManager', () => {
  let gameStateManager: GameStateManager;
  let gameWorld: GameWorld;

  beforeEach(() => {
    // We need to override the GAME_CONFIG for testing purposes
    Object.assign(GAME_CONFIG, { gridWidth: 10, gridHeight: 10 });
    gameWorld = createMockGameWorld(GAME_CONFIG.gridWidth, GAME_CONFIG.gridHeight);
    gameStateManager = new GameStateManager(gameWorld);
  });

  describe('addPlayer', () => {
    it('should add a player to an empty world and assign a valid position', () => {
      const player = createMockPlayer('player1', 'Player One');
      const result = gameStateManager.addPlayer(player);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Player Player One joined the game');
      expect(gameWorld.players.length).toBe(1);
      expect(gameWorld.players[0]).toEqual(player);
      expect(player.position.x).not.toBe(-1);
      expect(player.position.y).not.toBe(-1);

      const posKey = `${player.position.x},${player.position.y}`;
      // @ts-ignore - occupiedPositions is private, but we need to test it
      expect(gameStateManager.occupiedPositions.has(posKey)).toBe(true);
    });

    it('should fail to add a player with a duplicate ID', () => {
      const player1 = createMockPlayer('player1', 'Player One');
      gameStateManager.addPlayer(player1);

      const player2 = createMockPlayer('player1', 'Player One Duplicate');
      const result = gameStateManager.addPlayer(player2);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Player already exists');
      expect(gameWorld.players.length).toBe(1);
    });

    it('should fail to add a player when the world is full', () => {
        // Fill the world with players
        for (let i = 0; i < GAME_CONFIG.gridWidth * GAME_CONFIG.gridHeight; i++) {
            const player = createMockPlayer(`player${i}`, `Player ${i}`);
            // Manually add players to avoid spawn logic for this test setup
            const x = i % GAME_CONFIG.gridWidth;
            const y = Math.floor(i / GAME_CONFIG.gridWidth);
            player.position = { x, y };
            gameWorld.players.push(player);
            // @ts-ignore
            gameStateManager.occupiedPositions.add(`${x},${y}`);
        }

        const extraPlayer = createMockPlayer('extra', 'Extra Player');
        const result = gameStateManager.addPlayer(extraPlayer);

        expect(result.success).toBe(false);
        expect(result.message).toBe('No available spawn position');
    });
  });

  describe('removePlayer', () => {
    it('should remove an existing player from the world', () => {
      const player = createMockPlayer('player1', 'Player One');
      gameStateManager.addPlayer(player);
      const { position } = player;

      const result = gameStateManager.removePlayer('player1');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Player Player One left the game');
      expect(gameWorld.players.length).toBe(0);

      const posKey = `${position.x},${position.y}`;
      // @ts-ignore
      expect(gameStateManager.occupiedPositions.has(posKey)).toBe(false);
    });

    it('should fail to remove a non-existent player', () => {
      const result = gameStateManager.removePlayer('nonexistent');
      expect(result.success).toBe(false);
      expect(result.message).toBe('Player not found');
    });
  });
});
