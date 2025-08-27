import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { GameStateManager, GameActionResult, MoveResult, CombatResult, ItemResult } from './gameStateManager';
import { Player, GameWorld, PlayerClass } from 'shared/src/types/game';

export interface ClientData {
  playerId: string;
  socketId: string;
  connectedAt: number;
  isJoinConfirmed: boolean;
  commandQueue: QueuedCommand[];
}

export interface PlayerCommand {
  type: 'move' | 'attack' | 'pickup' | 'use_item' | 'start_cataclysm';
  playerId: string;
  data?: any;
}

export interface QueuedCommand {
  command: PlayerCommand;
  timestamp: number;
  resolve: (result: any) => void;
  reject: (error: any) => void;
}

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
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
      },
      pingTimeout: 60000,
      pingInterval: 25000
    });

    this.setupEventHandlers();
    this.startGameLoop();
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      console.log(`Client connected: ${socket.id}`);

      // Handle player join
      socket.on('join_game', (playerData: Partial<Player>) => {
        this.handlePlayerJoin(socket, playerData);
      });

      // Handle player commands
      socket.on('player_command', (command: PlayerCommand) => {
        this.handlePlayerCommand(socket, command);
      });

      // Handle join confirmation from client
      socket.on('join_confirmed', () => {
        this.handleJoinConfirmation(socket);
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

  private handlePlayerJoin(socket: Socket, playerData: Partial<Player>): void {
    try {
      console.log(`[JOIN_GAME] Player join attempt from socket ${socket.id}:`, playerData);

      // Validate player data
      if (!playerData.id || !playerData.displayName) {
        console.error(`[JOIN_ERROR] Invalid player data: missing id or displayName`, playerData);
        socket.emit('error', { message: 'Invalid player data: missing id or displayName' });
        return;
      }

      // DIAGNOSTIC: Check for existing client data with same socket ID (potential memory leak)
      const existingClientData = this.connectedClients.get(socket.id);
      if (existingClientData) {
        console.warn(`[AUTH_DIAGNOSTIC] Found existing client data for socket ${socket.id}:`, {
          playerId: existingClientData.playerId,
          connectedAt: new Date(existingClientData.connectedAt),
          isJoinConfirmed: existingClientData.isJoinConfirmed,
          queuedCommands: existingClientData.commandQueue.length
        });
        console.warn(`[AUTH_DIAGNOSTIC] This indicates a potential memory leak - cleaning up stale entry`);
        this.connectedClients.delete(socket.id);
        this.playerSockets.delete(existingClientData.playerId);
      }

      // DIAGNOSTIC: Check for existing player with same ID but different socket (reconnection scenario)
      const existingSocketForPlayer = this.playerSockets.get(playerData.id);
      if (existingSocketForPlayer && existingSocketForPlayer !== socket.id) {
        console.warn(`[AUTH_DIAGNOSTIC] Player ${playerData.id} reconnecting - old socket: ${existingSocketForPlayer}, new socket: ${socket.id}`);
        console.warn(`[AUTH_DIAGNOSTIC] Cleaning up old connection mapping`);
        this.connectedClients.delete(existingSocketForPlayer);
        this.playerSockets.delete(playerData.id);
      }

      // Create player object with all required properties
      const player: Player = {
        id: playerData.id!,
        displayName: playerData.displayName!,
        twitchUsername: playerData.twitchUsername || '',
        avatar: playerData.avatar || '👤', // Default avatar emoji
        position: { x: 0, y: 0 }, // Will be set by GameStateManager
        class: playerData.class || PlayerClass.KNIGHT, // Default to knight
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

      // DIAGNOSTIC: Log spawn attempt with game world state
      console.log(`[SPAWN_DIAGNOSTIC] Attempting to spawn player ${player.displayName}:`, {
        totalPlayers: this.gameStateManager.getPlayers().length,
        connectedPlayers: this.gameStateManager.getPlayers().filter(p => p.connected).length,
        totalNPCs: this.gameStateManager.getNPCs().length,
        totalItems: this.gameStateManager.getItems().length
      });

      // Add player to game state
      const result = this.gameStateManager.addPlayer(player);

      if (!result.success) {
        console.error(`[SPAWN_ERROR] Failed to add player ${player.displayName}:`, result.message);
        socket.emit('error', { message: result.message });
        return;
      }

      // Track client connection
      const clientData: ClientData = {
        playerId: player.id,
        socketId: socket.id,
        connectedAt: Date.now(),
        isJoinConfirmed: false, // Will be set to true when client confirms join
        commandQueue: [] // Queue for commands until join is confirmed
      };

      this.connectedClients.set(socket.id, clientData);
      this.playerSockets.set(player.id, socket.id);

      console.log(`[JOIN_SUCCESS] Player ${player.displayName} authenticated and added to game`);
      console.log(`[JOIN_SUCCESS] Client data stored:`, clientData);
      console.log(`[JOIN_SUCCESS] Total connected clients: ${this.connectedClients.size}`);

      // DIAGNOSTIC: Validate map synchronization
      const playerSocketEntry = this.playerSockets.get(player.id);
      const clientDataEntry = this.connectedClients.get(socket.id);
      if (playerSocketEntry !== socket.id || clientDataEntry?.playerId !== player.id) {
        console.error(`[MAP_SYNC_ERROR] Map synchronization failed:`, {
          expectedSocketId: socket.id,
          playerSocketEntry,
          expectedPlayerId: player.id,
          clientDataPlayerId: clientDataEntry?.playerId
        });
      } else {
        console.log(`[MAP_SYNC_SUCCESS] Client tracking maps synchronized correctly`);
      }

      // Join player to their personal room for targeted updates
      socket.join(`player_${player.id}`);

      // Send success response with initial game state
      socket.emit('game_joined', {
        player: result.data.player,
        gameWorld: this.gameStateManager.getGameWorld()
      });

      // Broadcast player joined to all other clients
      socket.to('game_room').emit('player_joined', {
        player: result.data.player
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
    try {
      const clientData = this.connectedClients.get(socket.id);
      if (!clientData) {
        console.error(`[AUTH_ERROR] Not authenticated - socket ${socket.id} not found in connectedClients`);
        console.error(`[AUTH_ERROR] Connected clients: ${Array.from(this.connectedClients.keys()).join(', ')}`);
        console.error(`[AUTH_ERROR] Player sockets: ${Array.from(this.playerSockets.entries()).map(([pid, sid]) => `${pid}:${sid}`).join(', ')}`);
        
        // DIAGNOSTIC: Check if this socket ID exists in playerSockets but not connectedClients
        const orphanedPlayerEntries = Array.from(this.playerSockets.entries()).filter(([playerId, socketId]) => socketId === socket.id);
        if (orphanedPlayerEntries.length > 0) {
          console.error(`[AUTH_ERROR] Found orphaned playerSockets entries for this socket:`, orphanedPlayerEntries);
          console.error(`[AUTH_ERROR] This indicates a map synchronization issue`);
        }
        
        socket.emit('error', { message: 'Not authenticated' });
        return;
      }

      // DIAGNOSTIC: Log command processing state
      console.log(`[COMMAND_DIAGNOSTIC] Processing command from ${clientData.playerId}:`, {
        command: command.type,
        isJoinConfirmed: clientData.isJoinConfirmed,
        queuedCommands: clientData.commandQueue.length,
        connectedAt: new Date(clientData.connectedAt),
        socketAge: Date.now() - clientData.connectedAt
      });

      // If join is not confirmed, queue the command
      if (!clientData.isJoinConfirmed) {
        console.log(`[COMMAND_QUEUED] Player ${clientData.playerId} command queued until join confirmed:`, command.type);
        this.queueCommand(clientData, command);
        return;
      }

      // Execute the command immediately if join is confirmed
      const result = this.executePlayerCommand(clientData, command);

      // Send result back to the client
      socket.emit('command_result', {
        command: command.type,
        success: result.success,
        message: result.message,
        data: result.data
      });

      // If command was successful and affects game state, broadcast update
      if (result.success) {
        this.broadcastGameState();
      }

    } catch (error) {
      console.error('Error handling player command:', error);
      socket.emit('error', { message: 'Command execution failed' });
    }
  }

  private queueCommand(clientData: ClientData, command: PlayerCommand): void {
    // Create a promise that will be resolved when the command is processed
    const promise = new Promise((resolve, reject) => {
      const queuedCommand: QueuedCommand = {
        command,
        timestamp: Date.now(),
        resolve,
        reject
      };

      clientData.commandQueue.push(queuedCommand);

      // Set a timeout to reject the command if it waits too long
      setTimeout(() => {
        const index = clientData.commandQueue.findIndex(qc => qc === queuedCommand);
        if (index !== -1) {
          clientData.commandQueue.splice(index, 1);
          reject(new Error('Command timed out while waiting for join confirmation'));
        }
      }, 30000); // 30 second timeout
    });

    // Handle the promise (log errors but don't crash)
    promise.catch(error => {
      console.error(`Queued command failed for player ${clientData.playerId}:`, error);
    });
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

        result = this.gameStateManager.attackEnemy(attacker, targetPlayer || targetNPC!);
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

  private handleJoinConfirmation(socket: Socket): void {
    try {
      const clientData = this.connectedClients.get(socket.id);
      if (!clientData) {
        console.error(`[JOIN_CONFIRMATION_ERROR] No client data found for socket ${socket.id}`);
        return;
      }

      console.log(`[JOIN_CONFIRMED] Player ${clientData.playerId} confirmed join`);

      // Mark join as confirmed
      clientData.isJoinConfirmed = true;

      // Process any queued commands
      this.processQueuedCommands(clientData);

    } catch (error) {
      console.error('Error handling join confirmation:', error);
    }
  }

  private processQueuedCommands(clientData: ClientData): void {
    if (clientData.commandQueue.length === 0) {
      return;
    }

    console.log(`[QUEUE_PROCESSING] Processing ${clientData.commandQueue.length} queued commands for player ${clientData.playerId}`);

    // Process all queued commands
    while (clientData.commandQueue.length > 0) {
      const queuedCommand = clientData.commandQueue.shift()!;
      const { command, resolve, reject } = queuedCommand;

      try {
        // Execute the command
        const result = this.executePlayerCommand(clientData, command);

        // Send result back to client
        const socket = this.io.sockets.sockets.get(clientData.socketId);
        if (socket) {
          socket.emit('command_result', {
            command: command.type,
            success: result.success,
            message: result.message,
            data: result.data
          });

          // If command was successful and affects game state, broadcast update
          if (result.success) {
            this.broadcastGameState();
          }
        }

        resolve(result);
      } catch (error) {
        console.error(`Error processing queued command for player ${clientData.playerId}:`, error);

        // Send error back to client
        const socket = this.io.sockets.sockets.get(clientData.socketId);
        if (socket) {
          socket.emit('error', { message: error instanceof Error ? error.message : 'Command execution failed' });
        }

        reject(error);
      }
    }
  }

  private handlePlayerDisconnect(socket: Socket): void {
    try {
      const clientData = this.connectedClients.get(socket.id);
      if (clientData) {
        // DIAGNOSTIC: Log disconnect details
        console.log(`[DISCONNECT_DIAGNOSTIC] Socket ${socket.id} disconnecting:`, {
          playerId: clientData.playerId,
          connectedAt: new Date(clientData.connectedAt),
          connectionDuration: Date.now() - clientData.connectedAt,
          isJoinConfirmed: clientData.isJoinConfirmed,
          queuedCommands: clientData.commandQueue.length
        });

        // Mark player as disconnected instead of removing them completely
        const player = this.gameStateManager.getPlayer(clientData.playerId);
        if (player) {
          player.connected = false;
          player.lastActive = Date.now();

          console.log(`[DISCONNECT] Player ${player.displayName} marked as disconnected`);

          // Broadcast player disconnected to all clients (but keep them in game world)
          this.io.to('game_room').emit('player_disconnected', {
            playerId: clientData.playerId,
            player: player
          });
        } else {
          console.warn(`[DISCONNECT_WARNING] Could not find player ${clientData.playerId} in game world`);
        }

        // Clean up tracking
        this.connectedClients.delete(socket.id);
        this.playerSockets.delete(clientData.playerId);

        // DIAGNOSTIC: Verify cleanup
        const remainingSocketEntry = this.playerSockets.get(clientData.playerId);
        const remainingClientEntry = this.connectedClients.get(socket.id);
        if (remainingSocketEntry || remainingClientEntry) {
          console.error(`[CLEANUP_ERROR] Failed to clean up connection tracking:`, {
            remainingSocketEntry,
            remainingClientEntry
          });
        } else {
          console.log(`[CLEANUP_SUCCESS] Connection tracking cleaned up successfully`);
        }
      } else {
        console.warn(`[DISCONNECT_WARNING] No client data found for disconnecting socket ${socket.id}`);
      }

      console.log(`Client disconnected: ${socket.id}`);
    } catch (error) {
      console.error('Error handling player disconnect:', error);
    }
  }

  public broadcastGameState(): void {
    try {
      const gameWorld = this.gameStateManager.getGameWorld();
      this.io.to('game_room').emit('game_state_update', gameWorld);
    } catch (error) {
      console.error('Error broadcasting game state:', error);
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

      // Broadcast updated game state to all connected clients
      this.broadcastGameState();

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
      console.log('🛑 Game loop stopped');
    }
  }

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

    // Disconnect all clients
    this.io.disconnectSockets();

    // Clear tracking maps
    this.connectedClients.clear();
    this.playerSockets.clear();

    console.log('✅ WebSocket server shutdown complete');
  }
}