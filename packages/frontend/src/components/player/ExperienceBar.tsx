import React from 'react';
import { ExperienceBarProps } from '../../types/playerStatus';

export const ExperienceBar: React.FC<ExperienceBarProps> = ({ currentExperience, level }) => {
  // This is simplified. In a real game, maxExperience for a level would be needed.
  const experiencePercentage = (currentExperience / 100) * 100;

  return (
    <div className="relative w-full h-3 rounded-md bg-[var(--color-surface-variant)] overflow-hidden">
      <div className="absolute left-0 top-0 h-full bg-[var(--color-accent)]" style={{ width: `${experiencePercentage}%` }} />
      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-[var(--color-text-secondary)]">LVL {level} - EXP {currentExperience}/100</span>
    </div>
  );
};