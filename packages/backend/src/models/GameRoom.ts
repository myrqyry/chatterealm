import { GameWorld, Player as PlayerData } from 'shared';
import { Player } from './Player';

export class GameRoom {
  id: string;
  private players: Map<string, Player> = new Map();
  private gameWorld: GameWorld;

  constructor(roomId: string, initialWorldState: GameWorld) {
    this.id = roomId;
    this.gameWorld = initialWorldState;
  }

  public addPlayer(playerData: PlayerData): Player {
    const player = new Player(playerData);
    this.players.set(player.id, player);
    this.gameWorld.players.push(player.getData());
    return player;
  }

  public removePlayer(playerId: string): Player | undefined {
    const player = this.players.get(playerId);
    if (player) {
      player.disconnect();
      this.players.delete(playerId);
      this.gameWorld.players = this.gameWorld.players.filter(p => p.id !== playerId);
      return player;
    }
    return undefined;
  }

  public getPlayer(playerId: string): Player | undefined {
    return this.players.get(playerId);
  }

  public getAllPlayers(): Player[] {
    return Array.from(this.players.values());
  }

  public getGameState(): GameWorld {
    return this.gameWorld;
  }
}