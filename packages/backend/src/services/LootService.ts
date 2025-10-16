import { Server } from 'socket.io';
import { GameStateManager } from './gameStateManager';
import { LootManager } from './LootManager';
import { TwitchService } from './twitchService';
import { Player, Item, Position, LootingSession, LootResult } from 'shared/src/types/game';
import { CataclysmService } from './CataclysmService';

export class LootService extends LootManager {
  private lootingPlayers: Map<string, LootingSession> = new Map();
  private gameStateManager: GameStateManager;
  private cataclysmService: CataclysmService;

  constructor(gameStateManager: GameStateManager, cataclysmService: CataclysmService) {
    super();
    this.gameStateManager = gameStateManager;
    this.cataclysmService = cataclysmService;
  }

  public startLooting(playerId: string, buildingId: string): LootResult {
    const player = this.gameStateManager.getGameWorld().players.find(p => p.id === playerId);
    if (!player) return { success: false, message: 'Player not found!' };

    const building = this.gameStateManager.getBuildingAt(player.position);
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

  public update(): void {
    const now = Date.now();
    for (const session of this.lootingPlayers.values()) {
      if (session.canceled) {
        this.lootingPlayers.delete(session.playerId);
        continue;
      }

      if (this.checkForInterruptions(session)) {
        this.interruptLooting(session);
        continue;
      }

      const elapsedTime = now - session.startTime;
      if (elapsedTime >= session.duration) {
        this.completeLootingSession(session);
        continue;
      }

      const expectedReveals = Math.floor((elapsedTime / session.duration) * session.totalItems);
      const itemsToReveal = expectedReveals - session.revealedItems.length;

      if (itemsToReveal > 0) {
        for (let i = 0; i < itemsToReveal; i++) {
          const item = this.revealNextItem(session);
          if (item) {
            session.revealedItems.push(item);
            if (item.rarity === 'legendary' || item.rarity === 'epic') {
            }
          }
        }
      }
    }
  }

  private revealNextItem(session: LootingSession): Item | null {
    const player = this.gameStateManager.getGameWorld().players.find(p => p.id === session.playerId);
    if (!player) return null;

    const building = this.gameStateManager.getBuildingAt(player.position);
    if (!building) return null;

    // For demonstration, we generate a new item. In a real implementation, you'd pull from the building's loot table.
    const terrain = this.gameStateManager.getTerrainAt(player.position);
    return this.generateTerrainBasedLoot(player.position, terrain?.type || ('plain' as any));
  }

  private checkForInterruptions(session: LootingSession): boolean {
    const player = this.gameStateManager.getGameWorld().players.find(p => p.id === session.playerId);
    if (!player) return true;

    const nearbyEnemies = this.gameStateManager.getGameWorld().npcs.filter(npc =>
        Math.abs(npc.position.x - player.position.x) <= 2 &&
        Math.abs(npc.position.y - player.position.y) <= 2 &&
        npc.isAlive
    );

    if (nearbyEnemies.length > 0) {
      const enemy = nearbyEnemies[0];
      return true;
    }

    if (this.cataclysmService.isInCataclysmCircle(player.position, this.gameStateManager.getGameWorld())) {
          return true;
    }

    return false;
  }

  private interruptLooting(session: LootingSession): void {
    session.canceled = true;
    this.lootingPlayers.delete(session.playerId);
    // Items found so far might be kept or dropped, depending on game rules.
    // For now, let's assume they are dropped.
    const player = this.gameStateManager.getGameWorld().players.find(p => p.id === session.playerId);
    if (player) {
    }
  }

  private completeLootingSession(session: LootingSession): void {
    this.lootingPlayers.delete(session.playerId);
    const player = this.gameStateManager.getGameWorld().players.find(p => p.id === session.playerId);
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

  private getPlayerDisplayName(playerId: string): string {
    const player = this.gameStateManager.getGameWorld().players.find(p => p.id === playerId);
    return player ? player.displayName : 'A looter';
  }
}