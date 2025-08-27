import React from 'react';
import { ExperienceBarProps } from '../../types/playerStatus';

export const ExperienceBar: React.FC<ExperienceBarProps> = ({ currentExperience, level }) => {
  // This is simplified. In a real game, maxExperience for a level would be needed.
  const experiencePercentage = (currentExperience / 100) * 100;

  return (
    <div className="experience-bar">
      <div
        className="experience-fill"
        style={{ width: `${experiencePercentage}%` }}
      ></div>
      <span className="experience-text">LVL {level} - EXP {currentExperience}/100</span>
    </div>
  );
};