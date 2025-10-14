import { LootService } from '../LootService';
import { GameStateManager } from '../gameStateManager';
import { Player, Item, ItemType, ItemRarity } from 'shared';
import { createMockPlayer } from '../../testUtils/mockGameWorld';

describe('LootService', () => {
  let lootService: LootService;
  let gameStateManager: GameStateManager;
  let players: Player[];
  let items: Item[];

  beforeEach(() => {
    gameStateManager = new GameStateManager();
    lootService = new LootService(gameStateManager);
    players = [];
    items = [];
  });

  describe('pickupItem', () => {
    it('should allow a player to pick up an item', () => {
      const player = createMockPlayer('1', 'testPlayer', { x: 0, y: 0 });
      players.push(player);
      const item: Item = {
        id: 'item1',
        name: 'Test Item',
        description: 'A test item',
        type: ItemType.WEAPON,
        rarity: ItemRarity.COMMON,
        position: { x: 0, y: 0 },
        canBeLooted: true,
        isHidden: false,
        revealProgress: 1,
        revealDuration: 0,
      };
      items.push(item);

      const result = lootService.pickupItem('1', 'item1', items, players);
      expect(result.success).toBe(true);
      expect(player.inventory).toContain(item);
      expect(items).not.toContain(item);
    });
  });
});