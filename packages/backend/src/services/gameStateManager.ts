import { GameWorld, GAME_CONFIG, BiomeType, Player, NPC, LootResult, Building } from '@chatterealm/shared';
import { PlayerMovementService, MoveResult } from './PlayerMovementService';
import { CombatService, CombatResult } from './CombatService';
import { LootService } from './LootService';
import { ItemResult } from './LootManager';
import { GameWorldManager } from './GameWorldManager';
import { NPCManager } from './NPCManager';
import { EventEmitter } from 'events';

// --- Interfaces ---

interface GameServices {
  playerMovement: PlayerMovementService;
  combat: CombatService;
  loot: LootService;
}

interface GameStateManagerConfig {
  services?: Partial<GameServices>;
  options?: { generateNPCs?: boolean; worldType?: 'test' | 'default' };
}

interface GameStateManagerEvents {
  error: (error: Error) => void;
  warning: (warning: string) => void;
  stateChanged: (state: GameWorld) => void;
}

export class GameStateManager extends EventEmitter {
  private gameWorld: GameWorld | null = null;
  private gameWorldManager!: GameWorldManager;
  private npcManager!: NPCManager;
  private services!: GameServices;
  private isInitialized = false;
  private healthStatus = {
    worldManager: false,
    npcManager: false,
    playerMovement: false,
    combat: false,
    loot: false
  };

  private constructor(config: GameStateManagerConfig = {}) {
    super();
  }

  public static async create(config: GameStateManagerConfig = {}): Promise<GameStateManager> {
    const instance = new GameStateManager(config);
    await instance.initializeComponents(config);
    instance.isInitialized = true;
    return instance;
  }

  private async initializeComponents(config: GameStateManagerConfig): Promise<void> {
    try {
      this.npcManager = new NPCManager(new Set());
      this.healthStatus.npcManager = true;

      this.gameWorldManager = new GameWorldManager(this.npcManager);
      this.healthStatus.worldManager = true;

      this.gameWorld = await this.retryOperation(
        () => this.gameWorldManager.initializeGameWorld(config.options),
        'Game world initialization'
      );

      this.services = this.initializeServices(config.services);
    } catch (error) {
      console.error('Component initialization failed:', error);
      throw error;
    }
  }

  private initializeServices(serviceConfig?: Partial<GameServices>): GameServices {
    const services: Partial<GameServices> = {};
    const errors: Array<{ service: string; error: Error }> = [];

    // Initialize PlayerMovementService (critical)
    try {
      services.playerMovement = serviceConfig?.playerMovement ??
        new PlayerMovementService(this.getGameWorld());
      this.healthStatus.playerMovement = true;
      console.log('✅ PlayerMovementService initialized');
    } catch (error) {
      const err = error as Error;
      errors.push({ service: 'PlayerMovementService', error: err });
      console.error('❌ PlayerMovementService initialization failed:', err);
    }

    // Initialize CombatService (critical)
    try {
      services.combat = serviceConfig?.combat ?? new CombatService();
      this.healthStatus.combat = true;
      console.log('✅ CombatService initialized');
    } catch (error) {
      const err = error as Error;
      errors.push({ service: 'CombatService', error: err });
      console.error('❌ CombatService initialization failed:', err);
    }

    // Initialize LootService (critical)
    try {
      services.loot = serviceConfig?.loot ?? new LootService();
      this.healthStatus.loot = true;
      console.log('✅ LootService initialized');
    } catch (error) {
      const err = error as Error;
      errors.push({ service: 'LootService', error: err });
      console.error('❌ LootService initialization failed:', err);
    }

    // Fail fast if any critical service failed
    if (errors.length > 0) {
      const errorMessage = errors
        .map(e => `${e.service}: ${e.error.message}`)
        .join('; ');
      throw new Error(`Failed to initialize critical services: ${errorMessage}`);
    }

    // All services initialized successfully
    this.emit('servicesReady', services);
    return services as GameServices;
  }

