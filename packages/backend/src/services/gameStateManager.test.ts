import { GameStateManager } from './gameStateManager';
import { GameWorld, Player, PlayerClass, BiomeType, Position, GAME_CONFIG } from 'shared';
import { createMockGameWorld, createMockPlayer } from '../testUtils/mockGameWorld';

describe('GameStateManager', () => {
  let gameStateManager: GameStateManager;

  beforeEach(() => {
    gameStateManager = new GameStateManager({ options: { generateNPCs: false, worldType: 'test' } });
  });

  describe('game world access', () => {
    it('should provide access to the game world', () => {
      const gameWorld = gameStateManager.getGameWorld();
      
      expect(gameWorld).toBeDefined();
      expect(gameWorld.players).toEqual([]);
      expect(gameWorld.npcs).toEqual([]);
      expect(gameWorld.items).toEqual([]);
    });
  });
});