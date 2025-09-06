import React from 'react';
import type { GameWorld, Player } from '../../../../shared/src/types/game';
import { useGameStore } from '../../stores/gameStore';

interface WorldControlsProps {
  gameWorld: GameWorld | null;
  currentPlayer: Player | null;
  handleRegenerateWorld: () => void;
  gameMessage: string | null;
}

const WorldControls: React.FC<WorldControlsProps> = ({ gameWorld, currentPlayer, handleRegenerateWorld, gameMessage }) => {
  const { setGameMessage } = useGameStore();
  return (
    <div className="world-tab">
      <h4>World Information</h4>
      <div className="world-stats">
        <p><strong>World Age:</strong> {gameWorld?.worldAge || 0} cycles</p>
        <p><strong>Players:</strong> {gameWorld?.players.length || 0}</p>
        <p><strong>NPCs:</strong> {gameWorld?.npcs.length || 0}</p>
        <p><strong>Items:</strong> {gameWorld?.items.length || 0}</p>
        <p><strong>Phase:</strong> {gameWorld?.phase || 'N/A'}</p>
      </div>

      <div className="control-section">
        <h5>Debug / Development Controls</h5>
        <div className="action-buttons">
          <button className="action-btn" onClick={handleRegenerateWorld}>
            ♻️ Regenerate World
          </button>
        </div>

        <h6>Current World Properties:</h6>
        {gameWorld && (
          <ul className="world-properties-list">
            <li>
              Cataclysm Active: {gameWorld.cataclysmCircle.isActive ? 'Yes' : 'No'}
              {gameWorld.cataclysmCircle.isActive && ` (Radius: ${gameWorld.cataclysmCircle.radius.toFixed(1)})`}
            </li>
            <li>Last Reset: {new Date(gameWorld.lastResetTime).toLocaleString()}</li>
            <li>Player Count: {gameWorld.players.length}</li>
            <li>NPC Count: {gameWorld.npcs.length}</li>
            <li>Item Count: {gameWorld.items.length}</li>
          </ul>
        )}
      </div>

      <div className="control-section">
        <h6>Player Spawning:</h6>
        <div className="action-buttons">
          <button
            className="action-btn dev-spawn-button"
            onClick={() => {
              if (currentPlayer && gameWorld) {
                // Example of programmatically showing a notification
                setGameMessage(`Spawned a test player at ${currentPlayer.position.x},${currentPlayer.position.y}!`);
                setTimeout(() => setGameMessage(''), 3000); // Clear after 3 seconds
              }
            }}
          >
            Spawn Test Player (dev)
          </button>
        </div>
        <p className="description-text">
          Use the 'Spawn Test Player' button for testing player spawn logic directly in the UI.
        </p>
      </div>
    </div>
  );
};

export default WorldControls;