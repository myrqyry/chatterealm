import { GameStateManager } from './gameStateManager';
import { TwitchService } from './twitchService';
import { Player, Position, WanderSettings, DangerLevel, DangerAssessment } from 'shared/src/types/game';

export class AutoWanderService {
  private wanderingPlayers: Map<string, WanderSettings> = new Map();
  private dangerZones: Map<string, DangerLevel> = new Map();

  private gameStateManager!: GameStateManager;

  constructor(private twitchService: TwitchService) {}

  public setGameStateManager(gameStateManager: GameStateManager): void {
    this.gameStateManager = gameStateManager;
  }

  public update(): void {
    if (!this.gameStateManager) return;
    this.processAutoWander();
  }

  public startAutoWander(playerId: string, settings: WanderSettings): void {
    this.wanderingPlayers.set(playerId, settings);
    this.twitchService.sendStreamMessage(`🚶‍♂️ ${this.getPlayerDisplayName(playerId)} begins to wander the wasteland...`);
  }

  public stopAutoWander(playerId: string): void {
    if (this.wanderingPlayers.has(playerId)) {
      this.wanderingPlayers.delete(playerId);
      this.twitchService.sendStreamMessage(`🛑 ${this.getPlayerDisplayName(playerId)} has stopped wandering.`);
    }
  }

  private processAutoWander(): void {
    for (const [playerId, settings] of this.wanderingPlayers.entries()) {
      const player = this.gameStateManager.getGameWorld().players.find(p => p.id === playerId);
      if (!player || !player.isAlive) {
        this.stopAutoWander(playerId);
        continue;
      }

      const nextPosition = this.calculateSafeMove(player, settings);
      if (!nextPosition) continue;

      const danger = this.assessDanger(nextPosition, player.level);

      if (danger.level > settings.maxRiskLevel) {
        this.sendRiskWarning(player, danger);

        if (settings.stopOnDanger) {
          this.stopAutoWander(playerId);
          continue;
        }
      }

      const moveResult = this.gameStateManager.movePlayer(playerId, nextPosition);
      if (moveResult.success) {
        this.narrateAutoWanderMove(player, nextPosition, danger);
      }
    }
  }

  private calculateSafeMove(player: Player, settings: WanderSettings): Position | null {
    const validMoves: Position[] = [];
    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            if (dx === 0 && dy === 0) continue;
            const newPos = { x: player.position.x + dx, y: player.position.y + dy };
            if (this.gameStateManager.isPositionValid(newPos)) {
                validMoves.push(newPos);
            }
        }
    }
    if (validMoves.length === 0) return null;
    return validMoves[Math.floor(Math.random() * validMoves.length)];
  }

  private assessDanger(position: Position, playerLevel: number): DangerAssessment {
    const nearbyEnemies = this.gameStateManager.getGameWorld().npcs.filter(npc =>
        Math.abs(npc.position.x - position.x) <= 3 &&
        Math.abs(npc.position.y - position.y) <= 3 &&
        npc.isAlive
    );

    let dangerLevel = 0;
    const threats: string[] = [];

    for (const enemy of nearbyEnemies) {
        dangerLevel += enemy.stats.attack + (enemy.stats.maxHp / 10);
        threats.push(enemy.type);
    }

    return { level: dangerLevel, threats };
  }

  private sendRiskWarning(player: Player, danger: DangerAssessment): void {
    this.twitchService.sendStreamMessage(
      `⚠️ ${player.displayName} is wandering into a dangerous area with threats: ${danger.threats.join(', ')}!`
    );
  }

  private narrateAutoWanderMove(player: Player, position: Position, danger: DangerAssessment): void {
    const terrain = this.gameStateManager.getTerrainAt(position);
    const terrainType = terrain ? terrain.type : 'unknown land';

    const narratives = [
      `${player.displayName} cautiously explores the ${terrainType}...`,
      `${player.displayName} wanders into ${danger.level > 50 ? 'dangerous' : 'relatively safe'} territory...`,
      `${player.displayName}'s auto-wander leads them toward potential ${danger.threats.length > 0 ? danger.threats.join(', ') : 'treasure'}...`
    ];

    const narrative = narratives[Math.floor(Math.random() * narratives.length)];
    this.twitchService.sendStreamMessage(narrative);
  }

  private getPlayerDisplayName(playerId: string): string {
    const player = this.gameStateManager.getGameWorld().players.find(p => p.id === playerId);
    return player ? player.displayName : 'A wanderer';
  }
}