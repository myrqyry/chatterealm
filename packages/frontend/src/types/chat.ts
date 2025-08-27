export interface ChatMessage {
  message: string;
  timestamp: number;
  isResponse: boolean;
  originalMessage?: string;
  username?: string;
  displayName?: string;
}

export interface Player {
  id: string;
  twitchUsername: string;
  displayName: string;
  avatar: string;
  position: { x: number; y: number };
  class: string;
  stats: { hp: number; maxHp: number; attack: number; defense: number; speed: number };
  level: number;
  experience: number;
  inventory: any[];
  equipment: any;
  achievements: string[];
  titles: string[];
  isAlive: boolean;
  lastMoveTime: number;
  spawnTime: number;
}