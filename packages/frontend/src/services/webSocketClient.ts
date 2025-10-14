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
  private hasJoinedGame = false; // Add flag to prevent duplicate joins

  constructor() {
    this.connect();
  }

  // Connection management
  private connect(): void {
    try {
      // Use environment variable for the backend URL
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';
      this.socket = io(backendUrl, {
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: this.maxReconnectAttempts,
        transports: ['websocket', 'polling'],
        timeout: 5000,
      });

      this.setupEventHandlers();
    } catch (error) {
      throttledError('WS_CONNECT', `Failed to create WebSocket connection: ${error}`);
    }
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      throttledLog('WS_CONNECTED', `Connected to game server - Socket ID: ${this.socket?.id}`);
      this.isConnected = true;
      this.reconnectAttempts = 0;

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
      if (reason === 'io server disconnect') {
        // The server intentionally disconnected the socket.
        // It will not automatically reconnect.
        this.socket?.connect();
      }
    });

    this.socket.on('connect_error', (error) => {
      throttledError('WS_CONNECT_ERROR', `Connection error: ${error.message}`);
      this.reconnectAttempts++;
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        throttledError('WS_MAX_ATTEMPTS', 'Max reconnection attempts reached - giving up');
        useGameStore.getState().setGameMessage('Failed to connect to game server. Please refresh the page.');
      }
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
      const gameStore = useGameStore.getState();
      const currentWorld = gameStore.gameWorld;
      if (!currentWorld) return;

      const newWorld = { ...currentWorld };

      // Apply deltas to update the game world
      for (const delta of deltas) {
        switch (delta.type) {
          case 'players':
            newWorld.players = delta.data;
            break;
          case 'npcs':
            newWorld.npcs = delta.data;
            break;
          case 'items':
            newWorld.items = delta.data;
            break;
        }
      }

      // Update the store with the modified world
      gameStore.setGameWorld(newWorld);

      // Update current player if it was affected
      const currentPlayerId = gameStore.currentPlayer?.id;
      if (currentPlayerId) {
        const updatedPlayer = newWorld.players.find(p => p.id === currentPlayerId);
        if (updatedPlayer) {
          gameStore.setCurrentPlayer(updatedPlayer);
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

  public createNewCharacter(characterData: any): Promise<Player> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        return reject(new Error('WebSocket is not connected.'));
      }

      this.socket.emit('create_character', {
        characterData,
        timestamp: Date.now()
      });

      const onCharacterCreated = (response: { success: boolean; player: Player; error?: string }) => {
        cleanup();
        if (response.success) {
          resolve(response.player);
        } else {
          reject(new Error(response.error || 'Failed to create character.'));
        }
      };

      const onError = (error: { message: string }) => {
        cleanup();
        reject(new Error(error.message));
      };

      const cleanup = () => {
        this.socket?.off('character_created', onCharacterCreated);
        this.socket?.off('error', onError);
      }

      this.socket.once('character_created', onCharacterCreated);
      this.socket.once('error', onError);
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
