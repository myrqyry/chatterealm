// Consolidated GameStateManager
// Preserves previous refactor (event queue, helper methods, cataclysm, NPCs, items, movement, combat)

import { Player, NPC, Item, BiomeType, Position, GameWorld, ItemType, ItemRarity, GAME_CONFIG, MOVEMENT_CONSTANTS, COMBAT_CONSTANTS, WORLD_CONSTANTS } from 'shared';

export interface GameActionResult {
  success: boolean;
  message: string;
  data?: any;
}

export interface MoveResult extends GameActionResult {
  newPosition?: Position;
}

export interface CombatResult extends GameActionResult {
  battleResult?: any;
}

export interface ItemResult extends GameActionResult {
  item?: Item;
}

export class GameStateManager {
  private gameWorld: GameWorld;
  private reservedPositions: Set<string> = new Set();
  private occupiedPositions: Set<string> = new Set();
  private availableSpawnPoints: Set<string> = new Set();

  // Event queue for state changes (deltas)
  private changeEvents: GameEvent[] = [];

  // Movement queues for players performing path-following (click-to-move)
  private playerMovementQueues: Map<string, Position[]> = new Map();

  private recordEvent(event: GameEvent) {
    this.changeEvents.push(event);
  }

  public getAndClearChangeEvents(): GameEvent[] {
    const events = [...this.changeEvents];
    this.changeEvents = [];
    return events;
  }

  constructor(gameWorld?: GameWorld) {
    this.gameWorld = gameWorld ?? this.initializeGameWorld();
    this.initializeOccupiedPositions();
  }

