import { CombatService } from '../CombatService';
import { Player, NPC } from 'shared';
import { createMockPlayer, createMockNpc } from '../../testUtils/mockGameWorld';

describe('CombatService', () => {
  let combatService: CombatService;

  beforeEach(() => {
    combatService = new CombatService();
  });

  describe('processAttack', () => {
    it('should return success false if target is not adjacent', () => {
      const attacker = createMockPlayer('1', 'attacker', { x: 0, y: 0 });
      const defender = createMockNpc('2', 'defender', { x: 2, y: 2 });
      const result = combatService.processAttack(attacker, defender, attacker.position, defender.position);
      expect(result.success).toBe(false);
    });

    it('should return success false if target is already defeated', () => {
      const attacker = createMockPlayer('1', 'attacker', { x: 0, y: 0 });
      const defender = createMockNpc('2', 'defender', { x: 1, y: 1 });
      defender.isAlive = false;
      const result = combatService.processAttack(attacker, defender, attacker.position, defender.position);
      expect(result.success).toBe(false);
    });

    it('should calculate damage and apply it to the defender', () => {
      const attacker = createMockPlayer('1', 'attacker', { x: 0, y: 0 });
      const defender = createMockNpc('2', 'defender', { x: 1, y: 1 });
      const initialHp = defender.stats.hp;
      const result = combatService.processAttack(attacker, defender, attacker.position, defender.position);
      expect(result.success).toBe(true);
      expect(defender.stats.hp).toBeLessThan(initialHp);
    });
  });
});