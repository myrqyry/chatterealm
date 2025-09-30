import { createServer, Server as HTTPServer } from 'http';
import { AddressInfo } from 'net';
import { io as ioc, Socket as ClientSocket } from 'socket.io-client';
import { WebSocketServer } from './webSocketServer';
import { GameStateManager } from './gameStateManager';
import { GameWorld, Player, PlayerClass, GAME_CONFIG } from 'shared';

const createMockPlayer = (id: string, displayName: string): Player => ({
    id,
    twitchUsername: id,
    displayName,
    avatar: '🤖',
    position: { x: 0, y: 0 },
    class: PlayerClass.KNIGHT,
    health: 100,
    mana: 50,
    stamina: 100,
    hunger: 100,
    thirst: 100,
    stats: { hp: 100, maxHp: 100, attack: 10, defense: 5, speed: 2 },
    level: 1,
    experience: 0,
    inventory: [],
    equipment: {},
    achievements: [],
    titles: [],
    isAlive: true,
    lastMoveTime: 0,
    spawnTime: Date.now(),
    connected: true,
    lastActive: Date.now(),
});


describe('WebSocketServer', () => {
    let httpServer: HTTPServer;
    let wsServer: WebSocketServer;
    let clientSocket: ClientSocket;
    let port: number;
    let gameStateManager: GameStateManager;

    beforeAll((done) => {
        httpServer = createServer();
        gameStateManager = new GameStateManager({ generateNPCs: false, worldType: 'test' });
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

    beforeEach((done) => {
        // Reset the game state before each test
        gameStateManager = new GameStateManager({ generateNPCs: false, worldType: 'test' });
        wsServer.setGameStateManager(gameStateManager); // Assumes a setter method exists

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

    describe('Authentication', () => {
        it('should allow a client to join the game', (done) => {
            const playerData = { id: 'player1', displayName: 'Player One' };
            const addPlayerSpy = jest.spyOn(gameStateManager, 'addPlayer');

            clientSocket.on('game_joined', (data) => {
                expect(data.player.id).toBe(playerData.id);
                expect(addPlayerSpy).toHaveBeenCalledTimes(1);
                done();
            });

            clientSocket.emit('join_game', playerData);
        });

        it('should reject commands from a client that has not joined', (done) => {
            clientSocket.on('error', (data) => {
                expect(data.message).toBe('Not authenticated');
                done();
            });

            clientSocket.emit('player_command', { type: 'move', data: { direction: 'up' } });
        });
    });

    describe('Player Commands', () => {
        it('should process a valid command from an authenticated client', (done) => {
            const playerData = createMockPlayer('player1', 'Player One');
            playerData.position = { x: 5, y: 5 }; // Set a starting position

            const moveSpy = jest.spyOn(gameStateManager, 'movePlayer');

            clientSocket.on('game_joined', () => {
                clientSocket.on('command_result', (result) => {
                    expect(result.success).toBe(true);
                    expect(moveSpy).toHaveBeenCalledWith('player1', { x: 5, y: 4 });
                    done();
                });

                clientSocket.emit('player_command', { type: 'move', playerId: 'player1', data: { direction: { x: 0, y: -1 } } });
            });

            clientSocket.emit('join_game', playerData);
        });
    });
});
