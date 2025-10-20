import { Player, Position, GameWorld, BiomeType, MOVEMENT_CONSTANTS } from 'shared';

export interface MoveResult {
  success: boolean;
  message: string;
  newPosition?: Position;
  path?: Position[];
}

export interface PathfindingNode {
  position: Position;
  gCost: number;
  hCost: number;
  fCost: number;
  parent: PathfindingNode | null;
}

export class PlayerMovementService {
  private occupiedPositions: Set<string> = new Set();
  private reservedPositions: Set<string> = new Set();
  private availableSpawnPoints: Set<string> = new Set();
  private playerMovementQueues: Map<string, Position[]> = new Map();

  constructor(gameWorld: GameWorld) {
    this.initializeOccupiedPositions(gameWorld);
  }

  /**
   * Initialize occupied positions from the current game world
   */
  private initializeOccupiedPositions(gameWorld: GameWorld): void {
    this.occupiedPositions.clear();
    this.reservedPositions.clear();
    this.availableSpawnPoints.clear();

    // Mark player positions as occupied
    gameWorld.players.forEach(player => {
      if (player.isAlive) {
        this.occupiedPositions.add(`${player.position.x},${player.position.y}`);
      }
    });

    // Mark NPC positions as occupied
    gameWorld.npcs.forEach(npc => {
      if (npc.isAlive) {
        this.occupiedPositions.add(`${npc.position.x},${npc.position.y}`);
      }
    });

    // Mark building positions as occupied
    gameWorld.buildings.forEach(building => {
      for (let y = building.position.y; y < building.position.y + building.size.height; y++) {
        for (let x = building.position.x; x < building.position.x + building.size.width; x++) {
          this.occupiedPositions.add(`${x},${y}`);
        }
      }
    });

    // Populate available spawn points (non-mountain, non-occupied tiles)
    for (let y = 0; y < gameWorld.grid.length; y++) {
      for (let x = 0; x < gameWorld.grid[y].length; x++) {
        const terrain = gameWorld.grid[y][x];
        if (terrain.type !== BiomeType.MOUNTAIN && 
            !this.occupiedPositions.has(`${x},${y}`)) {
          this.availableSpawnPoints.add(`${x},${y}`);
        }
      }
    }
  }

  /**
   * Request player movement to a target position with pathfinding
   */
  public requestMoveTo(playerId: string, target: Position, gameWorld: GameWorld): MoveResult {
    const player = gameWorld.players.find(p => p.id === playerId);
    if (!player) {
      return { success: false, message: 'Player not found.' };
    }

    if (!player.isAlive) {
      return { success: false, message: 'Cannot move while defeated.' };
    }

    // Instant validation for distance
    const distance = this.getDistance(player.position, target);
    if (distance > 20) { // A reasonable limit for a single move request
      return { success: false, message: 'Target is too far.' };
    }

    // Check if target is within world bounds
    if (target.x < 0 || target.x >= gameWorld.grid[0].length || 
        target.y < 0 || target.y >= gameWorld.grid.length) {
      return { success: false, message: 'Target position is out of bounds.' };
    }

    // Check if target is accessible
    const targetTerrain = gameWorld.grid[target.y][target.x];
    if (targetTerrain.type === BiomeType.MOUNTAIN) {
      return { success: false, message: 'Cannot move to mountain terrain.' };
    }

    // Find path to target
    const path = this.findPath(player.position, target, gameWorld.grid);
    if (!path || path.length === 0) {
      return { success: false, message: 'No path found to target location.' };
    }

    // Set up movement queue for the player
    this.playerMovementQueues.set(playerId, path);

    return {
      success: true,
      message: `Movement planned to (${target.x}, ${target.y}). ${path.length} steps.`,
      path
    };
  }

  /**
   * Process a single movement step for a player
   */
  public processSinglePlayerQueueStep(playerId: string, gameWorld: GameWorld): MoveResult {
    const player = gameWorld.players.find(p => p.id === playerId);
    if (!player || !player.isAlive) {
      this.playerMovementQueues.delete(playerId);
      return { success: false, message: 'Player not found or not alive.' };
    }

    const queue = this.playerMovementQueues.get(playerId);
    if (!queue || queue.length === 0) {
      return { success: false, message: 'No movement queued.' };
    }

    const nextPosition = queue.shift()!;
    const moveResult = this.movePlayer(playerId, nextPosition, gameWorld);

    // Clear queue if movement failed or completed
    if (!moveResult.success || queue.length === 0) {
      this.playerMovementQueues.delete(playerId);
    }

    return moveResult;
  }

