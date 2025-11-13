import { PlayerMovementService } from '../PlayerMovementService';
import { createMockGameWorld, createMockPlayer } from '../../testUtils/mockGameWorld';
import { GameWorld, Player, Position } from '@chatterealm/shared';

describe('PlayerMovementService', () => {
  let gameWorld: GameWorld;
  let player: Player;
  let movementService: PlayerMovementService;

  beforeEach(() => {
    gameWorld = createMockGameWorld(100, 100); // Create a large world
    player = createMockPlayer('player-1', 'Test Player', { x: 10, y: 10 });
    gameWorld.players.push(player);
    movementService = new PlayerMovementService(gameWorld);
  });

  describe('requestMoveTo', () => {
    it('should reject distant move requests instantly without expensive pathfinding', () => {
      const target: Position = { x: 80, y: 80 }; // A target far away

      const startTime = performance.now();
      const result = movementService.requestMoveTo(player.id, target, gameWorld);
      const duration = performance.now() - startTime;

      // This will fail initially. The goal is to make it pass.
      expect(result.success).toBe(false);
      expect(result.message).toBe('Target is too far.');
      expect(duration).toBeLessThan(50); // Should be very fast
    });
  });
});
