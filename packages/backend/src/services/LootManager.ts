import { Item, ItemType, ItemRarity, Position, TerrainType, Player, NPC, GAME_CONFIG } from 'shared';

export interface ItemResult {
  success: boolean;
  message: string;
  item?: Item;
}

export class LootManager {
  /**
   * Generate terrain-based loot with enhanced properties
   */
  public generateTerrainBasedLoot(position: Position, terrainType: TerrainType, isCataclysmLoot: boolean = false): Item | null {
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

  /**
   * Generate enhanced item name with terrain context
   */
  private generateEnhancedItemName(type: ItemType, rarity: ItemRarity, terrainType: TerrainType): string {
    const terrainModifiers: Record<TerrainType, string[]> = {
      [TerrainType.ANCIENT_RUINS]: ['Ancient', 'Ruined', 'Lost', 'Forgotten'],
      [TerrainType.FOREST]: ['Wooden', 'Natural', 'Forest', 'Wild'],
      [TerrainType.MOUNTAIN]: ['Stone', 'Mountain', 'Rocky', 'Dwarven'],
      [TerrainType.SWAMP]: ['Murky', 'Bog', 'Swamp', 'Poisonous'],
      [TerrainType.ICE]: ['Frozen', 'Ice', 'Crystal', 'Arctic'],
      [TerrainType.SNOW]: ['Snow-touched', 'Frigid', 'Winter', 'Frost'],
      [TerrainType.SAND]: ['Desert', 'Sand-worn', 'Nomad', 'Sun-bleached'],
      [TerrainType.DEEP_WATER]: ['Sunken', 'Waterlogged', 'Coral', 'Deep'],
      [TerrainType.RIVER]: ['River-blessed', 'Flowing', 'Current-touched', 'Stream']
    } as Record<TerrainType, string[]>;

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

  /**
   * Generate terrain-specific item descriptions
   */
  private generateTerrainItemDescription(type: ItemType, rarity: ItemRarity, terrainType: TerrainType): string {
    const terrainContext: Record<TerrainType, string> = {
      [TerrainType.ANCIENT_RUINS]: 'discovered among ancient ruins',
      [TerrainType.FOREST]: 'found deep in the forest',
      [TerrainType.MOUNTAIN]: 'carved from mountain stone',
      [TerrainType.SWAMP]: 'recovered from murky swamplands',
      [TerrainType.ICE]: 'preserved in eternal ice',
      [TerrainType.SAND]: 'buried in desert sands'
    } as Record<TerrainType, string>;

    const context = terrainContext[terrainType] || 'found in the wilderness';
    return `A ${rarity} ${type} ${context}.`;
  }

  /**
   * Generate enhanced item stats with terrain and cataclysm bonuses
   */
  private generateEnhancedItemStats(type: ItemType, rarity: ItemRarity, terrainType: TerrainType, isCataclysmLoot: boolean): any {
    const rarityMultipliers: Record<ItemRarity, number> = {
      [ItemRarity.COMMON]: 1,
      [ItemRarity.UNCOMMON]: 1.5,
      [ItemRarity.RARE]: 2.5,
      [ItemRarity.EPIC]: 4,
      [ItemRarity.LEGENDARY]: 6
    };

    let multiplier = rarityMultipliers[rarity];
    
    // Terrain bonuses
    const terrainBonuses: Record<TerrainType, number> = {
      [TerrainType.ANCIENT_RUINS]: 1.3,
      [TerrainType.MOUNTAIN]: 1.1,
      [TerrainType.MOUNTAIN_PEAK]: 1.2
    } as Record<TerrainType, number>;

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

  /**
   * Select item rarity based on weighted chances
   */
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

  /**
   * Generate basic loot from defeated NPCs
   */
  public generateLoot(defeated: NPC): Item[] {
    const loot: Item[] = [];
    
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
   * Generate basic item name
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
   * Generate basic item stats
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
   * Process item pickup
   */
  public pickupItem(playerId: string, itemId: string, items: Item[], players: Player[]): ItemResult {
    const player = players.find(p => p.id === playerId);
    if (!player) {
      return { success: false, message: 'Player not found.' };
    }

    if (!player.isAlive) {
      return { success: false, message: 'Cannot pick up items while defeated.' };
    }

    const itemIndex = items.findIndex(item => item.id === itemId);
    if (itemIndex === -1) {
      return { success: false, message: 'Item not found.' };
    }

    const item = items[itemIndex];
    
    // Check if item is within pickup range
    if (!item.position || !this.isWithinPickupRange(player.position, item.position)) {
      return { success: false, message: 'Item is too far away.' };
    }

    // Check if item can be looted
    if (!item.canBeLooted) {
      return { success: false, message: 'Item is not ready to be picked up yet.' };
    }

    // Add to player inventory
    player.inventory.push(item);
    item.ownerId = player.id;
    item.position = undefined;
    
    // Remove from world items
    items.splice(itemIndex, 1);

    return {
      success: true,
      message: `Picked up ${item.name}!`,
      item
    };
  }

  /**
   * Process item inspection
   */
  public inspectItem(playerId: string, itemId: string, items: Item[], players: Player[]): ItemResult {
    const player = players.find(p => p.id === playerId);
    if (!player) {
      return { success: false, message: 'Player not found.' };
    }

    const item = items.find(item => item.id === itemId);
    if (!item) {
      return { success: false, message: 'Item not found.' };
    }

    // Check if item is within inspection range
    if (!item.position || !this.isWithinPickupRange(player.position, item.position)) {
      return { success: false, message: 'Item is too far away to inspect.' };
    }

    // Reveal the item if it's hidden
    if (item.isHidden) {
      item.isHidden = false;
      item.revealProgress = 0.0;
    }

    return {
      success: true,
      message: `Inspecting ${item.name}: ${item.description}`,
      item
    };
  }

  /**
   * Process Tarkov-style item looting
   */
  public lootItem(playerId: string, itemId: string, items: Item[], players: Player[]): ItemResult {
    const player = players.find(p => p.id === playerId);
    if (!player) {
      return { success: false, message: 'Player not found.' };
    }

    if (!player.isAlive) {
      return { success: false, message: 'Cannot loot items while defeated.' };
    }

    const itemIndex = items.findIndex(item => item.id === itemId);
    if (itemIndex === -1) {
      return { success: false, message: 'Item not found.' };
    }

    const item = items[itemIndex];
    
    // Check if item is within loot range
    if (!item.position || !this.isWithinPickupRange(player.position, item.position)) {
      return { success: false, message: 'Item is too far away.' };
    }

    // Check if item is ready to be looted
    if (item.revealProgress < 1.0) {
      return { success: false, message: 'Item is still being revealed. Wait for the process to complete.' };
    }

    if (!item.canBeLooted) {
      return { success: false, message: 'Item cannot be looted yet.' };
    }

    // Add to player inventory
    player.inventory.push(item);
    item.ownerId = player.id;
    item.position = undefined;
    
    // Remove from world items
    items.splice(itemIndex, 1);

    return {
      success: true,
      message: `Successfully looted ${item.name}!`,
      item
    };
  }

  /**
   * Update item reveal progress for Tarkov-style looting
   */
  public updateItemReveals(items: Item[]): void {
    const now = Date.now();
    
    items.forEach(item => {
      if (item.isHidden && item.revealProgress < 1.0) {
        const elapsedTime = now - (item.revealStartTime || now);
        item.revealProgress = Math.min(1.0, elapsedTime / item.revealDuration);
        
        if (item.revealProgress >= 1.0) {
          item.canBeLooted = true;
        }
      }
    });
  }

  /**
   * Check if position is within pickup/loot range
   */
  private isWithinPickupRange(playerPos: Position, itemPos: Position): boolean {
    const distance = Math.max(Math.abs(playerPos.x - itemPos.x), Math.abs(playerPos.y - itemPos.y));
    return distance <= GAME_CONFIG.lootInteractionRadius;
  }

  /**
   * Use/consume an item from player inventory
   */
  public useItem(playerId: string, itemId: string, players: Player[]): ItemResult {
    const player = players.find(p => p.id === playerId);
    if (!player) {
      return { success: false, message: 'Player not found.' };
    }

    if (!player.isAlive) {
      return { success: false, message: 'Cannot use items while defeated.' };
    }

    const itemIndex = player.inventory.findIndex(item => item.id === itemId);
    if (itemIndex === -1) {
      return { success: false, message: 'Item not found in inventory.' };
    }

    const item = player.inventory[itemIndex];
    
    // Only consumable items can be used
    if (item.type !== ItemType.CONSUMABLE) {
      return { success: false, message: 'This item cannot be consumed.' };
    }

    // Apply item effects
    if (item.stats?.hp) {
      const healAmount = item.stats.hp;
      const oldHp = player.stats.hp;
      player.stats.hp = Math.min(player.stats.maxHp, player.stats.hp + healAmount);
      const actualHeal = player.stats.hp - oldHp;
      
      // Remove item from inventory
      player.inventory.splice(itemIndex, 1);
      
      return {
        success: true,
        message: `Used ${item.name} and restored ${actualHeal} HP.`,
        item
      };
    }

    return { success: false, message: 'Item has no usable effects.' };
  }
}