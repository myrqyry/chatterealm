import React from 'react';
import { useGameStore } from '../../stores/gameStore';
import { SettingDropdown, SettingCheckbox, SettingSlider } from '../shared/settings';
import { DropdownOption } from '../shared/settings/SettingDropdown';
import { Theme } from 'shared';
import { MaterialCard } from '../index';

const VisualModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { unifiedSettings, updateVisualSettings, updateAnimationSettings } = useGameStore();

  const themeOptions: DropdownOption[] = [
    { value: Theme.DARK, label: '🌙 Dark Theme', icon: '🌙' },
    { value: Theme.LIGHT, label: '☀️ Light Theme', icon: '☀️' },
    { value: Theme.NIGHT, label: '🌃 Night Theme', icon: '🌃' },
    { value: Theme.AUTO, label: '🤖 Auto (System)', icon: '🤖' },
  ];

  const languageOptions: DropdownOption[] = [
    { value: 'en', label: '🇺🇸 English', icon: '🇺🇸' },
    { value: 'es', label: '🇪🇸 Español', icon: '🇪🇸' },
    { value: 'fr', label: '🇫🇷 Français', icon: '🇫🇷' },
    { value: 'de', label: '🇩🇪 Deutsch', icon: '🇩🇪' },
    { value: 'jp', label: '🇯🇵 日本語', icon: '🇯🇵' },
  ];

  const fillStyleOptions: DropdownOption[] = [
    { value: 'hachure', label: 'Hachure' },
    { value: 'solid', label: 'Solid' },
    { value: 'zigzag', label: 'Zigzag' },
    { value: 'cross-hatch', label: 'Cross-Hatch' },
    { value: 'dots', label: 'Dots' },
    { value: 'sunburst', label: 'Sunburst' },
    { value: 'dashed', label: 'Dashed' },
    { value: 'scrawl', label: 'Scrawl' },
  ];

  return (
    <div className="p-6 h-full overflow-auto font-mono bg-gradient-to-br from-background-primary/95 to-surface/90">
      {/* Modal Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-primary/30">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <span className="text-2xl">👁️</span>
          </div>
          <div>
            <h1 className="m-0 text-text-primary text-2xl font-bold text-shadow">
              Visual
            </h1>
            <p className="mt-1 mb-0 text-text-secondary text-sm font-normal">
              Display and theme preferences
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
            border: '1px solid rgba(156, 39, 176, 0.2)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(156, 39, 176, 0.1)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(156, 39, 176, 0.15)',
              borderColor: 'rgba(156, 39, 176, 0.3)'
            }
          }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
              <span className="text-lg">🎨</span>
            </div>
            <h3 className="m-0 text-text-primary text-lg font-semibold">
              Theme & UI
            </h3>
          </div>
          <div className="flex flex-col gap-4">
            <SettingDropdown
              label="Theme"
              value={unifiedSettings.visual.theme}
              options={themeOptions}
              onChange={(v) => updateVisualSettings({ theme: v as Theme })}
              description="Color scheme preference"
            />
            <SettingDropdown
              label="Language"
              value={unifiedSettings.visual.language}
              options={languageOptions}
              onChange={(v) => updateVisualSettings({ language: v as string })}
              description="Interface language"
            />
          </div>
        </MaterialCard>

        <MaterialCard
          sx={{
            backgroundColor: 'rgba(25, 23, 36, 0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(156, 39, 176, 0.2)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(156, 39, 176, 0.1)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(156, 39, 176, 0.15)',
              borderColor: 'rgba(156, 39, 176, 0.3)'
            }
          }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
              <span className="text-lg">♿</span>
            </div>
            <h3 className="m-0 text-text-primary text-lg font-semibold">
              Accessibility
            </h3>
          </div>
          <div className="flex flex-col gap-4">
            <SettingCheckbox
              label="High Contrast"
              checked={unifiedSettings.visual.highContrast}
              onChange={(c) => updateVisualSettings({ highContrast: c })}
              description="Increase contrast for readability"
            />
            <SettingCheckbox
              label="Reduce Motion"
              checked={unifiedSettings.visual.reduceMotion}
              onChange={(c) => updateVisualSettings({ reduceMotion: c })}
              description="Minimize non-essential animations"
            />
            <SettingCheckbox
              label="Show Grid"
              checked={unifiedSettings.visual.showGrid}
              onChange={(c) => updateVisualSettings({ showGrid: c })}
              description="Debug/display coordinate grid"
            />
            <SettingCheckbox
              label="Show Particles"
              checked={unifiedSettings.visual.showParticles}
              onChange={(c) => updateVisualSettings({ showParticles: c })}
              description="Enable particle effects"
            />
            <SettingCheckbox
              label="Show Health Bars"
              checked={unifiedSettings.visual.showHealthBars}
              onChange={(c) => updateVisualSettings({ showHealthBars: c })}
              description="Display entity health bars"
            />
          </div>
        </MaterialCard>

        <MaterialCard
          sx={{
            backgroundColor: 'rgba(25, 23, 36, 0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(156, 39, 176, 0.2)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(156, 39, 176, 0.1)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(156, 39, 176, 0.15)',
              borderColor: 'rgba(156, 39, 176, 0.3)'
            }
          }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
              <span className="text-lg">🎞️</span>
            </div>
            <h3 className="m-0 text-text-primary text-lg font-semibold">
              Animation & Drawing Style
            </h3>
          </div>
          <div className="flex flex-col gap-4">
            <SettingSlider
              label="Animation Speed"
              value={unifiedSettings.animations.animationSpeed}
              min={0.1} max={3} step={0.1}
              onChange={(v) => updateAnimationSettings({ animationSpeed: v })}
              unit="x" showReset resetValue={1.0}
              description="Global animation speed multiplier"
            />
            <SettingSlider
              label="Particle Count"
              value={unifiedSettings.animations.particleCount}
              min={0} max={20} step={1}
              onChange={(v) => updateAnimationSettings({ particleCount: v })}
              showReset resetValue={5}
              description="Number of effect particles"
            />
            <SettingSlider
              label="Roughness"
              value={unifiedSettings.animations.roughness}
              min={0} max={5} step={0.1}
              onChange={(v) => updateAnimationSettings({ roughness: v })}
              showReset resetValue={1.5}
              description="Hand-drawn roughness"
            />
            <SettingSlider
              label="Bowing"
              value={unifiedSettings.animations.bowing}
              min={0} max={5} step={0.1}
              onChange={(v) => updateAnimationSettings({ bowing: v })}
              showReset resetValue={1.2}
              description="Curvature of lines"
            />
            <SettingSlider
              label="Fill Weight"
              value={unifiedSettings.animations.fillWeight}
              min={0} max={5} step={0.1}
              onChange={(v) => updateAnimationSettings({ fillWeight: v })}
              showReset resetValue={1.5}
              description="Thickness of fills"
            />
            <SettingSlider
              label="Hachure Angle"
              value={unifiedSettings.animations.hachureAngle}
              min={0} max={180} step={15}
              onChange={(v) => updateAnimationSettings({ hachureAngle: v })}
              unit="°" showReset resetValue={45}
              description="Angle for hatching"
            />
            <SettingSlider
              label="Hachure Gap"
              value={unifiedSettings.animations.hachureGap}
              min={1} max={20} step={1}
              onChange={(v) => updateAnimationSettings({ hachureGap: v })}
              showReset resetValue={4}
              description="Spacing of hatch lines"
            />
            <SettingDropdown
              label="Fill Style"
              value={unifiedSettings.animations.fillStyle || 'hachure'}
              options={fillStyleOptions}
              onChange={(v) => updateAnimationSettings({ fillStyle: String(v) })}
              description="Rough.js fill style"
            />
            <SettingSlider
              label="Random Seed"
              value={unifiedSettings.animations.seed || 1}
              min={1} max={10000} step={1}
              onChange={(v) => updateAnimationSettings({ seed: v })}
              showReset resetValue={1}
              description="Seed for deterministic randomness"
            />
          </div>
        </MaterialCard>
      </div>
    </div>
  );
};

export default VisualModal;