  private initializeGameWorld(): GameWorld {
    const newGameWorld: GameWorld = {
      id: 'main_world',
      grid: [],
      players: [],
      npcs: [],
      items: [],
      buildings: [], // Initialize empty buildings array
      cataclysmCircle: {
        center: { x: Math.floor(GAME_CONFIG.gridWidth / 2), y: Math.floor(GAME_CONFIG.gridHeight / 2) },
        radius: Math.max(GAME_CONFIG.gridWidth, GAME_CONFIG.gridHeight),
        isActive: false,
        shrinkRate: WORLD_CONSTANTS.CATACLYSM_SHRINK_RATE,
        nextShrinkTime: 0,
      },
      cataclysmRoughnessMultiplier: 1.0,
      worldAge: 0,
      lastResetTime: Date.now(),
      phase: 'exploration'
    } as GameWorld;

    // Initialize grid with default terrain
    for (let y = 0; y < GAME_CONFIG.gridHeight; y++) {
      newGameWorld.grid[y] = [];
      for (let x = 0; x < GAME_CONFIG.gridWidth; x++) {
        newGameWorld.grid[y][x] = {
          type: BiomeType.PLAIN,
          position: { x, y },
          movementCost: GAME_CONFIG.terrainConfig[BiomeType.PLAIN].movementCost,
          defenseBonus: GAME_CONFIG.terrainConfig[BiomeType.PLAIN].defenseBonus,
          visibilityModifier: GAME_CONFIG.terrainConfig[BiomeType.PLAIN].visibilityModifier
        } as any;
      }
    }

    // Enhanced biome generation with compatibility rules and transition zones
    const biomeCompatibility: Record<BiomeType, BiomeType[]> = {
      [BiomeType.PLAIN]: [BiomeType.FOREST, BiomeType.GRASSLAND, BiomeType.HILLS, BiomeType.CLEARING],
      [BiomeType.FOREST]: [BiomeType.PLAIN, BiomeType.DENSE_FOREST, BiomeType.MOUNTAIN, BiomeType.HILLS],
      [BiomeType.MOUNTAIN]: [BiomeType.FOREST, BiomeType.HILLS, BiomeType.SNOW, BiomeType.ROUGH_TERRAIN],
      [BiomeType.OCEAN]: [BiomeType.WATER, BiomeType.SAND, BiomeType.MARSH],
      [BiomeType.SAND]: [BiomeType.OCEAN, BiomeType.DUNES, BiomeType.PLAIN],
      [BiomeType.GRASSLAND]: [BiomeType.PLAIN, BiomeType.FOREST, BiomeType.FLOWER_FIELD],
      [BiomeType.HILLS]: [BiomeType.PLAIN, BiomeType.MOUNTAIN, BiomeType.ROUGH_TERRAIN],
      [BiomeType.SNOW]: [BiomeType.MOUNTAIN, BiomeType.ICE],
      [BiomeType.WATER]: [BiomeType.OCEAN, BiomeType.RIVER, BiomeType.MARSH],
      [BiomeType.RIVER]: [BiomeType.WATER, BiomeType.PLAIN, BiomeType.FOREST],
      [BiomeType.DENSE_FOREST]: [BiomeType.FOREST, BiomeType.MOUNTAIN],
      [BiomeType.CLEARING]: [BiomeType.FOREST, BiomeType.PLAIN],
      [BiomeType.FLOWER_FIELD]: [BiomeType.GRASSLAND, BiomeType.PLAIN],
      [BiomeType.ROUGH_TERRAIN]: [BiomeType.HILLS, BiomeType.MOUNTAIN],
      [BiomeType.DUNES]: [BiomeType.SAND, BiomeType.PLAIN],
      [BiomeType.MARSH]: [BiomeType.WATER, BiomeType.SWAMP],
      [BiomeType.SWAMP]: [BiomeType.MARSH, BiomeType.WATER],
      [BiomeType.ICE]: [BiomeType.SNOW, BiomeType.WATER],
      [BiomeType.ANCIENT_RUINS]: [BiomeType.PLAIN, BiomeType.FOREST],
      [BiomeType.MOUNTAIN_PEAK]: [BiomeType.MOUNTAIN],
      [BiomeType.DENSE_JUNGLE]: [BiomeType.FOREST, BiomeType.JUNGLE],
      [BiomeType.JUNGLE]: [BiomeType.DENSE_JUNGLE, BiomeType.FOREST],
      [BiomeType.DEEP_WATER]: [BiomeType.OCEAN, BiomeType.WATER],
      [BiomeType.OASIS]: [BiomeType.SAND, BiomeType.DUNES],
      [BiomeType.ROLLING_HILLS]: [BiomeType.HILLS, BiomeType.PLAIN],
      [BiomeType.SNOWY_HILLS]: [BiomeType.HILLS, BiomeType.SNOW]
    };

    // Enhanced cluster generation with different shapes and transition zones
    const generateBiomeCluster = (centerX: number, centerY: number, primaryBiome: BiomeType, size: number) => {
      const placed = new Map<string, BiomeType>();
      const transitionZone = new Set<string>();

      // Generate primary cluster with organic shape
      const generateOrganicShape = (cx: number, cy: number, biome: BiomeType, clusterSize: number) => {
        const localPlaced = new Set<string>();
        const seeds = [{ x: cx, y: cy }];

        for (let i = 0; i < clusterSize && seeds.length > 0; i++) {
          const idx = Math.floor(Math.random() * seeds.length);
          const { x, y } = seeds.splice(idx, 1)[0];
          const key = `${x},${y}`;

          if (x < 0 || y < 0 || x >= GAME_CONFIG.gridWidth || y >= GAME_CONFIG.gridHeight) continue;
          if (localPlaced.has(key)) continue;

          localPlaced.add(key);
          placed.set(key, biome);

          // Add neighboring tiles with decreasing probability
          const neighbors = [
            { x: x + 1, y }, { x: x - 1, y },
            { x, y: y + 1 }, { x, y: y - 1 }
          ];

          for (const n of neighbors) {
            if (!localPlaced.has(`${n.x},${n.y}`) && Math.random() < 0.7) {
              seeds.push(n);
            }
          }
        }

        return localPlaced;
      };

      // Generate primary cluster
      const primaryTiles = generateOrganicShape(centerX, centerY, primaryBiome, size);

      // Generate transition zones around compatible biomes
      const compatibleBiomes = biomeCompatibility[primaryBiome] || [];
      for (const tileKey of primaryTiles) {
        const [xStr, yStr] = tileKey.split(',');
        const x = parseInt(xStr), y = parseInt(yStr);

        // Check adjacent tiles for transition opportunities
        const adjacent = [
          { x: x + 1, y }, { x: x - 1, y },
          { x, y: y + 1 }, { x, y: y - 1 }
        ];

        for (const adj of adjacent) {
          if (adj.x < 0 || adj.y < 0 || adj.x >= GAME_CONFIG.gridWidth || adj.y >= GAME_CONFIG.gridHeight) continue;

          const adjKey = `${adj.x},${adj.y}`;
          // Ensure the grid position exists before accessing it
          if (!newGameWorld.grid[adj.y] || !newGameWorld.grid[adj.y][adj.x]) continue;

          const currentBiome = newGameWorld.grid[adj.y][adj.x].type;

          // If adjacent tile is compatible and not already set, mark for transition
          if (compatibleBiomes.includes(currentBiome) && !placed.has(adjKey)) {
            transitionZone.add(adjKey);
          }
        }
      }

      // Apply transition zones with reduced density
      for (const tileKey of transitionZone) {
        if (Math.random() < 0.4) { // 40% chance for transition tiles
          const [xStr, yStr] = tileKey.split(',');
          const x = parseInt(xStr), y = parseInt(yStr);
          const currentBiome = newGameWorld.grid[y][x].type;

          // Choose a transition biome that's compatible
          const transitionOptions = compatibleBiomes.filter(b => b !== primaryBiome);
          if (transitionOptions.length > 0) {
            const transitionBiome = transitionOptions[Math.floor(Math.random() * transitionOptions.length)];
            placed.set(tileKey, transitionBiome);
          }
        }
      }

      // Apply all placed tiles to the world
      for (const [key, biome] of placed) {
        const [xStr, yStr] = key.split(',');
        const x = parseInt(xStr), y = parseInt(yStr);
        newGameWorld.grid[y][x] = {
          type: biome,
          position: { x, y },
          movementCost: GAME_CONFIG.terrainConfig[biome].movementCost,
          defenseBonus: GAME_CONFIG.terrainConfig[biome].defenseBonus,
          visibilityModifier: GAME_CONFIG.terrainConfig[biome].visibilityModifier
        } as any;
      }
    };

    // Generate biome clusters with strategic placement
    const biomeClusters = [
      // Core biomes with larger clusters
      { biome: BiomeType.FOREST, count: Math.max(4, Math.floor((GAME_CONFIG.gridWidth * GAME_CONFIG.gridHeight) / 250)), sizeRange: [8, 18] },
      { biome: BiomeType.MOUNTAIN, count: Math.max(3, Math.floor((GAME_CONFIG.gridWidth * GAME_CONFIG.gridHeight) / 400)), sizeRange: [6, 14] },
      { biome: BiomeType.OCEAN, count: Math.max(2, Math.floor((GAME_CONFIG.gridWidth * GAME_CONFIG.gridHeight) / 600)), sizeRange: [10, 20] },
      { biome: BiomeType.SAND, count: Math.max(2, Math.floor((GAME_CONFIG.gridWidth * GAME_CONFIG.gridHeight) / 500)), sizeRange: [7, 15] },

      // Secondary biomes with smaller clusters
      { biome: BiomeType.GRASSLAND, count: Math.max(2, Math.floor((GAME_CONFIG.gridWidth * GAME_CONFIG.gridHeight) / 800)), sizeRange: [5, 12] },
      { biome: BiomeType.HILLS, count: Math.max(2, Math.floor((GAME_CONFIG.gridWidth * GAME_CONFIG.gridHeight) / 700)), sizeRange: [4, 10] },
      { biome: BiomeType.SNOW, count: Math.max(1, Math.floor((GAME_CONFIG.gridWidth * GAME_CONFIG.gridHeight) / 1200)), sizeRange: [3, 8] },
      { biome: BiomeType.WATER, count: Math.max(1, Math.floor((GAME_CONFIG.gridWidth * GAME_CONFIG.gridHeight) / 1000)), sizeRange: [4, 12] },
    ];

    // Place all biome clusters
    for (const cluster of biomeClusters) {
      for (let i = 0; i < cluster.count; i++) {
        const cx = Math.floor(Math.random() * GAME_CONFIG.gridWidth);
        const cy = Math.floor(Math.random() * GAME_CONFIG.gridHeight);
        const size = cluster.sizeRange[0] + Math.floor(Math.random() * (cluster.sizeRange[1] - cluster.sizeRange[0]));
        generateBiomeCluster(cx, cy, cluster.biome, size);
      }
    }

    // Add some rivers connecting water bodies
    const addRivers = () => {
      const waterBodies: Array<{ x: number, y: number }> = [];

      // Find all water tiles
      for (let y = 0; y < GAME_CONFIG.gridHeight; y++) {
        for (let x = 0; x < GAME_CONFIG.gridWidth; x++) {
          const tile = newGameWorld.grid[y][x];
          if (tile.type === BiomeType.OCEAN || tile.type === BiomeType.WATER) {
            waterBodies.push({ x, y });
          }
        }
      }

      // Create rivers between some water bodies
      const riverCount = Math.min(3, Math.floor(waterBodies.length / 4));
      for (let i = 0; i < riverCount; i++) {
        if (waterBodies.length < 2) break;

        const startIdx = Math.floor(Math.random() * waterBodies.length);
        const start = waterBodies.splice(startIdx, 1)[0];

        const endIdx = Math.floor(Math.random() * waterBodies.length);
        const end = waterBodies[endIdx];

        // Create a winding river path
        let current = { ...start };
        const riverTiles: Array<{ x: number, y: number }> = [];

        for (let step = 0; step < 20 && (current.x !== end.x || current.y !== end.y); step++) {
          riverTiles.push({ ...current });

          // Move towards end with some randomness
          const dx = end.x - current.x;
          const dy = end.y - current.y;

          if (Math.abs(dx) > Math.abs(dy)) {
            current.x += Math.sign(dx) + (Math.random() > 0.7 ? Math.sign(Math.random() - 0.5) : 0);
          } else {
            current.y += Math.sign(dy) + (Math.random() > 0.7 ? Math.sign(Math.random() - 0.5) : 0);
          }

          // Keep within bounds
          current.x = Math.max(0, Math.min(GAME_CONFIG.gridWidth - 1, current.x));
          current.y = Math.max(0, Math.min(GAME_CONFIG.gridHeight - 1, current.y));
        }

        // Apply river tiles
        for (const tile of riverTiles) {
          if (tile.x >= 0 && tile.y >= 0 && tile.x < GAME_CONFIG.gridWidth && tile.y < GAME_CONFIG.gridHeight) {
            const currentType = newGameWorld.grid[tile.y][tile.x].type;
            // Only place river on plains or grasslands
            if (currentType === BiomeType.PLAIN || currentType === BiomeType.GRASSLAND) {
              newGameWorld.grid[tile.y][tile.x] = {
                type: BiomeType.RIVER,
                position: { x: tile.x, y: tile.y },
                movementCost: GAME_CONFIG.terrainConfig[BiomeType.RIVER].movementCost,
                defenseBonus: GAME_CONFIG.terrainConfig[BiomeType.RIVER].defenseBonus,
                visibilityModifier: GAME_CONFIG.terrainConfig[BiomeType.RIVER].visibilityModifier
              } as any;
            }
          }
        }
      }
    };

    addRivers();

    // Mark available spawn points (non-mountain tiles) and initialize movement/defense modifiers
    for (let y = 0; y < GAME_CONFIG.gridHeight; y++) {
      for (let x = 0; x < GAME_CONFIG.gridWidth; x++) {
        const terrainType = newGameWorld.grid[y][x].type;
        if (terrainType !== BiomeType.MOUNTAIN) {
          this.availableSpawnPoints.add(`${x},${y}`);
        }
      }
    }

    return newGameWorld;
  }

