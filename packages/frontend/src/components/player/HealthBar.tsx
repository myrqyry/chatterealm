import React from 'react';
import { HealthBarProps } from '../../types/playerStatus';
import { calculateHealthStatus } from '../../utils/player/StatusUtils'; // Adjusted import path

export const HealthBar: React.FC<HealthBarProps> = ({ currentHealth, maxHealth }) => {
  const healthPercentage = (currentHealth / maxHealth) * 100;
  const healthStatus = calculateHealthStatus(healthPercentage); // Uses the new utility function

  return (
    <div className="health-bar">
      <div
        className={`health-fill health-status-${healthStatus}`}
        style={{ width: `${healthPercentage}%` }}
      ></div>
      <span className="health-text">{currentHealth}/{maxHealth}</span>
    </div>
  );
};