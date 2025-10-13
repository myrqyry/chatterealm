import { NPC, Position, BiomeType, GAME_CONFIG, WORLD_CONSTANTS } from 'shared';

export class NPCManager {
  private occupiedPositions: Set<string>;

  constructor(occupiedPositions: Set<string>) {
    this.occupiedPositions = occupiedPositions;
  }

  /**
   * Generate NPCs for the initial world
   */
  public generateNPCs(gridWidth: number, gridHeight: number, grid: any[]): NPC[] {
    const npcs: NPC[] = [];
    const npcCount = Math.floor(gridWidth * gridHeight * WORLD_CONSTANTS.NPC_SPAWN_CHANCE);
    
    for (let i = 0; i < npcCount; i++) {
      const position = this.findEmptySpawnPosition(gridWidth, gridHeight, grid);
      if (!position) continue;
      
      const npc: NPC = {
        id: `npc_${i}_${Date.now()}`,
        name: this.generateNPCName(),
        type: 'monster',
        position,
        stats: {
          hp: 30 + Math.floor(Math.random() * 20),
          maxHp: 30 + Math.floor(Math.random() * 20),
          attack: 3 + Math.floor(Math.random() * 4),
          defense: 1 + Math.floor(Math.random() * 3),
          speed: 1 + Math.floor(Math.random() * 2)
        },
        behavior: 'wandering',
        lootTable: [],
        isAlive: true,
        lastMoveTime: Date.now()
      };
      
      npcs.push(npc);
      this.occupiedPositions.add(`${position.x},${position.y}`);
    }
    
    return npcs;
  }

  /**
   * Generate NPCs in a specific zone (for cataclysm events)
   */
  public generateNPCsInZone(
    centerPosition: Position,
    innerRadius: number,
    outerRadius: number,
    gridWidth: number,
    gridHeight: number,
    grid: any[]
  ): NPC[] {
    const npcs: NPC[] = [];
    const center = centerPosition;
    const npcCount = Math.floor(
      (Math.PI * (outerRadius * outerRadius - innerRadius * innerRadius)) * 
      WORLD_CONSTANTS.NPC_SPAWN_CHANCE * 0.5
    );

    for (let i = 0; i < npcCount; i++) {
      // Find a position in the affected zone
      let attempts = 0;
      let position: Position | null = null;

      while (attempts < 50 && !position) {
        const angle = Math.random() * Math.PI * 2;
        const distance = innerRadius + Math.random() * (outerRadius - innerRadius);
        const x = Math.round(center.x + Math.cos(angle) * distance);
        const y = Math.round(center.y + Math.sin(angle) * distance);

        if (x >= 0 && x < gridWidth && y >= 0 && y < gridHeight &&
            !this.occupiedPositions.has(`${x},${y}`) &&
            grid[y][x].type !== BiomeType.MOUNTAIN) {
          position = { x, y };
        }
        attempts++;
      }

      if (position) {
        const npc: NPC = {
          id: `npc_cataclysm_${i}_${Date.now()}`,
          name: this.generateNPCName(),
          type: 'monster',
          position,
          stats: {
            hp: 40 + Math.floor(Math.random() * 30),
            maxHp: 40 + Math.floor(Math.random() * 30),
            attack: 5 + Math.floor(Math.random() * 6),
            defense: 2 + Math.floor(Math.random() * 4),
            speed: 1 + Math.floor(Math.random() * 2)
          },
          behavior: 'wandering',
          lootTable: [],
          isAlive: true,
          lastMoveTime: Date.now()
        };
        
        npcs.push(npc);
        this.occupiedPositions.add(`${position.x},${position.y}`);
      }
    }

    return npcs;
  }

  /**
   * Update NPC AI and movement
   */
  public updateNPCs(npcs: NPC[], grid: any[]): void {
    npcs.forEach(npc => {
      if (!npc.isAlive) return;
      
      const now = Date.now();
      
      // Simple AI: move randomly every 5 seconds with 30% chance
      if (now - npc.lastMoveTime > 5000 && Math.random() < 0.3) {
        const directions = ['up', 'down', 'left', 'right'] as const;
        const direction = directions[Math.floor(Math.random() * directions.length)];
        
        const oldPosition = npc.position;
        const newPosition = this.calculateNewPosition(oldPosition, direction);
        
        const oldKey = `${oldPosition.x},${oldPosition.y}`;
        this.occupiedPositions.delete(oldKey);
        
        if (this.isValidMove(oldPosition, newPosition, grid) && 
            !this.occupiedPositions.has(`${newPosition.x},${newPosition.y}`)) {
          npc.position = newPosition;
          this.occupiedPositions.add(`${newPosition.x},${newPosition.y}`);
          npc.lastMoveTime = now;
        } else {
          // Restore position if move failed
          this.occupiedPositions.add(oldKey);
        }
      }
    });
  }

