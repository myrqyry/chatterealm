import React from 'react';
import { CharacterClass } from 'shared';

export const ClassCard: React.FC<{
  characterClass: CharacterClass;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ characterClass, isSelected, onSelect }) => {
  return (
    <div
      className={`class-card p-4 rounded-lg border-2 cursor-pointer transition-all ${
        isSelected
          ? 'border-green-500 bg-green-900/20'
          : 'border-gray-600 bg-gray-800 hover:border-gray-500'
      }`}
      onClick={onSelect}
    >
      <div
        className="class-icon w-12 h-12 rounded-full mb-3 mx-auto"
        style={{
          background: `linear-gradient(135deg, ${characterClass.primaryColor}, ${characterClass.secondaryColor})`
        }}
      />
      <h4 className="text-sm font-semibold text-center mb-2">{characterClass.name}</h4>
      <p className="text-xs text-gray-400 text-center">{characterClass.description}</p>
    </div>
  );
};