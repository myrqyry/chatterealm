import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { GameActionResult } from './CataclysmService';
import { MoveResult } from './PlayerMovementService';
import { CombatResult } from './CombatService';
import { ItemResult } from './LootManager';
import { Player, GameWorld, PlayerClass, JoinGameData, SocketEvents } from 'shared';
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

// Central socket room name used across this module
const SOCKET_MAIN_ROOM = 'main_room';

export class WebSocketServer {
  private io: SocketIOServer;
  private characterHandler: CharacterHandler;
  private connectedClients: Map<string, ClientData> = new Map();
  private playerSockets: Map<string, string> = new Map(); // playerId -> socketId
  private authenticationLocks: Set<string> = new Set();
  private gameLoopInterval: NodeJS.Timeout | null = null;
  private isGameLoopRunning: boolean = false;
  private cleanupInterval: NodeJS.Timeout | null = null; // Add cleanup interval for stale entries
  private rateLimiter: RateLimiter;
  private gameLoopStats = {
    totalUpdates: 0,
    lastUpdateTime: 0,
    averageUpdateTime: 0,
    errorCount: 0
  };

  constructor(httpServer: HTTPServer) {
    // Initialize Socket.IO server with CORS configuration
    this.io = new SocketIOServer(httpServer, {
      cors: {
        // Allow all origins to simplify local testing and CLI test clients
        origin: true,
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

      socket.on(
        'npc_message',
        async (data: { npcId: string; message: string }) => {
          const clientData = this.connectedClients.get(socket.id);
          if (clientData) {
            const room = gameService.getRoom('main_room');
            if (room) {
              const response = await room.handleNpcInteraction(
                clientData.playerId,
                data.npcId,
                data.message
              );
              socket.emit('npc_response', { success: true, message: response });
            }
          }
        }
      );

      // Handle client disconnect
      socket.on('disconnect', () => {
        this.handlePlayerDisconnect(socket);
      });

      // Handle connection errors
      socket.on('error', (error) => {
        console.error(`Socket error for ${socket.id}:`, error);
        this.handlePlayerDisconnect(socket);
      });
    });
  }

  private handlePlayerJoin(socket: Socket, playerData: JoinGameData): void {
    if (this.authenticationLocks.has(playerData.id)) {
      socket.emit('error', { message: 'Authentication already in progress for this player.' });
      return;
    }

    this.authenticationLocks.add(playerData.id);

    try {
      if (this.isPlayerOnline(playerData.id)) {
        socket.emit('error', { message: 'Player is already online.' });
        console.warn(`[JOIN_REJECTED] Player ${playerData.id} is already online. Rejecting join request for socket ${socket.id}.`);
        return;
      }

      console.log(`[JOIN_START] Processing join for socket ${socket.id} with player data:`, playerData);
      console.log(`[JOIN_START] ConnectedClients before join: ${this.connectedClients.size}`);

      // Set authentication state to prevent race conditions
      socket.data.isAuthenticating = true;
      socket.data.commandQueue = [];

      const room = gameService.joinRoom(SOCKET_MAIN_ROOM, {
        ...playerData,
        position: { x: 0, y: 0 },
        health: 100,
        mana: 100,
        stamina: 100,
        hunger: 100,
        thirst: 100,
        stats: {
          hp: 100,
          maxHp: 100,
          attack: 10,
          defense: 5,
          speed: 5,
        },
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
        class: playerData.class || PlayerClass.KNIGHT,
        avatar: playerData.avatar || '👤',
        twitchUsername: '',
      });

      if (!room) {
        console.error(
          `[SPAWN_ERROR] Failed to add player ${playerData.displayName} to room ${SOCKET_MAIN_ROOM}`
        );
        socket.emit('error', { message: 'Failed to join room' });
        return;
      }

      console.log(`[JOIN_REGISTERING] About to register socket ${socket.id} in connectedClients`);

      // Use authoritative player instance created by the room
      const addedPlayer = room.getPlayers().find(p => p.id === playerData.id);
      if (!addedPlayer) {
        console.error(`[SPAWN_ERROR] Player added but authoritative instance not found for id ${playerData.id}`);
        socket.emit('error', { message: 'Failed to join room (internal)' });
        return;
      }

      // Track client connection using authoritative player id
      const clientData: ClientData = {
        playerId: addedPlayer.id,
        socketId: socket.id,
        connectedAt: Date.now()
      };

      this.connectedClients.set(socket.id, clientData);
      this.playerSockets.set(addedPlayer.id, socket.id);

      console.log(`[JOIN_REGISTERED] Socket ${socket.id} registered in connectedClients`);
      console.log(`[JOIN_REGISTERED] ConnectedClients after join: ${this.connectedClients.size}`);
      console.log(`[JOIN_REGISTERED] ConnectedClients keys: [${Array.from(this.connectedClients.keys()).join(', ')}]`);

      socket.data.isAuthenticated = true;
      delete socket.data.isAuthenticating;

      // Process any queued commands
      if (socket.data.commandQueue && socket.data.commandQueue.length > 0) {
        socket.data.commandQueue.forEach((queuedCommand: PlayerCommand) => {
          this.handlePlayerCommand(socket, queuedCommand);
        });
        socket.data.commandQueue = [];
      }

      // Join player to their personal room for targeted updates
      socket.join(`player_${addedPlayer.id}`);

      // Send success response with initial game state using authoritative player
      socket.emit(SocketEvents.GAME_JOINED, {
        player: addedPlayer,
        gameWorld: room.getGameState(),
      });

      // Broadcast player joined to all other clients in the main room
      socket.to(SOCKET_MAIN_ROOM).emit(SocketEvents.PLAYER_JOINED, {
        player: addedPlayer
      });

      // Join the main game room
      socket.join(SOCKET_MAIN_ROOM);

      socket.emit('join_acknowledged', { status: 'success' });

    } catch (error) {
      console.error('Error handling player join:', error);
      socket.emit('error', { message: 'Failed to join game' });
    } finally {
      this.authenticationLocks.delete(playerData.id);
    }
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
      let result;

      switch (type) {
        case 'move':
          result = room.movePlayer(playerId, data.position);
          break;
        case 'attack':
          result = room.attackEnemy(playerId, data.targetPosition);
          break;
        case 'pickup':
          result = room.pickupItem(playerId, data.itemId);
          break;
        case 'loot_item':
          result = room.lootItem(playerId, data.itemId);
          break;
        case 'inspect_item':
          result = room.inspectItem(playerId, data.itemId);
          break;
        default:
          socket.emit('error', { message: `Unknown command type: ${type}` });
          return;
      }

      if (result && !result.success) {
        socket.emit('action_failed', { message: result.message });
      }

    } catch (error) {
      console.error('Error handling player command:', error);
      socket.emit('error', { message: 'Command execution failed' });
    }
  }


