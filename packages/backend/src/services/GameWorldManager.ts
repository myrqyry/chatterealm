import { GameWorld, Player, NPC, Item, Building, TerrainType, Position, GAME_CONFIG, DEFAULT_WORLD_CONFIG } from 'shared';
import { NPCManager } from './NPCManager';

export class GameWorldManager {
  private npcManager: NPCManager;

  constructor(npcManager: NPCManager) {
    this.npcManager = npcManager;
  }

  /**
   * Initialize a new game world
   */
  public initializeGameWorld(options?: { generateNPCs?: boolean; worldType?: 'test' | 'default' }): GameWorld {
    const grid: any[][] = [];
    const worldType = options?.worldType || 'default';

    // Initialize terrain grid
    for (let y = 0; y < GAME_CONFIG.gridHeight; y++) {
      grid[y] = [];
      for (let x = 0; x < GAME_CONFIG.gridWidth; x++) {
        const terrainType = worldType === 'test' ? TerrainType.PLAIN : this.generateTerrainType();
        const config = GAME_CONFIG.terrainConfig[terrainType];
        
        grid[y][x] = {
          type: terrainType,
          position: { x, y },
          movementCost: config.movementCost,
          defenseBonus: config.defenseBonus,
          visibilityModifier: config.visibilityModifier
        };
      }
    }

    // Generate initial NPCs
    const npcs = (options?.generateNPCs ?? true)
        ? this.npcManager.generateNPCs(GAME_CONFIG.gridWidth, GAME_CONFIG.gridHeight, grid)
        : [];

    // Create the game world
    const gameWorld: GameWorld = {
      id: `world_${Date.now()}`,
      grid,
      players: [],
      npcs,
      items: [],
      buildings: [],
      cataclysmCircle: {
        center: { 
          x: Math.floor(GAME_CONFIG.gridWidth / 2), 
          y: Math.floor(GAME_CONFIG.gridHeight / 2) 
        },
        radius: Math.max(GAME_CONFIG.gridWidth, GAME_CONFIG.gridHeight),
        isActive: false,
        shrinkRate: 1,
        nextShrinkTime: 0
      },
      cataclysmRoughnessMultiplier: 1.0,
      worldAge: 0,
      lastResetTime: Date.now(),
      phase: 'exploration'
    };

    return gameWorld;
  }

  /**
   * Generate terrain type based on spawn chances
   */
  private generateTerrainType(): TerrainType {
    const rand = Math.random();
    let cumulative = 0;
    
    for (const [terrainType, config] of Object.entries(GAME_CONFIG.terrainConfig)) {
      cumulative += config.spawnChance;
      if (rand <= cumulative) {
        return terrainType as TerrainType;
      }
    }
    
    return TerrainType.PLAIN;
  }

  /**
   * Add a player to the game world
   */
  public addPlayer(gameWorld: GameWorld, player: Player, occupiedPositions: Set<string>, availableSpawnPoints: Set<string>): boolean {
    // Check if player already exists
    if (gameWorld.players.find(p => p.id === player.id)) {
      return false;
    }

    // Use player's position if valid, otherwise find a new spawn point
    let spawnPosition: Position | null = player.position;
    if (!spawnPosition || !this.isValidSpawnPosition(spawnPosition.x, spawnPosition.y, gameWorld.grid, occupiedPositions)) {
        spawnPosition = this.findEmptySpawnPosition(gameWorld.grid, occupiedPositions);
    }

    if (!spawnPosition) {
        return false; // Could not find a valid spawn position
    }

    // Set player position
    player.position = spawnPosition;
    player.isAlive = true;
    player.spawnTime = Date.now();

    // Add to game world
    gameWorld.players.push(player);

    // Update position tracking
    const posKey = `${spawnPosition.x},${spawnPosition.y}`;
    occupiedPositions.add(posKey);
    availableSpawnPoints.delete(posKey);

    return true;
  }

