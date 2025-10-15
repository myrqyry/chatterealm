import React from 'react';
import { Player } from 'shared';

interface PlayerSummaryPanelProps {
  player: Player | null;
}

const PlayerSummaryPanel: React.FC<PlayerSummaryPanelProps> = ({ player }) => {
  if (!player) {
    return (
      <div className="py-2 text-sm text-[var(--color-text-secondary)]">Not in game</div>
    );
  }

  const playerName = player.displayName || player.name || 'Unknown';
  const playerClass = player.characterClass?.name || player.class || 'Unknown';
  const hp = player.stats?.hp ?? player.health ?? 0;
  const maxHp = player.stats?.maxHp ?? 0;
  const inventoryCount = player.inventory ? player.inventory.length : 0;

  return (
    <div className="py-4">
      <h4 className="text-[var(--color-text-primary)] text-sm font-semibold mb-3">Player Status</h4>
      <div className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between">
          <span className="text-[var(--color-text-secondary)]">Name</span>
          <span className="font-medium">{playerName}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-[var(--color-text-secondary)]">Class</span>
          <span className="font-medium">{String(playerClass)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-[var(--color-text-secondary)]">HP</span>
          <span className="font-medium">{hp}/{maxHp}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-[var(--color-text-secondary)]">Inventory</span>
          <span className="font-medium">{inventoryCount}</span>
        </div>
      </div>
    </div>
  );
};

export default PlayerSummaryPanel;