  // Pathfinding (A*) - returns an array of Positions from start to target inclusive, or null if no path
  public findPath(start: Position, target: Position, maxNodes = 20000): Position[] | null {
    const startKey = `${start.x},${start.y}`;
    const targetKey = `${target.x},${target.y}`;
    if (startKey === targetKey) return [start];

    const inBounds = (p: Position) => p.x >= 0 && p.y >= 0 && p.x < GAME_CONFIG.gridWidth && p.y < GAME_CONFIG.gridHeight;

    const heuristic = (a: Position, b: Position) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

    const keyOf = (p: Position) => `${p.x},${p.y}`;

    const openSet: Position[] = [start];
    const cameFrom: Map<string, string> = new Map();

    const gScore: Map<string, number> = new Map();
    gScore.set(startKey, 0);

    const fScore: Map<string, number> = new Map();
    fScore.set(startKey, heuristic(start, target));

    const closed = new Set<string>();
    let nodesProcessed = 0;

    while (openSet.length > 0 && nodesProcessed < maxNodes) {
      // find node in openSet with lowest fScore
      let currentIdx = 0;
      let currentF = Infinity;
      for (let i = 0; i < openSet.length; i++) {
        const k = keyOf(openSet[i]);
        const fs = fScore.get(k) ?? Infinity;
        if (fs < currentF) {
          currentF = fs;
          currentIdx = i;
        }
      }

      const current = openSet.splice(currentIdx, 1)[0];
      const currentKey = keyOf(current);

      if (currentKey === targetKey) {
        // reconstruct path
        const path: Position[] = [];
        let k: string | undefined = currentKey;
        while (k) {
          const [xStr, yStr] = k.split(',');
          path.push({ x: Number(xStr), y: Number(yStr) });
          k = cameFrom.get(k);
        }
        path.reverse();
        return path;
      }

      closed.add(currentKey);
      nodesProcessed++;

      const neighbors = [ { x: current.x+1, y: current.y }, { x: current.x-1, y: current.y }, { x: current.x, y: current.y+1 }, { x: current.x, y: current.y-1 } ];
      for (const n of neighbors) {
        if (!inBounds(n)) continue;
        const nKey = keyOf(n);
        if (closed.has(nKey)) continue;

        // Skip mountains as impassable
        const terrain = this.gameWorld.grid[n.y][n.x];
        if (!terrain || terrain.type === BiomeType.MOUNTAIN) continue;

        // Avoid occupied tiles (except if it's the target)
        if (nKey !== targetKey && this.isPositionOccupied(n)) continue;

        const tentativeG = (gScore.get(currentKey) ?? Infinity) + (this.gameWorld.grid[n.y][n.x].movementCost ?? 1);

        const existingG = gScore.get(nKey) ?? Infinity;
        if (tentativeG < existingG) {
          cameFrom.set(nKey, currentKey);
          gScore.set(nKey, tentativeG);
          const f = tentativeG + heuristic(n, target);
          fScore.set(nKey, f);
          // add to openSet if not present
          if (!openSet.some(p => keyOf(p) === nKey)) openSet.push({ x: n.x, y: n.y });
        }
      }
    }

    return null; // no path found
  }

  // Request the server to compute a path and enqueue movement for the player.
  // Returns a MoveResult with success and optional path length info.
  public requestMoveTo(playerId: string, target: Position): MoveResult {
    const player = this.getPlayer(playerId);
    if (!player) return { success: false, message: 'Player not found' };
    if (!player.isAlive) return { success: false, message: 'Player not alive' };

    const now = Date.now();
    // Allow queueing even if on cooldown; movement will occur on next available tick.

    const path = this.findPath(player.position, target);
    if (!path || path.length === 0) return { success: false, message: 'No path found' };

    // Store queue excluding current position
    const queue = path.slice(1);
    this.playerMovementQueues.set(playerId, queue);

    // Attempt an immediate step if possible
    const immediate = this.processSinglePlayerQueueStep(playerId);
    const remaining = this.playerMovementQueues.get(playerId)?.length ?? 0;
    return { success: immediate.success, message: immediate.message, newPosition: immediate.newPosition, data: { queued: remaining } };
  }

  // Process one queued step for a particular player (respecting cooldown). Returns a MoveResult-like object.
  private processSinglePlayerQueueStep(playerId: string): MoveResult {
    const queue = this.playerMovementQueues.get(playerId);
    if (!queue || queue.length === 0) return { success: false, message: 'No queued moves' };
    const player = this.getPlayer(playerId);
    if (!player) return { success: false, message: 'Player not found' };
    if (!player.isAlive) return { success: false, message: 'Player not alive' };

    const now = Date.now();
    if (now - player.lastMoveTime < MOVEMENT_CONSTANTS.BASE_MOVE_COOLDOWN) return { success: false, message: 'Movement on cooldown' };

    const next = queue[0];
    if (!this.isValidMove(player.position, next)) return { success: false, message: 'Invalid move (queued)' };
    if (this.isPositionOccupied(next)) return { success: false, message: 'Position occupied (queued)' };

    // Perform move
    this.occupiedPositions.delete(`${player.position.x},${player.position.y}`);
    const oldPos = { ...player.position };
    player.position = { x: next.x, y: next.y };
    this.occupiedPositions.add(`${player.position.x},${player.position.y}`);
    player.lastMoveTime = now;

    // Pop the queue and clean up
    queue.shift();
    if (queue.length === 0) this.playerMovementQueues.delete(playerId);
    else this.playerMovementQueues.set(playerId, queue);

    this.recordEvent({ type: 'player_moved', data: { playerId, newPosition: { ...player.position }, direction: (player.position.x - oldPos.x === 1 ? 'right' : player.position.x - oldPos.x === -1 ? 'left' : player.position.y - oldPos.y === 1 ? 'down' : 'up') } } as any);

    return { success: true, message: 'Moved', newPosition: { ...player.position } };
  }

