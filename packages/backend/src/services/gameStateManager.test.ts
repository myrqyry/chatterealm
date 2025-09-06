import { GameStateManager } from './gameStateManager';
import { GameWorld, Player, PlayerClass, TerrainType, Position, GAME_CONFIG } from 'shared';
import { createMockGameWorld, createMockPlayer } from '../testUtils/mockGameWorld';

describe('GameStateManager', () => {
  let gameStateManager: GameStateManager;
  let gameWorld: GameWorld;

  beforeEach(() => {
  gameWorld = createMockGameWorld(GAME_CONFIG.gridWidth, GAME_CONFIG.gridHeight);
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
      // Enable movement debug for this test only
      process.env.GAME_DEBUG_MOVE = '1';
      const player1 = createMockPlayer('1', 'player1', { x: 5, y: 5 });
      gameStateManager.addPlayer(player1);

      // Force player2 to be adjacent to player1 even if spawn logic picks another tile.
      const desiredAdjacent = { x: player1.position.x, y: Math.min(player1.position.y + 1, GAME_CONFIG.gridHeight - 1) };
      if (desiredAdjacent.y === player1.position.y) {
        // If we were at bottom edge, pick the tile above instead
        desiredAdjacent.y = Math.max(0, player1.position.y - 1);
      }
      const player2 = createMockPlayer('2', 'player2', desiredAdjacent);
      gameStateManager.addPlayer(player2);

      // Manually enforce adjacency position in case spawn logic relocated player2.
      player2.position = desiredAdjacent;
      // @ts-ignore private access to keep test deterministic
      gameStateManager.occupiedPositions.add(`${desiredAdjacent.x},${desiredAdjacent.y}`);

  // @ts-ignore verify occupancy state before move
  expect(gameStateManager.occupiedPositions.has(`${player1.position.x},${player1.position.y}`)).toBe(true);
  // @ts-ignore
  expect(gameStateManager.occupiedPositions.has(`${player2.position.x},${player2.position.y}`)).toBe(true);

      const direction: 'up' | 'down' = desiredAdjacent.y > player1.position.y ? 'down' : 'up';
      const result = gameStateManager.movePlayer('1', direction);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Position occupied');
      expect(player1.position).toEqual({ x: 5, y: 5 });
      // @ts-ignore
      expect(gameStateManager.occupiedPositions.has(`${player1.position.x},${player1.position.y}`)).toBe(true);
      // @ts-ignore
      expect(gameStateManager.occupiedPositions.has(`${player2.position.x},${player2.position.y}`)).toBe(true);
    });
  });
});
