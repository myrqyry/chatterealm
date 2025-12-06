import { notificationQueue } from './NotificationQueue';
import { GameWorld, Player, Item, PlayerData } from '@chatterealm/shared';

export class GameNotificationService {
  private lastKnownState: Map<string, any> = new Map();

  processGameStateUpdate(gameWorld: GameWorld, localPlayer: PlayerData | null): void {
    if (!gameWorld || !localPlayer) return;

    // Check for player deaths
    gameWorld.players.forEach(player => {
      const wasAlive = this.lastKnownState.get(`player-${player.id}-alive`) ?? true;
      if (wasAlive && !player.isAlive) {
        this.notifyPlayerDeath(player);
      }
      this.lastKnownState.set(`player-${player.id}-alive`, player.isAlive);

      // Check for level ups for the local player
      if (player.id === localPlayer.id) {
        const lastLevel = this.lastKnownState.get(`player-${player.id}-level`) ?? player.level;
        if (player.level > lastLevel) {
          this.notifyLevelUp(player, lastLevel, player.level);
        }
        this.lastKnownState.set(`player-${player.id}-level`, player.level);
      }
    });

    // Check for rare item spawns
    gameWorld.items.forEach(item => {
      const wasKnown = this.lastKnownState.get(`item-${item.id}`);
      if (!wasKnown && item.itemType && (item.itemType.rarity === 'Legendary' || item.itemType.rarity === 'Epic')) {
        this.notifyRareItem(item, item.itemType.rarity);
      }
      this.lastKnownState.set(`item-${item.id}`, true);
    });
  }

  private notifyPlayerDeath(player: Player): void {
    notificationQueue.addNotification({
      title: 'Player Fallen',
      message: `${player.name} has been defeated!`,
      type: 'warning',
      icon: '💀',
      duration: 4000
    });
  }

  private notifyLevelUp(player: Player, oldLevel: number, newLevel: number): void {
    notificationQueue.addNotification({
      title: 'Level Up!',
      message: `You reached level ${newLevel}!`,
      type: 'success',
      icon: '⬆️',
      duration: 5000,
      actions: [
        {
          label: 'View Stats',
          action: () => {
            window.dispatchEvent(new CustomEvent('show-player-stats', { detail: player }));
          },
          style: 'primary'
        }
      ]
    });
  }

  private notifyRareItem(item: Item, rarity: string): void {
    notificationQueue.addNotification({
      title: 'Rare Item Appeared!',
      message: `A ${rarity} ${item.itemType?.name} has spawned!`,
      type: 'info',
      icon: '✨',
      duration: 6000
    });
  }
}
