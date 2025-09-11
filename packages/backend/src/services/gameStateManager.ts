// Consolidated GameStateManager
// Preserves previous refactor (event queue, helper methods, cataclysm, NPCs, items, movement, combat)

import { Player, NPC, Item, TerrainType, Position, GameWorld, ItemType, ItemRarity, GAME_CONFIG, MOVEMENT_CONSTANTS, COMBAT_CONSTANTS, WORLD_CONSTANTS } from 'shared';

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
      cataclysmCircle: {
        center: { x: Math.floor(GAME_CONFIG.gridWidth / 2), y: Math.floor(GAME_CONFIG.gridHeight / 2) },
        radius: Math.max(GAME_CONFIG.gridWidth, GAME_CONFIG.gridHeight),
        isActive: false,
        shrinkRate: 1,
        nextShrinkTime: 0
      },
      worldAge: 0,
      lastResetTime: Date.now(),
      phase: 'exploration'
    } as GameWorld;

    for (let y = 0; y < GAME_CONFIG.gridHeight; y++) {
      newGameWorld.grid[y] = [];
      for (let x = 0; x < GAME_CONFIG.gridWidth; x++) {
        let terrainType = TerrainType.PLAIN;
        const rand = Math.random();
        if (rand < 0.1) terrainType = TerrainType.FOREST;
        else if (rand < 0.15) terrainType = TerrainType.MOUNTAIN;

        newGameWorld.grid[y][x] = {
          type: terrainType,
          position: { x, y },
          movementCost: terrainType === TerrainType.MOUNTAIN ? 2 : 1,
          defenseBonus: terrainType === TerrainType.FOREST ? 1 : 0,
          visibilityModifier: terrainType === TerrainType.FOREST ? 0.8 : 1
        } as any;

        if (terrainType !== TerrainType.MOUNTAIN) {
          this.availableSpawnPoints.add(`${x},${y}`);
        }
      }
    }

    return newGameWorld;
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
      this.recordEvent({ type: 'cataclysm_started', data: { timestamp: Date.now() } } as any);
      return { success: true, message: 'Cataclysm started', data: { nextShrinkTime: this.gameWorld.cataclysmCircle.nextShrinkTime } };
    }
    return { success: false, message: 'Cataclysm already active' };
  }

  // Return a single player by id
  public getPlayer(playerId: string): Player | undefined {
    return this.gameWorld.players.find(p => p.id === playerId);
  }

  // Item pickup - player picks up item from world
  public pickupItem(playerId: string, itemId: string): ItemResult {
    const player = this.getPlayer(playerId);
    const itemIndex = this.gameWorld.items.findIndex(i => i.id === itemId);
    if (!player) return { success: false, message: 'Player not found' };
    if (itemIndex === -1) return { success: false, message: 'Item not found' };

    const item = this.gameWorld.items[itemIndex];
    // Ensure item is adjacent or at the same position
    if (!item.position || (Math.abs(player.position.x - item.position.x) + Math.abs(player.position.y - item.position.y) > 1)) {
      return { success: false, message: 'Item out of reach' };
    }

    // Add to inventory and remove from world
    player.inventory.push(item);
    item.ownerId = player.id;
    item.position = undefined;
    this.gameWorld.items.splice(itemIndex, 1);

    this.recordEvent({ type: 'item_picked', data: { playerId, itemId } } as any);

    return { success: true, message: `Picked up ${item.name}`, item };
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

    this.releaseReservedPosition(finalPosition);

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
    if (terrain.type === TerrainType.MOUNTAIN) return false;
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
    if (defenderTerrain.type === TerrainType.FOREST) damage *= 0.9;
    if (defenderTerrain.type === TerrainType.MOUNTAIN) damage *= 0.85;

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
        stats: this.generateItemStats(itemType as string, rarity as string)
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
      this.gameWorld.cataclysmCircle.radius = Math.max(0, this.gameWorld.cataclysmCircle.radius - 1);
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

  private isInCataclysmCircle(position: Position): boolean {
    const center = this.gameWorld.cataclysmCircle.center;
    const distance = Math.sqrt(Math.pow(position.x - center.x,2) + Math.pow(position.y - center.y,2));
    return distance >= this.gameWorld.cataclysmCircle.radius;
  }

  private resetWorld(): void {
    this.gameWorld.cataclysmCircle.isActive = false;
    this.gameWorld.cataclysmCircle.radius = 20;
    this.gameWorld.cataclysmCircle.nextShrinkTime = 0;
    this.regenerateWorld();
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
  }

  private regenerateWorld(): void {
    this.gameWorld.items = [];
    this.gameWorld.npcs = [];
    for (let y = 0; y < GAME_CONFIG.gridHeight; y++) {
      for (let x = 0; x < GAME_CONFIG.gridWidth; x++) {
        const terrainType = this.generateTerrainType();
        const config = GAME_CONFIG.terrainConfig[terrainType];
        this.gameWorld.grid[y][x] = { type: terrainType, position: { x,y }, movementCost: config.movementCost, defenseBonus: config.defenseBonus, visibilityModifier: config.visibilityModifier } as any;
      }
    }
    this.generateNPCs();
  }

  private generateTerrainType(): TerrainType {
    const rand = Math.random();
    let cumulative = 0;
    for (const [terrainType, config] of Object.entries(GAME_CONFIG.terrainConfig)) {
      cumulative += config.spawnChance;
      if (rand <= cumulative) return terrainType as TerrainType;
    }
    return TerrainType.PLAIN;
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
    return !!terrain && terrain.type !== TerrainType.MOUNTAIN && !this.occupiedPositions.has(key);
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

  private releaseReservedPosition(position: Position): void {
    this.reservedPositions.delete(`${position.x},${position.y}`);
  }
}

// Delta event type (must be after all class/function definitions)
export type GameEvent =
  | { type: 'player_joined'; data: { player: Player; position: Position } }
  | { type: 'player_left'; data: { playerId: string; position: Position } }
  | { type: 'player_moved'; data: { playerId: string; newPosition: Position; direction: string } }
  ;


