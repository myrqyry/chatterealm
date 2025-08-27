import { useEffect, useState } from 'react';
import { Player } from '@shared/types/game';
import { calculatePlayerStats, applyEffectsToStats } from '../services/player/StatusCalculator';
import { getActiveEffects } from '../services/player/EffectManager';
import { PlayerStats, PlayerEffect } from '../types/playerStatus';

export const usePlayerStatus = (player: Player) => {
  const [stats, setStats] = useState<PlayerStats>(calculatePlayerStats(player));
  const [effects, setEffects] = useState<PlayerEffect[]>(getActiveEffects(player));

  useEffect(() => {
    let currentStats = calculatePlayerStats(player);
    const currentEffects = getActiveEffects(player);
    currentStats = applyEffectsToStats(currentStats, currentEffects);
    setStats(currentStats);
    setEffects(currentEffects);
  }, [player]);

  return { stats, effects };
};