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
    <div style={{ padding: '16px 0' }}>
      <div style={{ marginBottom: '16px' }}>
        <label style={{
          display: 'block',
          marginBottom: '8px',
          color: 'var(--color-text-primary)',
          fontSize: '0.9em',
          fontWeight: '500'
        }}>
          Auto-Save
        </label>
        <input
          type="checkbox"
          checked={unifiedSettings.game.autoSaveEnabled}
          onChange={(e) => updateGameSettings({ autoSaveEnabled: e.target.checked })}
          style={{ marginRight: '8px' }}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{
          display: 'block',
          marginBottom: '8px',
          color: 'var(--color-text-primary)',
          fontSize: '0.9em',
          fontWeight: '500'
        }}>
          Show Damage Numbers
        </label>
        <input
          type="checkbox"
          checked={unifiedSettings.game.showDamageNumbers}
          onChange={(e) => updateGameSettings({ showDamageNumbers: e.target.checked })}
          style={{ marginRight: '8px' }}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{
          display: 'block',
          marginBottom: '8px',
          color: 'var(--color-text-primary)',
          fontSize: '0.9em',
          fontWeight: '500'
        }}>
          Mini-map
        </label>
        <input
          type="checkbox"
          checked={unifiedSettings.game.minimapEnabled}
          onChange={(e) => updateGameSettings({ minimapEnabled: e.target.checked })}
          style={{ marginRight: '8px' }}
        />
      </div>
    </div>
  );
};

export default GameplaySettings;