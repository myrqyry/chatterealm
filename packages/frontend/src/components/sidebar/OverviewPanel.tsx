import React from 'react';
import { GameWorld, Player } from 'shared';

interface OverviewPanelProps {
  gameWorld: GameWorld | null;
  currentPlayer: Player | null;
  gameMessage: string | null;
}

const OverviewPanel: React.FC<OverviewPanelProps> = ({
  gameWorld,
  currentPlayer,
  gameMessage
}) => {
  return (
    <div style={{ padding: '16px 0' }}>
      {/* World Snapshot */}
      <div style={{
        background: 'rgba(25, 23, 36, 0.6)',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '12px',
        border: '1px solid rgba(196, 167, 231, 0.2)'
      }}>
        <h4 style={{
          color: 'var(--color-text-primary)',
          fontSize: '0.9em',
          fontWeight: '600',
          margin: '0 0 8px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          🗺️ World Status
        </h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '6px',
          fontSize: '0.8em'
        }}>
          <div style={{ color: 'var(--color-text-secondary)' }}>
            <strong>Players:</strong> {gameWorld ? gameWorld.players.length : 0}
          </div>
          <div style={{ color: 'var(--color-text-secondary)' }}>
            <strong>NPCs:</strong> {gameWorld ? gameWorld.npcs.length : 0}
          </div>
          <div style={{ color: 'var(--color-text-secondary)' }}>
            <strong>Items:</strong> {gameWorld ? gameWorld.items.length : 0}
          </div>
          <div style={{ color: 'var(--color-text-secondary)' }}>
            <strong>Age:</strong> {gameWorld?.worldAge || 0}
          </div>
        </div>
      </div>

      {/* Player Info */}
      {currentPlayer && (
        <div style={{
          background: 'rgba(25, 23, 36, 0.6)',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '12px',
          border: '1px solid rgba(196, 167, 231, 0.2)'
        }}>
          <h4 style={{
            color: 'var(--color-text-primary)',
            fontSize: '0.9em',
            fontWeight: '600',
            margin: '0 0 8px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            🧑 Player
          </h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '6px',
            fontSize: '0.8em'
          }}>
            <div style={{ color: 'var(--color-text-secondary)' }}>
              <strong>HP:</strong> {currentPlayer.stats.hp}/{currentPlayer.stats.maxHp}
            </div>
            <div style={{ color: 'var(--color-text-secondary)' }}>
              <strong>Level:</strong> {currentPlayer.level}
            </div>
            <div style={{ color: 'var(--color-text-secondary)' }}>
              <strong>Pos:</strong> {currentPlayer.position.x},{currentPlayer.position.y}
            </div>
            <div style={{ color: 'var(--color-text-secondary)' }}>
              <strong>XP:</strong> {currentPlayer.experience}
            </div>
          </div>
        </div>
      )}

      {/* Game Message */}
      {gameMessage && (
        <div style={{
          background: 'rgba(196, 167, 231, 0.1)',
          color: 'var(--color-text-primary)',
          borderRadius: '8px',
          padding: '12px',
          border: '1px solid rgba(196, 167, 231, 0.3)',
          fontSize: '0.85em'
        }}>
          {gameMessage}
        </div>
      )}
    </div>
  );
};

export default OverviewPanel;