import React from 'react';
import { useGameStore } from '../../stores/gameStore';
import { SettingSlider } from '../shared/settings';
import { SettingCheckbox } from '../shared/settings';
import { MaterialCard } from '../index';

const WorldModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { unifiedSettings, updateWorldSettings, updateAnimationSettings } = useGameStore();

  return (
    <div className="p-6 h-full overflow-auto font-mono bg-gradient-to-br from-background-primary/95 to-surface/90">
      {/* Modal Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-primary/30">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <span className="text-2xl">🌍</span>
          </div>
          <div>
            <h1 className="m-0 text-text-primary text-2xl font-bold text-shadow">
              World
            </h1>
            <p className="mt-1 mb-0 text-text-secondary text-sm font-normal">
              Environment and world generation
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/10 border-none text-text-primary cursor-pointer flex items-center justify-center text-lg transition-all duration-200 hover:bg-white/20 hover:scale-105"
        >
          ✕
        </button>
      </div>

      <div className="flex flex-col gap-6">
        <MaterialCard
          sx={{
            backgroundColor: 'rgba(25, 23, 36, 0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(0, 188, 212, 0.2)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 188, 212, 0.1)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 188, 212, 0.15)',
              borderColor: 'rgba(0, 188, 212, 0.3)'
            }
          }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
              <span className="text-lg">📐</span>
            </div>
            <h3 className="m-0 text-text-primary text-lg font-semibold">
              World Dimensions
            </h3>
          </div>
          <div className="flex flex-col gap-4">
            <SettingSlider
              label="World Width"
              value={unifiedSettings.world.worldWidth}
              min={20} max={100} step={5}
              onChange={(v) => updateWorldSettings({ worldWidth: v })}
              unit=" tiles" showReset resetValue={40}
              description="Horizontal size"
            />
            <SettingSlider
              label="World Height"
              value={unifiedSettings.world.worldHeight}
              min={15} max={75} step={3}
              onChange={(v) => updateWorldSettings({ worldHeight: v })}
              unit=" tiles" showReset resetValue={30}
              description="Vertical size"
            />
          </div>
        </MaterialCard>

        <MaterialCard
          sx={{
            backgroundColor: 'rgba(25, 23, 36, 0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(0, 188, 212, 0.2)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 188, 212, 0.1)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 188, 212, 0.15)',
              borderColor: 'rgba(0, 188, 212, 0.3)'
            }
          }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
              <span className="text-lg">🌿</span>
            </div>
            <h3 className="m-0 text-text-primary text-lg font-semibold">
              Environment Animation
            </h3>
          </div>
          <div className="flex flex-col gap-4">
            <SettingSlider
              label="Grass Wave Speed"
              value={unifiedSettings.world.grassWaveSpeed}
              min={0} max={1} step={0.1}
              onChange={(v) => updateWorldSettings({ grassWaveSpeed: v })}
              showReset resetValue={0.1}
              description="Grass sway speed"
            />
            <SettingSlider
              label="Tree Sway Speed"
              value={unifiedSettings.world.treeSwaySpeed}
              min={0} max={1} step={0.1}
              onChange={(v) => updateWorldSettings({ treeSwaySpeed: v })}
              showReset resetValue={0.03}
              description="Tree movement speed"
            />
            <SettingSlider
              label="Flower Spawn Rate"
              value={unifiedSettings.world.flowerSpawnRate}
              min={0} max={1} step={0.1}
              onChange={(v) => updateWorldSettings({ flowerSpawnRate: v })}
              showReset resetValue={0.01}
              description="Spawn rate of flowers"
            />
            <SettingSlider
              label="Wind Speed"
              value={unifiedSettings.world.windSpeed}
              min={0} max={1} step={0.1}
              onChange={(v) => updateWorldSettings({ windSpeed: v })}
              showReset resetValue={0.02}
              description="Global wind agitation"
            />
          </div>
        </MaterialCard>

        <MaterialCard
          sx={{
            backgroundColor: 'rgba(25, 23, 36, 0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(0, 188, 212, 0.2)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 188, 212, 0.1)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 188, 212, 0.15)',
              borderColor: 'rgba(0, 188, 212, 0.3)'
            }
          }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
              <span className="text-lg">🌙</span>
            </div>
            <h3 className="m-0 text-text-primary text-lg font-semibold">
              World Rendering
            </h3>
          </div>
          <div className="flex flex-col gap-4">
            <SettingCheckbox
              label="Night Mode"
              checked={unifiedSettings.world.nightMode}
              onChange={(checked) => updateWorldSettings({ nightMode: checked })}
              description="Enable night time rendering effects in the game world"
            />
          </div>
        </MaterialCard>

        <MaterialCard
          sx={{
            backgroundColor: 'rgba(25, 23, 36, 0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(0, 188, 212, 0.2)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 188, 212, 0.1)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 188, 212, 0.15)',
              borderColor: 'rgba(0, 188, 212, 0.3)'
            }
          }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
              <span className="text-lg">🎨</span>
            </div>
            <h3 className="m-0 text-text-primary text-lg font-semibold">
              Rough.js Styling
            </h3>
          </div>
          <div className="flex flex-col gap-4">
            <div className="text-sm text-text-secondary mb-2">
              Advanced rough.js drawing style controls for hand-drawn aesthetics.
            </div>

            {/* Basic Roughness Controls */}
            <div className="grid grid-cols-2 gap-4">
              <SettingSlider
                label="Roughness"
                value={unifiedSettings.animations.roughness}
                min={0} max={10} step={0.1}
                onChange={(v) => updateAnimationSettings({ roughness: v })}
                showReset resetValue={1.5}
                description="Overall sketchiness"
              />
              <SettingSlider
                label="Bowing"
                value={unifiedSettings.animations.bowing}
                min={0} max={10} step={0.1}
                onChange={(v) => updateAnimationSettings({ bowing: v })}
                showReset resetValue={1.2}
                description="Line curvature"
              />
            </div>

            {/* Stroke and Fill Controls */}
            <div className="grid grid-cols-2 gap-4">
              <SettingSlider
                label="Stroke Width"
                value={unifiedSettings.animations.strokeWidth}
                min={0.1} max={5} step={0.1}
                onChange={(v) => updateAnimationSettings({ strokeWidth: v })}
                showReset resetValue={1.5}
                description="Line thickness"
              />
              <SettingSlider
                label="Fill Weight"
                value={unifiedSettings.animations.fillWeight}
                min={0} max={5} step={0.1}
                onChange={(v) => updateAnimationSettings({ fillWeight: v })}
                showReset resetValue={1.5}
                description="Fill density"
              />
            </div>

            {/* Hachure Controls */}
            <div className="grid grid-cols-2 gap-4">
              <SettingSlider
                label="Hachure Angle"
                value={unifiedSettings.animations.hachureAngle}
                min={-180} max={180} step={5}
                onChange={(v) => updateAnimationSettings({ hachureAngle: v })}
                showReset resetValue={45}
                description="Hatch direction"
              />
              <SettingSlider
                label="Hachure Gap"
                value={unifiedSettings.animations.hachureGap}
                min={1} max={20} step={0.5}
                onChange={(v) => updateAnimationSettings({ hachureGap: v })}
                showReset resetValue={4}
                description="Hatch spacing"
              />
            </div>

            {/* Curve Controls */}
            <div className="grid grid-cols-3 gap-4">
              <SettingSlider
                label="Curve Fitting"
                value={unifiedSettings.animations.curveFitting}
                min={0} max={1} step={0.01}
                onChange={(v) => updateAnimationSettings({ curveFitting: v })}
                showReset resetValue={0.95}
                description="Curve smoothness"
              />
              <SettingSlider
                label="Curve Tightness"
                value={unifiedSettings.animations.curveTightness}
                min={0} max={1} step={0.01}
                onChange={(v) => updateAnimationSettings({ curveTightness: v })}
                showReset resetValue={0}
                description="Curve tension"
              />
              <SettingSlider
                label="Curve Steps"
                value={unifiedSettings.animations.curveStepCount}
                min={3} max={20} step={1}
                onChange={(v) => updateAnimationSettings({ curveStepCount: v })}
                showReset resetValue={9}
                description="Curve resolution"
              />
            </div>

            {/* Advanced Controls */}
            <div className="grid grid-cols-2 gap-4">
              <SettingSlider
                label="Simplification"
                value={unifiedSettings.animations.simplification}
                min={0} max={1} step={0.01}
                onChange={(v) => updateAnimationSettings({ simplification: v })}
                showReset resetValue={0.8}
                description="Shape simplification"
              />
              <SettingSlider
                label="Fill Roughness Gain"
                value={unifiedSettings.animations.fillShapeRoughnessGain}
                min={0} max={2} step={0.01}
                onChange={(v) => updateAnimationSettings({ fillShapeRoughnessGain: v })}
                showReset resetValue={0.8}
                description="Fill roughness boost"
              />
            </div>

            {/* Dash and Zigzag Controls */}
            <div className="grid grid-cols-3 gap-4">
              <SettingSlider
                label="Dash Offset"
                value={unifiedSettings.animations.dashOffset}
                min={0} max={10} step={0.1}
                onChange={(v) => updateAnimationSettings({ dashOffset: v })}
                showReset resetValue={0}
                description="Dash pattern offset"
              />
              <SettingSlider
                label="Dash Gap"
                value={unifiedSettings.animations.dashGap}
                min={0} max={10} step={0.1}
                onChange={(v) => updateAnimationSettings({ dashGap: v })}
                showReset resetValue={0}
                description="Dash gap size"
              />
              <SettingSlider
                label="Zigzag Offset"
                value={unifiedSettings.animations.zigzagOffset}
                min={0} max={10} step={0.1}
                onChange={(v) => updateAnimationSettings({ zigzagOffset: v })}
                showReset resetValue={0}
                description="Zigzag amplitude"
              />
            </div>

            {/* Random Seed */}
            <div className="grid grid-cols-1 gap-4">
              <SettingSlider
                label="Random Seed"
                value={unifiedSettings.animations.seed}
                min={0} max={1000} step={1}
                onChange={(v) => updateAnimationSettings({ seed: v })}
                showReset resetValue={1}
                description="Randomness seed for consistent patterns"
              />
            </div>

            {/* Boolean Toggles */}
            <div className="grid grid-cols-2 gap-4">
              <SettingCheckbox
                label="Disable Multi-Stroke"
                checked={unifiedSettings.animations.disableMultiStroke}
                onChange={(checked) => updateAnimationSettings({ disableMultiStroke: checked })}
                description="Single stroke only"
              />
              <SettingCheckbox
                label="Disable Multi-Stroke Fill"
                checked={unifiedSettings.animations.disableMultiStrokeFill}
                onChange={(checked) => updateAnimationSettings({ disableMultiStrokeFill: checked })}
                description="Single fill stroke"
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <SettingCheckbox
                label="Preserve Vertices"
                checked={unifiedSettings.animations.preserveVertices}
                onChange={(checked) => updateAnimationSettings({ preserveVertices: checked })}
                description="Keep original shape points"
              />
            </div>
          </div>
        </MaterialCard>
      </div>
    </div>
  );
};

export default WorldModal;
