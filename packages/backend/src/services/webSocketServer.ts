import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { GameActionResult } from './CataclysmService';
import { MoveResult } from './PlayerMovementService';
import { CombatResult } from './CombatService';
import { ItemResult } from './LootManager';
import { Player as PlayerData, GameWorld, PlayerClass, JoinGameData, SocketEvents } from '@chatterealm/shared';
import { CharacterHandler } from '../handlers/CharacterHandler';
import { RateLimiter } from './RateLimiter';

export interface ClientData {
  playerId: string;
  socketId: string;
  connectedAt: number;
}

export interface PlayerCommand {
  type: 'move' | 'move_to' | 'attack' | 'pickup' | 'use_item' | 'start_cataclysm' | 'loot_item' | 'inspect_item';
  playerId: string;
  data?: any;
}

// The QueuedCommand interface is no longer needed with the simplified authentication logic.

import { gameService } from './GameService';
import { GameStateManager } from './gameStateManager';
import { Player } from '../models/Player';

// Central socket room name used across this module
const SOCKET_MAIN_ROOM = 'main_room';

export class WebSocketServer {
  private io: SocketIOServer;
  private characterHandler: CharacterHandler;
  private connectedClients: Map<string, ClientData> = new Map();
  private playerSockets: Map<string, string> = new Map(); // playerId -> socketId
  private gameLoopInterval: NodeJS.Timeout | null = null;
  private isGameLoopRunning: boolean = false;
  private cleanupInterval: NodeJS.Timeout | null = null; // Add cleanup interval for stale entries
  private rateLimiter: RateLimiter;
  private currentInterval: number = 1000; // Add this line
  private gameLoopStats = {
    totalUpdates: 0,
    lastUpdateTime: 0,
    averageUpdateTime: 0,
    errorCount: 0
  };
  private gameStateManager: GameStateManager | undefined;
  private commandHandlers: { [key: string]: (room: any, playerId: string, data: any) => any };

