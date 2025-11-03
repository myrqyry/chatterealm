import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PlayerProfile } from 'shared';
import { useGameStore } from '../../../stores/gameStore';
import PlayerProfileComponent from './PlayerProfile';

const PlayerProfileWrapper: React.FC = () => {
  const { playerId } = useParams<{ playerId: string }>();
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const { socket } = useGameStore();

  useEffect(() => {
    if (socket && playerId) {
      socket.emit('get_player_profile', playerId);
      socket.on('player_profile', (data: PlayerProfile) => {
        setProfile(data);
      });
    }

    return () => {
      if (socket) {
        socket.off('player_profile');
      }
    };
  }, [socket, playerId]);

  if (!profile) {
    return <div>Loading...</div>;
  }

  return <PlayerProfileComponent profile={profile} />;
};

export default PlayerProfileWrapper;