  // Process movement queues for all players on the server tick (called from update)
  private processPlayerMovementQueues(): void {
    for (const playerId of Array.from(this.playerMovementQueues.keys())) {
      // Attempt a single step; ignore failures (will retry next tick)
      this.processSinglePlayerQueueStep(playerId);
    }
  }

  private initializeOccupiedPositions(): void {
    this.occupiedPositions.clear();
    this.gameWorld.players.forEach(p => {
      if (p.isAlive) this.occupiedPositions.add(`${p.position.x},${p.position.y}`);
    });
    this.gameWorld.npcs.forEach(n => {
      if (n.isAlive) this.occupiedPositions.add(`${n.position.x},${n.position.y}`);
    });

    this.gameWorld.players.forEach(p => {
      if (p.isAlive) this.availableSpawnPoints.delete(`${p.position.x},${p.position.y}`);
    });
    this.gameWorld.npcs.forEach(n => {
      if (n.isAlive) this.availableSpawnPoints.delete(`${n.position.x},${n.position.y}`);
    });
  }

  // Get current game world
  public getGameWorld(): GameWorld {
    return this.gameWorld;
  }

  // Public helpers required by webSocketServer
  public getPlayers(): Player[] {
    return this.gameWorld.players;
  }

  public startCataclysm(): GameActionResult {
    if (!this.gameWorld.cataclysmCircle.isActive) {
      this.gameWorld.cataclysmCircle.isActive = true;
      this.gameWorld.cataclysmCircle.nextShrinkTime = Date.now() + 60000;
      this.gameWorld.phase = 'cataclysm';
      this.gameWorld.cataclysmRoughnessMultiplier = 1.0; // Start at normal roughness
      this.recordEvent({ type: 'cataclysm_started', data: { timestamp: Date.now() } } as any);
      return { success: true, message: 'Cataclysm started', data: { nextShrinkTime: this.gameWorld.cataclysmCircle.nextShrinkTime } };
    }
    return { success: false, message: 'Cataclysm already active' };
  }

  // Return a single player by id
  public getPlayer(playerId: string): Player | undefined {
    return this.gameWorld.players.find(p => p.id === playerId);
  }

  // Item pickup - player picks up item from world (Tarkov-style looting)
  public pickupItem(playerId: string, itemId: string): ItemResult {
    const player = this.getPlayer(playerId);
    const itemIndex = this.gameWorld.items.findIndex(i => i.id === itemId);
    if (!player) return { success: false, message: 'Player not found' };
    if (itemIndex === -1) return { success: false, message: 'Item not found' };

    const item = this.gameWorld.items[itemIndex];

    // Check if player is close enough to interact with the item
    if (!item.position || this.getDistance(player.position, item.position) > GAME_CONFIG.lootInteractionRadius) {
      return { success: false, message: 'Item out of reach' };
    }

    // If item is hidden, player must inspect it first
    if (item.isHidden) {
      return { success: false, message: 'Item is hidden. Use inspect_item first.' };
    }

    // If item is still revealing, can't pick it up yet
    if (item.revealProgress < 1.0) {
      return { success: false, message: 'Item is still being revealed.' };
    }

    // Item is fully revealed and can be picked up
    if (!item.canBeLooted) {
      return { success: false, message: 'This item cannot be looted.' };
    }

    // Add to inventory and remove from world
    player.inventory.push(item);
    item.ownerId = player.id;
    item.position = undefined;
    this.gameWorld.items.splice(itemIndex, 1);

    this.recordEvent({ type: 'item_picked', data: { playerId, itemId } } as any);

    return { success: true, message: `Picked up ${item.name}`, item };
  }

  // Inspect item - starts the reveal process for hidden items
  public inspectItem(playerId: string, itemId: string): ItemResult {
    const player = this.getPlayer(playerId);
    const itemIndex = this.gameWorld.items.findIndex(i => i.id === itemId);
    if (!player) return { success: false, message: 'Player not found' };
    if (itemIndex === -1) return { success: false, message: 'Item not found' };

    const item = this.gameWorld.items[itemIndex];

    // Check if player is close enough
    if (!item.position || this.getDistance(player.position, item.position) > GAME_CONFIG.lootInteractionRadius) {
      return { success: false, message: 'Item out of reach' };
    }

    // If item is not hidden, no need to inspect
    if (!item.isHidden) {
      return { success: false, message: 'Item is already visible.' };
    }

    // Start the reveal process
    const now = Date.now();
    item.isHidden = false;
    item.revealStartTime = now;
    item.lastInteractionTime = now;
    item.revealProgress = 0.0;

    this.recordEvent({ type: 'item_inspected', data: { playerId, itemId, revealStartTime: now } } as any);

    return { success: true, message: `Started revealing ${item.name}`, item };
  }

  // Loot item - attempts to pick up a revealing item (Tarkov-style)
  public lootItem(playerId: string, itemId: string): ItemResult {
    const player = this.getPlayer(playerId);
    const itemIndex = this.gameWorld.items.findIndex(i => i.id === itemId);
    if (!player) return { success: false, message: 'Player not found' };
    if (itemIndex === -1) return { success: false, message: 'Item not found' };

    const item = this.gameWorld.items[itemIndex];

    // Check if player is close enough
    if (!item.position || this.getDistance(player.position, item.position) > GAME_CONFIG.lootInteractionRadius) {
      return { success: false, message: 'Item out of reach' };
    }

    // If item is hidden, must inspect first
    if (item.isHidden) {
      return { success: false, message: 'Item is hidden. Use inspect_item first.' };
    }

    // If item is still revealing, can't loot yet
    if (item.revealProgress < 1.0) {
      return { success: false, message: 'Item is still being revealed.' };
    }

    // Try to loot the item (with potential failure chance for tension)
    const lootSuccess = Math.random() > 0.05; // 95% success rate
    if (!lootSuccess) {
      // Failed loot attempt - item becomes temporarily unavailable
      item.canBeLooted = false;
      setTimeout(() => {
        item.canBeLooted = true;
      }, 5000); // 5 seconds cooldown

      this.recordEvent({ type: 'loot_failed', data: { playerId, itemId } } as any);
      return { success: false, message: 'Failed to loot item! Try again later.' };
    }

    // Successful loot
    player.inventory.push(item);
    item.ownerId = player.id;
    item.position = undefined;
    this.gameWorld.items.splice(itemIndex, 1);

    this.recordEvent({ type: 'item_looted', data: { playerId, itemId } } as any);

    return { success: true, message: `Successfully looted ${item.name}!`, item };
  }

  // Update item reveal progress over time
  public updateItemReveals(): void {
    const now = Date.now();

    this.gameWorld.items.forEach(item => {
      if (!item.isHidden && item.revealStartTime && item.revealProgress < 1.0) {
        const elapsed = now - item.revealStartTime;
        const revealDuration = GAME_CONFIG.itemRevealTimes[item.rarity];
        item.revealProgress = Math.min(1.0, elapsed / revealDuration);

        // If fully revealed, mark as lootable
        if (item.revealProgress >= 1.0) {
          item.canBeLooted = true;
        }
      }
    });
  }