  private handlePlayerDisconnect(socket: Socket): void {
    this.rateLimiter.cleanup(socket.id);
    try {
      const clientData = this.connectedClients.get(socket.id);
      if (clientData) {
        const roomId = 'main_room';
        const room = gameService.getRoom(roomId);
        if (room) {
            const player = room.removePlayer(clientData.playerId);
            if (player) {
              // Broadcast player disconnected to all clients in the room
              this.io.to(roomId).emit(SocketEvents.PLAYER_DISCONNECTED, {
                playerId: clientData.playerId,
                player: player,
              });
            }
        }

        // Ensure explicit cleanup of mappings from connectedClients and playerSockets
        this.connectedClients.delete(socket.id);
        // Only delete from playerSockets if it still points to the disconnecting socket
        if (this.playerSockets.get(clientData.playerId) === socket.id) {
          this.playerSockets.delete(clientData.playerId);
        }

        // Ensure any authentication locks are cleared for this player
        this.authenticationLocks.delete(clientData.playerId);

        console.log(`Client disconnected: ${socket.id}`);
      }
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

    // Start the game loop with 1-second intervals
    this.gameLoopInterval = setInterval(() => {
      this.executeGameLoop();
    }, 1000);

    this.isGameLoopRunning = true;
    console.log('✅ Game loop started successfully');
  }

  private executeGameLoop(): void {
    const startTime = Date.now();

    try {
      // Only run game updates if there are active players
      if (this.getPlayerCount() === 0) {
        // Skip updates when no players are online to save resources
        return;
      }

      const room = gameService.getRoom('main_room');
      if (room) {
        room.update();
      }

      // Broadcast only deltas (state changes)
      this.broadcastGameDeltas();

      // Update performance statistics
      const updateTime = Date.now() - startTime;
      this.updateGameLoopStats(updateTime);

      // Log performance metrics every 60 seconds
      if (this.gameLoopStats.totalUpdates % 60 === 0) {
        this.logGameLoopStats();
      }

    } catch (error) {
      this.gameLoopStats.errorCount++;
      console.error('❌ Error in game loop execution:', error);

      // Log detailed error information
      console.error('Game loop error details:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        playerCount: this.getPlayerCount(),
        totalUpdates: this.gameLoopStats.totalUpdates,
        errorCount: this.gameLoopStats.errorCount
      });
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
    try {
      const now = Date.now();
      const staleTimeout = 60000; // 60 seconds timeout for joins not confirmed
      let cleanedCount = 0;

      console.log(`[CLEANUP_CHECK] Starting stale client data cleanup - ${this.connectedClients.size} clients tracked`);

      // Iterate over a copy of entries to avoid mutation issues while iterating
      for (const [socketId, clientData] of Array.from(this.connectedClients.entries())) {
        const age = now - clientData.connectedAt;

        // Condition to treat entry as stale: socket is no longer present in io.sockets
        const socketExists = this.io.sockets.sockets.has(socketId);

        if (!socketExists) {
          console.log(`[CLEANUP] Removing stale client data for socket ${socketId}:`, {
            playerId: clientData.playerId,
            ageMs: age,
            socketExists
          });

          // Remove mappings
          this.connectedClients.delete(socketId);
          // CRITICAL: Only remove player socket mapping if it still points to the stale socket
          if (this.playerSockets.get(clientData.playerId) === socketId) {
            this.playerSockets.delete(clientData.playerId);
          }

          // The player is intentionally left in the game world as "disconnected"
          // This allows for potential reconnection logic in the future.
          // If a player needs to be fully removed on disconnect, that logic
          // should be in handlePlayerDisconnect.

          cleanedCount++;
        }
      }

      if (cleanedCount > 0) {
        console.log(`[CLEANUP_COMPLETE] Cleaned up ${cleanedCount} stale client entries`);
        console.log(`[CLEANUP_STATUS] Remaining clients: ${this.connectedClients.size}, Player sockets: ${this.playerSockets.size}`);
      } else {
        console.log(`[CLEANUP_CHECK] No stale entries found`);
      }
    } catch (err) {
      console.error('[CLEANUP_ERROR] Error during stale client cleanup:', err);
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
