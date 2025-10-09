import { Server } from 'socket.io';
import { GameStateManager } from './gameStateManager';
import { LootManager } from './LootManager';
import { TwitchService } from './twitchService';
import { Player, Item, Position, LootingSession, LootResult } from 'shared/src/types/game';

export class TarkovLootService extends LootManager {
  private lootingPlayers: Map<string, LootingSession> = new Map();
  private gameStateManager!: GameStateManager;

  constructor(private io: Server, private twitchService: TwitchService) {
    super();
  }

  public setGameStateManager(gameStateManager: GameStateManager): void {
    this.gameStateManager = gameStateManager;
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

    this.twitchService.sendStreamMessage(
      `📦 ${player.displayName} begins searching a ${building.type}... ` +
      `This could take ${Math.ceil(lootingTime / 1000)}s. Hope nothing dangerous shows up! 😰`
    );

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
              this.twitchService.sendStreamMessage(
                `✨ ${this.getPlayerDisplayName(session.playerId)} found something special... ` +
                `${item.name} (${item.rarity})! 🎉`
              );
              this.io.emit('rare_item_found', {
                playerId: session.playerId,
                item: item,
                rarity: item.rarity
              });
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
      this.twitchService.sendStreamMessage(
        `⚠️ ${player.displayName}'s looting interrupted by a ${enemy.type}! ` +
        `Fight or flight? 🏃‍♂️⚔️`
      );
      return true;
    }

    if (this.gameStateManager.isInCataclysm(player.position)) {
        this.twitchService.sendStreamMessage(
            `🔥 The infection spreads toward ${player.displayName}! ` +
            `Looting interrupted by the approaching chaos! 💀`
          );
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
        this.twitchService.sendStreamMessage(`😱 ${player.displayName} was interrupted and dropped all found items!`);
    }
  }

  private completeLootingSession(session: LootingSession): void {
    this.lootingPlayers.delete(session.playerId);
    const player = this.gameStateManager.getGameWorld().players.find(p => p.id === session.playerId);
    if (player && !session.canceled) {
      session.revealedItems.forEach(item => {
        if(item) player.inventory.push(item);
      });
      this.twitchService.sendStreamMessage(`✅ ${player.displayName} finished looting and found ${session.revealedItems.length} items!`);
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