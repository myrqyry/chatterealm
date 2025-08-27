import React from 'react';
import { PlayerEffect } from '../../types/playerStatus';
import { getEffectDescription } from '../../utils/player/EffectUtils'; // Adjusted import path

export interface StatusEffectsProps {
  effects: PlayerEffect[];
}

export const StatusEffects: React.FC<StatusEffectsProps> = ({ effects }) => {
  return (
    <div className="status-effects">
      <h4>Effects:</h4>
      {effects.length === 0 ? (
        <p>No active effects.</p>
      ) : (
        <ul>
          {effects.map((effect, index) => (
            <li key={index}>
              {getEffectDescription(effect)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};