import { GameWorld, GAME_CONFIG, BiomeType } from 'shared';
// Lightweight event type used by legacy callers (CataclysmService, etc.)
export interface GameEvent {
  type: string;
  data?: any;
}
import type { PlayerMovementService, MoveResult } from './PlayerMovementService';
import type { CombatService, CombatResult } from './CombatService';
import type { LootService } from './LootService';
import type { ItemResult } from './LootManager';
import { GameWorldManager } from './GameWorldManager';
import { NPCManager } from './NPCManager';

export class GameStateManager {
  private gameWorld: GameWorld;
  private gameWorldManager: GameWorldManager;
  private npcManager: NPCManager;
  // Optional references to other services for compatibility wrappers
  private playerMovementService?: PlayerMovementService;
  private combatService?: CombatService;
  private lootService?: LootService;

  constructor(options?: { generateNPCs?: boolean; worldType?: 'test' | 'default' }) {
    this.npcManager = new NPCManager(new Set());
    this.gameWorldManager = new GameWorldManager(this.npcManager);
    this.gameWorld = this.gameWorldManager.initializeGameWorld(options);
  }

  /**
   * Wire other services into this manager to preserve the legacy API surface.
   * Accepts type-only references to avoid runtime circular imports.
   */
  public setServices(services: {
    playerMovementService?: PlayerMovementService;
    combatService?: CombatService;
    lootService?: LootService;
  }): void {
    this.playerMovementService = services.playerMovementService;
    this.combatService = services.combatService;
    this.lootService = services.lootService;
  }

  public update(): void {
    this.npcManager.updateNPCs(this.gameWorld.npcs, this.gameWorld.grid);
    this.gameWorldManager.updateWorldAge(this.gameWorld);
    this.npcManager.cleanupDeadNPCs(this.gameWorld.npcs);
  }

  public getGameWorld(): GameWorld {
    return this.gameWorld;
  }

  public getBuildingAt(position: any): any {
    return this.gameWorld.buildings.find(
      b => b.position.x === position.x && b.position.y === position.y
    );
  }

  public getTerrainAt(position: any): any {
    if (
      position.x < 0 ||
      position.x >= GAME_CONFIG.gridWidth ||
      position.y < 0 ||
      position.y >= GAME_CONFIG.gridHeight
    ) {
      return undefined;
    }
    return this.gameWorld.grid[position.y][position.x];
  }

  /**
   * Compatibility: request a player movement via the MovementService
   */
  public movePlayer(playerId: string, newPosition: any): MoveResult {
    if (!this.playerMovementService) {
      return { success: false, message: 'Movement subsystem not configured' } as MoveResult;
    }
    return this.playerMovementService.movePlayer(playerId, newPosition, this.gameWorld);
  }

  /**
   * Compatibility: proxy combat interactions to the CombatService
   */
  public attackEnemy(playerId: string, enemyPosition: any): CombatResult {
    if (!this.combatService) {
      return { success: false, message: 'Combat subsystem not configured' } as CombatResult;
    }
    const attacker = this.gameWorld.players.find(p => p.id === playerId);
    const defender = this.gameWorld.npcs.find(n => n.position.x === enemyPosition.x && n.position.y === enemyPosition.y);
    if (!attacker || !defender) {
      return { success: false, message: 'Attacker or defender not found' } as CombatResult;
    }
    return this.combatService.processAttack(attacker as any, defender as any, attacker.position, defender.position);
  }

  /**
   * Compatibility: delegate pickup to the LootService
   */
  public pickupItem(playerId: string, itemId: string): ItemResult {
    if (!this.lootService) {
      return { success: false, message: 'Loot subsystem not configured' } as ItemResult;
    }
    return this.lootService.pickupItem(playerId, itemId, this.gameWorld.items, this.gameWorld.players as any[]);
  }

  /**
   * Compatibility: delegate use-item to the LootService
   */
  public useItem(playerId: string, itemId: string): ItemResult {
    if (!this.lootService) {
      return { success: false, message: 'Loot subsystem not configured' } as ItemResult;
    }
    return this.lootService.useItem(playerId, itemId, this.gameWorld.players as any[]);
  }

  /**
   * Compatibility: add a player into the world and update movement tracking
   */
  public addPlayer(player: any): { success: boolean; player?: any; message?: string } {
    if (this.playerMovementService) {
      const occupied = this.playerMovementService.getOccupiedPositions();
      const available = this.playerMovementService.getAvailableSpawnPoints();
      const ok = this.gameWorldManager.addPlayer(this.gameWorld, player, occupied, available);
      if (ok) {
        // Ensure movement tracking is updated
        this.playerMovementService.addPlayerPosition(player.position);
        return { success: true, player, message: 'Player added' };
      }
      return { success: false, message: 'Failed to add player' };
    }

    // Fallback: naive push (legacy compatibility)
    this.gameWorld.players.push(player);
    return { success: true, player, message: 'Player added (no movement service)' };
  }

  /**
   * Compatibility: position helpers
   */
  public isPositionValid(position: any): boolean {
    if (!this.gameWorld || !this.gameWorld.grid) return false;
    if (!this.gameWorldManager.isWithinBounds(this.gameWorld, position)) return false;
    const terrain = this.gameWorldManager.getTerrainAt(this.gameWorld, position);
    if (!terrain) return false;
    return terrain.type !== BiomeType.MOUNTAIN;
  }

  public isPositionOccupied(position: any): boolean {
    if (this.playerMovementService) return this.playerMovementService.isPositionOccupied(position as any);
    return !!this.gameWorld.players.find(p => p.position.x === position.x && p.position.y === position.y) ||
           !!this.gameWorld.npcs.find(n => n.position.x === position.x && n.position.y === position.y);
  }

}