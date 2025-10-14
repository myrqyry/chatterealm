import { GameWorld, GAME_CONFIG } from 'shared';
import { GameWorldManager } from './GameWorldManager';
import { NPCManager } from './NPCManager';

export class GameStateManager {
  private gameWorld: GameWorld;
  private gameWorldManager: GameWorldManager;
  private npcManager: NPCManager;

  constructor(options?: { generateNPCs?: boolean; worldType?: 'test' | 'default' }) {
    this.npcManager = new NPCManager(new Set());
    this.gameWorldManager = new GameWorldManager(this.npcManager);
    this.gameWorld = this.gameWorldManager.initializeGameWorld(options);
  }

  public update(): void {
    this.npcManager.updateNPCs(this.gameWorld.npcs, this.gameWorld.grid);
    this.gameWorldManager.updateWorldAge(this.gameWorld);
    this.npcManager.cleanupDeadNPCs(this.gameWorld.npcs);
  }

  public getGameWorld(): GameWorld {
    return this.gameWorld;
  }

  public getBuildingAt(position: any): any {
    return this.gameWorld.buildings.find(
      b => b.position.x === position.x && b.position.y === position.y
    );
  }

  public getTerrainAt(position: any): any {
    if (
      position.x < 0 ||
      position.x >= GAME_CONFIG.gridWidth ||
      position.y < 0 ||
      position.y >= GAME_CONFIG.gridHeight
    ) {
      return undefined;
    }
    return this.gameWorld.grid[position.y][position.x];
  }

  public isInCataclysm(position: any): boolean {
    if (!this.gameWorld.cataclysmCircle.isActive) return false;
    const center = this.gameWorld.cataclysmCircle.center;
    const distance = Math.sqrt(
      Math.pow(position.x - center.x, 2) + Math.pow(position.y - center.y, 2)
    );
    return distance >= this.gameWorld.cataclysmCircle.radius;
  }
}