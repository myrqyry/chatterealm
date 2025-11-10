import { io, Socket } from 'socket.io-client';
import { ChatMessage, Player } from '../../types/chat';
import { GameCommand } from '@chatterealm/shared';

class ChatService {
  private socket: Socket;
  private readonly apiUrl: string;
  private onMessageReceived: ((message: ChatMessage) => void) | null = null;
  private onWorldUpdateReceived: ((players: Player[]) => void) | null = null;
  public isConnected: boolean = false;

  constructor(apiUrl: string = 'http://localhost:3002') {
    this.apiUrl = apiUrl;
    this.socket = io(this.apiUrl);
    this.setupSocketListeners();
  }

  private setupSocketListeners(): void {
    this.socket.on('connect', () => {
      console.log('🎮 [SOCKET] Connected to backend');
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 [SOCKET] Disconnected from backend');
      this.isConnected = false;
    });

    this.socket.on('chat_message', (data: ChatMessage) => {
      console.log('💬 [SOCKET] Received chat message:', data);
      if (this.onMessageReceived) {
        this.onMessageReceived(data);
      }
    });

    this.socket.on('world_update', (worldData: any) => {
      console.log('🌍 [SOCKET] Received world update:', {
        players: worldData.players?.length || 0,
        phase: worldData.phase
      });
      if (this.onWorldUpdateReceived) {
        this.onWorldUpdateReceived(worldData.players || []);
      }
    });
  }

  public setOnMessageReceived(callback: (message: ChatMessage) => void): void {
    this.onMessageReceived = callback;
  }

  public setOnWorldUpdateReceived(callback: (players: Player[]) => void): void {
    this.onWorldUpdateReceived = callback;
  }

  public async sendChatCommand(username: string, displayName: string, message: string, channelPoints: number): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/api/test/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          displayName,
          message,
          channelPoints
        })
      });

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Error sending chat command:', error);
      return false;
    }
  }

  public async sendGameCommand(username: string, displayName: string, command: GameCommand, channelPoints: number): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/api/test/command`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          displayName,
          command,
          channelPoints
        })
      });

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Error sending game command:', error);
      return false;
    }
  }

  public closeConnection(): void {
    this.socket.close();
  }
}

export const chatService = new ChatService();