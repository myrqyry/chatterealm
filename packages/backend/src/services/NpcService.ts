import { NPC } from 'shared';

export class NpcService {
  private npcs: NPC[] = [
    {
      id: 'npc-1',
      name: 'Old Man',
      personality: 'wise and helpful',
      position: { x: 10, y: 5 },
      type: 'friendly',
      stats: {
        hp: 100,
        maxHp: 100,
        attack: 10,
        defense: 10,
        speed: 5,
      },
      behavior: 'passive',
      lootTable: [],
      isAlive: true,
      lastMoveTime: 0,
    },
  ];

  getNpcs(): NPC[] {
    return this.npcs;
  }

  async generateDialogue(npc: NPC, playerMessage: string): Promise<string> {
    // In a real implementation, this would call a large language model.
    // For now, we'll use a simple placeholder.
    return `I am ${npc.name}, and I am ${npc.personality}. You said: "${playerMessage}"`;
  }
}
