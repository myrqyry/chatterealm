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
    <div style={{ padding: '16px 0' }}>
      <div style={{ marginBottom: '16px' }}>
        <label style={{
          display: 'block',
          marginBottom: '8px',
          color: 'var(--color-text-primary)',
          fontSize: '0.9em',
          fontWeight: '500'
        }}>
          Show Grid
        </label>
        <input
          type="checkbox"
          checked={unifiedSettings.visual.showGrid}
          onChange={(e) => updateVisualSettings({ showGrid: e.target.checked })}
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
          Show Particles
        </label>
        <input
          type="checkbox"
          checked={unifiedSettings.visual.showParticles}
          onChange={(e) => updateVisualSettings({ showParticles: e.target.checked })}
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
          Animation Speed: {unifiedSettings.animations.animationSpeed}x
        </label>
        <input
          type="range"
          min="0.1"
          max="3"
          step="0.1"
          value={unifiedSettings.animations.animationSpeed}
          onChange={(e) => updateAnimationSettings({ animationSpeed: parseFloat(e.target.value) })}
          style={{ width: '100%' }}
        />
      </div>
    </div>
  );
};

export default VisualSettings;