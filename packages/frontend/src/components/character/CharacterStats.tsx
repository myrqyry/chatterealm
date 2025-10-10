import React from 'react';
import { CharacterClass } from 'shared';

export const CharacterStats: React.FC<{ characterClass: CharacterClass }> = ({ characterClass }) => {
  return (
    <div className="character-stats mt-4 bg-gray-800 p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-3 text-center">{characterClass.name}</h3>
      <p className="text-sm text-gray-300 mb-4 italic">"{characterClass.lore}"</p>

      <div className="stats-grid grid grid-cols-2 gap-2 text-sm">
        {Object.entries(characterClass.baseStats).map(([stat, value]) => (
          <div key={stat} className="stat-row flex justify-between">
            <span className="capitalize text-gray-400">{stat}:</span>
            <span className="text-white font-semibold">{value}</span>
          </div>
        ))}
      </div>

      <div className="resource-info mt-4 pt-4 border-t border-gray-700">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Resource:</span>
          <span className="text-white capitalize">{characterClass.primaryResource.replace('_', ' ')}</span>
        </div>
      </div>

      <div className="abilities-preview mt-4">
        <h4 className="text-sm font-semibold mb-2 text-gray-300">Starting Abilities</h4>
        {characterClass.abilities.filter(ability => ability.unlockLevel <= 2).map(ability => (
          <div key={ability.id} className="ability-item mb-2 p-2 bg-gray-900 rounded">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">{ability.name}</span>
              <span className="text-xs text-gray-400">Lvl {ability.unlockLevel}</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">{ability.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};