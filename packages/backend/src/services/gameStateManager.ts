import { Player, NPC, Item, Position, GameWorld, GAME_CONFIG } from 'shared';
import { CombatSystem, CombatResult } from './CombatSystem';
import { PlayerMovementService, MoveResult } from './PlayerMovementService';
import { LootManager, ItemResult } from './LootManager';
import { NPCManager } from './NPCManager';
import { CataclysmService, GameActionResult } from './CataclysmService';
import { GameWorldManager } from './GameWorldManager';

// Core result interfaces
export { GameActionResult, MoveResult, CombatResult, ItemResult };

// Event types for tracking changes
export type GameEvent =
  | { type: 'player_moved'; data: { playerId: string; oldPosition: Position; newPosition: Position } }
  | { type: 'player_attacked'; data: { attackerId: string; defenderId: string; damage: number } }
  | { type: 'npc_defeated'; data: { npcId: string; defeatedBy: string; position: Position } }
  | { type: 'item_picked_up'; data: { playerId: string; itemId: string; position: Position } }
  | { type: 'item_looted'; data: { playerId: string; itemId: string } }
  | { type: 'player_leveled_up'; data: { playerId: string; newLevel: number } }
  | { type: 'cataclysm_started'; data: { timestamp: number } }
  | { type: 'cataclysm_shrunk'; data: { newRadius: number; center: Position } }
  | { type: 'world_regenerated'; data: { timestamp: number } };

/**
 * Lightweight GameStateManager that orchestrates all game modules
 * Reduced from 1347 lines to ~300 lines by extracting focused modules
 */
export class GameStateManager {
  private gameWorld: GameWorld;
  private changeEvents: GameEvent[] = [];
  
  // Module instances
  private combatSystem: CombatSystem;
  private playerMovementService: PlayerMovementService;
  private lootManager: LootManager;
  private npcManager: NPCManager;
  private cataclysmService: CataclysmService;
  private gameWorldManager: GameWorldManager;
  
  // Shared state
  private occupiedPositions: Set<string> = new Set();
  private reservedPositions: Set<string> = new Set();
  private availableSpawnPoints: Set<string> = new Set();

  constructor() {
    // Initialize modules
    this.npcManager = new NPCManager(this.occupiedPositions);
    this.gameWorldManager = new GameWorldManager(this.npcManager);
    this.combatSystem = new CombatSystem();
    this.lootManager = new LootManager();
    this.cataclysmService = new CataclysmService(this.lootManager, this.npcManager, this.occupiedPositions);
    
    // Initialize world
    this.gameWorld = this.gameWorldManager.initializeGameWorld();
    this.playerMovementService = new PlayerMovementService(this.gameWorld);
    
    // Update all modules with current state
    this.updateModuleReferences();
  }

  /**
   * Update module references when world state changes
   */
  private updateModuleReferences(): void {
    this.npcManager.updateOccupiedPositions(this.occupiedPositions);
    this.cataclysmService.updateOccupiedPositions(this.occupiedPositions);
    this.playerMovementService.updateOccupiedPositions(this.gameWorld);
  }

  /**
   * Record an event for external systems to track
   */
  private recordEvent(event: GameEvent): void {
    this.changeEvents.push(event);
  }

  /**
   * Get and clear accumulated change events
   */
  public getAndClearChangeEvents(): GameEvent[] {
    const events = [...this.changeEvents];
    this.changeEvents = [];
    return events;
  }

  // =============================================================================
  // PLAYER MANAGEMENT
  // =============================================================================

  /**
   * Add a player to the game world
   */
  public addPlayer(player: Player): GameActionResult {
    const success = this.gameWorldManager.addPlayer(
      this.gameWorld, 
      player, 
      this.occupiedPositions, 
      this.availableSpawnPoints
    );

    if (success) {
      this.updateModuleReferences();
      return { success: true, message: `Player ${player.displayName} joined the game.` };
    } else {
      return { success: false, message: 'Failed to add player. No spawn points available.' };
    }
  }

  /**
   * Remove a player from the game world
   */
  public removePlayer(playerId: string): GameActionResult {
    const success = this.gameWorldManager.removePlayer(
      this.gameWorld, 
      playerId, 
      this.occupiedPositions, 
      this.availableSpawnPoints
    );

    if (success) {
      this.playerMovementService.clearPlayerMovementQueue(playerId);
      this.updateModuleReferences();
      return { success: true, message: 'Player removed from game.' };
    } else {
      return { success: false, message: 'Player not found.' };
    }
  }

  /**
   * Get a player by ID
   */
  public getPlayer(playerId: string): Player | undefined {
    return this.gameWorld.players.find(p => p.id === playerId);
  }

  /**
   * Get all players
   */
  public getPlayers(): Player[] {
    return this.gameWorld.players;
  }

  // =============================================================================
  // MOVEMENT SYSTEM
  // =============================================================================

  /**
   * Request player movement to target position
   */
  public requestMoveTo(playerId: string, target: Position): MoveResult {
    const result = this.playerMovementService.requestMoveTo(playerId, target, this.gameWorld);
    
    if (result.success && result.path) {
      this.recordEvent({
        type: 'player_moved',
        data: {
          playerId,
          oldPosition: this.getPlayer(playerId)?.position || target,
          newPosition: target
        }
      });
    }
    
    return result;
  }

