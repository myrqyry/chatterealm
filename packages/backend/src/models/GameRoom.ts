import { GameWorld, Player as PlayerData, NPC, Item, PlayerProfile } from 'shared';
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

  private constructor(roomId: string) {
    this.id = roomId;
    // Properties will be initialized in the async `initialize` method
    this.players = new Map();
    this.gameStateManager = null!;
    this.playerService = null!;
    this.combatService = null!;
    this.lootService = null!;
    this.movementService = null!;
    this.cataclysmService = null!;
    this.lastGameState = null!;
  }

  public static async create(roomId: string): Promise<GameRoom> {
    const room = new GameRoom(roomId);
    await room.initialize();
    return room;
  }

  private async initialize(): Promise<void> {
    this.gameStateManager = await GameStateManager.create();
    const gameWorld = this.gameStateManager.getGameWorld();
    const npcManager = this.gameStateManager.getNPCManager();
    const gameWorldManager = this.gameStateManager.getGameWorldManager();
    this.playerService = new PlayerService(gameWorld, gameWorldManager, new Set(), new Set());
    this.combatService = new CombatService();
    this.cataclysmService = new CataclysmService(new LootManager(), npcManager, new Set());
    this.lootService = new LootService(this.cataclysmService);
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
   * Cleans up the game state.
   */
  public cleanup(): void {
    const now = Date.now();
    const disconnectedPlayers = this.playerService.getPlayers().filter(p => !p.connected && (now - p.lastActive > 60000));
    for (const player of disconnectedPlayers) {
      this.removePlayer(player.id);
    }
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

  public getPlayerProfile(playerId: string): PlayerProfile | null {
    return this.playerService.getPlayerProfile(playerId);
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
    const gameWorld = this.gameStateManager.getGameWorld();
    return this.lootService.pickupItem(playerId, itemId, gameWorld.items, gameWorld.players);
  }

  public useItem(playerId: string, itemId: string): any {
    const gameWorld = this.gameStateManager.getGameWorld();
    return this.lootService.useItem(playerId, itemId, gameWorld.players);
  }

  public lootItem(playerId: string, itemId: string): any {
    const gameWorld = this.gameStateManager.getGameWorld();
    return this.lootService.lootItem(playerId, itemId, gameWorld.items, gameWorld.players);
  }

  public inspectItem(playerId: string, itemId: string): any {
    const gameWorld = this.gameStateManager.getGameWorld();
    return this.lootService.inspectItem(playerId, itemId, gameWorld.items, gameWorld.players);
  }

  /**
   * Calculates the difference between the current and last game state.
   */
  public getGameStateDelta(): GameStateDelta[] {
    const currentState = this.gameStateManager.getGameWorld();
    const deltas: GameStateDelta[] = [];

    const changedPlayers = this.findChangedEntities(this.lastGameState.players, currentState.players);
    if (changedPlayers.length > 0) {
      deltas.push({ type: 'players', data: changedPlayers });
    }

    const changedNpcs = this.findChangedEntities(this.lastGameState.npcs, currentState.npcs);
    if (changedNpcs.length > 0) {
      deltas.push({ type: 'npcs', data: changedNpcs });
    }

    const changedItems = this.findChangedEntities(this.lastGameState.items, currentState.items);
    if (changedItems.length > 0) {
      deltas.push({ type: 'items', data: changedItems });
    }

    // After calculating the delta, update the last known state.
    this.lastGameState = clone(currentState);

    return deltas;
  }

  private getComparableState(entity: any): any {
    const { lastMoveTime, lastActive, ...comparableState } = entity;
    return comparableState;
  }

  private findChangedEntities<T extends { id: string }>(oldEntities: T[], newEntities: T[]): T[] {
    const oldEntityMap = new Map(oldEntities.map(e => [e.id, e]));
    const newEntityMap = new Map(newEntities.map(e => [e.id, e]));
    const changed: T[] = [];

    // Check for new or changed entities
    for (const [id, newEntity] of newEntityMap.entries()) {
      const oldEntity = oldEntityMap.get(id);
      if (!oldEntity) {
        changed.push(newEntity); // It's a new entity
      } else {
        // Compare without volatile properties
        const oldComparable = this.getComparableState(oldEntity);
        const newComparable = this.getComparableState(newEntity);
        if (JSON.stringify(oldComparable) !== JSON.stringify(newComparable)) {
          changed.push(newEntity);
        }
      }
    }
    return changed;
  }
}