  /**
   * Process movement queues for all players
   */
  public processPlayerMovementQueues(gameWorld: GameWorld): void {
    for (const playerId of this.playerMovementQueues.keys()) {
      this.processSinglePlayerQueueStep(playerId, gameWorld);
    }
  }

  /**
   * Move a player to a new position
   */
  public movePlayer(playerId: string, newPosition: Position, gameWorld: GameWorld): MoveResult {
    const player = gameWorld.players.find(p => p.id === playerId);
    if (!player) {
      return { success: false, message: 'Player not found.' };
    }

    if (!player.isAlive) {
      return { success: false, message: 'Cannot move while defeated.' };
    }

    // Validate the move
    if (!this.isValidMove(player.position, newPosition, gameWorld.grid)) {
      return { success: false, message: 'Invalid move.' };
    }

    // Check if destination is occupied
    if (this.isPositionOccupied(newPosition)) {
      return { success: false, message: 'Destination is occupied.' };
    }

    // Update positions
    const oldKey = `${player.position.x},${player.position.y}`;
    const newKey = `${newPosition.x},${newPosition.y}`;
    
    this.occupiedPositions.delete(oldKey);
    this.occupiedPositions.add(newKey);
    this.availableSpawnPoints.add(oldKey);
    this.availableSpawnPoints.delete(newKey);
    
    player.position = { ...newPosition };
    player.lastMoveTime = Date.now();

    return {
      success: true,
      message: `Moved to (${newPosition.x}, ${newPosition.y}).`,
      newPosition
    };
  }

  /**
   * A* pathfinding algorithm
   */
  public findPath(start: Position, target: Position, grid: any[][], maxNodes = 20000): Position[] | null {
    const openSet: PathfindingNode[] = [];
    const closedSet: Set<string> = new Set();
    const gridHeight = grid.length;
    const gridWidth = grid[0]?.length || 0;

    if (gridWidth === 0 || gridHeight === 0) return null;

    const startNode: PathfindingNode = {
      position: start,
      gCost: 0,
      hCost: this.getDistance(start, target),
      fCost: 0,
      parent: null
    };
    startNode.fCost = startNode.gCost + startNode.hCost;

    openSet.push(startNode);
    let nodesProcessed = 0;

    while (openSet.length > 0 && nodesProcessed < maxNodes) {
      nodesProcessed++;

      // Find node with lowest fCost
      openSet.sort((a, b) => a.fCost - b.fCost);
      const currentNode = openSet.shift()!;

      const currentKey = `${currentNode.position.x},${currentNode.position.y}`;
      closedSet.add(currentKey);

      // Check if we reached the target
      if (currentNode.position.x === target.x && currentNode.position.y === target.y) {
        return this.reconstructPath(currentNode);
      }

      // Check all adjacent positions (8-directional movement)
      const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1]
      ];

