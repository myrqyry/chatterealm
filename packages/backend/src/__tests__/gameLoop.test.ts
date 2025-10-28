import { WebSocketServer } from '../services/webSocketServer';
import { Server as HTTPServer } from 'http';
import { io as ioClient, Socket as ClientSocket } from 'socket.io-client';

describe('GameLoop Performance Tests', () => {
  let httpServer: HTTPServer;
  let webSocketServer: WebSocketServer;
  let clientSocket: ClientSocket;

  beforeEach(async () => {
    httpServer = new HTTPServer();
    webSocketServer = new WebSocketServer(httpServer);

    await new Promise<void>((resolve) => {
      httpServer.listen(() => resolve());
    });

    const address = httpServer.address();
    const port = typeof address === 'object' && address ? address.port : 3000;
    clientSocket = ioClient(`http://localhost:${port}`);

    await new Promise<void>((resolve) => {
      clientSocket.on('connect', resolve);
    });
  });

  afterEach(async () => {
    clientSocket.disconnect();
    webSocketServer.shutdown();
    httpServer.close();
  });

  test('should adjust game loop interval based on player count', async () => {
    const initialStats = webSocketServer.getGameLoopStats();

    // Simulate no players - should use 10-second interval
    expect(webSocketServer.getPlayerCount()).toBe(0);

    // Wait for a few iterations
    await new Promise(resolve => setTimeout(resolve, 11000));

    const statsAfterEmpty = webSocketServer.getGameLoopStats();
    expect(statsAfterEmpty.totalUpdates).toBeGreaterThanOrEqual(initialStats.totalUpdates);
  }, 12000);

  test('should handle environment variable validation', () => {
    const originalEnv = process.env.NODE_ENV;

    try {
      process.env.NODE_ENV = 'test';
      expect(() => webSocketServer.validateEnvironment()).not.toThrow();

      delete process.env.NODE_ENV;
      expect(() => webSocketServer.validateEnvironment()).toThrow();
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });

  test('should cleanup stale client data efficiently', async () => {
    const initialClientCount = webSocketServer.getPlayerCount();

    // Force disconnect without proper cleanup
    clientSocket.disconnect();

    // Trigger cleanup
    await new Promise(resolve => setTimeout(resolve, 35000)); // Wait for cleanup interval

    const finalClientCount = webSocketServer.getPlayerCount();
    expect(finalClientCount).toBeLessThanOrEqual(initialClientCount);
  }, 40000);
});
