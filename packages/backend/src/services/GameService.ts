import { GameRoom } from '../models/GameRoom';
import { Player as PlayerData } from '@chatterealm/shared';

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

  public async createRoom(roomId: string): Promise<GameRoom> {
    if (this.rooms.has(roomId)) {
      return this.rooms.get(roomId)!;
    }
    const room = await GameRoom.create(roomId);
    this.rooms.set(roomId, room);
    return room;
  }

  public getRoom(roomId: string): GameRoom | undefined {
    return this.rooms.get(roomId);
  }

  public async joinRoom(roomId: string, playerData: PlayerData): Promise<GameRoom> {
    const room = this.getRoom(roomId) ?? await this.createRoom(roomId);
    room.addPlayer(playerData);
    return room;
  }

}

export const gameService = GameService.getInstance();