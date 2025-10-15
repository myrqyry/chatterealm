import React from 'react';
import { Player, PlayerClass } from 'shared';

interface ActionsPanelProps {
  currentPlayer: Player | null;
  onJoin: () => void;
  onMove: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onPickup: () => void;
  onRegenerate: () => void;
  onCataclysm: () => void;
}

const ActionsPanel: React.FC<ActionsPanelProps> = ({
  currentPlayer,
  onJoin,
  onMove,
  onPickup,
  onRegenerate,
  onCataclysm
}) => {
  return (
    <div className="py-4">
      {/* Quick Actions */}
      <div className="mb-5">
        <h4 className="text-[var(--color-text-primary)] text-sm font-semibold mb-3">Quick Actions</h4>

        <div className="flex flex-col gap-2">
          {!currentPlayer && (
            <button
              onClick={onJoin}
              className="bg-[var(--color-primary)] text-[var(--color-on-primary)] rounded-md px-3 py-2 text-sm font-medium flex items-center gap-2 transform transition-transform duration-150 hover:scale-[1.02]"
            >
              🔌 Join Game
            </button>
          )}

          {currentPlayer && (
            <>
              {/* Movement Controls */}
              <div className="grid grid-cols-3 gap-1 mb-2">
                <div />
                <button onClick={() => onMove('up')} className="w-8 h-8 rounded-sm border text-[var(--color-text-primary)] bg-[var(--color-surface-variant)] border-[var(--color-outline)] flex items-center justify-center text-sm transition-colors duration-150 hover:bg-[var(--color-primary-container)]">↑</button>
                <div />

                <button onClick={() => onMove('left')} className="w-8 h-8 rounded-sm border text-[var(--color-text-primary)] bg-[var(--color-surface-variant)] border-[var(--color-outline)] flex items-center justify-center text-sm transition-colors duration-150 hover:bg-[var(--color-primary-container)]">←</button>

                <button onClick={() => onMove('down')} className="w-8 h-8 rounded-sm border text-[var(--color-text-primary)] bg-[var(--color-surface-variant)] border-[var(--color-outline)] flex items-center justify-center text-sm transition-colors duration-150 hover:bg-[var(--color-primary-container)]">↓</button>

                <button onClick={() => onMove('right')} className="w-8 h-8 rounded-sm border text-[var(--color-text-primary)] bg-[var(--color-surface-variant)] border-[var(--color-outline)] flex items-center justify-center text-sm transition-colors duration-150 hover:bg-[var(--color-primary-container)]">→</button>
              </div>

              <button onClick={onPickup} className="bg-[var(--color-secondary)] text-[var(--color-on-secondary)] rounded-md px-3 py-2 text-sm font-medium flex items-center gap-2 transform transition-transform duration-150 hover:scale-[1.02]">🎒 Pick Up</button>
            </>
          )}

          <button onClick={onRegenerate} className="bg-[var(--color-tertiary)] text-[var(--color-on-tertiary)] rounded-md px-3 py-2 text-sm font-medium flex items-center gap-2 transform transition-transform duration-150 hover:scale-[1.02]">🌍 Regen World</button>

          <button onClick={onCataclysm} className="bg-[var(--color-error)] text-[var(--color-on-error)] rounded-md px-3 py-2 text-sm font-medium flex items-center gap-2 transform transition-transform duration-150 hover:scale-[1.02]">⚡ Cataclysm</button>
        </div>
      </div>
    </div>
  );
};

export default ActionsPanel;
