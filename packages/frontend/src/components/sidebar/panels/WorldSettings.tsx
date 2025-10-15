import React from 'react';

interface UnifiedSettings {
  world: {
    worldWidth: number;
    worldHeight: number;
    grassWaveSpeed: number;
    treeSwaySpeed: number;
    flowerSpawnRate: number;
    windSpeed: number;
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
    <div className="py-4">
      <div className="mb-4">
        <label className="block mb-2 text-[var(--color-text-primary)] text-sm font-medium">World Width: {unifiedSettings.world.worldWidth}</label>
        <input
          type="range"
          min="20"
          max="100"
          step="5"
          value={unifiedSettings.world.worldWidth}
          onChange={(e) => updateWorldSettings({ worldWidth: parseInt(e.target.value) })}
          className="w-full"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-2 text-[var(--color-text-primary)] text-sm font-medium">World Height: {unifiedSettings.world.worldHeight}</label>
        <input
          type="range"
          min="15"
          max="75"
          step="3"
          value={unifiedSettings.world.worldHeight}
          onChange={(e) => updateWorldSettings({ worldHeight: parseInt(e.target.value) })}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default WorldSettings;
