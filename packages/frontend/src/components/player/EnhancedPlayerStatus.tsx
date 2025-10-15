import React from 'react';
import { PlayerStatus } from './PlayerStatus';
import { EnhancedPlayerStatusProps } from '../../types/playerStatus';
import { usePlayerStatus } from '../../hooks/usePlayerStatus'; // Import the custom hook

const EnhancedPlayerStatus: React.FC<EnhancedPlayerStatusProps> = ({ player }) => {
  const { stats, effects } = usePlayerStatus(player); // Use the custom hook

  return <PlayerStatus stats={stats} effects={effects} player={player} />;
};

export default EnhancedPlayerStatus;