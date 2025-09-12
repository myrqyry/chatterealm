import React from 'react';
import { Player } from 'shared';
import EnhancedPlayerStatus from '../EnhancedPlayerStatus';

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
    <div style={{
      padding: '16px 20px',
      borderTop: '1px solid rgba(196, 167, 231, 0.2)',
      background: 'rgba(25, 23, 36, 0.8)'
    }}>
      <EnhancedPlayerStatus player={currentPlayer} />
    </div>
  );
};

export default PlayerStatusPanel;