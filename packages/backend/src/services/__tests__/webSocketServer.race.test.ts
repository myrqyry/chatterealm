import { createServer, Server as HTTPServer } from 'http';
import { AddressInfo } from 'net';
import { io as ioc, Socket as ClientSocket } from 'socket.io-client';
import { WebSocketServer } from '../webSocketServer';
import { gameService } from '../GameService';

describe('WebSocketServer Race Conditions', () => {
    let httpServer: HTTPServer;
    let wsServer: WebSocketServer;
    let port: number;

    beforeAll((done) => {
        httpServer = createServer();
        wsServer = new WebSocketServer(httpServer);

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
                    const validErrors = [
                        'Authentication already in progress for this player.',
                        'Player is already online.',
                        'Join already in progress'
                    ];
                    if (validErrors.includes(error.message)) {
                        errorCount++;
                    }
                    resolve();
                });
                client.on('join_failed', (error) => {
                    const validErrors = [
                        'Player already connected',
                    ];
                    if (validErrors.includes(error.message)) {
                        errorCount++;
                    }
                    resolve();
                });
                client.emit('join_game', playerData);
            });
        });

        await Promise.all(joinPromises);

        const room = gameService.getRoom('main_room');
        const playersInGame = room ? room.getPlayers() : [];

        // Assertions
        expect(successCount).toBe(1);
        expect(errorCount).toBe(numClients - 1);
        expect(playersInGame.length).toBe(1);

        // Cleanup
        clients.forEach(client => client.disconnect());
    }, 10000); // Increase timeout for this test
});