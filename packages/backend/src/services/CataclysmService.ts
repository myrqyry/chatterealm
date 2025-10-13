import { GameWorld, Position, BiomeType, Player, GAME_CONFIG } from 'shared';
import { LootManager } from './LootManager';
import { NPCManager } from './NPCManager';
import { GameEvent } from './gameStateManager';

export interface GameActionResult {
  success: boolean;
  message: string;
  data?: any;
}

export class CataclysmService {
  private lootManager: LootManager;
  private npcManager: NPCManager;
  private occupiedPositions: Set<string>;
  private rebirthEndTime: number | null = null;

  constructor(lootManager: LootManager, npcManager: NPCManager, occupiedPositions: Set<string>) {
    this.lootManager = lootManager;
    this.npcManager = npcManager;
    this.occupiedPositions = occupiedPositions;
  }

  /**
   * Start the cataclysm event
   */
  public startCataclysm(gameWorld: GameWorld): { result: GameActionResult, events: GameEvent[] } {
    if (gameWorld.cataclysmCircle.isActive) {
      return { result: { success: false, message: 'Cataclysm is already active.' }, events: [] };
    }

    gameWorld.cataclysmCircle.isActive = true;
    gameWorld.cataclysmCircle.nextShrinkTime = Date.now() + 10000; // Start shrinking in 10 seconds for faster demo
    gameWorld.phase = 'cataclysm';

    const event: GameEvent = { type: 'cataclysm_started', data: { timestamp: Date.now() } };

    return {
      result: {
        success: true,
        message: 'The cataclysm has begun! The world will start changing soon.'
      },
      events: [event]
    };
  }

  /**
   * Update cataclysm mechanics each tick
   */
  public updateCataclysm(gameWorld: GameWorld): void {
    if (!gameWorld.cataclysmCircle.isActive) return;

    const now = Date.now();
    
    if (now >= gameWorld.cataclysmCircle.nextShrinkTime) {
      const oldRadius = gameWorld.cataclysmCircle.radius;
      gameWorld.cataclysmCircle.radius = Math.max(0, gameWorld.cataclysmCircle.radius - 1);

      // Calculate roughness multiplier based on cataclysm progress
      // Start at 1.0 (normal), increase to 4.0 (very chaotic) as radius shrinks
      const initialRadius = Math.max(GAME_CONFIG.gridWidth, GAME_CONFIG.gridHeight);
      const progress = 1 - (gameWorld.cataclysmCircle.radius / initialRadius);
      gameWorld.cataclysmRoughnessMultiplier = 1.0 + (progress * 3.0); // 1.0 to 4.0

      // Regenerate terrain in the newly affected area (between old and new radius)
      if (oldRadius > gameWorld.cataclysmCircle.radius) {
        this.regenerateTerrainInCataclysmZone(gameWorld, oldRadius, gameWorld.cataclysmCircle.radius);
      }

      // Schedule next shrink
      gameWorld.cataclysmCircle.nextShrinkTime = now + 60000; // Shrink every minute

      // Check if cataclysm should end
      if (gameWorld.cataclysmCircle.radius <= 0) {
        this.endCataclysm(gameWorld);
      }
    }
  }

