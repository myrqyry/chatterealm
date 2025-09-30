import { Player, NPC, Position, Stats, Item, ItemType, ItemRarity, COMBAT_CONSTANTS, GAME_CONFIG } from 'shared';

export interface CombatResult {
  success: boolean;
  message: string;
  damage?: number;
  experienceGained?: number;
  levelUp?: boolean;
  lootDropped?: Item[];
}

export class CombatSystem {
  /**
   * Process an attack between a player and an enemy NPC
   */
  public processAttack(
    attacker: Player,
    defender: NPC,
    attackerPosition: Position,
    defenderPosition: Position
  ): CombatResult {
    // Check if attacker and defender are adjacent
    if (!this.areAdjacent(attackerPosition, defenderPosition)) {
      return {
        success: false,
        message: 'Target is not adjacent. Move closer to attack.',
      };
    }

    // Check if defender is alive
    if (!defender.isAlive) {
      return {
        success: false,
        message: 'Target is already defeated.',
      };
    }

    // Calculate damage
    const damage = this.calculateDamage(attacker.stats, defender.stats);
    
    // Apply damage
    defender.stats.hp = Math.max(0, defender.stats.hp - damage);
    
    // Check if defender is defeated
    const isDefeated = defender.stats.hp <= 0;
    if (isDefeated) {
      defender.isAlive = false;
    }

    // Calculate experience gain
    const experienceGained = this.calculateExperienceGain(defender, isDefeated);
    attacker.experience += experienceGained;

    // Check for level up
    const levelUpResult = this.checkLevelUp(attacker);

    // Generate loot if enemy was defeated
    const lootDropped = isDefeated ? this.generateLoot(defender) : undefined;

    return {
      success: true,
      message: isDefeated 
        ? `Defeated ${defender.name} for ${experienceGained} experience!`
        : `Attacked ${defender.name} for ${damage} damage. ${defender.stats.hp}/${defender.stats.maxHp} HP remaining.`,
      damage,
      experienceGained,
      levelUp: levelUpResult.levelUp,
      lootDropped
    };
  }

  /**
   * Calculate damage dealt in combat
   */
  private calculateDamage(attackerStats: Stats, defenderStats: Stats): number {
    const baseDamage = attackerStats.attack;
    const defense = defenderStats.defense;
    
    // Apply defense reduction
    let damage = Math.max(COMBAT_CONSTANTS.MIN_DAMAGE, baseDamage - defense);
    
    // Apply base damage multiplier
    damage *= COMBAT_CONSTANTS.BASE_DAMAGE_MULTIPLIER;
    
    // Random variance (±20%)
    const variance = 0.8 + Math.random() * 0.4;
    damage *= variance;
    
    // Check for critical hit
    if (Math.random() < COMBAT_CONSTANTS.CRITICAL_HIT_CHANCE) {
      damage *= COMBAT_CONSTANTS.CRITICAL_DAMAGE_MULTIPLIER;
    }
    
    // Cap damage
    damage = Math.min(damage, COMBAT_CONSTANTS.MAX_DAMAGE);
    
    return Math.floor(damage);
  }

  /**
   * Calculate experience gained from combat
   */
  private calculateExperienceGain(enemy: NPC, wasDefeated: boolean): number {
    const baseExp = enemy.stats.maxHp + enemy.stats.attack + enemy.stats.defense;
    const multiplier = wasDefeated ? 1.0 : 0.1; // Full XP for defeat, small amount for damage
    return Math.floor(baseExp * multiplier);
  }

  /**
   * Check if player should level up and apply level benefits
   */
  private checkLevelUp(player: Player): { levelUp: boolean; newLevel?: number } {
    const requiredExp = COMBAT_CONSTANTS.EXPERIENCE_PER_LEVEL * Math.pow(COMBAT_CONSTANTS.LEVEL_SCALING_FACTOR, player.level - 1);
    
    if (player.experience >= requiredExp) {
      const oldLevel = player.level;
      player.level++;
      player.experience -= requiredExp;
      
      // Apply level up benefits
      this.applyLevelUpBenefits(player);
      
      return { levelUp: true, newLevel: player.level };
    }
    
    return { levelUp: false };
  }

  /**
   * Apply stat increases when player levels up
   */
  private applyLevelUpBenefits(player: Player): void {
    const statIncrease = Math.floor(2 + player.level * 0.5);
    
    player.stats.attack += statIncrease;
    player.stats.defense += statIncrease;
    player.stats.maxHp += statIncrease * 5;
    player.stats.hp = Math.min(player.stats.hp + statIncrease * 5, player.stats.maxHp);
    player.stats.speed += Math.floor(statIncrease * 0.5);
  }

  /**
   * Generate loot drops from defeated enemies
   */
  private generateLoot(defeated: NPC): Item[] {
    const loot: Item[] = [];
    
    // Base drop chance
    if (Math.random() < 0.15) { // 15% drop chance
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
        isHidden: true,
        revealDuration: GAME_CONFIG.itemRevealTimes[rarity as ItemRarity],
        revealProgress: 0.0,
        canBeLooted: false
      };
      
      loot.push(item);
    }
    
    return loot;
  }

  /**
   * Generate a random item name
   */
  private generateItemName(type: string, rarity: string): string {
    const prefixes: Record<string, string[]> = {
      common: ['Basic', 'Simple', 'Plain'],
      uncommon: ['Good', 'Quality', 'Enhanced'],
      rare: ['Superior', 'Excellent', 'Masterwork']
    };
    
    const typeNames: Record<string, string[]> = {
      weapon: ['Sword', 'Dagger', 'Axe', 'Staff', 'Bow'],
      armor: ['Shield', 'Helmet', 'Armor', 'Boots', 'Gloves'],
      consumable: ['Potion', 'Elixir', 'Scroll', 'Herb']
    };
    
    const prefix = prefixes[rarity]?.[Math.floor(Math.random() * prefixes[rarity].length)] || 'Basic';
    const typeName = typeNames[type]?.[Math.floor(Math.random() * typeNames[type].length)] || 'Item';
    
    return `${prefix} ${typeName}`;
  }

  /**
   * Generate item stats based on type and rarity
   */
  private generateItemStats(type: string, rarity: string): any {
    const rarityMultipliers: Record<string, number> = {
      common: 1,
      uncommon: 1.5,
      rare: 2.5
    };
    
    const multiplier = rarityMultipliers[rarity] ?? 1;
    
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

  /**
   * Check if two positions are adjacent (including diagonals)
   */
  private areAdjacent(pos1: Position, pos2: Position): boolean {
    const dx = Math.abs(pos1.x - pos2.x);
    const dy = Math.abs(pos1.y - pos2.y);
    return dx <= 1 && dy <= 1 && (dx + dy > 0);
  }

  /**
   * Get the enemy NPC at a specific position
   */
  public getEnemyAtPosition(npcs: NPC[], position: Position): NPC | null {
    return npcs.find(npc => 
      npc.isAlive && 
      npc.position.x === position.x && 
      npc.position.y === position.y
    ) || null;
  }
}