      for (const [dx, dy] of directions) {
        const neighborPos: Position = {
          x: currentNode.position.x + dx,
          y: currentNode.position.y + dy
        };

        // Check bounds
        if (neighborPos.x < 0 || neighborPos.x >= gridWidth || 
            neighborPos.y < 0 || neighborPos.y >= gridHeight) {
          continue;
        }

        const neighborKey = `${neighborPos.x},${neighborPos.y}`;
        if (closedSet.has(neighborKey)) continue;

        // Check if the neighbor is walkable
        const terrain = grid[neighborPos.y][neighborPos.x];
        if (terrain.type === BiomeType.MOUNTAIN) continue;

        // Skip if occupied (unless it's the target)
        if (this.isPositionOccupied(neighborPos) && 
            !(neighborPos.x === target.x && neighborPos.y === target.y)) {
          continue;
        }

        // Calculate movement cost (diagonal moves cost more)
        const isDiagonal = dx !== 0 && dy !== 0;
        const movementCost = isDiagonal ? 1.41 : 1.0;
        const terrainCost = terrain.movementCost || 1.0;
        const gCost = currentNode.gCost + (movementCost * terrainCost);

        // Check if this neighbor is already in the open set
        const existingNode = openSet.find(node => 
          node.position.x === neighborPos.x && node.position.y === neighborPos.y
        );

        if (existingNode) {
          if (gCost < existingNode.gCost) {
            existingNode.gCost = gCost;
            existingNode.fCost = existingNode.gCost + existingNode.hCost;
            existingNode.parent = currentNode;
          }
        } else {
          const neighborNode: PathfindingNode = {
            position: neighborPos,
            gCost,
            hCost: this.getDistance(neighborPos, target),
            fCost: 0,
            parent: currentNode
          };
          neighborNode.fCost = neighborNode.gCost + neighborNode.hCost;
          openSet.push(neighborNode);
        }
      }
    }

    return null; // No path found
  }

  /**
   * Reconstruct the path from the pathfinding result
   */
  private reconstructPath(endNode: PathfindingNode): Position[] {
    const path: Position[] = [];
    let currentNode: PathfindingNode | null = endNode;

    while (currentNode !== null) {
      path.unshift(currentNode.position);
      currentNode = currentNode.parent;
    }

    // Remove the starting position
    path.shift();
    return path;
  }

  /**
   * Calculate distance between two positions (Manhattan distance)
   */
  private getDistance(pos1: Position, pos2: Position): number {
    return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
  }

  /**
   * Check if a move is valid
   */
  private isValidMove(from: Position, to: Position, grid: any[][]): boolean {
    if (!from) {
      return false;
    }
    // Check bounds
    if (to.x < 0 || to.x >= grid[0].length || to.y < 0 || to.y >= grid.length) {
      return false;
    }

    // Check if movement distance is valid (max 1 tile)
    const distance = Math.max(Math.abs(to.x - from.x), Math.abs(to.y - from.y));
    if (distance > MOVEMENT_CONSTANTS.MAX_MOVE_DISTANCE) {
      return false;
    }

    // Check terrain
    const terrain = grid[to.y][to.x];
    return terrain.type !== BiomeType.MOUNTAIN;
  }

  /**
   * Check if a position is occupied
   */
  public isPositionOccupied(position: Position): boolean {
    return this.occupiedPositions.has(`${position.x},${position.y}`);
  }

  /**
   * Find an empty spawn position
   */
  public findEmptySpawnPosition(): Position | null {
    if (this.availableSpawnPoints.size === 0) {
      return null;
    }

    const pointsArray = Array.from(this.availableSpawnPoints);
    const randomPoint = pointsArray[Math.floor(Math.random() * pointsArray.length)];
    const [x, y] = randomPoint.split(',').map(Number);
    
    return { x, y };
  }

  /**
   * Add a player to position tracking
   */
  public addPlayerPosition(position: Position): void {
    const key = `${position.x},${position.y}`;
    this.occupiedPositions.add(key);
    this.availableSpawnPoints.delete(key);
  }

  /**
   * Expose internal occupied positions set for coordination with other services
   */
  public getOccupiedPositions(): Set<string> {
    return this.occupiedPositions;
  }

  /**
   * Expose internal available spawn points set for coordination with other services
   */
  public getAvailableSpawnPoints(): Set<string> {
    return this.availableSpawnPoints;
  }

  /**
   * Remove a player from position tracking
   */
  public removePlayerPosition(position: Position): void {
    const key = `${position.x},${position.y}`;
    this.occupiedPositions.delete(key);
    this.availableSpawnPoints.add(key);
  }

  /**
   * Update occupied positions when game world changes
   */
  public updateOccupiedPositions(gameWorld: GameWorld): void {
    this.initializeOccupiedPositions(gameWorld);
  }

  /**
   * Get current movement queue for a player
   */
  public getPlayerMovementQueue(playerId: string): Position[] | undefined {
    return this.playerMovementQueues.get(playerId);
  }

  /**
   * Clear movement queue for a player
   */
  public clearPlayerMovementQueue(playerId: string): void {
    this.playerMovementQueues.delete(playerId);
  }
}