  /**
   * Remove a player from the game world
   */
  public removePlayer(gameWorld: GameWorld, playerId: string, occupiedPositions: Set<string>, availableSpawnPoints: Set<string>): boolean {
    const playerIndex = gameWorld.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) {
      return false;
    }

    const player = gameWorld.players[playerIndex];
    
    // Update position tracking
    const posKey = `${player.position.x},${player.position.y}`;
    occupiedPositions.delete(posKey);
    availableSpawnPoints.add(posKey);

    // Remove from game world
    gameWorld.players.splice(playerIndex, 1);

    return true;
  }

  /**
   * Find an empty spawn position
   */
  private findEmptySpawnPosition(grid: any[][], occupiedPositions: Set<string>): Position | null {
    let attempts = 0;
    const maxAttempts = 100;

    while (attempts < maxAttempts) {
      const x = Math.floor(Math.random() * grid[0].length);
      const y = Math.floor(Math.random() * grid.length);

      if (this.isValidSpawnPosition(x, y, grid, occupiedPositions)) {
        return { x, y };
      }
      attempts++;
    }

    return null;
  }

  /**
   * Validate if a spawn position is valid
   */
  private isValidSpawnPosition(x: number, y: number, grid: any[][], occupiedPositions: Set<string>): boolean {
    // Check bounds
    if (x < 0 || x >= grid[0].length || y < 0 || y >= grid.length) {
      return false;
    }

    // Check if position is already occupied
    if (occupiedPositions.has(`${x},${y}`)) {
      return false;
    }

    // Check terrain
    const terrain = grid[y][x];
    if (terrain.type === TerrainType.MOUNTAIN) {
      return false;
    }

    // Check for adjacent mountains (avoid spawning surrounded by mountains)
    let adjacentMountains = 0;
    const directions = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
    
    for (const [dx, dy] of directions) {
      const checkX = x + dx;
      const checkY = y + dy;
      
      if (checkX >= 0 && checkX < grid[0].length && checkY >= 0 && checkY < grid.length) {
        if (grid[checkY][checkX].type === TerrainType.MOUNTAIN) {
          adjacentMountains++;
        }
      }
    }

    return adjacentMountains <= 2; // Don't spawn if surrounded by too many mountains
  }

  /**
   * Add an item to the game world
   */
  public addItem(gameWorld: GameWorld, item: Item): void {
    gameWorld.items.push(item);
  }

  /**
   * Remove an item from the game world
   */
  public removeItem(gameWorld: GameWorld, itemId: string): boolean {
    const itemIndex = gameWorld.items.findIndex(item => item.id === itemId);
    if (itemIndex === -1) {
      return false;
    }

    gameWorld.items.splice(itemIndex, 1);
    return true;
  }

  /**
   * Add a building to the game world
   */
  public addBuilding(gameWorld: GameWorld, building: Building): void {
    gameWorld.buildings.push(building);
  }

  /**
   * Get terrain at specific position
   */
  public getTerrainAt(gameWorld: GameWorld, position: Position): any | null {
    if (position.x < 0 || position.x >= gameWorld.grid[0]?.length || 
        position.y < 0 || position.y >= gameWorld.grid.length) {
      return null;
    }

    return gameWorld.grid[position.y][position.x];
  }

  /**
   * Update world age
   */
  public updateWorldAge(gameWorld: GameWorld): void {
    gameWorld.worldAge = Date.now() - gameWorld.lastResetTime;
  }

  /**
   * Get world statistics
   */
  public getWorldStats(gameWorld: GameWorld): {
    totalPlayers: number;
    alivePlayers: number;
    totalNPCs: number;
    aliveNPCs: number;
    totalItems: number;
    totalBuildings: number;
    worldAge: number;
    phase: string;
  } {
    return {
      totalPlayers: gameWorld.players.length,
      alivePlayers: gameWorld.players.filter(p => p.isAlive).length,
      totalNPCs: gameWorld.npcs.length,
      aliveNPCs: gameWorld.npcs.filter(npc => npc.isAlive).length,
      totalItems: gameWorld.items.length,
      totalBuildings: gameWorld.buildings.length,
      worldAge: gameWorld.worldAge,
      phase: gameWorld.phase
    };
  }

  /**
   * Analyze terrain distribution for debugging
   */
  public analyzeTerrainDistribution(gameWorld: GameWorld): Record<string, number> {
    const distribution: Record<string, number> = {};
    
    for (let y = 0; y < gameWorld.grid.length; y++) {
      for (let x = 0; x < gameWorld.grid[y].length; x++) {
        const terrainType = gameWorld.grid[y][x].type;
        distribution[terrainType] = (distribution[terrainType] || 0) + 1;
      }
    }
    
    return distribution;
  }

  /**
   * Get all players at a specific position
   */
  public getPlayersAtPosition(gameWorld: GameWorld, position: Position): Player[] {
    return gameWorld.players.filter(player => 
      player.position.x === position.x && 
      player.position.y === position.y
    );
  }

  /**
   * Get all NPCs at a specific position
   */
  public getNPCsAtPosition(gameWorld: GameWorld, position: Position): NPC[] {
    return gameWorld.npcs.filter(npc => 
      npc.position.x === position.x && 
      npc.position.y === position.y &&
      npc.isAlive
    );
  }

  /**
   * Get all items at a specific position
   */
  public getItemsAtPosition(gameWorld: GameWorld, position: Position): Item[] {
    return gameWorld.items.filter(item => 
      item.position && 
      item.position.x === position.x && 
      item.position.y === position.y
    );
  }

  /**
   * Check if a position is within world bounds
   */
  public isWithinBounds(gameWorld: GameWorld, position: Position): boolean {
    return position.x >= 0 && 
           position.x < gameWorld.grid[0]?.length && 
           position.y >= 0 && 
           position.y < gameWorld.grid.length;
  }

  /**
   * Get adjacent positions to a given position
   */
  public getAdjacentPositions(position: Position): Position[] {
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1]
    ];

    return directions.map(([dx, dy]) => ({
      x: position.x + dx,
      y: position.y + dy
    }));
  }

  /**
   * Calculate distance between two positions
   */
  public getDistance(pos1: Position, pos2: Position): number {
    return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2));
  }

  /**
   * Get Manhattan distance between two positions
   */
  public getManhattanDistance(pos1: Position, pos2: Position): number {
    return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
  }

  /**
   * Check if two positions are adjacent (including diagonals)
   */
  public areAdjacent(pos1: Position, pos2: Position): boolean {
    const dx = Math.abs(pos1.x - pos2.x);
    const dy = Math.abs(pos1.y - pos2.y);
    return dx <= 1 && dy <= 1 && (dx + dy > 0);
  }

  /**
   * Get all positions within a radius from a center point
   */
  public getPositionsInRadius(center: Position, radius: number): Position[] {
    const positions: Position[] = [];
    
    for (let x = center.x - radius; x <= center.x + radius; x++) {
      for (let y = center.y - radius; y <= center.y + radius; y++) {
        const distance = this.getDistance(center, { x, y });
        if (distance <= radius) {
          positions.push({ x, y });
        }
      }
    }
    
    return positions;
  }

  /**
   * Validate game world integrity
   */
  public validateWorld(gameWorld: GameWorld): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check grid integrity
    if (!gameWorld.grid || gameWorld.grid.length === 0) {
      errors.push('Grid is empty or invalid');
    }

    // Check players have valid positions
    gameWorld.players.forEach(player => {
      if (!this.isWithinBounds(gameWorld, player.position)) {
        errors.push(`Player ${player.id} has invalid position`);
      }
    });

    // Check NPCs have valid positions
    gameWorld.npcs.forEach(npc => {
      if (!this.isWithinBounds(gameWorld, npc.position)) {
        errors.push(`NPC ${npc.id} has invalid position`);
      }
    });

    // Check items have valid positions (if positioned)
    gameWorld.items.forEach(item => {
      if (item.position && !this.isWithinBounds(gameWorld, item.position)) {
        errors.push(`Item ${item.id} has invalid position`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}