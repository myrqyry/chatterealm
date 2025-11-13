import { PlayerService } from '../PlayerService';
import { GameWorld } from '@chatterealm/shared';
import { GameWorldManager } from '../GameWorldManager';
import { NPCManager } from '../NPCManager';
import { createMockPlayer } from '../../testUtils/mockGameWorld';

describe('PlayerService', () => {
  let playerService: PlayerService;
  let gameWorld: GameWorld;
  let gameWorldManager: GameWorldManager;
  let occupiedPositions: Set<string>;
  let availableSpawnPoints: Set<string>;

  beforeEach(() => {
    const npcManager = new NPCManager(new Set());
    gameWorldManager = new GameWorldManager(npcManager);
    gameWorld = gameWorldManager.initializeGameWorld({ generateNPCs: false, worldType: 'test' });
    occupiedPositions = new Set();
    availableSpawnPoints = new Set();
    playerService = new PlayerService(gameWorld, gameWorldManager, occupiedPositions, availableSpawnPoints);
  });

  describe('addPlayer', () => {
    it('should add a player to an empty world', () => {
      const player = createMockPlayer('1', 'testPlayer', { x: 0, y: 0 });
      const result = playerService.addPlayer(player);

      expect(result).toBeDefined();
      expect(playerService.getPlayers()).toHaveLength(1);
      expect(playerService.getPlayer('1')).toEqual(expect.objectContaining({
        id: '1',
        displayName: 'testPlayer'
      }));
    });

    it('should add multiple players successfully', () => {
      const player1 = createMockPlayer('1', 'player1', { x: 0, y: 0 });
      const player2 = createMockPlayer('2', 'player2', { x: 1, y: 1 });

      const result1 = playerService.addPlayer(player1);
      const result2 = playerService.addPlayer(player2);

      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
      expect(playerService.getPlayers()).toHaveLength(2);
    });
  });

  describe('removePlayer', () => {
    it('should remove an existing player from the world', () => {
      const player = createMockPlayer('1', 'testPlayer', { x: 5, y: 5 });
      playerService.addPlayer(player);

      const result = playerService.removePlayer('1');

      expect(result).toBeDefined();
      expect(result?.id).toBe('1');
      expect(playerService.getPlayers().length).toBe(0);
      expect(playerService.getPlayer('1')).toBeUndefined();
    });

    it('should fail to remove a non-existent player', () => {
      const result = playerService.removePlayer('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('getPlayerProfile', () => {
    it('should return the profile for an existing player', () => {
      const player = createMockPlayer('1', 'testPlayer', { x: 5, y: 5 });
      playerService.addPlayer(player);

      const profile = playerService.getPlayerProfile('1');
      expect(profile).not.toBeNull();
      expect(profile?.id).toBe('1');
      expect(profile?.displayName).toBe('testPlayer');
    });

    it('should return null for a non-existent player', () => {
      const profile = playerService.getPlayerProfile('nonexistent');
      expect(profile).toBeNull();
    });
  });
});