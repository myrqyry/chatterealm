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
});