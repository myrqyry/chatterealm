import { Player as PlayerData, GameWorld } from 'shared';
import { Player } from '../models/Player';
import { GameWorldManager } from './GameWorldManager';

export class PlayerService {
  private gameWorld: GameWorld;
  private gameWorldManager: GameWorldManager;
  private occupiedPositions: Set<string>;
  private availableSpawnPoints: Set<string>;

  constructor(
    gameWorld: GameWorld,
    gameWorldManager: GameWorldManager,
    occupiedPositions: Set<string>,
    availableSpawnPoints: Set<string>
  ) {
    this.gameWorld = gameWorld;
    this.gameWorldManager = gameWorldManager;
    this.occupiedPositions = occupiedPositions;
    this.availableSpawnPoints = availableSpawnPoints;
  }

  public addPlayer(playerData: PlayerData): Player {
    const player = new Player(playerData);
    this.gameWorldManager.addPlayer(
      this.gameWorld,
      playerData,
      this.occupiedPositions,
      this.availableSpawnPoints
    );
    return player;
  }

  public removePlayer(playerId: string): PlayerData | null {
    return this.gameWorldManager.removePlayer(
      this.gameWorld,
      playerId,
      this.occupiedPositions,
      this.availableSpawnPoints
    );
  }

  public getPlayer(playerId: string): PlayerData | undefined {
    return this.gameWorld.players.find(p => p.id === playerId);
  }

  public getPlayers(): PlayerData[] {
    return this.gameWorld.players;
  }
}