import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { GameActionResult, MoveResult, CombatResult, ItemResult } from './gameStateManager';
import { Player, GameWorld, PlayerClass, JoinGameData, SocketEvents } from 'shared';
import { CharacterHandler } from '../handlers/CharacterHandler';

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

export class WebSocketServer {
  private io: SocketIOServer;
  private characterHandler: CharacterHandler;
  private connectedClients: Map<string, ClientData> = new Map();
  private playerSockets: Map<string, string> = new Map(); // playerId -> socketId
  private gameLoopInterval: NodeJS.Timeout | null = null;
  private isGameLoopRunning: boolean = false;
  private cleanupInterval: NodeJS.Timeout | null = null; // Add cleanup interval for stale entries
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
          gameService.leaveRoom(roomId, pid);

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
    });
  }

  private handlePlayerJoin(socket: Socket, playerData: JoinGameData): void {
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
      
      // Create player object with all required properties
      const player: Player = {
        id: playerData.id,
        displayName: playerData.displayName,
        twitchUsername: '', // Initialized to empty string as it's not part of JoinGameData
        avatar: playerData.avatar || '👤', // Default avatar emoji
        position: (playerData as any).position || { x: 0, y: 0 }, // Will be set by GameStateManager
        class: playerData.class || PlayerClass.KNIGHT, // Default to knight
        health: 100, // Full health at spawn
        mana: 100, // Full mana at spawn
        stamina: 100, // Full stamina at spawn
        hunger: 100, // Not hungry at spawn
        thirst: 100, // Not thirsty at spawn
        stats: {
          hp: 100,
          maxHp: 100,
          attack: 10,
          defense: 5,
          speed: 5
        },
        level: 1,
        experience: 0,
        inventory: [],
        equipment: {
          weapon: undefined,
          armor: undefined,
          accessory: undefined
        },
        achievements: [],
        titles: [],
        isAlive: true,
        lastMoveTime: 0,
        spawnTime: Date.now(),
        connected: true,
        lastActive: Date.now()
      };

      const roomId = 'main_room';
      const room = gameService.joinRoom(roomId, player);

      if (!room) {
        console.error(`[SPAWN_ERROR] Failed to add player ${player.displayName} to room ${roomId}`);
        socket.emit('error', { message: 'Failed to join room' });
        return;
      }

      console.log(`[JOIN_REGISTERING] About to register socket ${socket.id} in connectedClients`);

      // Track client connection
      const clientData: ClientData = {
        playerId: player.id,
        socketId: socket.id,
        connectedAt: Date.now()
      };

      this.connectedClients.set(socket.id, clientData);
      this.playerSockets.set(player.id, socket.id);

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
      socket.join(`player_${player.id}`);

      // Send success response with initial game state
      socket.emit(SocketEvents.GAME_JOINED, {
        player: player,
        gameWorld: room.getGameState(),
      });

      // Broadcast player joined to all other clients
      socket.to('game_room').emit(SocketEvents.PLAYER_JOINED, {
        player: player
      });

      // Join the main game room
      socket.join('game_room');

      console.log(`[JOIN_SUCCESS] Player ${player.displayName} fully joined the game`);

    } catch (error) {
      console.error('Error handling player join:', error);
      socket.emit('error', { message: 'Failed to join game' });
    }
  }

  private handlePlayerCommand(socket: Socket, command: PlayerCommand): void {
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
    try {
      const clientData = this.connectedClients.get(socket.id);
      if (clientData) {
        const roomId = 'main_room';
        const player = gameService.leaveRoom(roomId, clientData.playerId);

        if (player) {
          // Broadcast player disconnected to all clients in the room
          this.io.to(roomId).emit(SocketEvents.PLAYER_DISCONNECTED, {
            playerId: clientData.playerId,
            player: player.getData(),
          });
        }

        // Ensure explicit cleanup of mappings from connectedClients and playerSockets
        this.connectedClients.delete(socket.id);
        // Only delete from playerSockets if it still points to the disconnecting socket
        if (this.playerSockets.get(clientData.playerId) === socket.id) {
          this.playerSockets.delete(clientData.playerId);
        }

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
        // In a more advanced implementation, we would have deltas.
        // For now, we broadcast the full game state.
        this.io.to('main_room').emit('game_state_update', room.getGameState());
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
          this.playerSockets.delete(clientData.playerId);

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
    this.io.to('game_room').emit(event, data);
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
