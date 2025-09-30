import { GameStateManager } from './gameStateManager';
import { GameWorld, Player, PlayerClass, TerrainType, Position, GAME_CONFIG } from 'shared';
import { createMockGameWorld, createMockPlayer } from '../testUtils/mockGameWorld';

describe('GameStateManager', () => {
  let gameStateManager: GameStateManager;

  beforeEach(() => {
    gameStateManager = new GameStateManager({ generateNPCs: false, worldType: 'test' });
  });

  describe('addPlayer', () => {
    it('should add a player to an empty world', () => {
      const player = createMockPlayer('1', 'testPlayer', { x: 0, y: 0 });
      const result = gameStateManager.addPlayer(player);

      expect(result.success).toBe(true);
      expect(gameStateManager.getPlayers()).toHaveLength(1);
      expect(gameStateManager.getPlayer('1')).toEqual(expect.objectContaining({
        id: '1',
        displayName: 'testPlayer'
      }));
    });

    it('should add multiple players successfully', () => {
      const player1 = createMockPlayer('1', 'player1', { x: 0, y: 0 });
      const player2 = createMockPlayer('2', 'player2', { x: 1, y: 1 });
      
      const result1 = gameStateManager.addPlayer(player1);
      const result2 = gameStateManager.addPlayer(player2);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(gameStateManager.getPlayers()).toHaveLength(2);
    });
  });

  describe('movePlayer', () => {
    it('should allow a player to move to a valid position', () => {
      const player = createMockPlayer('1', 'testPlayer', { x: 5, y: 5 });
      gameStateManager.addPlayer(player);

      const newPosition = { x: 6, y: 5 };
      const result = gameStateManager.movePlayer('1', newPosition);

      expect(result.success).toBe(true);
      const updatedPlayer = gameStateManager.getPlayer('1');
      expect(updatedPlayer?.position).toEqual(newPosition);
    });

    it('should handle movement to invalid positions gracefully', () => {
      const player = createMockPlayer('1', 'testPlayer', { x: 5, y: 5 });
      gameStateManager.addPlayer(player);

      // Try to move outside grid boundaries
      const invalidPosition = { x: -1, y: -1 };
      const result = gameStateManager.movePlayer('1', invalidPosition);

      expect(result.success).toBe(false);
      const player1 = gameStateManager.getPlayer('1');
      expect(player1?.position).toEqual({ x: 5, y: 5 }); // Should remain at original position
    });
  });

  describe('removePlayer', () => {
    it('should remove a player from the game', () => {
      const player = createMockPlayer('1', 'testPlayer', { x: 5, y: 5 });
      gameStateManager.addPlayer(player);
      
      expect(gameStateManager.getPlayers()).toHaveLength(1);
      
      const result = gameStateManager.removePlayer('1');
      
      expect(result.success).toBe(true);
      expect(gameStateManager.getPlayers()).toHaveLength(0);
      expect(gameStateManager.getPlayer('1')).toBeUndefined();
    });
  });

  describe('attackEnemy', () => {
    it('should handle attack commands for valid targets', () => {
      const player = createMockPlayer('1', 'testPlayer', { x: 5, y: 5 });
      gameStateManager.addPlayer(player);

      // Attack a position where no enemy exists
      const targetPosition = { x: 6, y: 5 };
      const result = gameStateManager.attackEnemy('1', targetPosition);

      expect(result.success).toBe(false);
      expect(result.message).toContain('No enemy found');
    });
  });

  describe('game world access', () => {
    it('should provide access to the game world', () => {
      const gameWorld = gameStateManager.getGameWorld();
      
      expect(gameWorld).toBeDefined();
      expect(gameWorld.players).toEqual([]);
      expect(gameWorld.npcs).toEqual([]);
      expect(gameWorld.items).toEqual([]);
    });

    it('should provide world statistics', () => {
      const stats = gameStateManager.getWorldStats();
      
      expect(stats).toBeDefined();
      expect(typeof stats.totalPlayers).toBe('number');
      expect(typeof stats.totalNPCs).toBe('number');
      expect(typeof stats.totalItems).toBe('number');
      expect(typeof stats.totalBuildings).toBe('number');
      expect(typeof stats.worldAge).toBe('number');
      expect(typeof stats.phase).toBe('string');
    });
  });
});
