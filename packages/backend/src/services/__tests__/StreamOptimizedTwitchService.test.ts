import { StreamOptimizedTwitchService } from '../StreamOptimizedTwitchService';

describe('StreamOptimizedTwitchService', () => {
  let twitchService: StreamOptimizedTwitchService;
  let ioMock: any;
  let gameStateManagerMock: any;

  beforeEach(() => {
    jest.useFakeTimers();
    ioMock = {
      emit: jest.fn(),
    };
    gameStateManagerMock = {
      getGameWorld: jest.fn(),
      addPlayer: jest.fn(),
      removePlayer: jest.fn(),
      movePlayer: jest.fn(),
    };
    twitchService = new StreamOptimizedTwitchService(
      ioMock,
      'test-client-id',
      'test-client-secret',
      'test-channel',
      gameStateManagerMock
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should clear the interval on destroy', () => {
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
    twitchService.destroy();
    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});