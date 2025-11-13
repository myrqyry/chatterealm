import { Player as PlayerData, GameWorld, PlayerProfile } from '@chatterealm/shared';
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

  public getPlayerProfile(playerId: string): PlayerProfile | null {
    const player = this.getPlayer(playerId);
    if (!player) {
      return null;
    }

    return {
      id: player.id,
      displayName: player.displayName,
      avatar: player.avatar,
      class: player.class,
      level: player.level,
      bio: player.bio || "A brave adventurer exploring the world of ChatterRealm.",
      achievements: player.achievements,
      titles: player.titles,
    };
  }
}