  // Use an item from player's inventory
  public useItem(playerId: string, itemId: string): GameActionResult {
    const player = this.getPlayer(playerId);
    if (!player) return { success: false, message: 'Player not found' };
    const idx = player.inventory.findIndex(i => i.id === itemId);
    if (idx === -1) return { success: false, message: 'Item not in inventory' };
    const item = player.inventory[idx];

    // Apply simple consumable effect if present
    if (item.stats?.hp) {
      const heal = Math.min(item.stats.hp, player.stats.maxHp - player.stats.hp);
      player.stats.hp += heal;
    }

    // Remove item from inventory
    player.inventory.splice(idx, 1);

    this.recordEvent({ type: 'item_used', data: { playerId, itemId } } as any);

    return { success: true, message: `Used ${item.name}` };
  }

  // Player management
  public addPlayer(player: Player): GameActionResult {
    const existing = this.gameWorld.players.find(p => p.id === player.id);
    if (existing) return { success: false, message: 'Player already exists' };

    let finalPosition: Position | null = null;
    if (player.position && this.isValidSpawnPosition(player.position.x, player.position.y)) {
      finalPosition = player.position;
    } else {
      finalPosition = this.findEmptySpawnPosition();
    }

    if (!finalPosition) {
      this.analyzeTerrainDistribution();
      this.analyzePositionOccupancy();
      return { success: false, message: 'No available spawn position' };
    }

    player.position = finalPosition;
    this.gameWorld.players.push(player);
    this.occupiedPositions.add(`${finalPosition.x},${finalPosition.y}`);
    this.availableSpawnPoints.delete(`${finalPosition.x},${finalPosition.y}`);

    this.recordEvent({ type: 'player_joined', data: { player: { ...player }, position: finalPosition } });

    return { success: true, message: `Player ${player.displayName} joined`, data: { player, position: finalPosition } };
  }

  public removePlayer(playerId: string): GameActionResult {
    const idx = this.gameWorld.players.findIndex(p => p.id === playerId);
    if (idx === -1) return { success: false, message: 'Player not found' };
    const player = this.gameWorld.players[idx];
    this.occupiedPositions.delete(`${player.position.x},${player.position.y}`);
    this.availableSpawnPoints.add(`${player.position.x},${player.position.y}`);
    this.gameWorld.players.splice(idx, 1);

    this.recordEvent({ type: 'player_left', data: { playerId, position: { ...player.position } } });

    return { success: true, message: `Player ${player.displayName} removed`, data: { player } };
  }

  // Movement
  public movePlayer(playerId: string, direction: 'up' | 'down' | 'left' | 'right'): MoveResult {
    const player = this.gameWorld.players.find(p => p.id === playerId);
    if (!player) return { success: false, message: 'Player not found' };
    if (!player.isAlive) return { success: false, message: 'Player not alive' };

    const now = Date.now();
    if (now - player.lastMoveTime < MOVEMENT_CONSTANTS.BASE_MOVE_COOLDOWN) return { success: false, message: 'Movement on cooldown' };

    const newPos = this.calculateNewPosition(player.position, direction);
    if (!this.isValidMove(player.position, newPos)) return { success: false, message: 'Invalid move' };

    if (this.isPositionOccupied(newPos)) return { success: false, message: 'Position occupied' };

    this.occupiedPositions.delete(`${player.position.x},${player.position.y}`);
    player.position = newPos;
    this.occupiedPositions.add(`${newPos.x},${newPos.y}`);
    player.lastMoveTime = now;

    this.recordEvent({ type: 'player_moved', data: { playerId, newPosition: { ...newPos }, direction } });

    return { success: true, message: 'Moved', newPosition: newPos };
  }

  private calculateNewPosition(currentPos: Position, direction: 'up' | 'down' | 'left' | 'right'): Position {
    const np = { ...currentPos };
    switch (direction) {
      case 'up': np.y -= 1; break;
      case 'down': np.y += 1; break;
      case 'left': np.x -= 1; break;
      case 'right': np.x += 1; break;
    }
    return np;
  }

  private isValidMove(from: Position, to: Position): boolean {
    if (to.x < 0 || to.x >= GAME_CONFIG.gridWidth || to.y < 0 || to.y >= GAME_CONFIG.gridHeight) return false;
    const dx = Math.abs(to.x - from.x);
    const dy = Math.abs(to.y - from.y);
    if (!((dx === 1 && dy === 0) || (dx === 0 && dy === 1))) return false;
    const terrain = this.gameWorld.grid[to.y][to.x];
    if (terrain.type === BiomeType.MOUNTAIN) return false;
    return true;
  }

  private isPositionOccupied(position: Position): boolean {
    return this.occupiedPositions.has(`${position.x},${position.y}`);
  }

  private getEnemyAtPosition(position: Position): Player | NPC | null {
    const enemyPlayer = this.gameWorld.players.find(p => p.position.x === position.x && p.position.y === position.y && p.isAlive);
    if (enemyPlayer) return enemyPlayer;
    const npc = this.gameWorld.npcs.find(n => n.position.x === position.x && n.position.y === position.y && n.isAlive);
    return npc || null;
  }

  // Combat - simplified and preserved
  public attackEnemy(attacker: Player, defender: Player | NPC): CombatResult {
    const now = Date.now();
    const damage = this.calculateDamage(attacker, defender);
    const actualDamage = Math.max(0, Math.min(damage, defender.stats.hp));
    defender.stats.hp -= actualDamage;

    if (defender.stats.hp <= 0) {
      defender.stats.hp = 0;
      defender.isAlive = false;
      this.occupiedPositions.delete(`${defender.position.x},${defender.position.y}`);
      this.availableSpawnPoints.add(`${defender.position.x},${defender.position.y}`);

      const isPlayerDefender = 'twitchUsername' in defender;
      const experience = isPlayerDefender ? 50 : 25;
      attacker.experience += experience;
      this.checkLevelUp(attacker);

      const loot = isPlayerDefender ? null : this.generateLoot(defender as NPC);

      const battleResult = { winner: attacker, loser: defender, damage: actualDamage, experience, loot, timestamp: now, type: isPlayerDefender ? 'pvp' : 'pve' };

      return { success: true, message: `Defeated`, battleResult };
    }

    const battleResult = { winner: null, damage: actualDamage, defenderHp: defender.stats.hp, defenderMaxHp: defender.stats.maxHp, timestamp: now, type: 'damage' };
    return { success: true, message: 'Hit', battleResult };
  }

  private calculateDamage(attacker: Player, defender: Player | NPC): number {
    let damage = attacker.stats.attack * COMBAT_CONSTANTS.BASE_DAMAGE_MULTIPLIER;
    const defenseReduction = defender.stats.defense * 0.1;
    damage *= (1 - Math.min(defenseReduction, 0.8));
    const isCritical = Math.random() < COMBAT_CONSTANTS.CRITICAL_HIT_CHANCE;
    if (isCritical) damage *= COMBAT_CONSTANTS.CRITICAL_DAMAGE_MULTIPLIER;

    const defenderTerrain = this.gameWorld.grid[defender.position.y][defender.position.x];
    if (defenderTerrain.type === BiomeType.FOREST) damage *= 0.9;
    if (defenderTerrain.type === BiomeType.MOUNTAIN) damage *= 0.85;

    const randomFactor = 0.9 + Math.random() * 0.2;
    damage *= randomFactor;
    return Math.max(COMBAT_CONSTANTS.MIN_DAMAGE, Math.floor(damage));
  }

