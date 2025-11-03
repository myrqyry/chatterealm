import { LootService } from '../LootService';
import { GameStateManager } from '../gameStateManager';
import { CataclysmService } from '../CataclysmService';
import { Player, Item, ItemType, ItemRarity, GameWorld, Position } from 'shared';
import { createMockPlayer } from '../../testUtils/mockGameWorld';
import { LootManager } from '../LootManager';
import { NPCManager } from '../NPCManager';

// Mock dependencies
jest.mock('../gameStateManager');
jest.mock('../CataclysmService');

describe('LootService', () => {
  let lootService: LootService;
  let mockGameStateManager: jest.Mocked<GameStateManager>;
  let mockCataclysmService: jest.Mocked<CataclysmService>;
  let mockGameWorld: GameWorld;
  let player: Player;

  beforeEach(() => {
    // Create a mock GameWorld
    mockGameWorld = {
      id: 'test-world',
      players: [],
      npcs: [],
      items: [],
      grid: [],
      buildings: [],
      cataclysmCircle: {
        isActive: false,
        center: { x: 50, y: 50 },
        radius: 100,
        nextShrinkTime: 0,
        shrinkRate: 1,
      },
      worldAge: 0,
      lastResetTime: 0,
      cataclysmRoughnessMultiplier: 1.0,
      phase: 'exploration',
    };

    // Mock GameStateManager
    mockGameStateManager = new (GameStateManager as any)({ options: { generateNPCs: false, worldType: 'test' } });
    (mockGameStateManager.getGameWorld as jest.Mock).mockReturnValue(mockGameWorld);

    // Mock CataclysmService
    const mockLootManager = new LootManager();
    const mockNpcManager = new NPCManager(new Set());
    mockCataclysmService = new (CataclysmService as any)(mockLootManager, mockNpcManager, new Set());

    // Create LootService with mocked dependencies
    lootService = new LootService(mockCataclysmService);

    // Setup a player for tests
    player = createMockPlayer('player1', 'Tester', { x: 10, y: 10 });
    mockGameWorld.players.push(player);
  });

  describe('checkForInterruptions', () => {
    it('should return true if CataclysmService indicates the player is in the cataclysm', () => {
      // Arrange: Mock the looting session and CataclysmService response
      const session = { playerId: 'player1' } as any;

      // This is the core of the test: we set the mock to return true
      mockCataclysmService.isInCataclysmCircle.mockReturnValue(true);

      // Act: Call the private method (using ts-ignore for testing private methods)
      // @ts-ignore
      const result = lootService.checkForInterruptions(session, mockGameWorld);

      // Assert: Check that looting was interrupted
      expect(result).toBe(true);
      // Verify that the correct service and method were called
      expect(mockCataclysmService.isInCataclysmCircle).toHaveBeenCalledWith(player.position, mockGameWorld);
    });

    it('should return false if the player is not in the cataclysm and there are no other interruptions', () => {
      // Arrange
      const session = { playerId: 'player1' } as any;
      mockCataclysmService.isInCataclysmCircle.mockReturnValue(false); // Player is safe
      mockGameWorld.npcs = []; // No nearby enemies

      // Act
      // @ts-ignore
      const result = lootService.checkForInterruptions(session, mockGameWorld);

      // Assert
      expect(result).toBe(false);
      expect(mockCataclysmService.isInCataclysmCircle).toHaveBeenCalledWith(player.position, mockGameWorld);
    });
  });
});