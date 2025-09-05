import React from 'react';
import GameCanvas from './GameCanvas';
import NotificationSystem from './NotificationSystem';
import EnhancedPlayerStatus from './EnhancedPlayerStatus';
import SettingsPanel from './SettingsPanel';
import { useGameStore } from '../stores/gameStore';
import GameControls from './controls/GameControls';
import WorldControls from './controls/WorldControls';
import AnimationControls from './controls/AnimationControls';
import { COLORS } from '../constants/colors';

interface GameLayoutProps {
  handleRegenerateWorld: () => void;
  handleMove: (direction: 'up' | 'down' | 'left' | 'right') => void;
  handleJoinGame: () => void;
  handleStartCataclysm: () => void;
  handlePickUpItem: () => void;
}

const GameLayout: React.FC<GameLayoutProps> = ({
  handleRegenerateWorld,
  handleMove,
  handleJoinGame,
  handleStartCataclysm,
  handlePickUpItem,
}) => {
  const {
    gameWorld,
    currentPlayer,
    selectedTab,
    setSelectedTab,
    gameMessage
  } = useGameStore();

  return (
    <div className="app-container">
      <NotificationSystem />
      <div className="main-display">
        <div className="game-header">
          <h1>🗺️ Chat Grid Chronicles - Full Game Test</h1>
          <div className="world-info">
            <span>Phase: {gameWorld?.phase || 'N/A'}</span>
            <span>Players: {gameWorld ? gameWorld.players.length : 0}</span>
            <span>NPCs: {gameWorld ? gameWorld.npcs.length : 0}</span>
            <span>Items: {gameWorld ? gameWorld.items.length : 0}</span>
          </div>
        </div>

        <GameCanvas />

        <div className="game-legend">
          <div className="legend-item">
            <div className="legend-color" style={{background: 'var(--color-legend-knight)', borderRadius: '50%'}}></div>
            <span>Knight</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{background: 'var(--color-legend-rogue)', borderRadius: '50%'}}></div>
            <span>Rogue</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{background: 'var(--color-legend-mage)', borderRadius: '50%'}}></div>
            <span>Mage</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{background: 'var(--color-legend-npc)', borderRadius: '50%'}}></div>
            <span>NPC</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{background: 'var(--color-legend-item)', borderRadius: '0'}}></div>
            <span>Item</span>
          </div>
        </div>
      </div>

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
            className={selectedTab === 'settings' ? 'active' : ''}
            onClick={() => setSelectedTab('settings')}
            style={{background: 'var(--color-tab-settings)', color: 'white'}}
          >
            ⚙️ Settings
          </button>
          {process.env.NODE_ENV === 'development' && (
            <button
              className={selectedTab === 'dev' ? 'active' : ''}
              onClick={() => setSelectedTab('dev')}
              style={{background: 'var(--color-accent-dark-purple)', color: 'white'}}
            >
              🔧 Dev Panel
            </button>
          )}
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
              handleRegenerateWorld={handleRegenerateWorld}
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

          {selectedTab === 'settings' && (
            <SettingsPanel />
          )}

          {selectedTab === 'dev' && process.env.NODE_ENV === 'development' && (
            <AnimationControls />
          )}
        </div>
      </div>
    </div>
  );
};

export default GameLayout;