  /**
   * Move player directly (single step)
   */
  public movePlayer(playerId: string, newPosition: Position): MoveResult {
    const result = this.playerMovementService.movePlayer(playerId, newPosition, this.gameWorld);
    
    if (result.success && result.newPosition) {
      this.recordEvent({
        type: 'player_moved',
        data: {
          playerId,
          oldPosition: this.getPlayer(playerId)?.position || newPosition,
          newPosition: result.newPosition
        }
      });
    }
    
    return result;
  }

  // =============================================================================
  // COMBAT SYSTEM
  // =============================================================================

  /**
   * Process attack between player and NPC
   */
  public attackEnemy(playerId: string, targetPosition: Position): CombatResult {
    const player = this.getPlayer(playerId);
    if (!player) {
      return { success: false, message: 'Player not found.' };
    }

    const enemy = this.combatSystem.getEnemyAtPosition(this.gameWorld.npcs, targetPosition);
    if (!enemy) {
      return { success: false, message: 'No enemy found at target position.' };
    }

    const result = this.combatSystem.processAttack(player, enemy, player.position, targetPosition);
    
    if (result.success) {
      this.recordEvent({
        type: 'player_attacked',
        data: {
          attackerId: playerId,
          defenderId: enemy.id,
          damage: result.damage || 0
        }
      });

      if (!enemy.isAlive) {
        this.recordEvent({
          type: 'npc_defeated',
          data: {
            npcId: enemy.id,
            defeatedBy: playerId,
            position: enemy.position
          }
        });

        // Add loot to world if any was generated
        if (result.lootDropped) {
          result.lootDropped.forEach(item => {
            this.gameWorldManager.addItem(this.gameWorld, item);
          });
        }

        // Clean up dead NPC from position tracking
        this.npcManager.removeNPCPosition(enemy.position);
      }

      if (result.levelUp) {
        this.recordEvent({
          type: 'player_leveled_up',
          data: {
            playerId,
            newLevel: player.level
          }
        });
      }
    }

    return result;
  }

  // =============================================================================
  // LOOT SYSTEM
  // =============================================================================

  /**
   * Pick up an item
   */
  public pickupItem(playerId: string, itemId: string): ItemResult {
    const result = this.lootManager.pickupItem(itemId, itemId, this.gameWorld.items, this.gameWorld.players);
    
    if (result.success) {
      this.recordEvent({
        type: 'item_picked_up',
        data: {
          playerId,
          itemId,
          position: result.item?.position || { x: 0, y: 0 }
        }
      });
    }
    
    return result;
  }

  /**
   * Inspect an item
   */
  public inspectItem(playerId: string, itemId: string): ItemResult {
    return this.lootManager.inspectItem(playerId, itemId, this.gameWorld.items, this.gameWorld.players);
  }

  /**
   * Loot an item (Tarkov-style)
   */
  public lootItem(playerId: string, itemId: string): ItemResult {
    const result = this.lootManager.lootItem(playerId, itemId, this.gameWorld.items, this.gameWorld.players);
    
    if (result.success) {
      this.recordEvent({
        type: 'item_looted',
        data: { playerId, itemId }
      });
    }
    
    return result;
  }

  /**
   * Use an item from inventory
   */
  public useItem(playerId: string, itemId: string): ItemResult {
    return this.lootManager.useItem(playerId, itemId, this.gameWorld.players);
  }

  // =============================================================================
  // CATACLYSM SYSTEM
  // =============================================================================

  /**
   * Start the cataclysm event
   */
  public startCataclysm(): GameActionResult {
    const result = this.cataclysmService.startCataclysm(this.gameWorld);
    
    if (result.success) {
      this.recordEvent({
        type: 'cataclysm_started',
        data: { timestamp: Date.now() }
      });
    }
    
    return result;
  }

  /**
   * Regenerate the entire world
   */
  public regenerateWorld(): GameActionResult {
    const result = this.cataclysmService.regenerateWorld(this.gameWorld);
    
    if (result.success) {
      this.updateModuleReferences();
      this.recordEvent({
        type: 'world_regenerated',
        data: { timestamp: Date.now() }
      });
    }
    
    return result;
  }

  // =============================================================================
  // WORLD ACCESS
  // =============================================================================

  /**
   * Get the current game world
   */
  public getGameWorld(): GameWorld {
    return this.gameWorld;
  }

  /**
   * Get world statistics
   */
  public getWorldStats() {
    return this.gameWorldManager.getWorldStats(this.gameWorld);
  }

  // =============================================================================
  // UPDATE LOOP
  // =============================================================================

  /**
   * Main update loop called each game tick
   */
  public update(): void {
    // Update NPCs
    this.npcManager.updateNPCs(this.gameWorld.npcs, this.gameWorld.grid);
    
    // Update cataclysm
    this.cataclysmService.updateCataclysm(this.gameWorld);
    
    // Update item reveals (Tarkov-style)
    this.lootManager.updateItemReveals(this.gameWorld.items);
    
    // Process player movement queues
    this.playerMovementService.processPlayerMovementQueues(this.gameWorld);
    
    // Update world age
    this.gameWorldManager.updateWorldAge(this.gameWorld);
    
    // Clean up dead NPCs
    this.npcManager.cleanupDeadNPCs(this.gameWorld.npcs);
  }
}