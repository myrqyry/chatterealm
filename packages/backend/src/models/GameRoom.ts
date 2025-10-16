import { GameWorld, Player as PlayerData, NPC, Item } from 'shared';
import { GameStateManager } from '../services/gameStateManager';
import { Player } from './Player';
import { PlayerService } from '../services/PlayerService';
import { CombatService } from '../services/CombatService';
import { LootService } from '../services/LootService';
import { PlayerMovementService } from '../services/PlayerMovementService';
import { GameWorldManager } from '../services/GameWorldManager';
import { NPCManager } from '../services/NPCManager';
import { CataclysmService } from '../services/CataclysmService';
import { LootManager } from '../services/LootManager';

// A simple deep-clone function for this use case.
// For a real-world app, a more robust library like lodash.cloneDeep would be better.
const clone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

export interface GameStateDelta {
  type: 'players' | 'npcs' | 'items';
  data: any;
}

export class GameRoom {
  id: string;
  private players: Map<string, Player> = new Map();
  private gameStateManager: GameStateManager;
  private playerService: PlayerService;
  private combatService: CombatService;
  private lootService: LootService;
  private movementService: PlayerMovementService;
  private cataclysmService: CataclysmService;
  private lastGameState: GameWorld;

  constructor(roomId: string) {
    this.id = roomId;
    this.gameStateManager = new GameStateManager();
    const gameWorld = this.gameStateManager.getGameWorld();
    const npcManager = new NPCManager(new Set());
    const gameWorldManager = new GameWorldManager(npcManager);
    this.playerService = new PlayerService(gameWorld, gameWorldManager, new Set(), new Set());
    this.combatService = new CombatService();
    this.cataclysmService = new CataclysmService(new LootManager(), npcManager, new Set());
    this.lootService = new LootService(this.gameStateManager, this.cataclysmService);
    this.movementService = new PlayerMovementService(gameWorld);
    this.lastGameState = clone(gameWorld);
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
    const player = this.playerService.addPlayer(playerData);
    this.players.set(player.id, player);
    return player;
  }

  /**
   * Removes a player from the game room and the underlying game state.
   */
  public removePlayer(playerId: string): PlayerData | null {
    const player = this.players.get(playerId);
    if (player) {
      player.disconnect();
      this.players.delete(playerId);
    }
    return this.playerService.removePlayer(playerId);
  }

  public getPlayers(): PlayerData[] {
    return this.playerService.getPlayers();
  }

  /**
   * Returns the current state of the game world from the state manager.
   */
  public getGameState(): GameWorld {
    return this.gameStateManager.getGameWorld();
  }

  public movePlayer(playerId: string, newPosition: { x: number; y: number }): any {
    return this.movementService.movePlayer(playerId, newPosition, this.gameStateManager.getGameWorld());
  }

  public attackEnemy(playerId: string, targetPosition: { x: number; y: number }): any {
    const player = this.playerService.getPlayer(playerId);
    if (!player) {
      return { success: false, message: 'Player not found.' };
    }
    const enemy = this.combatService.getEnemyAtPosition(this.gameStateManager.getGameWorld().npcs, targetPosition);
    if (!enemy) {
      return { success: false, message: 'No enemy found at target position.' };
    }
    return this.combatService.processAttack(player, enemy, player.position, targetPosition);
  }

  public pickupItem(playerId: string, itemId: string): any {
    return this.lootService.pickupItem(playerId, itemId, this.gameStateManager.getGameWorld().items, this.gameStateManager.getGameWorld().players);
  }

  public lootItem(playerId: string, itemId: string): any {
    return this.lootService.lootItem(playerId, itemId, this.gameStateManager.getGameWorld().items, this.gameStateManager.getGameWorld().players);
  }

  public inspectItem(playerId: string, itemId: string): any {
    return this.lootService.inspectItem(playerId, itemId, this.gameStateManager.getGameWorld().items, this.gameStateManager.getGameWorld().players);
  }

  /**
   * Calculates the difference between the current and last game state.
   */
  public getGameStateDelta(): GameStateDelta[] {
    const currentState = this.gameStateManager.getGameWorld();
    const deltas: GameStateDelta[] = [];

    // A simple and inefficient way to check for changes.
    // In a real application, you'd want a more granular check,
    // perhaps by comparing object hashes or versions.
    if (JSON.stringify(currentState.players) !== JSON.stringify(this.lastGameState.players)) {
      deltas.push({ type: 'players', data: currentState.players });
    }
    if (JSON.stringify(currentState.npcs) !== JSON.stringify(this.lastGameState.npcs)) {
      deltas.push({ type: 'npcs', data: currentState.npcs });
    }
    if (JSON.stringify(currentState.items) !== JSON.stringify(this.lastGameState.items)) {
      deltas.push({ type: 'items', data: currentState.items });
    }

    // After calculating the delta, update the last known state.
    this.lastGameState = clone(currentState);

    return deltas;
  }
}