import { createServer, Server as HTTPServer } from 'http';
import { AddressInfo } from 'net';
import { io as ioc, Socket as ClientSocket } from 'socket.io-client';
import { WebSocketServer } from './webSocketServer';
import { GameStateManager } from './gameStateManager';
import { GameWorld, Player, PlayerClass, GAME_CONFIG } from 'shared';

// Mock GameStateManager
jest.mock('./gameStateManager');

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

    beforeEach((done) => {
        // Reset mocks before each test
        jest.clearAllMocks();

        // Mock GameStateManager methods
        gameStateManager.addPlayer.mockImplementation((player: Player) => {
            const gameWorld = { players: [player] } as GameWorld;
            // @ts-ignore
            gameStateManager.getGameWorld.mockReturnValue(gameWorld);
            return { success: true, message: 'Player added' };
        });
        gameStateManager.getPlayer.mockImplementation((playerId: string) => {
            return createMockPlayer(playerId, 'test');
        });

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

            clientSocket.on('game_joined', (data) => {
                expect(data.player.id).toBe(playerData.id);
                expect(gameStateManager.addPlayer).toHaveBeenCalledTimes(1);
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
            const playerData = { id: 'player1', displayName: 'Player One' };
            gameStateManager.movePlayer.mockReturnValue({ success: true, message: 'Moved up' });

            clientSocket.on('game_joined', () => {
                clientSocket.on('command_result', (result) => {
                    expect(result.success).toBe(true);
                    expect(gameStateManager.movePlayer).toHaveBeenCalledWith('player1', { x: 0, y: -1 });
                    done();
                });
                clientSocket.emit('player_command', { type: 'move', playerId: 'player1', data: { direction: { x: 0, y: -1 } } });
            });

            clientSocket.emit('join_game', playerData);
        });
    });
});
