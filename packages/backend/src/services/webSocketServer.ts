import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { GameStateManager, GameActionResult, MoveResult, CombatResult, ItemResult } from './gameStateManager';
import { Player, GameWorld, PlayerClass, JoinGameData, SocketEvents } from 'shared';

export interface ClientData {
  playerId: string;
  socketId: string;
  connectedAt: number;
}

export interface PlayerCommand {
  type: 'move' | 'move_to' | 'attack' | 'pickup' | 'use_item' | 'start_cataclysm';
  playerId: string;
  data?: any;
}

// The QueuedCommand interface is no longer needed with the simplified authentication logic.

export class WebSocketServer {
  private io: SocketIOServer;
  private gameStateManager: GameStateManager;
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

  constructor(httpServer: HTTPServer, gameStateManager: GameStateManager) {
    this.gameStateManager = gameStateManager;

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

    this.setupEventHandlers();
    this.startGameLoop();
    this.startCleanupInterval(); // Start periodic stale client cleanup
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

      // Handle explicit leave requests from clients
      socket.on('leave_game', (data: { playerId?: string } | undefined) => {
        try {
          const pid = data?.playerId || this.connectedClients.get(socket.id)?.playerId;
          if (!pid) {
            console.warn(`[LEAVE_GAME] No playerId provided and no mapping found for socket ${socket.id}`);
            return;
          }

          console.log(`[LEAVE_GAME] Received leave request for player ${pid} from socket ${socket.id}`);

          // Remove player from game state
          const result = this.gameStateManager.removePlayer(pid);
          if (!result.success) {
            console.warn(`[LEAVE_GAME] Failed to remove player ${pid}: ${result.message}`);
          } else {
            // Broadcast player left to all clients
            this.io.to('game_room').emit('player_left', { playerId: pid, player: result.data.player });
          }

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
        console.log(`[INSPECT_ITEM] Socket ${socket.id} inspecting item:`, itemId);
        this.handleInspectItem(socket, itemId);
      });

      socket.on('loot_item', (itemId: string) => {
        console.log(`[LOOT_ITEM] Socket ${socket.id} looting item:`, itemId);
        this.handleLootItem(socket, itemId);
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
        position: { x: 0, y: 0 }, // Will be set by GameStateManager
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

      // Add player to game state
      const result = this.gameStateManager.addPlayer(player);

      if (!result.success) {
        console.error(`[SPAWN_ERROR] Failed to add player ${player.displayName}:`, result.message);
        socket.emit('error', { message: result.message });
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
        gameWorld: this.gameStateManager.getGameWorld()
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

      // Update player's lastActive timestamp
  const player = this.gameStateManager.getPlayers().find(p => p.id === clientData.playerId);
      if (player) {
        player.lastActive = Date.now();
      }

      // With the simplified authentication flow, the presence of clientData means the user is authenticated.
      // There is no need to queue commands.
      const result = this.executePlayerCommand(clientData, command);

      // Send result back to the client
      socket.emit('command_result', {
        command: command.type,
        success: result.success,
        message: result.message
      });

      // If command was successful and affects game state, broadcast update
      if (result.success) {
  this.broadcastGameDeltas();
      }

    } catch (error) {
      console.error('Error handling player command:', error);
      socket.emit('error', { message: 'Command execution failed' });
    }
  }

  private executePlayerCommand(clientData: ClientData, command: PlayerCommand): GameActionResult | MoveResult | CombatResult | ItemResult {
    let result: GameActionResult | MoveResult | CombatResult | ItemResult;

    switch (command.type) {
      case 'move':
        if (!command.data?.direction) {
          throw new Error('Missing direction for move command');
        }
        result = this.gameStateManager.movePlayer(clientData.playerId, command.data.direction);
        break;

      case 'move_to':
        if (!command.data?.target) {
          throw new Error('Missing target for move_to command');
        }
        result = this.gameStateManager.requestMoveTo(clientData.playerId, command.data.target);
        break;

      case 'attack':
        if (!command.data?.targetId) {
          throw new Error('Missing target for attack command');
        }
        // Find the target (player or NPC)
        const attacker = this.gameStateManager.getGameWorld().players.find(p => p.id === clientData.playerId);
        if (!attacker) {
          throw new Error('Attacker not found');
        }

        const targetPlayer = this.gameStateManager.getGameWorld().players.find(p => p.id === command.data.targetId);
        const targetNPC = this.gameStateManager.getGameWorld().npcs.find(n => n.id === command.data.targetId);

        if (!targetPlayer && !targetNPC) {
          throw new Error('Target not found');
        }

        // Attack enemy using the new API which takes playerId and targetPosition
        const targetPosition = (targetPlayer || targetNPC)!.position;
        result = this.gameStateManager.attackEnemy(clientData.playerId, targetPosition);
        break;

      case 'pickup':
        if (!command.data?.itemId) {
          throw new Error('Missing item ID for pickup command');
        }
        result = this.gameStateManager.pickupItem(clientData.playerId, command.data.itemId);
        break;

      case 'use_item':
        if (!command.data?.itemId) {
          throw new Error('Missing item ID for use command');
        }
        result = this.gameStateManager.useItem(clientData.playerId, command.data.itemId);
        break;

      case 'start_cataclysm':
        result = this.gameStateManager.startCataclysm();
        break;

      default:
        throw new Error('Unknown command type');
    }

    return result;
  }

  private handleInspectItem(socket: Socket, itemId: string): void {
    try {
      const clientData = this.connectedClients.get(socket.id);
      if (!clientData) {
        socket.emit('error', { message: 'Not authenticated' });
        return;
      }

      const result = this.gameStateManager.inspectItem(clientData.playerId, itemId);

      socket.emit('command_result', {
        command: 'inspect_item',
        success: result.success,
        message: result.message,
        item: result.item
      });

      if (result.success) {
        this.broadcastGameDeltas();
      }
    } catch (error) {
      console.error('Error handling inspect item:', error);
      socket.emit('error', { message: 'Inspect item failed' });
    }
  }

  private handleLootItem(socket: Socket, itemId: string): void {
    try {
      const clientData = this.connectedClients.get(socket.id);
      if (!clientData) {
        socket.emit('error', { message: 'Not authenticated' });
        return;
      }

      const result = this.gameStateManager.lootItem(clientData.playerId, itemId);

      if (result.success) {
        socket.emit('loot_success', { item: result.item });
      } else {
        socket.emit('loot_failure', { reason: result.message });
      }

      socket.emit('command_result', {
        command: 'loot_item',
        success: result.success,
        message: result.message,
        item: result.item
      });

      if (result.success) {
        this.broadcastGameDeltas();
      }
    } catch (error) {
      console.error('Error handling loot item:', error);
      socket.emit('error', { message: 'Loot item failed' });
    }
  }

  private handlePlayerDisconnect(socket: Socket): void {
    try {
      const clientData = this.connectedClients.get(socket.id);
      if (clientData) {
        // Mark player as disconnected instead of removing them completely
    const player = this.gameStateManager.getPlayers().find(p => p.id === clientData.playerId);
        if (player) {
          player.connected = false;
          player.lastActive = Date.now();

          // Broadcast player disconnected to all clients (but keep them in game world)
          this.io.to('game_room').emit(SocketEvents.PLAYER_DISCONNECTED, {
            playerId: clientData.playerId,
            player: player
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
      const deltas = this.gameStateManager.getAndClearChangeEvents();
      if (deltas.length > 0) {
        this.io.to('game_room').emit('game_state_delta', deltas);
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

      // Execute game state updates
      this.gameStateManager.update();

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
