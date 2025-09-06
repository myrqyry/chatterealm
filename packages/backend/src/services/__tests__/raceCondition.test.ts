import { createServer, Server as HTTPServer } from 'http';
import { AddressInfo } from 'net';
import { io as ioc, Socket as ClientSocket } from 'socket.io-client';
import { WebSocketServer } from '../webSocketServer';
import { GameStateManager } from '../gameStateManager';
import { Player, PlayerClass } from 'shared';

// Mock GameStateManager
jest.mock('../gameStateManager');

describe('WebSocketServer Race Conditions', () => {
    let httpServer: HTTPServer;
    let wsServer: WebSocketServer;
    let port: number;
    let gameStateManager: jest.Mocked<GameStateManager>;

    beforeAll((done) => {
        httpServer = createServer();
        // @ts-ignore
        gameStateManager = new GameStateManager() as jest.Mocked<GameStateManager>;
        wsServer = new WebSocketServer(httpServer, gameStateManager);

        httpServer.listen(() => {
            port = (httpServer.address() as AddressInfo).port;
            done();
        });
    });

    afterAll(() => {
        wsServer.shutdown();
        httpServer.close();
    });

    it('should handle concurrent join_game requests for the same player and only allow one to succeed', async () => {
        const numClients = 5;
        const playerData = { id: 'race_player', displayName: 'Race Player' };
        const clients: ClientSocket[] = [];

        let successCount = 0;
        let errorCount = 0;

        // Mock addPlayer to be more realistic for a race condition
        const playersInGame: Player[] = [];
        gameStateManager.addPlayer.mockImplementation((player: Player) => {
            if (playersInGame.some(p => p.id === player.id)) {
                return { success: false, message: 'Player already exists' };
            }
            playersInGame.push(player);
            return { success: true, message: 'Player added', data: { player } };
        });

        const connectionPromises = [];
        for (let i = 0; i < numClients; i++) {
            const client = ioc(`http://localhost:${port}`, {
                reconnection: false,
                transports: ['websocket'],
                forceNew: true // Ensures a new connection for each client
            });
            clients.push(client);

            const connectionPromise = new Promise<void>((resolve) => {
                client.on('connect', () => resolve());
            });
            connectionPromises.push(connectionPromise);
        }

        // Wait for all clients to connect
        await Promise.all(connectionPromises);

        // Now, have all clients try to join at once
        const joinPromises = clients.map(client => {
            return new Promise<void>(resolve => {
                client.on('game_joined', () => {
                    successCount++;
                    resolve();
                });
                client.on('error', (error) => {
                    if (error.message === 'Player already exists') {
                        errorCount++;
                    }
                    resolve();
                });
                client.emit('join_game', playerData);
            });
        });

        await Promise.all(joinPromises);

        // Assertions
        expect(successCount).toBe(1);
        expect(errorCount).toBe(numClients - 1);
        expect(playersInGame.length).toBe(1);

        // Cleanup
        clients.forEach(client => client.disconnect());
    }, 10000); // Increase timeout for this test
});
