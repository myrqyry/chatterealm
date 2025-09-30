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
    <div className="py-4">
      {/* World Snapshot */}
  <div className="rounded-md p-3 mb-3 border bg-[var(--color-surface-variant)]/60 border-[var(--color-outline)]">
        <h4 className="text-[var(--color-text-primary)] text-sm font-semibold m-0 flex items-center gap-1.5">
          🗺️ World Status
        </h4>
        <div className="grid grid-cols-2 gap-1.5 text-xs">
          <div className="text-[var(--color-text-secondary)]">
            <strong>Players:</strong> {gameWorld ? gameWorld.players.length : 0}
          </div>
          <div className="text-[var(--color-text-secondary)]">
            <strong>NPCs:</strong> {gameWorld ? gameWorld.npcs.length : 0}
          </div>
          <div className="text-[var(--color-text-secondary)]">
            <strong>Items:</strong> {gameWorld ? gameWorld.items.length : 0}
          </div>
          <div className="text-[var(--color-text-secondary)]">
            <strong>Age:</strong> {gameWorld?.worldAge || 0}
          </div>
        </div>
      </div>

      {/* Player Info */}
      {currentPlayer && (
  <div className="rounded-md p-3 mb-3 border bg-[var(--color-surface-variant)]/60 border-[var(--color-outline)]">
          <h4 className="text-[var(--color-text-primary)] text-sm font-semibold m-0 flex items-center gap-1.5">
            🧑 Player
          </h4>
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            <div className="text-[var(--color-text-secondary)]">
              <strong>HP:</strong> {currentPlayer.stats.hp}/{currentPlayer.stats.maxHp}
            </div>
            <div className="text-[var(--color-text-secondary)]">
              <strong>Level:</strong> {currentPlayer.level}
            </div>
            <div className="text-[var(--color-text-secondary)]">
              <strong>Pos:</strong> {currentPlayer.position.x},{currentPlayer.position.y}
            </div>
            <div className="text-[var(--color-text-secondary)]">
              <strong>XP:</strong> {currentPlayer.experience}
            </div>
          </div>
        </div>
      )}

      {/* Game Message */}
      {gameMessage && (
        <div className="rounded-md p-3 text-[var(--color-text-primary)] text-sm bg-[var(--color-primary-container)]/8 border border-[var(--color-primary)]/20">
          {gameMessage}
        </div>
      )}
    </div>
  );
};

export default OverviewPanel;