  private checkLevelUp(player: Player): void {
    const expNeeded = COMBAT_CONSTANTS.EXPERIENCE_PER_LEVEL * player.level;
    if (player.experience >= expNeeded) {
      player.level += 1;
      player.experience -= expNeeded;
      const statIncrease = Math.floor(player.level * 0.5) + 1;
      player.stats.attack += statIncrease;
      player.stats.defense += statIncrease;
      player.stats.maxHp += statIncrease * 5;
      player.stats.hp = Math.min(player.stats.hp + statIncrease * 5, player.stats.maxHp);
      player.stats.speed += Math.floor(statIncrease * 0.5);
    }
  }

  private generateLoot(defeated: NPC): Item[] {
    const loot: Item[] = [];
    if (Math.random() < WORLD_CONSTANTS.ITEM_DROP_CHANCE) {
      const itemTypes = ['weapon', 'armor', 'consumable'] as const;
      const rarities = ['common', 'uncommon', 'rare'] as const;
      const itemType = itemTypes[Math.floor(Math.random() * itemTypes.length)];
      const rarity = rarities[Math.floor(Math.random() * rarities.length)];
      const item: Item = {
        id: `loot_${defeated.id}_${Date.now()}`,
        name: this.generateItemName(itemType as string, rarity as string),
        type: itemType as ItemType,
        rarity: rarity as ItemRarity,
        description: `A ${rarity} ${itemType} dropped by ${defeated.name}`,
        position: { ...defeated.position },
        stats: this.generateItemStats(itemType as string, rarity as string),
        // Tarkov-style looting properties
        isHidden: true, // Items start hidden
        revealDuration: GAME_CONFIG.itemRevealTimes[rarity as ItemRarity],
        revealProgress: 0.0,
        canBeLooted: false
      };
      loot.push(item);
      this.gameWorld.items.push(item);
    }
    return loot;
  }

  private generateItemName(type: string, rarity: string): string {
    const prefixes = { common: ['Basic', 'Simple', 'Plain'], uncommon: ['Good', 'Quality', 'Enhanced'], rare: ['Superior', 'Excellent', 'Masterwork'] } as any;
    const typeNames = { weapon: ['Sword', 'Dagger', 'Axe', 'Staff', 'Bow'], armor: ['Shield', 'Helmet', 'Armor', 'Boots', 'Gloves'], consumable: ['Potion', 'Elixir', 'Scroll', 'Herb'] } as any;
    const prefix = prefixes[rarity][Math.floor(Math.random() * prefixes[rarity].length)];
    const typeName = typeNames[type][Math.floor(Math.random() * typeNames[type].length)];
    return `${prefix} ${typeName}`;
  }

  private generateItemStats(type: string, rarity: string): any {
    const rarityMultipliers: Record<string, number> = { common: 1, uncommon: 1.5, rare: 2.5 };
    const multiplier = rarityMultipliers[rarity] ?? 1;
    switch (type) {
      case 'weapon': return { attack: Math.floor(5 * multiplier) };
      case 'armor': return { defense: Math.floor(3 * multiplier) };
      case 'consumable': return { hp: Math.floor(20 * multiplier) };
      default: return {};
    }
  }

  // World update loop (called externally by server loop)
  public update(): void {
    this.updateNPCs();
    this.updateCataclysm();
    this.updateItemReveals(); // Update item reveal progress
    this.processPlayerMovementQueues();
  }

  private updateNPCs(): void {
    this.gameWorld.npcs.forEach(npc => {
      if (!npc.isAlive) return;
      const now = Date.now();
      if (now - npc.lastMoveTime > 5000 && Math.random() < 0.3) {
        const directions = ['up','down','left','right'] as const;
        const direction = directions[Math.floor(Math.random() * directions.length)];
        const oldPosition = npc.position;
        const newPosition = this.calculateNewPosition(oldPosition, direction);
        const oldKey = `${oldPosition.x},${oldPosition.y}`;
        this.occupiedPositions.delete(oldKey);
        if (this.isValidMove(oldPosition, newPosition) && !this.isPositionOccupied(newPosition)) {
          npc.position = newPosition;
          this.occupiedPositions.add(`${newPosition.x},${newPosition.y}`);
          npc.lastMoveTime = now;
        } else {
          this.occupiedPositions.add(oldKey);
        }
      }
    });
  }

  private updateCataclysm(): void {
    if (!this.gameWorld.cataclysmCircle.isActive) return;
    const now = Date.now();
    if (now >= this.gameWorld.cataclysmCircle.nextShrinkTime) {
      const oldRadius = this.gameWorld.cataclysmCircle.radius;
      this.gameWorld.cataclysmCircle.radius = Math.max(0, this.gameWorld.cataclysmCircle.radius - 1);

      // Calculate roughness multiplier based on cataclysm progress
      // Start at 1.0 (normal), increase to 4.0 (very chaotic) as radius shrinks
      const initialRadius = Math.max(GAME_CONFIG.gridWidth, GAME_CONFIG.gridHeight);
      const progress = 1 - (this.gameWorld.cataclysmCircle.radius / initialRadius);
      this.gameWorld.cataclysmRoughnessMultiplier = 1.0 + (progress * 3.0); // 1.0 to 4.0

      // Regenerate terrain in the newly affected area (between old and new radius)
      if (oldRadius > this.gameWorld.cataclysmCircle.radius) {
        this.regenerateTerrainInCataclysmZone(oldRadius, this.gameWorld.cataclysmCircle.radius);
      }

      if (this.gameWorld.cataclysmCircle.radius <= 0) {
        this.resetWorld();
      } else {
        this.gameWorld.cataclysmCircle.nextShrinkTime = now + 60000;
        this.gameWorld.players.forEach(player => {
          if (player.isAlive && this.isInCataclysmCircle(player.position)) {
            player.isAlive = false;
          }
        });
      }
    }
  }

  private regenerateTerrainInCataclysmZone(oldRadius: number, newRadius: number): void {
    const center = this.gameWorld.cataclysmCircle.center;

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
          this.gameWorld.grid[y][x] = {
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
    this.generateNPCsInZone(newRadius, oldRadius);
    
    // Generate enhanced loot in the regenerated zone
    this.generateCataclysmZoneLoot(newRadius, oldRadius);
  }

  private isInCataclysmCircle(position: Position): boolean {
    const center = this.gameWorld.cataclysmCircle.center;
    const distance = Math.sqrt(Math.pow(position.x - center.x,2) + Math.pow(position.y - center.y,2));
    return distance >= this.gameWorld.cataclysmCircle.radius;
  }

  private generateNPCsInZone(innerRadius: number, outerRadius: number): void {
    const center = this.gameWorld.cataclysmCircle.center;
    const npcCount = Math.floor((Math.PI * (outerRadius * outerRadius - innerRadius * innerRadius)) * WORLD_CONSTANTS.NPC_SPAWN_CHANCE * 0.5);

    for (let i = 0; i < npcCount; i++) {
      // Find a position in the affected zone
      let attempts = 0;
      let position: Position | null = null;

      while (attempts < 50 && !position) {
        const angle = Math.random() * Math.PI * 2;
        const distance = innerRadius + Math.random() * (outerRadius - innerRadius);
        const x = Math.round(center.x + Math.cos(angle) * distance);
        const y = Math.round(center.y + Math.sin(angle) * distance);

        if (x >= 0 && x < GAME_CONFIG.gridWidth && y >= 0 && y < GAME_CONFIG.gridHeight &&
            !this.occupiedPositions.has(`${x},${y}`) &&
            this.gameWorld.grid[y][x].type !== BiomeType.MOUNTAIN) {
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
            hp: 40 + Math.floor(Math.random()*30),
            maxHp: 40 + Math.floor(Math.random()*30),
            attack: 5 + Math.floor(Math.random()*6),
            defense: 2 + Math.floor(Math.random()*4),
            speed: 1 + Math.floor(Math.random()*2)
          },
          behavior: 'wandering',
          lootTable: [],
          isAlive: true,
          lastMoveTime: Date.now()
        };
        this.gameWorld.npcs.push(npc);
        this.occupiedPositions.add(`${position.x},${position.y}`);
      }
    }
  }