  /**
   * Calculate new position based on direction
   */
  private calculateNewPosition(current: Position, direction: string): Position {
    switch (direction) {
      case 'up': return { x: current.x, y: current.y - 1 };
      case 'down': return { x: current.x, y: current.y + 1 };
      case 'left': return { x: current.x - 1, y: current.y };
      case 'right': return { x: current.x + 1, y: current.y };
      default: return current;
    }
  }

  /**
   * Validate if NPC movement is allowed
   */
  private isValidMove(from: Position, to: Position, grid: any[]): boolean {
    // Check bounds
    if (to.x < 0 || to.x >= grid[0]?.length || to.y < 0 || to.y >= grid.length) {
      return false;
    }

    // Check if movement distance is valid (max 1 tile)
    const distance = Math.max(Math.abs(to.x - from.x), Math.abs(to.y - from.y));
    if (distance > 1) {
      return false;
    }

    // Check terrain
    const terrain = grid[to.y][to.x];
    return terrain.type !== BiomeType.MOUNTAIN;
  }

  /**
   * Generate a random NPC name
   */
  private generateNPCName(): string {
    const prefixes = ['Dark', 'Shadow', 'Wild', 'Fierce', 'Ancient', 'Cursed', 'Savage', 'Brutal'];
    const creatures = ['Goblin', 'Orc', 'Wolf', 'Bear', 'Spider', 'Skeleton', 'Troll', 'Bandit'];
    
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const creature = creatures[Math.floor(Math.random() * creatures.length)];
    
    return `${prefix} ${creature}`;
  }

  /**
   * Find an empty spawn position for NPCs
   */
  private findEmptySpawnPosition(gridWidth: number, gridHeight: number, grid: any[]): Position | null {
    let attempts = 0;
    const maxAttempts = 100;

    while (attempts < maxAttempts) {
      const x = Math.floor(Math.random() * gridWidth);
      const y = Math.floor(Math.random() * gridHeight);

      if (this.isValidSpawnPosition(x, y, grid)) {
        return { x, y };
      }
      attempts++;
    }

    return null;
  }

  /**
   * Validate if a spawn position is valid for NPCs
   */
  private isValidSpawnPosition(x: number, y: number, grid: any[]): boolean {
    // Check bounds
    if (x < 0 || x >= grid[0]?.length || y < 0 || y >= grid.length) {
      return false;
    }

    // Check if position is already occupied
    if (this.occupiedPositions.has(`${x},${y}`)) {
      return false;
    }

    // Check terrain
    const terrain = grid[y][x];
    if (terrain.type === BiomeType.MOUNTAIN) {
      return false;
    }

    // Check for adjacent mountains (avoid spawning surrounded by mountains)
    let adjacentMountains = 0;
    const directions = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
    
    for (const [dx, dy] of directions) {
      const checkX = x + dx;
      const checkY = y + dy;
      
      if (checkX >= 0 && checkX < grid[0].length && checkY >= 0 && checkY < grid.length) {
        if (grid[checkY][checkX].type === BiomeType.MOUNTAIN) {
          adjacentMountains++;
        }
      }
    }

    return adjacentMountains <= 2; // Don't spawn if surrounded by too many mountains
  }

  /**
   * Get NPC at specific position
   */
  public getNPCAtPosition(npcs: NPC[], position: Position): NPC | null {
    return npcs.find(npc => 
      npc.isAlive && 
      npc.position.x === position.x && 
      npc.position.y === position.y
    ) || null;
  }

  /**
   * Remove dead NPCs from position tracking
   */
  public cleanupDeadNPCs(npcs: NPC[]): void {
    npcs.forEach(npc => {
      if (!npc.isAlive) {
        const key = `${npc.position.x},${npc.position.y}`;
        this.occupiedPositions.delete(key);
      }
    });
  }

  /**
   * Add NPC to position tracking
   */
  public addNPCPosition(position: Position): void {
    this.occupiedPositions.add(`${position.x},${position.y}`);
  }

  /**
   * Remove NPC from position tracking
   */
  public removeNPCPosition(position: Position): void {
    this.occupiedPositions.delete(`${position.x},${position.y}`);
  }

  /**
   * Update occupied positions reference
   */
  public updateOccupiedPositions(occupiedPositions: Set<string>): void {
    this.occupiedPositions = occupiedPositions;
  }
}