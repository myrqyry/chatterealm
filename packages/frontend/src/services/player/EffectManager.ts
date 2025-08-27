import { PlayerEffect, PlayerStats } from '../../types/playerStatus';

export const getActiveEffects = (player: any): PlayerEffect[] => {
  // Mock active effects, replace with actual game logic
  return player.buffs?.map((buff: any) => ({
    type: buff.type,
    duration: buff.duration,
    strength: buff.strength,
  })) || [];
};