  // Generate enhanced loot in cataclysm regenerated zones
  private generateCataclysmZoneLoot(innerRadius: number, outerRadius: number): void {
    const center = this.gameWorld.cataclysmCircle.center;
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
        const terrain = this.gameWorld.grid[position.y][position.x];
        const item = this.generateTerrainBasedLoot(position, terrain.type, true); // Enhanced cataclysm loot
        if (item) {
          this.gameWorld.items.push(item);
        }
      }
    }
  }

  // Generate terrain-based loot with enhanced properties
  private generateTerrainBasedLoot(position: Position, terrainType: BiomeType, isCataclysmLoot: boolean = false): Item | null {
    const rarityChances: Record<string, number> = isCataclysmLoot ? 
      { common: 30, uncommon: 35, rare: 25, epic: 8, legendary: 2 } : // Enhanced for cataclysm
      { common: 60, uncommon: 30, rare: 9, epic: 1 }; // Normal terrain loot

    const itemTypes = [ItemType.WEAPON, ItemType.ARMOR, ItemType.CONSUMABLE];
    const itemType = itemTypes[Math.floor(Math.random() * itemTypes.length)];
    const rarity = this.selectItemRarity(rarityChances);

    const item: Item = {
      id: `terrain_loot_${position.x}_${position.y}_${Date.now()}_${Math.random()}`,
      name: this.generateEnhancedItemName(itemType, rarity, terrainType),
      type: itemType,
      rarity,
      description: this.generateTerrainItemDescription(itemType, rarity, terrainType),
      position: { ...position },
      stats: this.generateEnhancedItemStats(itemType, rarity, terrainType, isCataclysmLoot),
      isHidden: true,
      revealDuration: GAME_CONFIG.itemRevealTimes[rarity],
      revealProgress: 0.0,
      canBeLooted: false
    };

    return item;
  }

  // Enhanced item name generation with terrain context
  private generateEnhancedItemName(type: ItemType, rarity: ItemRarity, terrainType: BiomeType): string {
    const terrainModifiers: Record<BiomeType, string[]> = {
      [BiomeType.ANCIENT_RUINS]: ['Ancient', 'Ruined', 'Lost', 'Forgotten'],
      [BiomeType.FOREST]: ['Wooden', 'Natural', 'Forest', 'Wild'],
      [BiomeType.MOUNTAIN]: ['Stone', 'Mountain', 'Rocky', 'Dwarven'],
      [BiomeType.SWAMP]: ['Murky', 'Bog', 'Swamp', 'Poisonous'],
      [BiomeType.ICE]: ['Frozen', 'Ice', 'Crystal', 'Arctic'],
      [BiomeType.SNOW]: ['Snow-touched', 'Frigid', 'Winter', 'Frost'],
      [BiomeType.SAND]: ['Desert', 'Sand-worn', 'Nomad', 'Sun-bleached'],
      [BiomeType.DEEP_WATER]: ['Sunken', 'Waterlogged', 'Coral', 'Deep'],
      [BiomeType.RIVER]: ['River-blessed', 'Flowing', 'Current-touched', 'Stream']
    } as Record<BiomeType, string[]>;

    const rarityPrefixes: Record<ItemRarity, string[]> = {
      [ItemRarity.COMMON]: ['Worn', 'Simple', 'Basic', 'Crude'],
      [ItemRarity.UNCOMMON]: ['Quality', 'Fine', 'Enhanced', 'Polished'],
      [ItemRarity.RARE]: ['Superior', 'Excellent', 'Masterwork', 'Pristine'],
      [ItemRarity.EPIC]: ['Legendary', 'Mythical', 'Ancient', 'Heroic'],
      [ItemRarity.LEGENDARY]: ['Divine', 'Immortal', 'Godly', 'Eternal']
    };

    const typeNames: Partial<Record<ItemType, string[]>> = {
      [ItemType.WEAPON]: ['Blade', 'Sword', 'Axe', 'Staff', 'Bow', 'Dagger', 'Mace'],
      [ItemType.ARMOR]: ['Shield', 'Helm', 'Armor', 'Boots', 'Gauntlets', 'Cloak'],
      [ItemType.CONSUMABLE]: ['Potion', 'Elixir', 'Herb', 'Essence', 'Extract', 'Tonic']
    };

    const terrainMods = terrainModifiers[terrainType] || ['Mysterious'];
    const terrainMod = terrainMods[Math.floor(Math.random() * terrainMods.length)];
    const rarityPrefix = rarityPrefixes[rarity][Math.floor(Math.random() * rarityPrefixes[rarity].length)];
    const typeNamesList = typeNames[type] || ['Item'];
    const typeName = typeNamesList[Math.floor(Math.random() * typeNamesList.length)];

    return `${rarityPrefix} ${terrainMod} ${typeName}`;
  }

  // Generate terrain-specific item descriptions
  private generateTerrainItemDescription(type: ItemType, rarity: ItemRarity, terrainType: BiomeType): string {
    const terrainContext: Record<BiomeType, string> = {
      [BiomeType.ANCIENT_RUINS]: 'discovered among ancient ruins',
      [BiomeType.FOREST]: 'found deep in the forest',
      [BiomeType.MOUNTAIN]: 'carved from mountain stone',
      [BiomeType.SWAMP]: 'recovered from murky swamplands',
      [BiomeType.ICE]: 'preserved in eternal ice',
      [BiomeType.SAND]: 'buried in desert sands'
    } as Record<BiomeType, string>;

    const context = terrainContext[terrainType] || 'found in the wilderness';
    return `A ${rarity} ${type} ${context}.`;
  }

  // Enhanced item stats with terrain and cataclysm bonuses
  private generateEnhancedItemStats(type: ItemType, rarity: ItemRarity, terrainType: BiomeType, isCataclysmLoot: boolean): any {
    const rarityMultipliers: Record<ItemRarity, number> = {
      [ItemRarity.COMMON]: 1,
      [ItemRarity.UNCOMMON]: 1.5,
      [ItemRarity.RARE]: 2.5,
      [ItemRarity.EPIC]: 4,
      [ItemRarity.LEGENDARY]: 6
    };

    let multiplier = rarityMultipliers[rarity];
    
    // Terrain bonuses
    const terrainBonuses: Record<BiomeType, number> = {
      [BiomeType.ANCIENT_RUINS]: 1.3,
      [BiomeType.MOUNTAIN]: 1.1,
      [BiomeType.MOUNTAIN_PEAK]: 1.2
    } as Record<BiomeType, number>;

    multiplier *= (terrainBonuses[terrainType] || 1.0);
    
    // Cataclysm bonus
    if (isCataclysmLoot) {
      multiplier *= 1.25;
    }

    switch (type) {
      case ItemType.WEAPON:
        return { attack: Math.floor(5 * multiplier + Math.random() * 3) };
      case ItemType.ARMOR:
        return { defense: Math.floor(3 * multiplier + Math.random() * 2) };
      case ItemType.CONSUMABLE:
        return { hp: Math.floor(20 * multiplier + Math.random() * 10) };
      default:
        return {};
    }
  }

  // Select item rarity based on weighted chances
  private selectItemRarity(rarityWeights: Record<string, number>): ItemRarity {
    const totalWeight = Object.values(rarityWeights).reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const [rarity, weight] of Object.entries(rarityWeights)) {
      random -= weight;
      if (random <= 0) {
        return rarity as ItemRarity;
      }
    }
    
    return ItemRarity.COMMON;
  }

  private resetWorld(): void {
    this.gameWorld.cataclysmCircle.isActive = false;
    this.gameWorld.cataclysmCircle.radius = 20;
    this.gameWorld.cataclysmCircle.nextShrinkTime = 0;
    this.gameWorld.cataclysmRoughnessMultiplier = 1.0; // Reset to normal
    this.gameWorld.phase = 'rebirth'; // Enter rebirth phase for regeneration effects
    this.regenerateTerrain();
    this.gameWorld.players.forEach(player => {
      if (!player.isAlive) {
        player.isAlive = true;
        player.stats.hp = player.stats.maxHp;
        const spawn = this.findEmptySpawnPosition();
        if (spawn) {
          player.position = spawn;
          this.occupiedPositions.add(`${spawn.x},${spawn.y}`);
        }
      }
    });
    // After a brief delay, return to exploration phase
    setTimeout(() => {
      this.gameWorld.phase = 'exploration';
    }, 5000); // 5 seconds of rebirth effects
  }

  private regenerateTerrain(): void {
    this.gameWorld.items = [];
    this.gameWorld.npcs = [];
    for (let y = 0; y < GAME_CONFIG.gridHeight; y++) {
      for (let x = 0; x < GAME_CONFIG.gridWidth; x++) {
        const terrainType = this.generateBiomeType();
        const config = GAME_CONFIG.terrainConfig[terrainType];
        this.gameWorld.grid[y][x] = { type: terrainType, position: { x,y }, movementCost: config.movementCost, defenseBonus: config.defenseBonus, visibilityModifier: config.visibilityModifier } as any;
      }
    }
    this.generateNPCs();
  }

  private generateBiomeType(): BiomeType {
    const rand = Math.random();
    let cumulative = 0;
    for (const [terrainType, config] of Object.entries(GAME_CONFIG.terrainConfig)) {
      cumulative += config.spawnChance;
      if (rand <= cumulative) return terrainType as BiomeType;
    }
    return BiomeType.PLAIN;
  }

  private generateNPCs(): void {
    const npcCount = Math.floor(GAME_CONFIG.gridWidth * GAME_CONFIG.gridHeight * WORLD_CONSTANTS.NPC_SPAWN_CHANCE);
    for (let i = 0; i < npcCount; i++) {
      const position = this.findEmptySpawnPosition();
      if (!position) continue;
      const npc: NPC = { id: `npc_${i}_${Date.now()}`, name: this.generateNPCName(), type: 'monster', position, stats: { hp: 30 + Math.floor(Math.random()*20), maxHp: 30 + Math.floor(Math.random()*20), attack: 3 + Math.floor(Math.random()*4), defense: 1 + Math.floor(Math.random()*3), speed: 1 + Math.floor(Math.random()*2) }, behavior: 'wandering', lootTable: [], isAlive: true, lastMoveTime: Date.now() };
      this.gameWorld.npcs.push(npc);
      this.occupiedPositions.add(`${position.x},${position.y}`);
      this.availableSpawnPoints.delete(`${position.x},${position.y}`);
    }
  }

  private generateNPCName(): string {
    const prefixes = ['Wild','Fierce','Ancient','Shadow','Blood'];
    const types = ['Wolf','Bear','Goblin','Orc','Troll','Spider','Snake'];
    return `${prefixes[Math.floor(Math.random()*prefixes.length)]} ${types[Math.floor(Math.random()*types.length)]}`;
  }

  // Helper: Calculate distance between two positions
  private getDistance(pos1: Position, pos2: Position): number {
    return Math.sqrt(Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2));
  }

  // Helper: Find an empty spawn position
  private findEmptySpawnPosition(): Position | null {
    for (const point of this.availableSpawnPoints) {
      if (!this.occupiedPositions.has(point)) {
        const [x, y] = point.split(',').map(Number);
        return { x, y };
      }
    }
    return null;
  }

  // Helper: Validate if a spawn position is valid
  private isValidSpawnPosition(x: number, y: number): boolean {
    const key = `${x},${y}`;
    if (x < 0 || y < 0 || x >= GAME_CONFIG.gridWidth || y >= GAME_CONFIG.gridHeight) return false;
    const terrain = this.gameWorld.grid[y]?.[x];
    return !!terrain && terrain.type !== BiomeType.MOUNTAIN && !this.occupiedPositions.has(key);
  }

  // Diagnostic helpers
  private analyzeTerrainDistribution(): void {
    const counts: Record<string, number> = {};
    for (let y = 0; y < GAME_CONFIG.gridHeight; y++) for (let x = 0; x < GAME_CONFIG.gridWidth; x++) counts[this.gameWorld.grid[y][x].type] = (counts[this.gameWorld.grid[y][x].type] || 0) + 1;
    console.log('[TERRAIN_DISTRIBUTION]', counts);
  }

  private analyzePositionOccupancy(): void {
    console.log('[OCCUPIED_POSITIONS]', Array.from(this.occupiedPositions));
    console.log('[AVAILABLE_SPAWN_POINTS]', Array.from(this.availableSpawnPoints));
  }

  // Regenerate the world (admin command)
  public regenerateWorld(): GameActionResult {
    // Clear all existing entities
    this.gameWorld.players = [];
    this.gameWorld.npcs = [];
    this.gameWorld.items = [];

    // Reset occupied positions and available spawn points
    this.occupiedPositions.clear();
    this.availableSpawnPoints.clear();

    // Regenerate terrain
    this.regenerateTerrain();

    // Reset cataclysm
    this.gameWorld.cataclysmCircle.isActive = false;
    this.gameWorld.cataclysmCircle.radius = Math.max(GAME_CONFIG.gridWidth, GAME_CONFIG.gridHeight);
    this.gameWorld.cataclysmCircle.nextShrinkTime = 0;
    this.gameWorld.cataclysmRoughnessMultiplier = 1.0;
    this.gameWorld.phase = 'exploration';

    // Reset world age
    this.gameWorld.worldAge = 0;
    this.gameWorld.lastResetTime = Date.now();

    this.recordEvent({ type: 'world_regenerated', data: { timestamp: Date.now() } } as any);

    return { success: true, message: 'World regenerated successfully' };
  }
}

// Delta event type (must be after all class/function definitions)
export type GameEvent =
  | { type: 'player_joined'; data: { player: Player; position: Position } }
  | { type: 'player_left'; data: { playerId: string; position: Position } }
  | { type: 'player_moved'; data: { playerId: string; newPosition: Position; direction: string } }
  ;


