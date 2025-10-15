import React from 'react';
import { Player } from 'shared';
import EnhancedPlayerStatus from '../player/EnhancedPlayerStatus';

interface PlayerStatusPanelProps {
  currentPlayer: Player | null;
}

const PlayerStatusPanel: React.FC<PlayerStatusPanelProps> = ({
  currentPlayer
}) => {
  if (!currentPlayer) {
    return null;
  }

  return (
    <div className="pt-4 pb-4 px-5 border-t bg-[var(--color-surface-variant)]/80 border-[var(--color-outline)]">
      <EnhancedPlayerStatus player={currentPlayer} />
    </div>
  );
};

export default PlayerStatusPanel;