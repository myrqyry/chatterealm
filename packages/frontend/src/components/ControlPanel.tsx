import React from 'react';
import EnhancedPlayerStatus from './EnhancedPlayerStatus';
import GameControls from './controls/GameControls';
import WorldControls from './controls/WorldControls';
import AnimationControls from './controls/AnimationControls';
import { useGameStore } from '../stores/gameStore';
import { GameWorld, Player, AnimationSettings } from '../../../shared/src/types/game'; // Adjust path as necessary

interface ControlPanelProps {
  handleRegenerateWorld: () => void;
  handleMove: (direction: 'up' | 'down' | 'left' | 'right') => void;
  handleJoinGame: () => void;
  handleStartCataclysm: () => void;
  handlePickUpItem: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  handleRegenerateWorld,
  handleMove,
  handleJoinGame,
  handleStartCataclysm,
  handlePickUpItem,
}) => {
  const { currentPlayer, selectedTab, setSelectedTab, gameMessage, animationSettings, updateAnimationSettings, gameWorld } = useGameStore();

  return (
    <div className="player-hub">
      <div className="tabs">
        <button
          className={selectedTab === 'status' ? 'active' : ''}
          onClick={() => setSelectedTab('status')}
        >
          Status
        </button>
        <button
          className={selectedTab === 'actions' ? 'active' : ''}
          onClick={() => setSelectedTab('actions')}
        >
          Actions
        </button>
        <button
          className={selectedTab === 'world' ? 'active' : ''}
          onClick={() => setSelectedTab('world')}
        >
          World Info
        </button>
        <button
          className={selectedTab === 'dev' ? 'active' : ''}
          onClick={() => setSelectedTab('dev')}
          style={{ background: '#9b59b6', color: 'white' }}
        >
          ⚙️ Dev Panel
        </button>
      </div>

      <div className="tab-content">
        {selectedTab === 'status' && currentPlayer && (
          <EnhancedPlayerStatus player={currentPlayer} />
        )}

        {selectedTab === 'actions' && (
          <GameControls
            handleMove={handleMove}
            handleJoinGame={handleJoinGame}
            gameMessage={gameMessage}
            handleStartCataclysm={handleStartCataclysm}
            handlePickUpItem={handlePickUpItem}
          />
        )}

        {selectedTab === 'world' && (
          <WorldControls
            gameWorld={gameWorld}
            currentPlayer={currentPlayer}
            handleRegenerateWorld={handleRegenerateWorld}
            gameMessage={gameMessage}
          />
        )}

        {selectedTab === 'dev' && animationSettings && (
          <AnimationControls
            {...animationSettings}
            updateAnimationSettings={updateAnimationSettings}
          />
        )}
      </div>
    </div>
  );
};

export default ControlPanel;