import React from 'react';
import { HealthBarProps } from '../../types/playerStatus';
import { calculateHealthStatus } from '../../utils/player/StatusUtils'; // Adjusted import path

export const HealthBar: React.FC<HealthBarProps> = ({ currentHealth, maxHealth }) => {
  const healthPercentage = (currentHealth / maxHealth) * 100;
  const healthStatus = calculateHealthStatus(healthPercentage); // Uses the new utility function

  return (
    <div className="relative w-full h-4 rounded-md bg-[var(--color-surface-variant)] overflow-hidden">
      <div
        className={`absolute left-0 top-0 h-full rounded-md health-status-${healthStatus} bg-[var(--color-health)]`}
        style={{ width: `${healthPercentage}%` }}
      />
      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xs text-[var(--color-text-primary)]">{currentHealth}/{maxHealth}</span>
    </div>
  );
};