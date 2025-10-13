import { GameRoom } from '../models/GameRoom';
import { GameWorld, Player as PlayerData } from 'shared';

// This is a simplified mock for world generation
const createNewWorld = (): GameWorld => {
  return {
    id: `world_${Date.now()}`,
    grid: [],
    players: [],
    npcs: [],
    items: [],
    buildings: [],
    cataclysmCircle: {
      center: { x: 50, y: 50 },
      radius: 100,
      isActive: false,
      shrinkRate: 0,
      nextShrinkTime: 0,
    },
    cataclysmRoughnessMultiplier: 1,
    worldAge: 0,
    lastResetTime: Date.now(),
    phase: 'exploration',
  };
};

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
    const newWorld = createNewWorld();
    const room = new GameRoom(roomId, newWorld);
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

  public leaveRoom(roomId: string, playerId: string): import('../models/Player').Player | undefined {
    const room = this.getRoom(roomId);
    if (room) {
      return room.removePlayer(playerId);
    }
  }
}

export const gameService = GameService.getInstance();