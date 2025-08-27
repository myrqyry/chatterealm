import React from 'react';

interface AnimationControlsProps {
  animationSpeed: number;
  showGrid: boolean;
  roughness: number;
  bowing: number;
  fillWeight: number;
  hachureAngle: number;
  hachureGap: number;
  windSpeed: number;
  grassWaveSpeed: number;
  treeSwaySpeed: number;
  flowerSpawnRate: number;
  showParticles: boolean;
  updateAnimationSettings: (settings: Partial<AnimationControlsProps>) => void;
}

const AnimationControls: React.FC<AnimationControlsProps> = ({
  animationSpeed,
  showGrid,
  roughness,
  bowing,
  fillWeight,
  hachureAngle,
  hachureGap,
  windSpeed,
  grassWaveSpeed,
  treeSwaySpeed,
  flowerSpawnRate,
  showParticles,
  updateAnimationSettings,
}) => {
  return (
    <div className="animation-controls-tab">
      <h4>Animation & Visual Settings</h4>
      <div className="control-group">
        <label>Animation Speed: {animationSpeed.toFixed(2)}x</label>
        <input
          type="range"
          min="0.1"
          max="5"
          step="0.05"
          value={animationSpeed}
          onChange={(e) => updateAnimationSettings({ animationSpeed: parseFloat(e.target.value) })}
        />
      </div>

      <div className="control-group checkbox">
        <label>
          <input
            type="checkbox"
            checked={showGrid}
            onChange={(e) => updateAnimationSettings({ showGrid: e.target.checked })}
          />
          Show Grid
        </label>
      </div>

      <div className="control-group">
        <label>Roughness: {roughness.toFixed(2)}</label>
        <input
          type="range"
          min="0"
          max="5"
          step="0.1"
          value={roughness}
          onChange={(e) => updateAnimationSettings({ roughness: parseFloat(e.target.value) })}
        />
      </div>

      <div className="control-group">
        <label>Bowing: {bowing.toFixed(2)}</label>
        <input
          type="range"
          min="0"
          max="5"
          step="0.1"
          value={bowing}
          onChange={(e) => updateAnimationSettings({ bowing: parseFloat(e.target.value) })}
        />
      </div>

      <div className="control-group">
        <label>Fill Weight: {fillWeight.toFixed(2)}</label>
        <input
          type="range"
          min="0"
          max="5"
          step="0.1"
          value={fillWeight}
          onChange={(e) => updateAnimationSettings({ fillWeight: parseFloat(e.target.value) })}
        />
      </div>

      <div className="control-group">
        <label>Hachure Angle: {hachureAngle.toFixed(0)}°</label>
        <input
          type="range"
          min="-90"
          max="90"
          step="1"
          value={hachureAngle}
          onChange={(e) => updateAnimationSettings({ hachureAngle: parseInt(e.target.value) })}
        />
      </div>

      <div className="control-group">
        <label>Hachure Gap: {hachureGap.toFixed(2)}</label>
        <input
          type="range"
          min="1"
          max="10"
          step="0.1"
          value={hachureGap}
          onChange={(e) => updateAnimationSettings({ hachureGap: parseFloat(e.target.value) })}
        />
      </div>

      <div className="control-group">
        <label>Wind Speed: {windSpeed.toFixed(2)}</label>
        <input
          type="range"
          min="0"
          max="5"
          step="0.1"
          value={windSpeed}
          onChange={(e) => updateAnimationSettings({ windSpeed: parseFloat(e.target.value) })}
        />
      </div>
      <div className="control-group">
        <label>Grass Wave Speed: {grassWaveSpeed.toFixed(2)}</label>
        <input
          type="range"
          min="0"
          max="5"
          step="0.1"
          value={grassWaveSpeed}
          onChange={(e) => updateAnimationSettings({ grassWaveSpeed: parseFloat(e.target.value) })}
        />
      </div>
      <div className="control-group">
        <label>Tree Sway Speed: {treeSwaySpeed.toFixed(2)}</label>
        <input
          type="range"
          min="0"
          max="5"
          step="0.1"
          value={treeSwaySpeed}
          onChange={(e) => updateAnimationSettings({ treeSwaySpeed: parseFloat(e.target.value) })}
        />
      </div>
      <div className="control-group">
        <label>Flower Spawn Rate: {flowerSpawnRate.toFixed(2)}</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={flowerSpawnRate}
          onChange={(e) => updateAnimationSettings({ flowerSpawnRate: parseFloat(e.target.value) })}
        />
      </div>
      <div className="control-group checkbox">
        <label>
          <input
            type="checkbox"
            checked={showParticles}
            onChange={(e) => updateAnimationSettings({ showParticles: e.target.checked })}
          />
          Show Particles
        </label>
      </div>
    </div>
  );
};

export default AnimationControls;