import { GameWorld, Player as PlayerData, NPC, Item } from 'shared';
import { GameStateManager } from '../services/gameStateManager';
import { Player } from './Player';
import { PlayerService } from '../services/PlayerService';
import { CombatService } from '../services/CombatService';
import { LootService } from '../services/LootService';
import { NpcService } from '../services/NpcService';
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
  private npcService: NpcService;
  private movementService: PlayerMovementService;
  private cataclysmService: CataclysmService;
  private lastGameState: GameWorld;

  constructor(roomId: string) {
    this.id = roomId;
    this.gameStateManager = new GameStateManager();
    const gameWorld = this.gameStateManager.getGameWorld();
    // Reuse managers from the authoritative GameStateManager to avoid divergent state
    const npcManager = this.gameStateManager.getNPCManager();
    const gameWorldManager = this.gameStateManager.getGameWorldManager();
    this.playerService = new PlayerService(gameWorld, gameWorldManager, new Set(), new Set());
    this.combatService = new CombatService();
    this.cataclysmService = new CataclysmService(new LootManager(), npcManager, new Set());
    this.lootService = new LootService(this.gameStateManager, this.cataclysmService);
    this.npcService = new NpcService();
    this.movementService = new PlayerMovementService(gameWorld);
    this.lastGameState = clone(gameWorld);
  }

  public async handleNpcInteraction(
    playerId: string,
    npcId: string,
    message: string
  ): Promise<string> {
    const npc = this.gameStateManager.getGameWorld().npcs.find((n) => n.id === npcId);
    if (!npc) {
      return 'NPC not found.';
    }

    return this.npcService.generateDialogue(npc, message);
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
    this.lastGameState = clone(this.gameStateManager.getGameWorld());
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

  private findChangedEntities<T extends { id: string }>(oldEntities: T[], newEntities: T[]): T[] {
    const oldEntityMap = new Map(oldEntities.map(e => [e.id, e]));
    const changed: T[] = [];

    for (const newEntity of newEntities) {
      const oldEntity = oldEntityMap.get(newEntity.id);
      if (!oldEntity || JSON.stringify(oldEntity) !== JSON.stringify(newEntity)) {
        changed.push(newEntity);
      }
    }
    return changed;
  }
}