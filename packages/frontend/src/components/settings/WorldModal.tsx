import React from 'react';
import { useGameStore } from '../../stores/gameStore';
import { SettingSlider } from '../shared/settings';
import { SettingCheckbox } from '../shared/settings';
import { MaterialCard } from '../index';

const WorldModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { unifiedSettings, updateWorldSettings, updateAnimationSettings } = useGameStore();

  return (
    <div style={{
      padding: '24px',
      height: '100%',
      overflow: 'auto',
      fontFamily: 'JetBrains Mono',
      background: 'linear-gradient(145deg, rgba(25, 23, 36, 0.95) 0%, rgba(31, 29, 46, 0.9) 100%)'
    }}>
      {/* Modal Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '32px',
        paddingBottom: '16px',
        borderBottom: '2px solid rgba(0, 188, 212, 0.3)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #00bcd4 0%, #0097a7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0, 188, 212, 0.3)'
          }}>
            <span style={{ fontSize: '1.5rem' }}>🌍</span>
          </div>
          <div>
            <h1 style={{
              margin: 0,
              color: 'var(--color-text-primary)',
              fontSize: '1.8rem',
              fontWeight: 700,
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
            }}>
              World
            </h1>
            <p style={{
              margin: '4px 0 0 0',
              color: 'var(--color-text-secondary)',
              fontSize: '0.9rem',
              fontWeight: 400
            }}>
              Environment and world generation
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            minWidth: '40px',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            color: 'var(--color-text-primary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          ✕
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '20px'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #00bcd4 0%, #0097a7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '1.1rem' }}>📐</span>
            </div>
            <h3 style={{
              margin: 0,
              color: 'var(--color-text-primary)',
              fontSize: '1.2rem',
              fontWeight: 600
            }}>
              World Dimensions
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '20px'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #00bcd4 0%, #0097a7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '1.1rem' }}>🌿</span>
            </div>
            <h3 style={{
              margin: 0,
              color: 'var(--color-text-primary)',
              fontSize: '1.2rem',
              fontWeight: 600
            }}>
              Environment Animation
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '20px'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #00bcd4 0%, #0097a7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '1.1rem' }}>🌙</span>
            </div>
            <h3 style={{
              margin: 0,
              color: 'var(--color-text-primary)',
              fontSize: '1.2rem',
              fontWeight: 600
            }}>
              World Rendering
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '20px'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #00bcd4 0%, #0097a7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '1.1rem' }}>🎨</span>
            </div>
            <h3 style={{
              margin: 0,
              color: 'var(--color-text-primary)',
              fontSize: '1.2rem',
              fontWeight: 600
            }}>
              Rough.js Styling
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              fontSize: '0.9rem',
              color: 'var(--color-text-secondary)',
              marginBottom: '8px'
            }}>
              Advanced rough.js drawing style controls for hand-drawn aesthetics.
            </div>

            {/* Basic Roughness Controls */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
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
