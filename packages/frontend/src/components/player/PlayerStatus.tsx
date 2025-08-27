import React from 'react';
import { PlayerStatusComponentProps } from '../../types/playerStatus';
import { HealthBar } from './HealthBar';
import { ExperienceBar } from './ExperienceBar';
import { StatusEffects } from './StatusEffects';
import { StatusDetails } from './StatusDetails';

export const PlayerStatus: React.FC<PlayerStatusComponentProps> = ({ stats, effects, player }) => {
  return (
    <div className="player-status">
      <h3>{player.name}</h3>
      <HealthBar currentHealth={stats.health} maxHealth={stats.maxHealth} />
      <ExperienceBar currentExperience={stats.experience} level={stats.level} />
      <StatusEffects effects={effects} />
      <StatusDetails stats={stats} />
    </div>
  );
};