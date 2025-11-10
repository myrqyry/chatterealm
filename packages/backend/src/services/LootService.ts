import { Server } from 'socket.io';
import { GameStateManager } from './gameStateManager';
import { LootManager } from './LootManager';
import { TwitchService } from './twitchService';
import { Player, Item, Position, LootingSession, LootResult } from 'shared/src/types/game';
import { CataclysmService } from './CataclysmService';

export class LootService extends LootManager {
  private lootingPlayers: Map<string, LootingSession> = new Map();
  private cataclysmService: CataclysmService | null;

  constructor(cataclysmService?: CataclysmService) {
    super();
    this.cataclysmService = cataclysmService || null;
  }

  public startLooting(playerId: string, buildingId: string, gameWorld: any): LootResult {
    const player = gameWorld.players.find((p: any) => p.id === playerId);
    if (!player) return { success: false, message: 'Player not found!' };

    const building = gameWorld.buildings.find((b: any) => b.position.x === player.position.x && b.position.y === player.position.y);
    if (!building || building.id !== buildingId) return { success: false, message: 'No building to loot here!' };

    // This is a simplification. In a real scenario, building would have a loot table.
    // For now, let's assume a building has a certain number of lootable items.
    const lootableItems = 5;
    const lootingTime = this.calculateLootingTime(building);

    const session: LootingSession = {
      playerId,
      buildingId,
      startTime: Date.now(),
      duration: lootingTime,
      revealedItems: [],
      totalItems: lootableItems,
      canceled: false
    };

    this.lootingPlayers.set(playerId, session);

    return { success: true, message: `Started looting ${building.type}` };
  }

  public update(gameWorld: any): void {
    const now = Date.now();
    for (const session of this.lootingPlayers.values()) {
      if (session.canceled) {
        this.lootingPlayers.delete(session.playerId);
        continue;
      }

      if (this.checkForInterruptions(session, gameWorld)) {
        this.interruptLooting(session, gameWorld);
        continue;
      }

      const elapsedTime = now - session.startTime;
      if (elapsedTime >= session.duration) {
        this.completeLootingSession(session, gameWorld);
        continue;
      }

      const expectedReveals = Math.floor((elapsedTime / session.duration) * session.totalItems);
      const itemsToReveal = expectedReveals - session.revealedItems.length;

      if (itemsToReveal > 0) {
        for (let i = 0; i < itemsToReveal; i++) {
          const item = this.revealNextItem(session, gameWorld);
          if (item) {
            session.revealedItems.push(item);
            if (item.rarity === 'legendary' || item.rarity === 'epic') {
            }
          }
        }
      }
    }
  }

  private revealNextItem(session: LootingSession, gameWorld: any): Item | null {
    const player = gameWorld.players.find((p: any) => p.id === session.playerId);
    if (!player) return null;

    const building = gameWorld.buildings.find((b: any) => b.position.x === player.position.x && b.position.y === player.position.y);
    if (!building) return null;

    // For demonstration, we generate a new item. In a real implementation, you'd pull from the building's loot table.
    const terrain = gameWorld.grid[player.position.y][player.position.x];
    return this.generateTerrainBasedLoot(player.position, terrain?.type || ('plain' as any));
  }

  private checkForInterruptions(session: LootingSession, gameWorld: any): boolean {
    const player = gameWorld.players.find((p: any) => p.id === session.playerId);
    if (!player) return true;

    const nearbyEnemies = gameWorld.npcs.filter((npc: any) =>
        Math.abs(npc.position.x - player.position.x) <= 2 &&
        Math.abs(npc.position.y - player.position.y) <= 2 &&
        npc.isAlive
    );

    if (nearbyEnemies.length > 0) {
      const enemy = nearbyEnemies[0];
      return true;
    }

    if (this.cataclysmService && this.cataclysmService.isInCataclysmCircle(player.position, gameWorld)) {
          return true;
    }

    return false;
  }

  private interruptLooting(session: LootingSession, gameWorld: any): void {
    session.canceled = true;
    this.lootingPlayers.delete(session.playerId);
    // Items found so far might be kept or dropped, depending on game rules.
    // For now, let's assume they are dropped.
    const player = gameWorld.players.find((p: any) => p.id === session.playerId);
    if (player) {
    }
  }

  private completeLootingSession(session: LootingSession, gameWorld: any): void {
    this.lootingPlayers.delete(session.playerId);
    const player = gameWorld.players.find((p: any) => p.id === session.playerId);
    if (player && !session.canceled) {
      session.revealedItems.forEach(item => {
        if(item) player.inventory.push(item);
      });
    }
  }

  private calculateLootingTime(building: any): number {
    // Simplified calculation. Could be based on building size, type, etc.
    return (building.size.width * building.size.height) * 2000; // 2 seconds per tile
  }

  private getPlayerDisplayName(playerId: string, gameWorld: any): string {
    const player = gameWorld.players.find((p: any) => p.id === playerId);
    return player ? player.displayName : 'A looter';
  }

  public pickupItem(playerId: string, itemId: string, items: Item[], players: Player[]): any {
    const player = players.find(p => p.id === playerId);
    if (!player) return { success: false, message: 'Player not found' };

    const itemIndex = items.findIndex(i => i.id === itemId);
    if (itemIndex === -1) return { success: false, message: 'Item not found' };

    const item = items[itemIndex];
    if (!item.position || item.position.x !== player.position.x || item.position.y !== player.position.y) {
      return { success: false, message: 'Item is not at the same position as the player' };
    }

    items.splice(itemIndex, 1);
    player.inventory.push(item);

    return { success: true, message: `Picked up ${item.name}` };
  }

  public useItem(playerId: string, itemId: string, players: Player[]): any {
    const player = players.find(p => p.id === playerId);
    if (!player) return { success: false, message: 'Player not found' };

    const itemIndex = player.inventory.findIndex(i => i.id === itemId);
    if (itemIndex === -1) return { success: false, message: 'Item not found in inventory' };

    const item = player.inventory[itemIndex];
    // Add logic for using the item here
    player.inventory.splice(itemIndex, 1);

    return { success: true, message: `Used ${item.name}` };
  }

  public lootItem(playerId: string, itemId: string, items: Item[], players: Player[]): any {
    // For now, this is the same as pickupItem
    return this.pickupItem(playerId, itemId, items, players);
  }

  public inspectItem(playerId: string, itemId: string, items: Item[], players: Player[]): any {
    const item = items.find(i => i.id === itemId);
    if (!item) return { success: false, message: 'Item not found' };

    return { success: true, message: `You inspect the ${item.name}. ${item.description}` };
  }
}