  constructor(httpServer: HTTPServer, gameStateManager?: GameStateManager) {
    this.gameStateManager = gameStateManager;
    this.commandHandlers = {
      move: (room, playerId, data) => room.movePlayer(playerId, data.position),
      attack: (room, playerId, data) => room.attackEnemy(playerId, data.targetPosition),
      pickup: (room, playerId, data) => room.pickupItem(playerId, data.itemId),
      loot_item: (room, playerId, data) => room.lootItem(playerId, data.itemId),
      inspect_item: (room, playerId, data) => room.inspectItem(playerId, data.itemId),
    };
    // Initialize Socket.IO server with CORS configuration
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: (origin, callback) => {
          const allowedOrigins = process.env.NODE_ENV === 'production'
            ? ['https://chatterrealm.com', 'https://www.chatterrealm.com']
            : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173'];

          if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
          } else {
            callback(new Error('Not allowed by CORS'));
          }
        },
        methods: ["GET", "POST"],
        credentials: true
      },
      pingTimeout: 60000,
      pingInterval: 25000
    });

    this.characterHandler = new CharacterHandler(this.io);
    this.rateLimiter = new RateLimiter({ maxEvents: 20, windowMs: 1000 });
    this.setupEventHandlers();
    this.startGameLoop();
    this.startCleanupInterval(); // Start periodic stale client cleanup
  }

  public getIO(): SocketIOServer {
    return this.io;
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      console.log(`[CONNECTION] Client connected: ${socket.id}`);
      console.log(`[CONNECTION] Current connectedClients count: ${this.connectedClients.size}`);
      console.log(`[CONNECTION] Current playerSockets count: ${this.playerSockets.size}`);
      console.log(`[CONNECTION] ConnectedClients keys: [${Array.from(this.connectedClients.keys()).join(', ')}]`);

      // Handle player join
      socket.on(SocketEvents.JOIN_GAME, (playerData: JoinGameData) => {
        console.log(`[JOIN_GAME_RECEIVED] Socket ${socket.id} attempting to join with data:`, playerData);
        this.handlePlayerJoin(socket, playerData);
      });

      // Handle character creation
      socket.on('create_character', (data: any) => {
        this.characterHandler.handleCreateCharacter(socket, data);
      });

      // Handle explicit leave requests from clients
      socket.on('leave_game', (data: { playerId?: string } | undefined) => {
        try {
          const pid = data?.playerId || this.connectedClients.get(socket.id)?.playerId;
          if (!pid) {
            console.warn(`[LEAVE_GAME] No playerId provided and no mapping found for socket ${socket.id}`);
            return;
          }

          console.log(`[LEAVE_GAME] Received leave request for player ${pid} from socket ${socket.id}`);
          const roomId = 'main_room';
          const room = gameService.getRoom(roomId);
          if(room) {
            room.removePlayer(pid);
          }

          this.io.to(roomId).emit('player_left', { playerId: pid });


          // Clean up client tracking maps
          this.connectedClients.delete(socket.id);
          if (this.playerSockets.get(pid) === socket.id) this.playerSockets.delete(pid);
        } catch (err) {
          console.error('[LEAVE_GAME] Error handling leave_game:', err);
        }
      });

      // Handle player commands
      socket.on(SocketEvents.PLAYER_COMMAND, (command: PlayerCommand) => {
        console.log(`[COMMAND_RECEIVED] Socket ${socket.id} sent command:`, command.type);
        console.log(`[COMMAND_RECEIVED] Socket in connectedClients: ${this.connectedClients.has(socket.id)}`);
        this.handlePlayerCommand(socket, command);
      });

      // Tarkov-style looting commands
      socket.on('inspect_item', (itemId: string) => {
        const clientData = this.connectedClients.get(socket.id);
        if (clientData) {
          this.handlePlayerCommand(socket, {
            type: 'inspect_item',
            playerId: clientData.playerId,
            data: { itemId },
          });
        }
      });

      socket.on('loot_item', (itemId: string) => {
        const clientData = this.connectedClients.get(socket.id);
        if (clientData) {
          this.handlePlayerCommand(socket, {
            type: 'loot_item',
            playerId: clientData.playerId,
            data: { itemId },
          });
        }
      });

      // Handle client disconnect
      socket.on('disconnect', () => {
        this.handlePlayerDisconnect(socket);
      });

      // Handle connection errors
      socket.on('error', (error) => {
        console.error(`Socket error for ${socket.id}:`, error);
        this.handlePlayerDisconnect(socket);
      });

      socket.on('get_player_profile', (playerId: string) => {
        const room = gameService.getRoom('main_room');
        if (room) {
          const profile = room.getPlayerProfile(playerId);
          socket.emit('player_profile', profile);
        }
      });
    });
  }

  private async handlePlayerJoin(socket: Socket, playerData: JoinGameData): Promise<void> {
    try {
      // Step 1: Validate - prevent duplicate joins atomically
      const existingSocketId = this.playerSockets.get(playerData.id);
      if (existingSocketId) {
        const existingSocket = this.io.sockets.sockets.get(existingSocketId);
        if (existingSocket && existingSocket.connected) {
          socket.emit('error', { message: 'Player already connected from another session' });
          return;
        }
        // Clean up stale mapping if socket is disconnected
        this.cleanupPlayerSession(playerData.id, existingSocketId);
      }

      console.log(`[JOIN_START] Processing join for socket ${socket.id} with player data:`, playerData);

      // Step 2: Create player and join room
      const player = new Player(playerData);
      const room = await gameService.joinRoom(SOCKET_MAIN_ROOM, player.getData());

      if (!room) {
        console.error(`[SPAWN_ERROR] Failed to add player ${player.name} to room ${SOCKET_MAIN_ROOM}`);
        socket.emit('error', { message: 'Failed to join room' });
        return;
      }

      // Step 3: Get authoritative player instance from room
      const addedPlayer = room.getPlayers().find(p => p.id === playerData.id);
      if (!addedPlayer) {
        socket.emit('error', { message: 'Failed to join room - internal error' });
        return;
      }

      // Step 4: Register session atomically
      this.registerPlayerSession(socket.id, addedPlayer.id);

      // Step 5: Join socket rooms and notify
      await socket.join(`player_${addedPlayer.id}`);
      await socket.join(SOCKET_MAIN_ROOM);

      // Set socket data for command handling
      socket.data.isAuthenticated = true;
      delete socket.data.isAuthenticating;

      // Process any queued commands
      if (socket.data.commandQueue && socket.data.commandQueue.length > 0) {
        socket.data.commandQueue.forEach((queuedCommand: PlayerCommand) => {
          this.handlePlayerCommand(socket, queuedCommand);
        });
        socket.data.commandQueue = [];
      }

      // Send success response with initial game state using authoritative player
      socket.emit(SocketEvents.GAME_JOINED, {
        player: addedPlayer,
        gameWorld: room.getGameState(),
      });

      socket.emit('join_acknowledged', { status: 'success' });

      this.io.to(SOCKET_MAIN_ROOM).emit(SocketEvents.PLAYER_JOINED, { player: addedPlayer });

      console.log(`✅ Player ${addedPlayer.displayName} joined successfully (socket: ${socket.id})`);
    } catch (error) {
      console.error('Join error:', error);
      socket.emit('error', { message: 'Failed to join game' });
    }
  }

  // Helper: Atomic session registration
  private registerPlayerSession(socketId: string, playerId: string): void {
    const clientData: ClientData = {
      playerId,
      socketId,
      connectedAt: Date.now()
    };

    this.connectedClients.set(socketId, clientData);
    this.playerSockets.set(playerId, socketId);
  }

  // Helper: Clean up stale session
  private cleanupPlayerSession(playerId: string, socketId: string): void {
    this.connectedClients.delete(socketId);
    // Only delete from playerSockets if it matches the socketId being cleaned up
    if (this.playerSockets.get(playerId) === socketId) {
      this.playerSockets.delete(playerId);
    }
    console.log(`🧹 Cleaned up session for player ${playerId}`);
  }

  private handlePlayerCommand(socket: Socket, command: PlayerCommand): void {
    if (this.rateLimiter.isRateLimited(socket.id)) {
      socket.emit('rate_limit', { message: 'Too many commands. Please slow down.' });
      return;
    }
    if (socket.data.isAuthenticated) {
      // Proceed to process the command
    } else if (socket.data.isAuthenticating) {
      if (!socket.data.commandQueue) socket.data.commandQueue = [];
      socket.data.commandQueue.push(command);
      return;
    } else {
      socket.emit('error', { message: 'Not authenticated' });
      return;
    }

    try {
      const clientData = this.connectedClients.get(socket.id);
      if (!clientData) {
        console.error(`[AUTH_ERROR] Not authenticated - socket ${socket.id} not found in connectedClients`);
        console.error(`[AUTH_ERROR] Connected clients: ${Array.from(this.connectedClients.keys()).join(', ')}`);
        console.error(`[AUTH_ERROR] Player sockets: ${Array.from(this.playerSockets.entries()).map(([pid, sid]) => `${pid}:${sid}`).join(', ')}`);
        // If connectedClients is missing the current socket, it's a critical authentication failure.
        // Aggressively clean up potential orphaned playerSockets mapping to prevent future errors for this state.
        let cleanedOrphanedPlayerSockets = false;
        for (const [playerId, storedSocketId] of this.playerSockets.entries()) {
          if (storedSocketId === socket.id) {
            console.warn(`[AUTH_CLEANUP] Found and removing orphaned playerSockets entry for playerId: ${playerId}, socketId: ${socket.id}.`);
            this.playerSockets.delete(playerId);
            cleanedOrphanedPlayerSockets = true;
          }
        }

        if (cleanedOrphanedPlayerSockets) {
            console.log(`[AUTH_CLEANUP_SUCCESS] Inconsistent playerSockets entry(ies) found and cleaned up for socket ${socket.id}.`);
        } else {
            console.warn(`[AUTH_CLEANUP_NONE] No orphaned playerSockets entries found for socket ${socket.id}, but clientData was missing.`);
        }

        socket.emit('error', { message: 'Not authenticated' });
        return;
      }

      const room = gameService.getRoom('main_room');
      if (!room) {
        socket.emit('error', { message: 'Game room not found.' });
        return;
      }

      const { playerId, type, data } = command;
      const handler = this.commandHandlers[type];

      if (handler) {
        const result = handler(room, playerId, data);
        if (result && !result.success) {
          socket.emit('action_failed', { message: result.message });
        }
      } else {
        socket.emit('error', { message: `Unknown command type: ${type}` });
      }

    } catch (error) {
      console.error('Error handling player command:', error);
      socket.emit('error', { message: 'Command execution failed' });
    }
  }


  private handlePlayerDisconnect(socket: Socket): void {
    this.rateLimiter.cleanup(socket.id);

    const clientData = this.connectedClients.get(socket.id);
    if (!clientData) {
      console.log(`⚠️ Disconnect from unregistered socket ${socket.id}`);
      return;
    }

    try {
      // Remove player from game room
      const room = gameService.getRoom('main_room');
      if (room) {
        const player = room.removePlayer(clientData.playerId);
        if (player) {
          this.io.to('main_room').emit(SocketEvents.PLAYER_DISCONNECTED, {
            playerId: clientData.playerId,
            player
          });
        }
      }

      // Clean up session
      this.cleanupPlayerSession(clientData.playerId, socket.id);

      console.log(`👋 Player ${clientData.playerId} disconnected cleanly`);
    } catch (error) {
      console.error('Error handling player disconnect:', error);
    }
  }

  // Broadcast only deltas (state changes)
  public broadcastGameDeltas(): void {
    try {
      const room = gameService.getRoom('main_room');
      if (room) {
        const deltas = room.getGameStateDelta();
        // Only broadcast if there are actual changes
        if (Array.isArray(deltas) && deltas.length > 0) {
          this.io.to(SOCKET_MAIN_ROOM).emit('game_state_delta', deltas);
        }
      }
    } catch (error) {
      console.error('Error broadcasting game deltas:', error);
    }
  }

  private startGameLoop(): void {
    console.log('🎮 Starting game loop...');
    this.isGameLoopRunning = true;
    this.gameLoopInterval = setInterval(() => this.executeGameLoop(), this.currentInterval);
    console.log(`✅ Game loop started successfully with interval: ${this.currentInterval}ms`);
  }

  private adjustGameLoopInterval(newInterval: number): void {
    if (this.currentInterval !== newInterval) {
      console.log(`🔄 Adjusting game loop interval: ${this.currentInterval}ms → ${newInterval}ms`);
      this.currentInterval = newInterval;
      this.restartGameLoop();
    }
  }

  private restartGameLoop(): void {
    if (this.gameLoopInterval) {
      clearInterval(this.gameLoopInterval);
    }

    this.gameLoopInterval = setInterval(() => {
      this.executeGameLoop();
    }, this.currentInterval);
  }

  private executeGameLoop(): void {
    const startTime = Date.now();

    try {
      const playerCount = this.getPlayerCount();

      // 🔥 KEY FIX: Dynamic interval adjustment
      if (playerCount === 0) {
        this.adjustGameLoopInterval(10000); // 10 seconds when empty
        this.cleanupGameState();
        const updateTime = Date.now() - startTime;
        this.updateGameLoopStats(updateTime);
        return;
      } else if (playerCount < 10) {
        this.adjustGameLoopInterval(2000); // 2 seconds for small groups
      } else {
        this.adjustGameLoopInterval(1000); // 1 second for active games
      }

      const room = gameService.getRoom('main_room');
      if (room) {
        room.update();
      }

      this.broadcastGameDeltas();

      const updateTime = Date.now() - startTime;
      this.updateGameLoopStats(updateTime);

      // Performance monitoring
      if (this.gameLoopStats.totalUpdates % 60 === 0) {
        this.logGameLoopStats();

        // Proactive memory cleanup
        this.performMemoryCleanup();
      }
    } catch (error) {
      this.handleGameLoopError(error as Error);
    }
  }

  private performMemoryCleanup(): void {
    // Force garbage collection in development
    if (process.env.NODE_ENV === 'development' && global.gc) {
      global.gc();
    }

    // Clean up stale game state
    const room = gameService.getRoom('main_room');
    if (room && typeof room.cleanup === 'function') {
      room.cleanup();
    }
  }

  private handleGameLoopError(error: Error): void {
    this.gameLoopStats.errorCount++;
    console.error('❌ Error in game loop execution:', error);

    // Exponential backoff for error recovery
    const errorBackoff = Math.min(this.gameLoopStats.errorCount * 1000, 10000);
    this.adjustGameLoopInterval(this.currentInterval + errorBackoff);
  }

  private cleanupGameState(): void {
    // Add game state cleanup logic here
    const room = gameService.getRoom('main_room');
    if (room) {
      room.cleanup(); // Implement this method in GameService
    }
  }

  private updateGameLoopStats(updateTime: number): void {
    this.gameLoopStats.totalUpdates++;
    this.gameLoopStats.lastUpdateTime = Date.now();

    // Calculate rolling average update time
    const alpha = 0.1; // Smoothing factor
    this.gameLoopStats.averageUpdateTime =
      this.gameLoopStats.averageUpdateTime * (1 - alpha) + updateTime * alpha;
  }

  private logGameLoopStats(): void {
    console.log('📊 Game Loop Performance Stats:', {
      totalUpdates: this.gameLoopStats.totalUpdates,
      averageUpdateTime: `${this.gameLoopStats.averageUpdateTime.toFixed(2)}ms`,
      errorCount: this.gameLoopStats.errorCount,
      activePlayers: this.getPlayerCount(),
      lastUpdate: new Date(this.gameLoopStats.lastUpdateTime).toISOString()
    });
  }

  private stopGameLoop(): void {
    if (this.gameLoopInterval) {
      clearInterval(this.gameLoopInterval);
      this.gameLoopInterval = null;
      this.isGameLoopRunning = false;
    }
  }

  // Periodic cleanup of stale ClientData entries to prevent memory leaks
  private startCleanupInterval(): void {
    if (this.cleanupInterval) return; // already started
    console.log('🧹 Starting stale client cleanup interval...');

    // Run cleanup every 30 seconds
    this.cleanupInterval = setInterval(() => {
      this.cleanupStaleClientData();
    }, 30000);

    console.log('✅ Stale client cleanup started successfully');
  }

  private stopCleanupInterval(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  private cleanupStaleClientData(): void {
    const staleSockets = new Set<string>();

    // First pass: identify stale sockets
    this.connectedClients.forEach((clientData, socketId) => {
      if (!this.io.sockets.sockets.has(socketId)) {
        staleSockets.add(socketId);
      }
    });

    // Second pass: batch cleanup
    if (staleSockets.size > 0) {
      staleSockets.forEach(socketId => {
        const clientData = this.connectedClients.get(socketId);
        if (clientData) {
          this.connectedClients.delete(socketId);
          // Use atomic operation to prevent race conditions
          if (this.playerSockets.get(clientData.playerId) === socketId) {
            this.playerSockets.delete(clientData.playerId);
          }
        }
      });

      console.log(`[CLEANUP] Removed ${staleSockets.size} stale connections`);
    }
  }

  // Periodic cleanup of stale ClientData entries to prevent memory leaks

  // Public methods for external access
  public getConnectedClients(): ClientData[] {
    return Array.from(this.connectedClients.values());
  }

  public getPlayerCount(): number {
    return this.connectedClients.size;
  }

  public getGameLoopStats() {
    return this.gameLoopStats;
  }

  public validateEnvironment() {
    if (!process.env.NODE_ENV) {
      throw new Error('NODE_ENV is not defined.');
    }
  }

  public isPlayerOnline(playerId: string): boolean {
    return this.playerSockets.has(playerId);
  }

  public sendToPlayer(playerId: string, event: string, data: any): void {
    const socketId = this.playerSockets.get(playerId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
    }
  }

  public broadcast(event: string, data: any): void {
    this.io.to(SOCKET_MAIN_ROOM).emit(event, data);
  }

  // Graceful shutdown
  public shutdown(): void {
    console.log('Shutting down WebSocket server...');

    // Stop the game loop first
    this.stopGameLoop();

    // Stop cleanup interval
    this.stopCleanupInterval();

    // Disconnect all clients
    this.io.disconnectSockets();

    // Clear tracking maps
    this.connectedClients.clear();
    this.playerSockets.clear();

    console.log('✅ WebSocket server shutdown complete');
  }
}
