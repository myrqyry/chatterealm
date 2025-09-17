import { io, Socket } from 'socket.io-client';
import type { Player, GameWorld } from 'shared';
import { useGameStore } from '../stores/gameStore';
import { throttledLog, throttledError, throttledWarn } from '../utils/loggingUtils';

export interface PlayerCommand {
  type: 'move' | 'move_to' | 'attack' | 'pickup' | 'use_item' | 'start_cataclysm';
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
  private hasJoinedGame = false; // Add flag to prevent duplicate joins

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
      throttledError('WS_CONNECT', `Failed to create WebSocket connection: ${error}`);
      this.handleConnectionError();
    }
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      throttledLog('WS_CONNECTED', `Connected to game server - Socket ID: ${this.socket?.id}`);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000;

      // Automatically join the game once connected (if not already joined)
      if (!this.hasJoinedGame) {
        throttledLog('WS_AUTO_JOIN', 'Automatically joining game after connection');
        const playerData = {
          id: 'player_' + Date.now(),
          displayName: 'TestPlayer',
          class: 'knight' as any,
          avatar: '🤠'
        };
        this.joinGameInternal(playerData);
      }
    });

    this.socket.on('disconnect', (reason) => {
      throttledWarn('WS_DISCONNECTED', `Disconnected from game server: ${reason}`);
      this.isConnected = false;
      this.handleDisconnect(reason);
    });

    this.socket.on('connect_error', (error) => {
      throttledError('WS_CONNECT_ERROR', `Connection error: ${error.message}`);
      this.handleConnectionError();
    });

    // Game events
  this.socket.on('game_joined', (data: { player: Player; gameWorld: GameWorld }) => {
    throttledLog('GAME_JOINED', `Successfully joined game: ${data.player.displayName}`, true);
    useGameStore.getState().setCurrentPlayer(data.player);
    useGameStore.getState().setGameWorld(data.gameWorld);
    useGameStore.getState().setGameMessage(`Welcome to the game, ${data.player.displayName}!`);
    this.hasJoinedGame = true;
  });    this.socket.on('game_state_delta', (deltas: any[]) => {
      // Handle delta updates by applying them to the current game world
      const currentWorld = useGameStore.getState().gameWorld;
      if (!currentWorld) return;

      // Apply deltas to update the game world
      for (const delta of deltas) {
        switch (delta.type) {
          case 'player_joined':
            if (!currentWorld.players.find(p => p.id === delta.data.player.id)) {
              currentWorld.players.push(delta.data.player);
            }
            break;
          case 'player_left':
            currentWorld.players = currentWorld.players.filter(p => p.id !== delta.data.playerId);
            break;
          case 'player_moved':
            const player = currentWorld.players.find(p => p.id === delta.data.playerId);
            if (player) {
              player.position = delta.data.newPosition;
            }
            break;
          // Add more delta types as needed
        }
      }

      // Update the store with the modified world
      useGameStore.getState().setGameWorld({ ...currentWorld });

      // Update current player if it was affected
      const currentPlayerId = useGameStore.getState().currentPlayer?.id;
      if (currentPlayerId) {
        const updatedPlayer = currentWorld.players.find(p => p.id === currentPlayerId);
        if (updatedPlayer) {
          useGameStore.getState().setCurrentPlayer(updatedPlayer);
        }
      }
    });

    this.socket.on('player_joined', (data: { player: Player }) => {
      throttledLog('PLAYER_JOINED', `${data.player.displayName} joined the game`);
      // The game state update will handle adding the player to the world
    });

    this.socket.on('player_left', (data: { playerId: string; player: Player }) => {
      throttledLog('PLAYER_LEFT', `${data.player.displayName} left the game`);
      // The game state update will handle removing the player from the world
    });

    this.socket.on('command_result', (result: CommandResult) => {
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
      throttledError('SERVER_ERROR', `Server error: ${error.message}`);
      useGameStore.getState().setGameMessage(`Server error: ${error.message}`);
    });

    // Tarkov-style looting events
    this.socket.on('item_reveal_update', (data: { itemId: string; revealProgress: number }) => {
      throttledLog('ITEM_REVEAL_UPDATE', `Item ${data.itemId} reveal progress: ${data.revealProgress}`);
      // Update item reveal progress in the game world
      const currentWorld = useGameStore.getState().gameWorld;
      if (currentWorld) {
        const item = currentWorld.items.find(i => i.id === data.itemId);
        if (item) {
          item.revealProgress = data.revealProgress;
          useGameStore.getState().setGameWorld({ ...currentWorld });
        }
      }
    });

    this.socket.on('loot_success', (data: { item: any }) => {
      throttledLog('LOOT_SUCCESS', `Successfully looted ${data.item.name}`);
      useGameStore.getState().setGameMessage(`Successfully looted ${data.item.name}!`);
    });

    this.socket.on('loot_failure', (data: { reason: string }) => {
      throttledWarn('LOOT_FAILURE', `Loot failed: ${data.reason}`);
      useGameStore.getState().setGameMessage(`Loot failed: ${data.reason}`);
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
      throttledError('WS_MAX_ATTEMPTS', 'Max reconnection attempts reached - giving up');
      useGameStore.getState().setGameMessage('Failed to connect to game server. Please refresh the page.');
      return;
    }

    this.reconnectAttempts++;
    throttledWarn('WS_ATTEMPT_RECONNECT', `Reconnecting to game server (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

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
      throttledError('CLIENT_ERROR', `Cannot join game - socket: ${!!this.socket}, connected: ${this.isConnected}`);
      useGameStore.getState().setGameMessage('Not connected to game server');
      return;
    }

    this.joinGameInternal(playerData);
  }

  // Allow client to explicitly leave the game (remove player from server world)
  public leaveGame(playerId?: string): void {
    if (!this.socket || !this.isConnected) {
      throttledWarn('CLIENT_LEAVE', 'Cannot leave game - not connected');
      return;
    }

    try {
      const pid = playerId || useGameStore.getState().currentPlayer?.id;
      if (!pid) {
        throttledWarn('CLIENT_LEAVE', 'No player id available to leave');
        return;
      }
      this.socket.emit('leave_game', { playerId: pid });
      // Optionally disconnect socket to fully clear client state
      // this.disconnect();
      throttledLog('CLIENT_LEAVE', `Requested leave for player ${pid}`);
    } catch (err) {
      throttledError('CLIENT_LEAVE_ERROR', `Failed to send leave_game: ${err}`);
    }
  }

  private joinGameInternal(playerData: Partial<Player>): void {
    if (!this.socket) return;

    throttledLog('CLIENT_JOIN', `Joining game with player data`, true);
    this.socket.emit('join_game', playerData);
    this.hasJoinedGame = true;
  }

  public sendPlayerCommand(command: Omit<PlayerCommand, 'playerId'>): void {
    if (!this.socket || !this.isConnected) {
      throttledError('CLIENT_ERROR', `Cannot send command - socket: ${!!this.socket}, connected: ${this.isConnected}`);
      useGameStore.getState().setGameMessage('Not connected to game server');
      return;
    }

    const currentPlayer = useGameStore.getState().currentPlayer;
    if (!currentPlayer) {
      throttledError('CLIENT_ERROR', `No current player found when sending command: ${JSON.stringify(command)}`);
      useGameStore.getState().setGameMessage('No current player found');
      return;
    }

    const fullCommand: PlayerCommand = {
      ...command,
      playerId: currentPlayer.id
    };

    this.socket.emit('player_command', fullCommand);
  }

  // Specific command methods for easier use
  public movePlayer(direction: 'up' | 'down' | 'left' | 'right'): void {
    this.sendPlayerCommand({
      type: 'move',
      data: { direction }
    });
  }

  public moveTo(target: { x: number; y: number }): void {
    this.sendPlayerCommand({
      type: 'move_to',
      data: { target }
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

  // Tarkov-style looting commands
  public inspectItem(itemId: string): void {
    if (!this.socket || !this.isConnected) {
      throttledError('CLIENT_ERROR', 'Cannot inspect item - not connected');
      useGameStore.getState().setGameMessage('Not connected to game server');
      return;
    }

    const currentPlayer = useGameStore.getState().currentPlayer;
    if (!currentPlayer) {
      throttledError('CLIENT_ERROR', 'No current player found when inspecting item');
      useGameStore.getState().setGameMessage('No current player found');
      return;
    }

    this.socket.emit('inspect_item', itemId);
  }

  public lootItem(itemId: string): void {
    if (!this.socket || !this.isConnected) {
      throttledError('CLIENT_ERROR', 'Cannot loot item - not connected');
      useGameStore.getState().setGameMessage('Not connected to game server');
      return;
    }

    const currentPlayer = useGameStore.getState().currentPlayer;
    if (!currentPlayer) {
      throttledError('CLIENT_ERROR', 'No current player found when looting item');
      useGameStore.getState().setGameMessage('No current player found');
      return;
    }

    this.socket.emit('loot_item', itemId);
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
