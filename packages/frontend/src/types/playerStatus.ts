import { Player, Buff } from '@shared/types/game';

export interface PlayerStats {
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  stamina: number;
  maxStamina: number;
  experience: number;
  level: number;
  hunger: number;
  thirst: number;
}

export interface PlayerEffect {
  type: Buff;
  duration: number;
  strength: number;
  description?: string;
}

export interface EnhancedPlayerStatusProps {
  player: Player;
}

export interface PlayerStatusComponentProps {
  stats: PlayerStats;
  effects: PlayerEffect[];
  player: Player;
}

export interface HealthBarProps {
  currentHealth: number;
  maxHealth: number;
}

export interface ExperienceBarProps {
  currentExperience: number;
  level: number;
}