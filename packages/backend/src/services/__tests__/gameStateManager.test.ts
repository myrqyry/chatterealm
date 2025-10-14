import { GameStateManager } from '../gameStateManager';

describe('GameStateManager', () => {
  let gameStateManager: GameStateManager;

  beforeEach(() => {
    gameStateManager = new GameStateManager();
  });

  it('should be created', () => {
    expect(gameStateManager).toBeDefined();
  });
});