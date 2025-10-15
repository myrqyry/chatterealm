import React from 'react';

interface UnifiedSettings {
  visual: {
    showGrid: boolean;
    showParticles: boolean;
  };
  animations: {
    animationSpeed: number;
  };
}

interface VisualSettingsProps {
  unifiedSettings: UnifiedSettings;
  updateVisualSettings: (settings: Partial<UnifiedSettings['visual']>) => void;
  updateAnimationSettings: (settings: Partial<UnifiedSettings['animations']>) => void;
}

const VisualSettings: React.FC<VisualSettingsProps> = ({
  unifiedSettings,
  updateVisualSettings,
  updateAnimationSettings
}) => {
  return (
    <div className="py-4">
      <div className="mb-4">
        <label className="block mb-2 text-[var(--color-text-primary)] text-sm font-medium">Show Grid</label>
        <input
          type="checkbox"
          checked={unifiedSettings.visual.showGrid}
          onChange={(e) => updateVisualSettings({ showGrid: e.target.checked })}
          className="mr-2"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-2 text-[var(--color-text-primary)] text-sm font-medium">Show Particles</label>
        <input
          type="checkbox"
          checked={unifiedSettings.visual.showParticles}
          onChange={(e) => updateVisualSettings({ showParticles: e.target.checked })}
          className="mr-2"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-2 text-[var(--color-text-primary)] text-sm font-medium">Animation Speed: {unifiedSettings.animations.animationSpeed}x</label>
        <input
          type="range"
          min="0.1"
          max="3"
          step="0.1"
          value={unifiedSettings.animations.animationSpeed}
          onChange={(e) => updateAnimationSettings({ animationSpeed: parseFloat(e.target.value) })}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default VisualSettings;
