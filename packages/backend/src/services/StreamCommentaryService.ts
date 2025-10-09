import { TwitchService } from './twitchService';
import { Player, NPC } from 'shared/src/types/game';
import { CombatResult } from './CombatSystem';

interface CombatEvent {
    timestamp: number;
    attacker: string;
    result: CombatResult;
}

export class StreamCommentaryService {
  private recentCombats: CombatEvent[] = [];
  private commentaryTemplates: Map<string, string[]> = new Map();

  constructor(private twitchService: TwitchService) {
    this.initializeCommentaryTemplates();
  }

  public announceCombat(attacker: Player, defender: NPC, result: CombatResult): void {
    const commentary = this.generateCombatCommentary(attacker, defender, result);

    // Send to Twitch chat with appropriate drama
    if (result.damage && result.damage > defender.stats.maxHp * 0.5) {
      this.twitchService.sendStreamMessage(`💥 MASSIVE HIT! ${commentary}`);
    } else if (!result.success) {
      this.twitchService.sendStreamMessage(`😅 ${commentary}`);
    } else {
      this.twitchService.sendStreamMessage(`⚔️ ${commentary}`);
    }

    // Track for potential combo commentary
    this.recentCombats.push({
      timestamp: Date.now(),
      attacker: attacker.id,
      result
    });

    this.checkForComboCombat();
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

  private checkForComboCombat(): void {
    const recentWindow = Date.now() - 5000; // 5 second window
    const recent = this.recentCombats.filter(c => c.timestamp > recentWindow);

    if (recent.length >= 3) {
      const players = [...new Set(recent.map(c => c.attacker))];
      this.twitchService.sendStreamMessage(
        `🔥 COMBAT FRENZY! ${players.length} players engaged in rapid combat! ` +
        `The wasteland erupts in violence! 💀⚔️💀`
      );
    }
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