  /**
   * Regenerate terrain in the cataclysm zone
   */
  private regenerateTerrainInCataclysmZone(gameWorld: GameWorld, oldRadius: number, newRadius: number): void {
    const center = gameWorld.cataclysmCircle.center;

    // Regenerate terrain in the ring between oldRadius and newRadius
    for (let y = 0; y < GAME_CONFIG.gridHeight; y++) {
      for (let x = 0; x < GAME_CONFIG.gridWidth; x++) {
        const distance = Math.sqrt(Math.pow(x - center.x, 2) + Math.pow(y - center.y, 2));

        // If this tile is in the affected zone (between old and new radius)
        if (distance <= oldRadius && distance > newRadius) {
          // Regenerate terrain with some cataclysm effects
          const terrainType = this.generateBiomeType();
          const config = GAME_CONFIG.terrainConfig[terrainType];

          // Apply cataclysm transformation - make terrain more chaotic
          let transformedType = terrainType;
          if (Math.random() < 0.3) { // 30% chance of transformation
            // Transform some terrain types to more dangerous/chaotic versions
            switch (terrainType) {
              case BiomeType.FOREST:
                transformedType = Math.random() < 0.5 ? BiomeType.DENSE_FOREST : BiomeType.ANCIENT_RUINS;
                break;
              case BiomeType.PLAIN:
                transformedType = Math.random() < 0.4 ? BiomeType.ROUGH_TERRAIN : BiomeType.ANCIENT_RUINS;
                break;
              case BiomeType.GRASSLAND:
                transformedType = Math.random() < 0.3 ? BiomeType.SWAMP : BiomeType.FLOWER_FIELD;
                break;
              case BiomeType.MOUNTAIN:
                transformedType = Math.random() < 0.5 ? BiomeType.MOUNTAIN_PEAK : BiomeType.ROUGH_TERRAIN;
                break;
            }
          }

          const transformedConfig = GAME_CONFIG.terrainConfig[transformedType];
          gameWorld.grid[y][x] = {
            type: transformedType,
            position: { x, y },
            movementCost: transformedConfig.movementCost,
            defenseBonus: transformedConfig.defenseBonus,
            visibilityModifier: transformedConfig.visibilityModifier
          } as any;
        }
      }
    }

    // Generate new NPCs in the regenerated area
    const newNPCs = this.npcManager.generateNPCsInZone(
      center, 
      newRadius, 
      oldRadius, 
      GAME_CONFIG.gridWidth, 
      GAME_CONFIG.gridHeight, 
      gameWorld.grid
    );
    gameWorld.npcs.push(...newNPCs);
    
    // Generate enhanced loot in the regenerated zone
    this.generateCataclysmZoneLoot(gameWorld, newRadius, oldRadius);
  }

  /**
   * Generate enhanced loot in cataclysm regenerated zones
   */
  private generateCataclysmZoneLoot(gameWorld: GameWorld, innerRadius: number, outerRadius: number): void {
    const center = gameWorld.cataclysmCircle.center;
    const areaSize = Math.PI * (outerRadius * outerRadius - innerRadius * innerRadius);
    
    // Increase loot spawn rate in cataclysm zones (2x base rate)
    const lootCount = Math.floor(areaSize * GAME_CONFIG.itemSpawnRate * 2);

    for (let i = 0; i < lootCount; i++) {
      let attempts = 0;
      let position: Position | null = null;

      while (attempts < 30 && !position) {
        const angle = Math.random() * Math.PI * 2;
        const distance = innerRadius + Math.random() * (outerRadius - innerRadius);
        const x = Math.round(center.x + Math.cos(angle) * distance);
        const y = Math.round(center.y + Math.sin(angle) * distance);

        if (x >= 0 && x < GAME_CONFIG.gridWidth && y >= 0 && y < GAME_CONFIG.gridHeight &&
            !this.occupiedPositions.has(`${x},${y}`)) {
          position = { x, y };
        }
        attempts++;
      }

      if (position) {
        const terrain = gameWorld.grid[position.y][position.x];
        const item = this.lootManager.generateTerrainBasedLoot(position, terrain.type, true); // Enhanced cataclysm loot
        if (item) {
          gameWorld.items.push(item);
        }
      }
    }
  }

  /**
   * End the cataclysm and enter rebirth phase
   */
  private endCataclysm(gameWorld: GameWorld): void {
    gameWorld.cataclysmCircle.isActive = false;
    gameWorld.cataclysmCircle.radius = Math.max(GAME_CONFIG.gridWidth, GAME_CONFIG.gridHeight);
    gameWorld.cataclysmCircle.nextShrinkTime = 0;
    gameWorld.cataclysmRoughnessMultiplier = 1.0;
    gameWorld.phase = 'rebirth';

    // Set the end time for the rebirth phase
    this.rebirthEndTime = Date.now() + 5000; // 5 seconds rebirth phase
  }

