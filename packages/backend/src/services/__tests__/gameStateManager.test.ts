import { GameStateManager } from '../gameStateManager';

describe('GameStateManager', () => {
  let gameStateManager: GameStateManager;

  beforeEach(async () => {
    gameStateManager = await GameStateManager.create();
  });

  it('should be created', () => {
    expect(gameStateManager).toBeDefined();
  });
});