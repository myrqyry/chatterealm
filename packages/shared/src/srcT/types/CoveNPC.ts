export interface NPC {
  id: string;
  name: string;
  personality?: string;
  position: {
    x: number;
    y: number;
  };
}