  /**
   * Reset the world after cataclysm
   */
  private resetWorld(gameWorld: GameWorld): void {
    gameWorld.cataclysmCircle.isActive = false;
    gameWorld.cataclysmCircle.radius = Math.max(GAME_CONFIG.gridWidth, GAME_CONFIG.gridHeight);
    gameWorld.cataclysmCircle.nextShrinkTime = 0;
    gameWorld.cataclysmRoughnessMultiplier = 1.0;
    gameWorld.phase = 'rebirth';

    // Regenerate terrain
    this.regenerateTerrain(gameWorld);

    // Respawn defeated players
    gameWorld.players.forEach(player => {
      if (!player.isAlive) {
        player.isAlive = true;
        player.stats.hp = player.stats.maxHp;
        // Position will be set when they spawn
      }
    });

    // The phase will be transitioned back to 'exploration' in the update loop
  }

  /**
   * Regenerate terrain for world reset
   */
  private regenerateTerrain(gameWorld: GameWorld): void {
    // Clear existing items and NPCs
    gameWorld.items = [];
    gameWorld.npcs = [];

    // Regenerate terrain grid
    for (let y = 0; y < GAME_CONFIG.gridHeight; y++) {
      for (let x = 0; x < GAME_CONFIG.gridWidth; x++) {
        const terrainType = this.generateBiomeType();
        const config = GAME_CONFIG.terrainConfig[terrainType];
        gameWorld.grid[y][x] = {
          type: terrainType,
          position: { x, y },
          movementCost: config.movementCost,
          defenseBonus: config.defenseBonus,
          visibilityModifier: config.visibilityModifier
        } as any;
      }
    }

    // Generate new NPCs
    const newNPCs = this.npcManager.generateNPCs(
      GAME_CONFIG.gridWidth, 
      GAME_CONFIG.gridHeight, 
      gameWorld.grid
    );
    gameWorld.npcs = newNPCs;
  }

  /**
   * Generate a random terrain type based on spawn chances
   */
  private generateBiomeType(): BiomeType {
    const rand = Math.random();
    let cumulative = 0;
    
    for (const [terrainType, config] of Object.entries(GAME_CONFIG.terrainConfig)) {
      cumulative += config.spawnChance;
      if (rand <= cumulative) {
        return terrainType as BiomeType;
      }
    }
    
    return BiomeType.PLAIN;
  }

  /**
   * Check if a position is in the cataclysm circle
   */
  public isInCataclysmCircle(position: Position, gameWorld: GameWorld): boolean {
    if (!gameWorld.cataclysmCircle.isActive) return false;
    
    const center = gameWorld.cataclysmCircle.center;
    const distance = Math.sqrt(Math.pow(position.x - center.x, 2) + Math.pow(position.y - center.y, 2));
    return distance >= gameWorld.cataclysmCircle.radius;
  }

  /**
   * Get cataclysm status information
   */
  public getCataclysmStatus(gameWorld: GameWorld): {
    isActive: boolean;
    radius: number;
    center: Position;
    nextShrinkTime: number;
    phase: string;
  } {
    return {
      isActive: gameWorld.cataclysmCircle.isActive,
      radius: gameWorld.cataclysmCircle.radius,
      center: gameWorld.cataclysmCircle.center,
      nextShrinkTime: gameWorld.cataclysmCircle.nextShrinkTime,
      phase: gameWorld.phase
    };
  }

  /**
   * Force trigger world regeneration (admin command)
   */
  public regenerateWorld(gameWorld: GameWorld): GameActionResult {
    // Clear all existing entities
    gameWorld.players = [];
    gameWorld.npcs = [];
    gameWorld.items = [];

    // Reset occupied positions
    this.occupiedPositions.clear();

    // Regenerate terrain
    this.regenerateTerrain(gameWorld);

    // Reset cataclysm
    gameWorld.cataclysmCircle.isActive = false;
    gameWorld.cataclysmCircle.radius = Math.max(GAME_CONFIG.gridWidth, GAME_CONFIG.gridHeight);
    gameWorld.cataclysmCircle.nextShrinkTime = 0;
    gameWorld.cataclysmRoughnessMultiplier = 1.0;
    gameWorld.phase = 'exploration';

    // Reset world age
    gameWorld.worldAge = 0;
    gameWorld.lastResetTime = Date.now();

    return {
      success: true,
      message: 'World has been completely regenerated.',
      data: { worldAge: gameWorld.worldAge }
    };
  }

  /**
   * Update occupied positions reference
   */
  public updateOccupiedPositions(occupiedPositions: Set<string>): void {
    this.occupiedPositions = occupiedPositions;
  }
}