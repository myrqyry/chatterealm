import React, { useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import { PlayerClass } from 'shared';

const BottomSettingsBar: React.FC = () => {
  const {
    currentPlayer,
    joinGame,
    regenerateWorld,
    startCataclysm,
    movePlayer,
    gameMessage
  } = useGameStore();

  const [showSettings, setShowSettings] = useState(false);

  const handleJoin = () => {
    joinGame({
      id: `player_${Date.now()}`,
      displayName: 'Player' + Math.floor(Math.random() * 1000),
      class: PlayerClass.KNIGHT,
      avatar: '🙂'
    });
  };

  const handleRegenerate = () => {
    regenerateWorld();
  };

  const handleCataclysm = () => {
    startCataclysm();
  };

  const handleMove = (direction: 'up' | 'down' | 'left' | 'right') => {
    movePlayer(direction);
  };

  return (
    <>
      {/* Bottom Settings Bar */}
      <div className="fixed inset-x-0 bottom-0 z-[1000] flex justify-center items-center gap-3 px-4 py-2 backdrop-blur-sm bg-[rgba(25,23,36,0.95)] border-t border-t-[rgba(196,167,231,0.2)]">
        {/* Join Game */}
        <button
          onClick={handleJoin}
          className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-transform transform hover:scale-105 bg-primary text-on-primary"
        >
          🔌 Join
        </button>

        {/* Movement Controls */}
        {currentPlayer && (
          <>
            <div className="flex gap-1">
              <button
                onClick={() => handleMove('up')}
                className="w-9 h-9 flex items-center justify-center text-lg rounded-sm border border-outline bg-surface-variant text-text-primary transition-colors hover:bg-primary-container"
              >
                ↑
              </button>
            </div>

            <div className="flex gap-1">
              <button
                onClick={() => handleMove('left')}
                className="w-9 h-9 flex items-center justify-center text-lg rounded-sm border border-outline bg-surface-variant text-text-primary transition-colors hover:bg-primary-container"
              >
                ←
              </button>

              <button
                onClick={() => handleMove('down')}
                className="w-9 h-9 flex items-center justify-center text-lg rounded-sm border border-outline bg-surface-variant text-text-primary transition-colors hover:bg-primary-container"
              >
                ↓
              </button>

              <button
                onClick={() => handleMove('right')}
                className="w-9 h-9 flex items-center justify-center text-lg rounded-sm border border-outline bg-surface-variant text-text-primary transition-colors hover:bg-primary-container"
              >
                →
              </button>
            </div>
          </>
        )}

        {/* World Controls */}
        <button
          onClick={handleRegenerate}
          className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-transform transform hover:scale-105 bg-secondary text-on-secondary"
        >
          🌍 Regen
        </button>

        <button
          onClick={handleCataclysm}
          className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-transform transform hover:scale-105 bg-error text-on-error"
        >
          ⚡ Cataclysm
        </button>

        {/* Settings Toggle */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors bg-surface-variant text-text-primary border border-outline hover:bg-primary-container"
        >
          ⚙️ Settings
        </button>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50">
          <div className="bg-surface border border-outline rounded-xl p-6 max-w-md w-[90%] max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="m-0 text-text-primary">Quick Settings</h3>
              <button onClick={() => setShowSettings(false)} className="text-text-secondary text-lg p-1">×</button>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="block mb-1 text-text-primary">Show Grid</label>
                <input type="checkbox" defaultChecked />
              </div>

              <div>
                <label className="block mb-1 text-text-primary">Show Particles</label>
                <input type="checkbox" defaultChecked />
              </div>

              <div>
                <label className="block mb-1 text-text-primary">Animation Speed</label>
                <input type="range" min="0.1" max="3" step="0.1" defaultValue="1" className="w-full" />
              </div>

              <div>
                <label className="block mb-1 text-text-primary">Volume</label>
                <input type="range" min="0" max="100" defaultValue="80" className="w-full" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Game Message */}
      {gameMessage && (
        <div className="fixed bottom-[80px] left-1/2 -translate-x-1/2 z-[1500] px-4 py-2 rounded-md text-sm bg-primary-container text-on-primary-container shadow-lg">
          {gameMessage}
        </div>
      )}
    </>
  );
};

export default BottomSettingsBar;