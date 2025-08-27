import { Player, NPC, Item, TerrainType, Position, GameWorld, ItemType, ItemRarity } from 'shared/src/types/game';
import { GAME_CONFIG, MOVEMENT_CONSTANTS, COMBAT_CONSTANTS, WORLD_CONSTANTS } from 'shared/src/constants/gameConstants';

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
  private reservedPositions: Set<string> = new Set(); // Prevents concurrent spawn races by reserving positions

  constructor(gameWorld: GameWorld) {
    this.gameWorld = gameWorld;
  }

  // Get current game world state
  public getGameWorld(): GameWorld {
    return this.gameWorld;
  }

  // Player Management
  public addPlayer(player: Player): GameActionResult {
    // Check if player already exists
    const existingPlayer = this.gameWorld.players.find(p => p.id === player.id);
    if (existingPlayer) {
      return { success: false, message: 'Player already exists' };
    }

    // DIAGNOSTIC: Log game world state before spawn attempt
    console.log(`[SPAWN_DIAGNOSTIC] Pre-spawn state for ${player.displayName}:`, {
      totalPlayers: this.gameWorld.players.length,
      connectedPlayers: this.gameWorld.players.filter(p => p.connected).length,
      disconnectedPlayers: this.gameWorld.players.filter(p => !p.connected).length,
      totalNPCs: this.gameWorld.npcs.length,
      totalItems: this.gameWorld.items.length,
      gridSize: `${GAME_CONFIG.gridWidth}x${GAME_CONFIG.gridHeight}`,
      totalGridPositions: GAME_CONFIG.gridWidth * GAME_CONFIG.gridHeight
    });

    // Find spawn position
    const spawnPosition = this.findEmptySpawnPosition();
    if (!spawnPosition) {
      console.error(`[SPAWN_ERROR] No available spawn position for player ${player.displayName}`);
      console.error(`[SPAWN_ERROR] Current players: ${this.gameWorld.players.length}`);
      console.error(`[SPAWN_ERROR] Current NPCs: ${this.gameWorld.npcs.length}`);
      console.error(`[SPAWN_ERROR] Grid size: ${GAME_CONFIG.gridWidth}x${GAME_CONFIG.gridHeight}`);
      
      // DIAGNOSTIC: Additional spawn failure analysis
      this.analyzeTerrainDistribution();
      this.analyzePositionOccupancy();
      
      return { success: false, message: 'No available spawn position' };
    }

    // Assign and persist player
    player.position = spawnPosition;
    this.gameWorld.players.push(player);

    // Release reservation after successfully placing the player (reservation only prevented races during selection)
    this.releaseReservedPosition(spawnPosition);

    console.log(`[SPAWN_SUCCESS] Player ${player.displayName} spawned at (${spawnPosition.x}, ${spawnPosition.y})`);

    return {
      success: true,
      message: `Player ${player.displayName} joined the game`,
      data: { player, position: spawnPosition }
    };
  }

  public removePlayer(playerId: string): GameActionResult {
    const playerIndex = this.gameWorld.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) {
      return { success: false, message: 'Player not found' };
    }

    const player = this.gameWorld.players[playerIndex];
    this.gameWorld.players.splice(playerIndex, 1);

    return {
      success: true,
      message: `Player ${player.displayName} left the game`,
      data: { player }
    };
  }

  // Movement System
  public movePlayer(playerId: string, direction: 'up' | 'down' | 'left' | 'right'): MoveResult {
    const player = this.gameWorld.players.find(p => p.id === playerId);
    if (!player) {
      return { success: false, message: 'Player not found' };
    }

    if (!player.isAlive) {
      return { success: false, message: 'Player is not alive' };
    }

    // Check movement cooldown
    const now = Date.now();
    if (now - player.lastMoveTime < MOVEMENT_CONSTANTS.BASE_MOVE_COOLDOWN) {
      return { success: false, message: 'Movement on cooldown' };
    }

    // Calculate new position
    const newPosition = this.calculateNewPosition(player.position, direction);

    // Validate move
    if (!this.isValidMove(player.position, newPosition)) {
      return { success: false, message: 'Invalid move' };
    }

    // Check collisions
    if (this.isPositionOccupied(newPosition, playerId)) {
      // Check if there's an enemy to attack
      const enemy = this.getEnemyAtPosition(newPosition);
      if (enemy) {
        return this.attackEnemy(player, enemy);
      }
      return { success: false, message: 'Position occupied' };
    }

    // Execute move
    player.position = newPosition;
    player.lastMoveTime = now;

    return {
      success: true,
      message: `Moved ${direction}`,
      newPosition
    };
  }

  private calculateNewPosition(currentPos: Position, direction: 'up' | 'down' | 'left' | 'right'): Position {
    const newPos = { ...currentPos };

    switch (direction) {
      case 'up':
        newPos.y -= 1;
        break;
      case 'down':
        newPos.y += 1;
        break;
      case 'left':
        newPos.x -= 1;
        break;
      case 'right':
        newPos.x += 1;
        break;
    }

    return newPos;
  }

  private isValidMove(from: Position, to: Position): boolean {
    // Check bounds
    if (to.x < 0 || to.x >= GAME_CONFIG.gridWidth ||
        to.y < 0 || to.y >= GAME_CONFIG.gridHeight) {
      return false;
    }

    // Check if move is adjacent (should be guaranteed by calculateNewPosition)
    const dx = Math.abs(to.x - from.x);
    const dy = Math.abs(to.y - from.y);

    if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
      // Check terrain
      const terrain = this.gameWorld.grid[to.y][to.x];
      if (terrain.type === TerrainType.MOUNTAIN) {
        return false; // Can't move through mountains
      }

      return true;
    }

    return false;
  }

  private isPositionOccupied(position: Position, excludePlayerId?: string): boolean {
    // Check other players
    const otherPlayer = this.gameWorld.players.find(p =>
      p.id !== excludePlayerId &&
      p.position.x === position.x &&
      p.position.y === position.y &&
      p.isAlive
    );

    if (otherPlayer) return true;

    // Check NPCs
    const npc = this.gameWorld.npcs.find(n =>
      n.position.x === position.x &&
      n.position.y === position.y &&
      n.isAlive
    );

    return !!npc;
  }

  private getEnemyAtPosition(position: Position): Player | NPC | null {
    // Check enemy players (for PvP)
    const enemyPlayer = this.gameWorld.players.find(p =>
      p.position.x === position.x &&
      p.position.y === position.y &&
      p.isAlive
    );

    if (enemyPlayer) return enemyPlayer;

    // Check NPCs (for PvE)
    const npc = this.gameWorld.npcs.find(n =>
      n.position.x === position.x &&
      n.position.y === position.y &&
      n.isAlive
    );

    return npc || null;
  }

  // Combat System
  public attackEnemy(attacker: Player, defender: Player | NPC): CombatResult {
    const now = Date.now();

    // Calculate damage
    const damage = this.calculateDamage(attacker, defender);
    const actualDamage = Math.max(0, Math.min(damage, defender.stats.hp));

    // Apply damage
    defender.stats.hp -= actualDamage;

    // Check if defender died
    if (defender.stats.hp <= 0) {
      defender.stats.hp = 0;
      defender.isAlive = false;

      // Award experience and potentially loot
      const isPlayerDefender = 'twitchUsername' in defender;
      const experience = isPlayerDefender ? 50 : 25;
      attacker.experience += experience;

      // Level up check
      this.checkLevelUp(attacker);

      const loot = isPlayerDefender ? null : this.generateLoot(defender as NPC);

      const battleResult = {
        winner: attacker,
        loser: defender,
        damage: actualDamage,
        experience,
        loot,
        timestamp: now,
        type: isPlayerDefender ? 'pvp' : 'pve'
      };

      const defenderName = isPlayerDefender ? (defender as Player).displayName : (defender as NPC).name;
      return {
        success: true,
        message: `Defeated ${defenderName} for ${experience} XP!`,
        battleResult
      };
    }

    // Defender survived
    const battleResult = {
      winner: null,
      damage: actualDamage,
      defenderHp: defender.stats.hp,
      defenderMaxHp: defender.stats.maxHp,
      timestamp: now,
      type: 'damage'
    };

    const defenderName = 'twitchUsername' in defender ? defender.displayName : defender.name;
    return {
      success: true,
      message: `Hit ${defenderName} for ${actualDamage} damage!`,
      battleResult
    };
  }

  private calculateDamage(attacker: Player, defender: Player | NPC): number {
    // Base damage calculation
    let damage = attacker.stats.attack * COMBAT_CONSTANTS.BASE_DAMAGE_MULTIPLIER;

    // Apply defense reduction
    const defenseReduction = defender.stats.defense * 0.1; // 10% damage reduction per defense point
    damage *= (1 - Math.min(defenseReduction, 0.8)); // Max 80% reduction

    // Critical hit chance
    const isCritical = Math.random() < COMBAT_CONSTANTS.CRITICAL_HIT_CHANCE;
    if (isCritical) {
      damage *= COMBAT_CONSTANTS.CRITICAL_DAMAGE_MULTIPLIER;
    }

    // Terrain modifiers
    const defenderTerrain = this.gameWorld.grid[defender.position.y][defender.position.x];

    // Forest gives defense bonus to defender
    if (defenderTerrain.type === TerrainType.FOREST) {
      damage *= 0.9; // 10% damage reduction
    }

    // Mountain gives defense bonus to defender
    if (defenderTerrain.type === TerrainType.MOUNTAIN) {
      damage *= 0.85; // 15% damage reduction
    }

    // Random factor (±10%)
    const randomFactor = 0.9 + Math.random() * 0.2;
    damage *= randomFactor;

    return Math.max(COMBAT_CONSTANTS.MIN_DAMAGE, Math.floor(damage));
  }

  private checkLevelUp(player: Player): void {
    const expNeeded = COMBAT_CONSTANTS.EXPERIENCE_PER_LEVEL * player.level;
    if (player.experience >= expNeeded) {
      player.level += 1;
      player.experience -= expNeeded;

      // Increase stats on level up
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

    // Chance to drop items
    if (Math.random() < WORLD_CONSTANTS.ITEM_DROP_CHANCE) {
      const itemTypes = ['weapon', 'armor', 'consumable'] as const;
      const rarities = ['common', 'uncommon', 'rare'] as const;

      const itemType = itemTypes[Math.floor(Math.random() * itemTypes.length)];
      const rarity = rarities[Math.floor(Math.random() * rarities.length)];

      const item: Item = {
        id: `loot_${defeated.id}_${Date.now()}`,
        name: this.generateItemName(itemType, rarity),
        type: itemType as ItemType,
        rarity: rarity as ItemRarity,
        description: `A ${rarity} ${itemType} dropped by ${defeated.name}`,
        position: { ...defeated.position },
        stats: this.generateItemStats(itemType, rarity)
      };

      loot.push(item);
      this.gameWorld.items.push(item);
    }

    return loot;
  }

  private generateItemName(type: string, rarity: string): string {
    const prefixes = {
      common: ['Basic', 'Simple', 'Plain'],
      uncommon: ['Good', 'Quality', 'Enhanced'],
      rare: ['Superior', 'Excellent', 'Masterwork']
    };

    const typeNames = {
      weapon: ['Sword', 'Dagger', 'Axe', 'Staff', 'Bow'],
      armor: ['Shield', 'Helmet', 'Armor', 'Boots', 'Gloves'],
      consumable: ['Potion', 'Elixir', 'Scroll', 'Herb']
    };

    const prefix = prefixes[rarity as keyof typeof prefixes][Math.floor(Math.random() * 3)];
    const typeName = typeNames[type as keyof typeof typeNames][Math.floor(Math.random() * 5)];

    return `${prefix} ${typeName}`;
  }

  private generateItemStats(type: string, rarity: string): any {
    const rarityMultipliers = {
      common: 1,
      uncommon: 1.5,
      rare: 2.5
    };

    const multiplier = rarityMultipliers[rarity as keyof typeof rarityMultipliers];

    switch (type) {
      case 'weapon':
        return { attack: Math.floor(5 * multiplier) };
      case 'armor':
        return { defense: Math.floor(3 * multiplier) };
      case 'consumable':
        return { hp: Math.floor(20 * multiplier) };
      default:
        return {};
    }
  }

  // Item System
  public pickupItem(playerId: string, itemId: string): ItemResult {
    const player = this.gameWorld.players.find(p => p.id === playerId);
    const item = this.gameWorld.items.find(i => i.id === itemId);

    if (!player || !item) {
      return { success: false, message: 'Player or item not found' };
    }

    // Check if player is adjacent to item
    const distance = Math.abs(player.position.x - item.position!.x) +
                     Math.abs(player.position.y - item.position!.y);

    if (distance > 1) {
      return { success: false, message: 'Too far from item' };
    }

    // Add to inventory
    player.inventory.push(item);
    item.ownerId = player.id;
    item.position = undefined;

    // Remove from world
    this.gameWorld.items = this.gameWorld.items.filter(i => i.id !== itemId);

    return {
      success: true,
      message: `Picked up ${item.name}!`,
      item
    };
  }

  public useItem(playerId: string, itemId: string): GameActionResult {
    const player = this.gameWorld.players.find(p => p.id === playerId);
    const itemIndex = player?.inventory.findIndex(i => i.id === itemId);

    if (!player || itemIndex === undefined || itemIndex === -1) {
      return { success: false, message: 'Item not found in inventory' };
    }

    const item = player.inventory[itemIndex];

    // Apply item effects
    if (item.stats) {
      if (item.stats.hp) {
        const healAmount = Math.min(item.stats.hp, player.stats.maxHp - player.stats.hp);
        player.stats.hp += healAmount;
      }

      if (item.stats.attack) {
        player.stats.attack += item.stats.attack;
      }

      if (item.stats.defense) {
        player.stats.defense += item.stats.defense;
      }
    }

    // Remove item from inventory
    player.inventory.splice(itemIndex, 1);

    return {
      success: true,
      message: `Used ${item.name}!`
    };
  }

  // World Updates
  public update(): void {
    // Update game world state

    // Update NPCs (simple AI)
    this.updateNPCs();

    // Check for cataclysm progression
    this.updateCataclysm();
  }

  private updateNPCs(): void {
    this.gameWorld.npcs.forEach(npc => {
      if (!npc.isAlive) return;

      const now = Date.now();

      // Simple wandering AI
      if (now - npc.lastMoveTime > 5000 && Math.random() < 0.3) {
        const directions = ['up', 'down', 'left', 'right'] as const;
        const direction = directions[Math.floor(Math.random() * directions.length)];
        const newPosition = this.calculateNewPosition(npc.position, direction);

        if (this.isValidMove(npc.position, newPosition) && !this.isPositionOccupied(newPosition)) {
          npc.position = newPosition;
          npc.lastMoveTime = now;
        }
      }
    });
  }

  private updateCataclysm(): void {
    if (!this.gameWorld.cataclysmCircle.isActive) return;

    const now = Date.now();
    if (now >= this.gameWorld.cataclysmCircle.nextShrinkTime) {
      // Shrink the circle
      this.gameWorld.cataclysmCircle.radius = Math.max(0, this.gameWorld.cataclysmCircle.radius - 1);

      if (this.gameWorld.cataclysmCircle.radius <= 0) {
        // Cataclysm complete - reset world
        this.resetWorld();
      } else {
        // Schedule next shrink
        this.gameWorld.cataclysmCircle.nextShrinkTime = now + 60000; // 1 minute

        // Check for players caught in the circle
        this.gameWorld.players.forEach(player => {
          if (player.isAlive && this.isInCataclysmCircle(player.position)) {
            player.isAlive = false;
          }
        });
      }
    }
  }

  private isInCataclysmCircle(position: Position): boolean {
    const center = this.gameWorld.cataclysmCircle.center;
    const distance = Math.sqrt(
      Math.pow(position.x - center.x, 2) + Math.pow(position.y - center.y, 2)
    );

    return distance >= this.gameWorld.cataclysmCircle.radius;
  }

  private resetWorld(): void {
    // Reset cataclysm
    this.gameWorld.cataclysmCircle.isActive = false;
    this.gameWorld.cataclysmCircle.radius = 20;
    this.gameWorld.cataclysmCircle.nextShrinkTime = 0;

    // Generate new world
    this.regenerateWorld();

    // Respawn dead players
    this.gameWorld.players.forEach(player => {
      if (!player.isAlive) {
        player.isAlive = true;
        player.stats.hp = player.stats.maxHp;
        // Find new spawn position
        const spawnPosition = this.findEmptySpawnPosition();
        if (spawnPosition) {
          player.position = spawnPosition;
        }
      }
    });
  }

  private regenerateWorld(): void {
    // Clear existing entities
    this.gameWorld.items = [];
    this.gameWorld.npcs = [];

    // Regenerate terrain
    for (let y = 0; y < GAME_CONFIG.gridHeight; y++) {
      for (let x = 0; x < GAME_CONFIG.gridWidth; x++) {
        const terrainType = this.generateTerrainType();
        const config = GAME_CONFIG.terrainConfig[terrainType];

        this.gameWorld.grid[y][x] = {
          type: terrainType,
          position: { x, y },
          movementCost: config.movementCost,
          defenseBonus: config.defenseBonus,
          visibilityModifier: config.visibilityModifier
        };
      }
    }

    // Regenerate NPCs
    this.generateNPCs();
  }

  private generateTerrainType(): TerrainType {
    const rand = Math.random();
    let cumulative = 0;

    for (const [terrainType, config] of Object.entries(GAME_CONFIG.terrainConfig)) {
      cumulative += config.spawnChance;
      if (rand <= cumulative) {
        return terrainType as TerrainType;
      }
    }

    return TerrainType.PLAIN; // fallback
  }

  private generateNPCs(): void {
    const npcCount = Math.floor(GAME_CONFIG.gridWidth * GAME_CONFIG.gridHeight * WORLD_CONSTANTS.NPC_SPAWN_CHANCE);

    for (let i = 0; i < npcCount; i++) {
      const position = this.findEmptySpawnPosition();
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

      this.gameWorld.npcs.push(npc);
    }
  }

  private generateNPCName(): string {
    const prefixes = ['Wild', 'Fierce', 'Ancient', 'Shadow', 'Blood'];
    const types = ['Wolf', 'Bear', 'Goblin', 'Orc', 'Troll', 'Spider', 'Snake'];

    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const type = types[Math.floor(Math.random() * types.length)];

    return `${prefix} ${type}`;
  }

  private findEmptySpawnPosition(): Position | null {
    console.log(`[SPAWN_SEARCH] Starting spawn position search`);
    
    // First, clean up positions from disconnected players
    this.cleanupDisconnectedPlayerPositions();

    const gridWidth = GAME_CONFIG.gridWidth;
    const gridHeight = GAME_CONFIG.gridHeight;

    // DIAGNOSTIC: Log search strategy
    console.log(`[SPAWN_SEARCH] Search strategy - Grid: ${gridWidth}x${gridHeight}, Priority: corners → edges → center → random`);

    // Define spawn priority zones
    const cornerPositions = [
      { x: 0, y: 0 },
      { x: gridWidth - 1, y: 0 },
      { x: 0, y: gridHeight - 1 },
      { x: gridWidth - 1, y: gridHeight - 1 }
    ];

    const edgePositions = [];
    // Add top and bottom edges (excluding corners)
    for (let x = 1; x < gridWidth - 1; x++) {
      edgePositions.push({ x, y: 0 });
      edgePositions.push({ x, y: gridHeight - 1 });
    }
    // Add left and right edges (excluding corners)
    for (let y = 1; y < gridHeight - 1; y++) {
      edgePositions.push({ x: 0, y });
      edgePositions.push({ x: gridWidth - 1, y });
    }

    console.log(`[SPAWN_SEARCH] Priority zones - Corners: ${cornerPositions.length}, Edges: ${edgePositions.length}`);

    // 1. Try corner positions first (highest priority)
    console.log(`[SPAWN_SEARCH] Checking corner positions...`);
    for (const position of cornerPositions) {
      if (this.isValidSpawnPosition(position.x, position.y)) {
        if (this.reservePosition(position.x, position.y)) {
          console.log(`[SPAWN_SUCCESS] Found & reserved corner spawn position: (${position.x}, ${position.y})`);
          return position;
        }
      }
    }

    // 2. Try edge positions (medium priority)
    console.log(`[SPAWN_SEARCH] Corner positions unavailable, checking edge positions...`);
    for (const position of edgePositions) {
      if (this.isValidSpawnPosition(position.x, position.y)) {
        if (this.reservePosition(position.x, position.y)) {
          console.log(`[SPAWN_SUCCESS] Found & reserved edge spawn position: (${position.x}, ${position.y})`);
          return position;
        }
      }
    }

    // 3. Try center area with intelligent fallback (lower priority)
    console.log(`[SPAWN_SEARCH] Edge positions unavailable, checking center area...`);
    const centerPositions = this.generateCenterPositions();
    console.log(`[SPAWN_SEARCH] Generated ${centerPositions.length} center positions to check`);
    for (const position of centerPositions) {
      if (this.isValidSpawnPosition(position.x, position.y)) {
        if (this.reservePosition(position.x, position.y)) {
          console.log(`[SPAWN_SUCCESS] Found & reserved center spawn position: (${position.x}, ${position.y})`);
          return position;
        }
      }
    }

    // 4. Final fallback: random search with increased attempts
    console.log(`[SPAWN_FALLBACK] All priority zones exhausted, using random search fallback`);
    return this.findEmptySpawnPositionFallback();
  }

  private cleanupDisconnectedPlayerPositions(): void {
    const now = Date.now();
    const disconnectThreshold = 30000; // 30 seconds threshold for disconnected players

    console.log(`[CLEANUP] Starting disconnected player cleanup`);

    // Mark players as disconnected if they haven't been active
    let markedDisconnected = 0;
    this.gameWorld.players.forEach(player => {
      if (player.connected && (now - player.lastActive) > disconnectThreshold) {
        console.log(`[CLEANUP] Marking player ${player.displayName} as disconnected (inactive for ${now - player.lastActive}ms)`);
        player.connected = false;
        markedDisconnected++;
      }
    });

    // Remove disconnected players from the game world
    const initialPlayerCount = this.gameWorld.players.length;
    this.gameWorld.players = this.gameWorld.players.filter(player => player.connected);

    const removedCount = initialPlayerCount - this.gameWorld.players.length;
    console.log(`[CLEANUP] Results: ${markedDisconnected} marked disconnected, ${removedCount} removed, ${this.gameWorld.players.length} remaining`);
    
    if (removedCount > 0) {
      console.log(`[CLEANUP] Freed up ${removedCount} spawn positions`);
    }
  }

  private generateCenterPositions(): Position[] {
    const gridWidth = GAME_CONFIG.gridWidth;
    const gridHeight = GAME_CONFIG.gridHeight;
    const centerX = Math.floor(gridWidth / 2);
    const centerY = Math.floor(gridHeight / 2);
    const radius = Math.min(centerX, centerY) - 2; // Leave some margin from edges

    const positions: Position[] = [];

    // Generate positions in concentric circles around center
    for (let r = 1; r <= radius; r++) {
      // Add positions in a circle pattern
      const circumference = r * 8; // Approximate circle with 8 directions
      for (let i = 0; i < circumference; i++) {
        const angle = (i / circumference) * 2 * Math.PI;
        const x = Math.round(centerX + r * Math.cos(angle));
        const y = Math.round(centerY + r * Math.sin(angle));

        if (x >= 0 && x < gridWidth && y >= 0 && y < gridHeight) {
          positions.push({ x, y });
        }
      }
    }

    // Shuffle positions to avoid predictable patterns
    return positions.sort(() => Math.random() - 0.5);
  }

  // Reservation helpers to avoid spawn race conditions
  private positionKey(x: number, y: number): string {
    return `${x},${y}`;
  }

  private reservePosition(x: number, y: number): boolean {
    const key = this.positionKey(x, y);
    if (this.reservedPositions.has(key)) return false;
    this.reservedPositions.add(key);
    return true;
  }

  private releaseReservedPosition(pos: Position): void {
    const key = this.positionKey(pos.x, pos.y);
    if (this.reservedPositions.has(key)) {
      this.reservedPositions.delete(key);
    }
  }

  private isPositionReserved(x: number, y: number): boolean {
    return this.reservedPositions.has(this.positionKey(x, y));
  }

  private isValidSpawnPosition(x: number, y: number): boolean {
    // Basic boundary check
    if (x < 0 || x >= GAME_CONFIG.gridWidth || y < 0 || y >= GAME_CONFIG.gridHeight) {
      console.log(`[SPAWN_CHECK] Position (${x},${y}) failed boundary check`);
      return false;
    }

    // Check if reserved (prevent race with concurrent spawns)
    if (this.isPositionReserved(x, y)) {
      console.log(`[SPAWN_CHECK] Position (${x},${y}) is currently reserved`);
      return false;
    }

    // Check if position is occupied by another player or NPC
    const position = { x, y };
    if (this.isPositionOccupied(position)) {
      console.log(`[SPAWN_CHECK] Position (${x},${y}) is occupied by another entity`);
      return false;
    }

    // Get terrain at this position
    const terrain = this.gameWorld.grid[y] && this.gameWorld.grid[y][x];
    if (!terrain) {
      console.log(`[SPAWN_CHECK] No terrain found at position (${x},${y}) - assuming valid`);
      return true;
    }

    // Check terrain type - mountains are typically non-spawnable
    if (terrain.type === TerrainType.MOUNTAIN) {
      console.log(`[SPAWN_CHECK] Position (${x},${y}) is blocked by terrain type: ${terrain.type}`);
      return false;
    }

    console.log(`[SPAWN_CHECK] Position (${x},${y}) is valid with terrain type: ${terrain.type}`);
    return true;
  }

  private findEmptySpawnPositionFallback(): Position | null {
    console.log(`[SPAWN_FALLBACK] Starting random search with detailed diagnostics`);
    
    const maxAttempts = 500; // Increased attempts for fallback
    let validPositions = 0;
    let unoccupiedPositions = 0;
    let mountainBlocked = 0;
    let waterBlocked = 0;
    let outOfBounds = 0;

    // Compute mountain percentage to decide fallback looseness
    const gridWidth = GAME_CONFIG.gridWidth;
    const gridHeight = GAME_CONFIG.gridHeight;
    const totalCells = gridWidth * gridHeight;
    let mountainCount = 0;
    for (let yy = 0; yy < gridHeight; yy++) {
      for (let xx = 0; xx < gridWidth; xx++) {
        const t = this.gameWorld.grid[yy][xx];
        if (t && t.type === TerrainType.MOUNTAIN) mountainCount++;
      }
    }
    const mountainPercentage = (mountainCount / totalCells) * 100;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const x = Math.floor(Math.random() * GAME_CONFIG.gridWidth);
      const y = Math.floor(Math.random() * GAME_CONFIG.gridHeight);

      // Early exit for invalid bounds - this should be covered by isValidSpawnPosition,
      // but double-check for robustness.
      if (x < 0 || x >= GAME_CONFIG.gridWidth || y < 0 || y >= GAME_CONFIG.gridHeight) {
        outOfBounds++;
        continue;
      }

      // Pre-check for reserved status to avoid unnecessary validation
      if (this.isPositionReserved(x, y)) {
        continue;
      }

      // Use isValidSpawnPosition to check all conditions
      if (this.isValidSpawnPosition(x, y)) {
        validPositions++;
        const position = { x, y };
        
        // Final check for occupancy, as isValidSpawnPosition does it too
        if (!this.isPositionOccupied(position)) {
          // Attempt to reserve the position to prevent race conditions.
          // If another process has just reserved it, `reservePosition` will return false.
          if (this.reservePosition(x, y)) {
            unoccupiedPositions++;
            console.log(`[SPAWN_SUCCESS] Found & reserved fallback spawn position after ${attempt + 1} attempts: (${x}, ${y})`);
            console.log(`[SPAWN_FALLBACK_STATS] Attempts: ${attempt + 1}, Valid: ${validPositions}, Unoccupied: ${unoccupiedPositions}`);
            return position;
          }
        }
      } else {
        // Log reasons for invalid positions in fallback, if not reserved/occupied (already logged)
        const terrain = this.gameWorld.grid[y][x];
        if (terrain) {
          if (terrain.type === TerrainType.MOUNTAIN) mountainBlocked++;
          // if (terrain.type === TerrainType.WATER) waterBlocked++; // No explicit water terrain type defined for spawning currently
        }
      }
    }

    // If we exhausted all attempts for non-mountain, unoccupied spots and the map is very mountainous,
    // we perform a desperate linear scan, allowing mountain tiles if necessary, but still
    // ensuring no overlap with existing players/NPCs or reservations.
    if (mountainPercentage > WORLD_CONSTANTS.EXTREMELY_MOUNTAIN_THRESHOLD) { // Define EXTREMELY_MOUNTAIN_THRESHOLD in gameConstants
      console.warn(`[SPAWN_FALLBACK] High mountain coverage (${mountainPercentage.toFixed(1)}%) - initiating last-resort scan including mountain tiles`);
      for (let yy = 0; yy < gridHeight; yy++) {
        for (let xx = 0; xx < gridWidth; xx++) {
          // Even in last resort, never spawn on currently reserved or occupied spots
          if (this.isPositionReserved(xx, yy)) continue;
          if (this.isPositionOccupied({ x: xx, y: yy })) continue;

          // Now, allow mountains in the linear scan for desperate situations.
          // Since it's a desperate fallback, prioritize *any* empty non-occupied, non-reserved spot.
          // Attempt to reserve and if successful, return the position.
          if (this.reservePosition(xx, yy)) {
            console.log(`[SPAWN_SUCCESS] Last-resort mountain/any terrain spawn chosen: (${xx}, ${yy})`);
            return { x: xx, y: yy };
          }
        }
      }
    }

    console.error(`[SPAWN_ERROR] Failed to find spawn position after ${maxAttempts} fallback attempts`);
    console.error(`[SPAWN_ERROR_STATS] Breakdown of ${maxAttempts} attempts:`);
    console.error(`[SPAWN_ERROR_STATS] - Out of bounds: ${outOfBounds}`);
    console.error(`[SPAWN_ERROR_STATS] - Mountain blocked: ${mountainBlocked} (during random search)`);
    console.error(`[SPAWN_ERROR_STATS] - Water blocked: ${waterBlocked}`);
    console.error(`[SPAWN_ERROR_STATS] - Valid terrain checked: ${validPositions}`);
    console.error(`[SPAWN_ERROR_STATS] - Unoccupied & reserved: ${unoccupiedPositions}`);
    console.error(`[SPAWN_ERROR] Total players: ${this.gameWorld.players.length}`);
    console.error(`[SPAWN_ERROR] Total NPCs: ${this.gameWorld.npcs.length}`);

    return null;
  }

  public startCataclysm(): GameActionResult {
    if (this.gameWorld.cataclysmCircle.isActive) {
      return { success: false, message: 'Cataclysm already active' };
    }

    this.gameWorld.cataclysmCircle.isActive = true;
    this.gameWorld.cataclysmCircle.nextShrinkTime = Date.now() + 60000; // Start shrinking in 1 minute

    return {
      success: true,
      message: 'Cataclysm has begun! The circle will shrink over time.',
      data: { cataclysmCircle: this.gameWorld.cataclysmCircle }
    };
  }

  // Utility methods for concurrent access
  public getPlayer(playerId: string): Player | undefined {
    return this.gameWorld.players.find(p => p.id === playerId);
  }

  public getPlayers(): Player[] {
    return this.gameWorld.players;
  }

  public getNPCs(): NPC[] {
    return this.gameWorld.npcs;
  }

  public getItems(): Item[] {
    return this.gameWorld.items;
  }

  private analyzeTerrainDistribution(): void {
    const gridWidth = GAME_CONFIG.gridWidth;
    const gridHeight = GAME_CONFIG.gridHeight;
    const totalCells = gridWidth * gridHeight;
    const terrainCounts = new Map<TerrainType, number>();

    // Count terrain types
    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        const terrain = this.gameWorld.grid[y][x];
        if (terrain) {
          const currentCount = terrainCounts.get(terrain.type) || 0;
          terrainCounts.set(terrain.type, currentCount + 1);
        }
      }
    }

    const plainPercentage = ((terrainCounts.get(TerrainType.PLAIN) || 0) / totalCells) * 100;
    const forestPercentage = ((terrainCounts.get(TerrainType.FOREST) || 0) / totalCells) * 100;
    const mountainPercentage = ((terrainCounts.get(TerrainType.MOUNTAIN) || 0) / totalCells) * 100;
    const waterPercentage = ((terrainCounts.get(TerrainType.WATER) || 0) / totalCells) * 100;

    console.log(`[TERRAIN_ANALYSIS] Grid size: ${gridWidth}x${gridHeight} (${totalCells} total cells)`);
    console.log(`[TERRAIN_ANALYSIS] Plains: ${terrainCounts.get(TerrainType.PLAIN) || 0} (${plainPercentage.toFixed(1)}%)`);
    console.log(`[TERRAIN_ANALYSIS] Forest: ${terrainCounts.get(TerrainType.FOREST) || 0} (${forestPercentage.toFixed(1)}%)`);
    console.log(`[TERRAIN_ANALYSIS] Mountains: ${terrainCounts.get(TerrainType.MOUNTAIN) || 0} (${mountainPercentage.toFixed(1)}%)`);
    console.log(`[TERRAIN_ANALYSIS] Water: ${terrainCounts.get(TerrainType.WATER) || 0} (${waterPercentage.toFixed(1)}%)`);

    // Log all terrain types found
    console.log(`[TERRAIN_ANALYSIS] All terrain types found:`, Array.from(terrainCounts.entries()).map(([type, count]) => `${type}: ${count}`).join(', '));

    if (plainPercentage < 10 && forestPercentage < 10) {
      console.error(`[TERRAIN_WARNING] Map has very few spawnable terrains (${(plainPercentage + forestPercentage).toFixed(1)}% plains+forest)`);
    }

    if (mountainPercentage > 80) {
      console.error(`[TERRAIN_WARNING] Map has ${mountainPercentage.toFixed(1)}% mountains - very few spawnable positions!`);
    }

    // Check for terrain generation issues - sum all terrain types
    const definedTerrain = Array.from(terrainCounts.values()).reduce((sum, count) => sum + count, 0);
    if (definedTerrain < totalCells) {
      console.error(`[TERRAIN_ERROR] Missing terrain data! Only ${definedTerrain}/${totalCells} cells have terrain defined`);
    }
  }

  private analyzePositionOccupancy(): void {
    console.log(`[OCCUPANCY_ANALYSIS] Analyzing position occupancy for spawn debugging`);
    
    let occupiedByPlayers = 0;
    let occupiedByNPCs = 0;
    let totalOccupied = 0;
    
    const playerPositions = new Set(this.gameWorld.players.filter(p => p.isAlive).map(p => `${p.position.x},${p.position.y}`));
    const npcPositions = new Set(this.gameWorld.npcs.filter(n => n.isAlive).map(n => `${n.position.x},${n.position.y}`));
    
    occupiedByPlayers = playerPositions.size;
    occupiedByNPCs = npcPositions.size;
    
    // Check for overlapping positions
    const overlap = new Set([...playerPositions].filter(pos => npcPositions.has(pos))).size;
    totalOccupied = playerPositions.size + npcPositions.size - overlap;
    
    console.log(`[OCCUPANCY_ANALYSIS] Position occupancy:`);
    console.log(`[OCCUPANCY_ANALYSIS] - Players: ${occupiedByPlayers} positions`);
    console.log(`[OCCUPANCY_ANALYSIS] - NPCs: ${occupiedByNPCs} positions`);
    console.log(`[OCCUPANCY_ANALYSIS] - Overlapping: ${overlap} positions`);
    console.log(`[OCCUPANCY_ANALYSIS] - Total occupied: ${totalOccupied} positions`);
    
    if (overlap > 0) {
      console.error(`[OCCUPANCY_ERROR] Found ${overlap} overlapping positions - this should not happen!`);
    }
  }
}
