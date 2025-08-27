import React from 'react';
import { PlayerStats } from '../../types/playerStatus';

export interface StatusDetailsProps {
  stats: PlayerStats;
}

export const StatusDetails: React.FC<StatusDetailsProps> = ({ stats }) => {
  return (
    <div className="status-details">
      <p>Mana: {stats.mana}/{stats.maxMana}</p>
      <p>Stamina: {stats.stamina}/{stats.maxStamina}</p>
      <p>Hunger: {stats.hunger}</p>
      <p>Thirst: {stats.thirst}</p>
    </div>
  );
};