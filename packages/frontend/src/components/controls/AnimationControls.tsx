import React from 'react';
import { useGameStore } from '../../stores/gameStore';

const AnimationControls: React.FC = () => {
  const { unifiedSettings, updateAnimationSettings, updateVisualSettings, updateWorldSettings } = useGameStore();

  // Use unified settings with fallbacks
  const animationSpeed = unifiedSettings?.animations?.animationSpeed ?? 1.0;
  const showGrid = unifiedSettings?.visual?.showGrid ?? false;
  const roughness = unifiedSettings?.animations?.roughness ?? 1.5;
  const bowing = unifiedSettings?.animations?.bowing ?? 1.2;
  const fillWeight = unifiedSettings?.animations?.fillWeight ?? 1.5;
  const hachureAngle = unifiedSettings?.animations?.hachureAngle ?? 45;
  const hachureGap = unifiedSettings?.animations?.hachureGap ?? 4;
  const windSpeed = unifiedSettings?.world?.windSpeed ?? 0.02;
  const grassWaveSpeed = unifiedSettings?.world?.grassWaveSpeed ?? 0.1;
  const treeSwaySpeed = unifiedSettings?.world?.treeSwaySpeed ?? 0.03;
  const flowerSpawnRate = unifiedSettings?.world?.flowerSpawnRate ?? 0.01;
  const showParticles = unifiedSettings?.visual?.showParticles ?? false;
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
            onChange={(e) => updateVisualSettings({ showGrid: e.target.checked })}
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
          onChange={(e) => updateWorldSettings({ windSpeed: parseFloat(e.target.value) })}
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
          onChange={(e) => updateWorldSettings({ grassWaveSpeed: parseFloat(e.target.value) })}
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
          onChange={(e) => updateWorldSettings({ treeSwaySpeed: parseFloat(e.target.value) })}
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
          onChange={(e) => updateWorldSettings({ flowerSpawnRate: parseFloat(e.target.value) })}
        />
      </div>
      <div className="control-group checkbox">
        <label>
          <input
            type="checkbox"
            checked={showParticles}
            onChange={(e) => updateVisualSettings({ showParticles: e.target.checked })}
          />
          Show Particles
        </label>
      </div>
    </div>
  );
};

export default AnimationControls;
