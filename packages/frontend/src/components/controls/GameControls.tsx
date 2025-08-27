import React from 'react';

interface GameControlsProps {
  handleMove: (direction: 'up' | 'down' | 'left' | 'right') => void;
  handleJoinGame: () => void;
  gameMessage: string | null;
  handleStartCataclysm: () => void;
  handlePickUpItem: () => void;
}

const GameControls: React.FC<GameControlsProps> = ({
  handleMove,
  handleJoinGame,
  gameMessage,
  handleStartCataclysm,
  handlePickUpItem,
}) => {
  return (
    <div className="actions-tab">
      <h4>Actions</h4>
      {gameMessage && (
        <div className="game-message" style={{
          background: 'rgba(52, 152, 219, 0.2)',
          border: '1px solid #3498db',
          borderRadius: '5px',
          padding: '10px',
          marginBottom: '15px',
          color: '#ecf0f1'
        }}>
          {gameMessage}
        </div>
      )}
      <div className="movement-controls">
        <button className="move-btn" onClick={() => handleMove('up')}>↑</button>
        <div className="horizontal-controls">
          <button className="move-btn" onClick={() => handleMove('left')}>←</button>
          <button className="move-btn" onClick={() => handleMove('down')}>↓</button>
          <button className="move-btn" onClick={() => handleMove('right')}>→</button>
        </div>
      </div>
      <div className="action-buttons">
        <button className="action-btn" onClick={handleJoinGame}>
          🔌 Join Game
        </button>
        <button className="action-btn" onClick={handleStartCataclysm}>
          Start Cataclysm
        </button>
        <button className="action-btn" onClick={handlePickUpItem}>
          Pick Up Item
        </button>
      </div>
    </div>
  );
};

export default GameControls;