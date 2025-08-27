import { PlayerStats } from '../../types/playerStatus';

export const calculateHealth = (stats: PlayerStats): number => {
  return stats.health;
};