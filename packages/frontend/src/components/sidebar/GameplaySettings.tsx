import React from 'react';

interface UnifiedSettings {
  game: {
    autoSaveEnabled: boolean;
    showDamageNumbers: boolean;
    minimapEnabled: boolean;
  };
}

interface GameplaySettingsProps {
  unifiedSettings: UnifiedSettings;
  updateGameSettings: (settings: Partial<UnifiedSettings['game']>) => void;
}

const GameplaySettings: React.FC<GameplaySettingsProps> = ({
  unifiedSettings,
  updateGameSettings
}) => {
  return (
    <div className="py-4">
      <div className="mb-4">
        <label className="block mb-2 text-[var(--color-text-primary)] text-sm font-medium">
          Auto-Save
        </label>
        <input
          type="checkbox"
          checked={unifiedSettings.game.autoSaveEnabled}
          onChange={(e) => updateGameSettings({ autoSaveEnabled: e.target.checked })}
          className="mr-2"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-2 text-[var(--color-text-primary)] text-sm font-medium">
          Show Damage Numbers
        </label>
        <input
          type="checkbox"
          checked={unifiedSettings.game.showDamageNumbers}
          onChange={(e) => updateGameSettings({ showDamageNumbers: e.target.checked })}
          className="mr-2"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-2 text-[var(--color-text-primary)] text-sm font-medium">
          Mini-map
        </label>
        <input
          type="checkbox"
          checked={unifiedSettings.game.minimapEnabled}
          onChange={(e) => updateGameSettings({ minimapEnabled: e.target.checked })}
          className="mr-2"
        />
      </div>
    </div>
  );
};

export default GameplaySettings;