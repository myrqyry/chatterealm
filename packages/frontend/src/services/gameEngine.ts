import { Player, NPC, Item, TerrainType, Position, GameWorld, ItemType, ItemRarity } from 'shared/src/types/game';
import { GAME_CONFIG, MOVEMENT_CONSTANTS, COMBAT_CONSTANTS, WORLD_CONSTANTS } from 'shared/src/constants/gameConstants';

export class GameEngine {
  private gameWorld: GameWorld;

  constructor(gameWorld: GameWorld) {
    this.gameWorld = gameWorld;
  }

  // Movement System
  public movePlayer(playerId: string, direction: 'up' | 'down' | 'left' | 'right'): { success: boolean; message: string; newPosition?: Position } {
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
  public attackEnemy(attacker: Player, defender: Player | NPC): { success: boolean; message: string; battleResult?: any } {
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
  public pickupItem(playerId: string, itemId: string): { success: boolean; message: string; item?: Item } {
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

  public useItem(playerId: string, itemId: string): { success: boolean; message: string } {
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

    this.gameWorld.worldAge = 0;
    this.gameWorld.lastResetTime = Date.now();
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

    return TerrainType.PLAIN;
  }

  private generateNPCs(): void {
    const npcCount = Math.floor(GAME_CONFIG.gridWidth * GAME_CONFIG.gridHeight * WORLD_CONSTANTS.NPC_SPAWN_CHANCE);

    for (let i = 0; i < npcCount; i++) {
      const position = this.findEmptySpawnPosition();
      if (position) {
        const npc: NPC = {
          id: `npc_${i}_${Date.now()}`,
          name: `Goblin ${i + 1}`,
          type: 'goblin',
          position,
          stats: {
            hp: 60,
            maxHp: 60,
            attack: 12,
            defense: 8,
            speed: 12
          },
          behavior: Math.random() > 0.5 ? 'aggressive' : 'wandering',
          lootTable: [],
          isAlive: true,
          lastMoveTime: Date.now()
        };

        this.gameWorld.npcs.push(npc);
      }
    }
  }

  private findEmptySpawnPosition(): Position | null {
    const maxAttempts = 100;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const x = Math.floor(Math.random() * GAME_CONFIG.gridWidth);
      const y = Math.floor(Math.random() * GAME_CONFIG.gridHeight);

      const terrain = this.gameWorld.grid[y][x];
      const isOccupied = this.gameWorld.players.some(p => p.position.x === x && p.position.y === y) ||
                        this.gameWorld.npcs.some(n => n.position.x === x && n.position.y === y);

      if (!isOccupied && terrain.type !== TerrainType.MOUNTAIN) {
        return { x, y };
      }
    }
    return null;
  }

  public getGameWorld(): GameWorld {
    return this.gameWorld;
  }

  public startCataclysm(): void {
    this.gameWorld.cataclysmCircle.isActive = true;
    this.gameWorld.cataclysmCircle.nextShrinkTime = Date.now() + 300000; // 5 minutes
    this.gameWorld.phase = 'cataclysm';
  }
}
