import { useEffect, useState } from 'react';
import { Player } from 'shared';
import { calculatePlayerStats, applyEffectsToStats } from '../services/player/StatusCalculator';
import { getActiveEffects } from '../services/player/EffectManager';
import { PlayerStats, PlayerEffect } from '../types/playerStatus';

/**
 * Custom hook for calculating and managing player status information.
 *
 * This hook computes derived player statistics and active effects based on the
 * current player state. It automatically updates when the player data changes.
 *
 * @param player - The player object to calculate stats for
 * @returns Object containing calculated player stats and active effects
 *
 * @example
 * ```tsx
 * const { stats, effects } = usePlayerStatus(currentPlayer);
 *
 * console.log('Player health:', stats.health);
 * console.log('Active effects:', effects.length);
 * ```
 */
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