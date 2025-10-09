import React from 'react';
import { Player } from '../types';

interface PlayerStatusCardProps {
    player: Player | null;
}

const PlayerStatusCard: React.FC<PlayerStatusCardProps> = ({ player }) => {
    if (!player) {
        return <div>Loading player data...</div>;
    }

    return (
        <div>
            <h2>{player.displayName}</h2>
            <p>Level: {player.level}</p>
            <p>Health: {player.health} / {player.maxHealth}</p>
        </div>
    );
};

export default PlayerStatusCard;