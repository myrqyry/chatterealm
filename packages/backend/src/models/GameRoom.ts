import { GameWorld, Player as PlayerData } from 'shared';
import { GameStateManager } from '../services/gameStateManager';
import { Player } from './Player';

export class GameRoom {
  id: string;
  private players: Map<string, Player> = new Map();
  private gameStateManager: GameStateManager;

  constructor(roomId: string) {
    this.id = roomId;
    // GameStateManager now creates and manages its own GameWorld instance.
    this.gameStateManager = new GameStateManager();
  }

  /**
   * The main update tick for this room.
   */
  public update(): void {
    this.gameStateManager.update();
  }

  /**
   * Adds a player to the game room and to the underlying game state.
   */
  public addPlayer(playerData: PlayerData): Player {
    const player = new Player(playerData);
    this.players.set(player.id, player);
    // Delegate adding the player data to the game state manager.
    this.gameStateManager.addPlayer(playerData);
    return player;
  }

  /**
   * Removes a player from the game room and the underlying game state.
   */
  public removePlayer(playerId: string): Player | undefined {
    const player = this.players.get(playerId);
    if (player) {
      player.disconnect();
      // Delegate removing the player data to the game state manager.
      this.gameStateManager.removePlayer(playerId);
      this.players.delete(playerId);
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

  /**
   * Returns the current state of the game world from the state manager.
   */
  public getGameState(): GameWorld {
    return this.gameStateManager.getGameWorld();
  }

  public movePlayer(playerId: string, newPosition: { x: number; y: number }): any {
    return this.gameStateManager.movePlayer(playerId, newPosition);
  }

  public attackEnemy(playerId: string, targetPosition: { x: number; y: number }): any {
    return this.gameStateManager.attackEnemy(playerId, targetPosition);
  }

  public pickupItem(playerId: string, itemId: string): any {
    return this.gameStateManager.pickupItem(playerId, itemId);
  }

  public lootItem(playerId: string, itemId: string): any {
    return this.gameStateManager.lootItem(playerId, itemId);
  }

  public inspectItem(playerId: string, itemId: string): any {
    return this.gameStateManager.inspectItem(playerId, itemId);
  }
}