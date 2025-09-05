import { GameStateManager } from '../gameStateManager';
import { GameWorld, Player, TerrainType, PlayerClass, Position } from 'shared/src/types/game';
import { GAME_CONFIG } from 'shared/src/constants';
import { createMockGameWorld, createMockPlayer } from '../../testUtils/mockGameWorld';

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
