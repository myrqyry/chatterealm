import { createServer, Server as HTTPServer } from 'http';
import { AddressInfo } from 'net';
import { io as ioc, Socket as ClientSocket } from 'socket.io-client';
import { WebSocketServer } from './webSocketServer';

describe('WebSocketServer', () => {
    let httpServer: HTTPServer;
    let wsServer: WebSocketServer;
    let clientSocket: ClientSocket;
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

    beforeEach((done) => {
        clientSocket = ioc(`http://localhost:${port}`, {
            reconnection: false,
            transports: ['websocket'],
        });

        clientSocket.on('connect', () => {
            done();
        });
    });

    afterEach(() => {
        if (clientSocket.connected) {
            clientSocket.disconnect();
        }
    });

    it('should allow a client to connect', () => {
        expect(clientSocket.connected).toBe(true);
    });

    it('should allow a client to disconnect', (done) => {
        clientSocket.on('disconnect', () => {
            expect(clientSocket.connected).toBe(false);
            done();
        });
        clientSocket.disconnect();
    });

    describe('Stale Connection Cleanup', () => {
        it('should not remove an active player if their old socket is cleaned up', (done) => {
            const playerId = 'player-1';
            const oldSocketId = 'stale-socket-id';

            // Manually add a stale entry to connectedClients
            const connectedClients = wsServer['connectedClients'];
            connectedClients.set(oldSocketId, {
                playerId,
                socketId: oldSocketId,
                connectedAt: Date.now() - 70000, // 70 seconds ago
            });

            // Manually add the NEW, ACTIVE socket entry for the player
            const playerSockets = wsServer['playerSockets'];
            if (clientSocket.id) {
                playerSockets.set(playerId, clientSocket.id);
            } else {
                return done(new Error('Client socket ID is not available'));
            }

            // Manually trigger the cleanup
            wsServer['cleanupStaleClientData']();

            // Assert that the active player's socket is still tracked
            expect(playerSockets.has(playerId)).toBe(true);
            expect(playerSockets.get(playerId)).toBe(clientSocket.id);

            // Assert that the stale socket entry was removed
            expect(connectedClients.has(oldSocketId)).toBe(false);

            done();
        });
    });
});