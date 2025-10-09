export interface Player {
    id: string;
    displayName: string;
    level: number;
    health: number;
    maxHealth: number;
}

export interface NotificationSettings {
    deaths: boolean;
    levelUps: boolean;
    rareItems: boolean;
}

export interface WanderSettings {
    maxDistance: number;
    avoidHighLevelAreas: boolean;
    prioritizeLoot: string[];
}

export interface PanelState {
  player: Player | null;
  autoWander: boolean;
  preferredLootTypes: string[];
  combatStyle: 'aggressive' | 'defensive' | 'balanced';
  notifications: NotificationSettings;
}