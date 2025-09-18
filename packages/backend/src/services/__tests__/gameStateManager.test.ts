import { GameStateManager } from '../gameStateManager';
import { GameWorld, Player, TerrainType, PlayerClass, Position, GAME_CONFIG } from 'shared';
import { createMockGameWorld, createMockPlayer } from '../../testUtils/mockGameWorld';

describe('GameStateManager', () => {
  let gameStateManager: GameStateManager;

  beforeEach(() => {
    gameStateManager = new GameStateManager();
  });

  describe('addPlayer', () => {
    it('should add a player to an empty world and assign a valid position', () => {
      const player = createMockPlayer('player1', 'Player One');
      const result = gameStateManager.addPlayer(player);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Player Player One joined the game.');
      expect(gameStateManager.getPlayers().length).toBe(1);
      expect(gameStateManager.getPlayer('player1')).toEqual(expect.objectContaining({
        id: 'player1',
        displayName: 'Player One'
      }));
    });

    it('should add multiple players successfully', () => {
      const player1 = createMockPlayer('player1', 'Player One');
      const player2 = createMockPlayer('player2', 'Player Two');
      
      const result1 = gameStateManager.addPlayer(player1);
      const result2 = gameStateManager.addPlayer(player2);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(gameStateManager.getPlayers().length).toBe(2);
    });
  });

  describe('removePlayer', () => {
    it('should remove an existing player from the world', () => {
      const player = createMockPlayer('player1', 'Player One');
      gameStateManager.addPlayer(player);

      const result = gameStateManager.removePlayer('player1');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Player removed from game.');
      expect(gameStateManager.getPlayers().length).toBe(0);
      expect(gameStateManager.getPlayer('player1')).toBeUndefined();
    });

    it('should fail to remove a non-existent player', () => {
      const result = gameStateManager.removePlayer('nonexistent');
      expect(result.success).toBe(false);
      expect(result.message).toBe('Player not found.');
    });
  });
});
