import React from 'react';

interface UnifiedSettings {
  world: {
    worldWidth: number;
    worldHeight: number;
  };
}

interface WorldSettingsProps {
  unifiedSettings: UnifiedSettings;
  updateWorldSettings: (settings: Partial<UnifiedSettings['world']>) => void;
}

const WorldSettings: React.FC<WorldSettingsProps> = ({
  unifiedSettings,
  updateWorldSettings
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
          World Width: {unifiedSettings.world.worldWidth}
        </label>
        <input
          type="range"
          min="20"
          max="100"
          step="5"
          value={unifiedSettings.world.worldWidth}
          onChange={(e) => updateWorldSettings({ worldWidth: parseInt(e.target.value) })}
          style={{ width: '100%' }}
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
          World Height: {unifiedSettings.world.worldHeight}
        </label>
        <input
          type="range"
          min="15"
          max="75"
          step="3"
          value={unifiedSettings.world.worldHeight}
          onChange={(e) => updateWorldSettings({ worldHeight: parseInt(e.target.value) })}
          style={{ width: '100%' }}
        />
      </div>
    </div>
  );
};

export default WorldSettings;