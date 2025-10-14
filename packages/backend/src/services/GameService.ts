import { GameRoom } from '../models/GameRoom';
import { Player as PlayerData } from 'shared';

class GameService {
  private rooms: Map<string, GameRoom> = new Map();
  private static instance: GameService;

  private constructor() {}

  public static getInstance(): GameService {
    if (!GameService.instance) {
      GameService.instance = new GameService();
    }
    return GameService.instance;
  }

  public createRoom(roomId: string): GameRoom {
    if (this.rooms.has(roomId)) {
      return this.rooms.get(roomId)!;
    }
    // The GameRoom now initializes its own GameStateManager and GameWorld.
    const room = new GameRoom(roomId);
    this.rooms.set(roomId, room);
    return room;
  }

  public getRoom(roomId: string): GameRoom | undefined {
    return this.rooms.get(roomId);
  }

  public joinRoom(roomId: string, playerData: PlayerData): GameRoom | undefined {
    const room = this.getRoom(roomId) ?? this.createRoom(roomId);
    room.addPlayer(playerData);
    return room;
  }

}

export const gameService = GameService.getInstance();