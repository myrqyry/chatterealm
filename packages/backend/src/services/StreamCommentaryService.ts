import { TwitchService } from './twitchService';
import { Player, NPC } from 'shared/src/types/game';
import { CombatResult } from './CombatService';

interface CombatEvent {
    timestamp: number;
    attacker: string;
    result: CombatResult;
}

export class StreamCommentaryService {
  private recentCombats: CombatEvent[] = [];
  private commentaryTemplates: Map<string, string[]> = new Map();

  constructor() {
    this.initializeCommentaryTemplates();
  }

  public announceCombat(attacker: Player, defender: NPC, result: CombatResult): void {
    const commentary = this.generateCombatCommentary(attacker, defender, result);

    // Track for potential combo commentary
    this.recentCombats.push({
      timestamp: Date.now(),
      attacker: attacker.id,
      result
    });

  }

  private generateCombatCommentary(attacker: Player, defender: NPC, result: CombatResult): string {
    const templates = this.commentaryTemplates.get('combat') || [];
    const template = templates[Math.floor(Math.random() * templates.length)];

    return template
      .replace('{attacker}', attacker.displayName)
      .replace('{defender}', defender.type)
      .replace('{damage}', result.damage?.toString() || '0')
      .replace('{weapon}', attacker.equipment.weapon?.name || 'bare hands');
  }

  private initializeCommentaryTemplates(): void {
    this.commentaryTemplates.set('combat', [
      '{attacker} strikes {defender} with {weapon} for {damage} damage!',
      '{attacker} delivers a devastating blow to {defender}!',
      '{defender} staggers under {attacker}\'s assault!',
      '{attacker}\'s {weapon} finds its mark on {defender}!',
      'Blood flies as {attacker} connects with {defender}!'
    ]);

    this.commentaryTemplates.set('death', [
      '{defender} falls before {attacker}\'s might!',
      'Another casualty in the wasteland... {defender} is no more!',
      '{attacker} emerges victorious over {defender}!',
      'The dust settles... {defender} will fight no more!'
    ]);
  }
}