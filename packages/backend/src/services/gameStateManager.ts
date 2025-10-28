import { GameWorld, GAME_CONFIG, BiomeType } from 'shared';
import { PlayerMovementService, MoveResult } from './PlayerMovementService';
import { CombatService, CombatResult } from './CombatService';
import { LootService } from './LootService';
import { ItemResult } from './LootManager';
import { GameWorldManager } from './GameWorldManager';
import { NPCManager } from './NPCManager';

interface GameServices {
  playerMovement: PlayerMovementService;
  combat: CombatService;
  loot: LootService;
}

interface GameStateManagerConfig {
  services?: Partial<GameServices>;
  options?: { generateNPCs?: boolean; worldType?: 'test' | 'default' };
}

export class GameStateManager {
  private gameWorld: GameWorld;
  private gameWorldManager: GameWorldManager;
  private npcManager: NPCManager;
  private services: GameServices;

  constructor(config: GameStateManagerConfig = {}) {
    this.npcManager = new NPCManager(new Set());
    this.gameWorldManager = new GameWorldManager(this.npcManager);
    this.gameWorld = this.gameWorldManager.initializeGameWorld(config.options);

    // Dependency injection with defaults
    this.services = {
      playerMovement: config.services?.playerMovement || new PlayerMovementService(this.gameWorld),
      combat: config.services?.combat || new CombatService(),
      loot: config.services?.loot || new LootService(this),
    };
  }

  public update(): void {
    this.npcManager.updateNPCs(this.gameWorld.npcs, this.gameWorld.grid);
    this.gameWorldManager.updateWorldAge(this.gameWorld);
    this.npcManager.cleanupDeadNPCs(this.gameWorld.npcs);
  }

  public getGameWorld(): GameWorld {
    return this.gameWorld;
  }

  // Expose internal managers so other parts of the server can reuse the same instances
  public getGameWorldManager(): GameWorldManager {
    return this.gameWorldManager;
  }

  public getNPCManager(): NPCManager {
    return this.npcManager;
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

  public movePlayer(playerId: string, newPosition: any): MoveResult {
    return this.services.playerMovement.movePlayer(playerId, newPosition, this.gameWorld);
  }

  public attackEnemy(playerId: string, enemyPosition: any): CombatResult {
    const attacker = this.gameWorld.players.find(p => p.id === playerId);
    const defender = this.gameWorld.npcs.find(n => n.position.x === enemyPosition.x && n.position.y === enemyPosition.y);
    if (!attacker || !defender) {
      return { success: false, message: 'Attacker or defender not found' } as CombatResult;
    }
    return this.services.combat.processAttack(attacker as any, defender as any, attacker.position, defender.position);
  }

  public pickupItem(playerId: string, itemId: string): ItemResult {
    return this.services.loot.pickupItem(playerId, itemId, this.gameWorld.items, this.gameWorld.players as any[]);
  }

  public useItem(playerId: string, itemId: string): ItemResult {
    return this.services.loot.useItem(playerId, itemId, this.gameWorld.players as any[]);
  }

  public addPlayer(player: any): { success: boolean; player?: any; message?: string } {
    const occupied = this.services.playerMovement.getOccupiedPositions();
    const available = this.services.playerMovement.getAvailableSpawnPoints();
    const ok = this.gameWorldManager.addPlayer(this.gameWorld, player, occupied, available);
    if (ok) {
      // Ensure movement tracking is updated
      this.services.playerMovement.addPlayerPosition(player.position);
      return { success: true, player, message: 'Player added' };
    }
    return { success: false, message: 'Failed to add player' };
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
    return this.services.playerMovement.isPositionOccupied(position as any);
  }

}