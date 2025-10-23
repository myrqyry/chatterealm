import { NPC } from 'shared/dist/srcT/types/CoveNPC';
import { GameStateManager } from './gameStateManager';

export class NpcService {
  private gameStateManager: GameStateManager;
  private npcs: NPC[] = [
    {
      id: 'npc-1',
      name: 'Old Man',
      personality: 'wise and helpful',
      position: { x: 10, y: 5 },
    },
  ];

  constructor(gameStateManager: GameStateManager) {
    this.gameStateManager = gameStateManager;
  }

  getNpcs(): NPC[] {
    return this.npcs;
  }

  async generateDialogue(npc: NPC, playerMessage: string): Promise<string> {
    // In a real implementation, this would call a large language model.
    // For now, we'll use a simple placeholder.
    return `I am ${npc.name}, and I am ${npc.personality}. You said: "${playerMessage}"`;
  }
}