  private async retryOperation<T>(
    operation: () => T,
    operationName: string,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error | undefined;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return operation();
      } catch (error) {
        lastError = error as Error;
        console.warn(`${operationName} failed (attempt ${attempt}/${maxRetries}):`, error);
        if (attempt < maxRetries) {
          const waitTime = delay * Math.pow(2, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }
    throw new Error(`${operationName} failed after ${maxRetries} attempts: ${lastError!.message}`);
  }

  public update(): void {
    if (!this.isInitialized || !this.gameWorld) {
      console.warn('Attempted to update uninitialized GameStateManager');
      return;
    }
    try {
      this.safeUpdate(() => this.npcManager.updateNPCs(this.getGameWorld().npcs, this.getGameWorld().grid), 'NPC update');
      this.safeUpdate(() => this.gameWorldManager.updateWorldAge(this.getGameWorld()), 'World age update');
      this.safeUpdate(() => this.npcManager.cleanupDeadNPCs(this.getGameWorld().npcs), 'NPC cleanup');
      this.emit('stateChanged', this.gameWorld);
    } catch (error) {
      console.error('Critical error during game state update:', error);
      this.emit('error', error as Error);
    }
  }

  private safeUpdate(operation: () => void, operationName: string): void {
    try {
      operation();
    } catch (error: any) {
      console.error(`${operationName} failed:`, error);
      this.emit('warning', `${operationName} failed: ${error.message}`);
    }
  }

  public getHealthStatus() {
    return {
      ...this.healthStatus,
      initialized: this.isInitialized,
      worldAvailable: this.gameWorld !== null
    };
  }

  public getGameWorld(): GameWorld {
    if (!this.gameWorld) {
      throw new Error('Game world not initialized');
    }
    return this.gameWorld;
  }

  // --- Passthrough methods to existing services ---

  public getGameWorldManager(): GameWorldManager { return this.gameWorldManager; }
  public getNPCManager(): NPCManager { return this.npcManager; }

  public getBuildingAt(position: any): Building | undefined {
    return this.getGameWorld().buildings.find((b: Building) => b.position.x === position.x && b.position.y === position.y);
  }

  public getTerrainAt(position: any): any {
    const world = this.getGameWorld();
    if (position.x < 0 || position.x >= GAME_CONFIG.gridWidth || position.y < 0 || position.y >= GAME_CONFIG.gridHeight) {
      return undefined;
    }
    return world.grid[position.y][position.x];
  }

  public movePlayer(playerId: string, newPosition: any): MoveResult {
    return this.services.playerMovement.movePlayer(playerId, newPosition, this.getGameWorld());
  }

  public attackEnemy(playerId: string, enemyPosition: any): CombatResult {
    const world = this.getGameWorld();
    const attacker = world.players.find((p: Player) => p.id === playerId);
    const defender = world.npcs.find((n: NPC) => n.position.x === enemyPosition.x && n.position.y === enemyPosition.y);
    if (!attacker || !defender) {
      return { success: false, message: 'Attacker or defender not found' };
    }
    return this.services.combat.processAttack(attacker, defender, attacker.position, defender.position);
  }

  public startLooting(playerId: string, buildingId: string): LootResult {
    return this.services.loot.startLooting(playerId, buildingId, this.getGameWorld());
  }

  public addPlayer(player: any): { success: boolean; player?: any; message?: string } {
    const world = this.getGameWorld();
    const occupied = this.services.playerMovement.getOccupiedPositions();
    const available = this.services.playerMovement.getAvailableSpawnPoints();
    const ok = this.gameWorldManager.addPlayer(world, player, occupied, available);
    if (ok) {
      this.services.playerMovement.addPlayerPosition(player.position);
      return { success: true, player, message: 'Player added' };
    }
    return { success: false, message: 'Failed to add player' };
  }

  public isPositionValid(position: any): boolean {
    const world = this.getGameWorld();
    if (!world.grid) return false;
    if (!this.gameWorldManager.isWithinBounds(world, position)) return false;
    const terrain = this.gameWorldManager.getTerrainAt(world, position);
    if (!terrain) return false;
    return terrain.type !== BiomeType.MOUNTAIN;
  }

  public isPositionOccupied(position: any): boolean {
    return this.services.playerMovement.isPositionOccupied(position);
  }
}