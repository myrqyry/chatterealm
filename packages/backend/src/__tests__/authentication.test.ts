import { WebSocketServer } from '../services/webSocketServer';
import { GameStateManager } from '../services/gameStateManager';
import { Server } from 'http';
import { io as ClientIO, Socket as ClientSocket } from 'socket.io-client';
import { AddressInfo } from 'net';

describe('Authentication Race Condition Tests', () => {
  let server: Server;
  let webSocketServer: WebSocketServer;
  let gameStateManager: GameStateManager;
  let port: number;

  beforeAll((done) => {
    // Create HTTP server
    server = require('http').createServer();
    gameStateManager = new GameStateManager();
    webSocketServer = new WebSocketServer(server);

    server.listen(0, () => {
      port = (server.address() as AddressInfo).port;
      done();
    });
  });

  afterAll((done) => {
    webSocketServer.shutdown();
    server.close(done);
  });

  it('should handle commands sent immediately after join without auth errors', (done) => {
    const clientSocket = ClientIO(`http://localhost:${port}`, {
      transports: ['websocket'],
      timeout: 5000,
    });

    let commandResults = 0;
    let authErrors = 0;

    clientSocket.on('connect', () => {
      clientSocket.emit('join_game', {
        id: `test-player-${Date.now()}`,
        displayName: 'TestPlayer',
        class: 'KNIGHT'
      });
    });

    clientSocket.on('game_joined', (data) => {
      // Send command immediately
      clientSocket.emit('player_command', {
        type: 'move',
        playerId: data.player.id,
        data: { direction: 'up' }
      });
    });

    clientSocket.on('command_result', (result) => {
      commandResults++;
      expect(result.success).toBe(true);
      if (commandResults >= 1) {
        clientSocket.disconnect();
        expect(authErrors).toBe(0);
        done();
      }
    });

    clientSocket.on('error', (error) => {
      if (error.message && error.message.includes('authenticated')) {
        authErrors++;
      }
    });

    setTimeout(() => {
      clientSocket.disconnect();
      expect(authErrors).toBe(0);
      done();
    }, 3000);
  });
});