import { io, Socket } from 'socket.io-client';
import { Player, GameWorld } from '../../../shared/src/types/game';
import { useGameStore } from '../stores/gameStore';

export interface PlayerCommand {
  type: 'move' | 'attack' | 'pickup' | 'use_item' | 'start_cataclysm';
  playerId: string;
  data?: any;
}

export interface CommandResult {
  command: string;
  success: boolean;
  message: string;
  data?: any;
}

export class WebSocketClient {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private reconnectTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.connect();
  }

  // Connection management
  private connect(): void {
    try {
      // Connect to the backend WebSocket server
      // Assuming backend runs on port 3001 (adjust if needed)
      this.socket = io('http://localhost:3001', {
        transports: ['websocket', 'polling'],
        timeout: 5000,
        autoConnect: true,
        reconnection: false, // We'll handle reconnection manually
      });

      this.setupEventHandlers();
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.handleConnectionError();
    }
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('Connected to game server');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from game server:', reason);
      this.isConnected = false;
      this.handleDisconnect(reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.handleConnectionError();
    });

    // Game events
    this.socket.on('game_joined', (data: { player: Player; gameWorld: GameWorld }) => {
      console.log('Successfully joined game:', data.player.displayName);
      useGameStore.getState().setCurrentPlayer(data.player);
      useGameStore.getState().setGameWorld(data.gameWorld);
      useGameStore.getState().setGameMessage(`Welcome to the game, ${data.player.displayName}!`);

      // Send join confirmation to server after processing the join event
      // This prevents race conditions where commands are sent before the client is fully synchronized
      setTimeout(() => {
        if (this.socket && this.isConnected) {
          console.log('[CLIENT_JOIN_CONFIRMED] Sending join confirmation to server');
          this.socket.emit('join_confirmed');
        }
      }, 100); // Small delay to ensure state is fully updated
    });

    this.socket.on('game_state_update', (gameWorld: GameWorld) => {
      // Update the game world state in real-time
      useGameStore.getState().setGameWorld(gameWorld);

      // Update current player data if it exists in the game world
      const currentPlayerId = useGameStore.getState().currentPlayer?.id;
      if (currentPlayerId) {
        const updatedPlayer = gameWorld.players.find(p => p.id === currentPlayerId);
        if (updatedPlayer) {
          useGameStore.getState().setCurrentPlayer(updatedPlayer);
        }
      }
    });

    this.socket.on('player_joined', (data: { player: Player }) => {
      console.log(`Player joined: ${data.player.displayName}`);
      // The game state update will handle adding the player to the world
    });

    this.socket.on('player_left', (data: { playerId: string; player: Player }) => {
      console.log(`Player left: ${data.player.displayName}`);
      // The game state update will handle removing the player from the world
    });

    this.socket.on('command_result', (result: CommandResult) => {
      console.log('Command result:', result);

      if (result.success) {
        useGameStore.getState().setGameMessage(result.message);
      } else {
        useGameStore.getState().setGameMessage(`Error: ${result.message}`);
      }

      // Clear message after 3 seconds
      setTimeout(() => {
        useGameStore.getState().clearMessage();
      }, 3000);
    });

    this.socket.on('error', (error: { message: string }) => {
      console.error('Server error:', error);
      useGameStore.getState().setGameMessage(`Server error: ${error.message}`);
    });
  }

  private handleDisconnect(reason: string): void {
    // Attempt to reconnect for certain disconnect reasons
    if (reason === 'io server disconnect' || reason === 'transport close') {
      this.attemptReconnect();
    }
  }

  private handleConnectionError(): void {
    this.isConnected = false;
    this.attemptReconnect();
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      useGameStore.getState().setGameMessage('Failed to connect to game server. Please refresh the page.');
      return;
    }

    this.reconnectAttempts++;
    console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    useGameStore.getState().setGameMessage(`Reconnecting to game server... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, this.reconnectDelay);

    // Exponential backoff
    this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000); // Max 30 seconds
  }

  // Public methods for game actions
  public joinGame(playerData: Partial<Player>): void {
    if (!this.socket || !this.isConnected) {
      console.error(`[CLIENT_ERROR] Cannot join game - socket: ${!!this.socket}, connected: ${this.isConnected}`);
      useGameStore.getState().setGameMessage('Not connected to game server');
      return;
    }

    console.log('[CLIENT_JOIN] Joining game with player data:', playerData);
    console.log('[CLIENT_JOIN] Socket ID:', this.socket.id);
    this.socket.emit('join_game', playerData);
  }

  public sendPlayerCommand(command: Omit<PlayerCommand, 'playerId'>): void {
    if (!this.socket || !this.isConnected) {
      console.error(`[CLIENT_ERROR] Cannot send command - socket: ${!!this.socket}, connected: ${this.isConnected}`);
      useGameStore.getState().setGameMessage('Not connected to game server');
      return;
    }

    const currentPlayer = useGameStore.getState().currentPlayer;
    if (!currentPlayer) {
      console.error(`[CLIENT_ERROR] No current player found when sending command:`, command);
      useGameStore.getState().setGameMessage('No current player found');
      return;
    }

    const fullCommand: PlayerCommand = {
      ...command,
      playerId: currentPlayer.id
    };

    console.log('[CLIENT_COMMAND] Sending player command:', fullCommand);
    this.socket.emit('player_command', fullCommand);
  }

  // Specific command methods for easier use
  public movePlayer(direction: 'up' | 'down' | 'left' | 'right'): void {
    this.sendPlayerCommand({
      type: 'move',
      data: { direction }
    });
  }

  public attackPlayer(targetId: string): void {
    this.sendPlayerCommand({
      type: 'attack',
      data: { targetId }
    });
  }

  public pickupItem(itemId: string): void {
    this.sendPlayerCommand({
      type: 'pickup',
      data: { itemId }
    });
  }

  public useItem(itemId: string): void {
    this.sendPlayerCommand({
      type: 'use_item',
      data: { itemId }
    });
  }

  public startCataclysm(): void {
    this.sendPlayerCommand({
      type: 'start_cataclysm'
    });
  }

  // Connection status
  public getConnectionStatus(): boolean {
    return this.isConnected;
  }

  public getReconnectAttempts(): number {
    return this.reconnectAttempts;
  }

  // Cleanup
  public disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.isConnected = false;
  }

  // Singleton pattern
  private static instance: WebSocketClient | null = null;

  public static getInstance(): WebSocketClient {
    if (!WebSocketClient.instance) {
      WebSocketClient.instance = new WebSocketClient();
    }
    return WebSocketClient.instance;
  }
}

// Export singleton instance
export const webSocketClient = WebSocketClient.getInstance();