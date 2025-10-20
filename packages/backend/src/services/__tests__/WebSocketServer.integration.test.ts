import { createServer, Server as HTTPServer } from 'http';
import { AddressInfo } from 'net';
import { io as ioc, Socket as ClientSocket } from 'socket.io-client';
import { WebSocketServer } from '../webSocketServer';
import { Player, PlayerClass } from 'shared';
import { gameService } from '../GameService';
import { GameStateDelta } from '../../models/GameRoom';

describe('WebSocketServer Integration', () => {
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
        clientSocket.on('connect', () => done());
    });

    afterEach(() => {
        if (clientSocket.connected) {
            clientSocket.disconnect();
        }
    });

    it('should broadcast only player changes, not the full player list', (done) => {
        const player1Data = { id: 'player1', displayName: 'Player One', class: PlayerClass.ROGUE };
        const player2Data = { id: 'player2', displayName: 'Player Two', class: PlayerClass.MAGE };

        clientSocket.emit('join_game', player1Data);
        clientSocket.once('join_acknowledged', () => {
            const room = gameService.getRoom('main_room');
            if (!room) return done(new Error('Room not found'));

            room.addPlayer(player2Data as any);
            room.movePlayer(player1Data.id, { x: 1, y: 1 });

            clientSocket.once('game_state_delta', (deltas: GameStateDelta[]) => {
                const playerDelta = deltas.find(d => d.type === 'players');

                // This is the failing assertion.
                // We expect the delta to contain only the changed player.
                expect(playerDelta).toBeDefined();
                expect(Array.isArray(playerDelta?.data)).toBe(true);
                expect(playerDelta?.data.length).toBe(1);
                expect(playerDelta?.data[0].id).toBe(player1Data.id);

                done();
            });
        });
    }, 5000);
});
