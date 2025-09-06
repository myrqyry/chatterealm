import React, { useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import { SettingSlider, SettingCheckbox, SettingDropdown, SettingGroup } from './shared/settings';
import { DropdownOption } from './shared/settings/SettingDropdown';

// Import shared types
import type { NotificationType } from '../../../shared/src/types/game';
import { MovementStyle, Theme } from '../../../shared/src/types/game.ts';

const SettingsPanel: React.FC = () => {
  const { unifiedSettings, exportSettings, importSettings, resetAllSettings } = useGameStore();

  // Tab navigation state
  const [activeTab, setActiveTab] = useState('gameplay');

  // Import/Export state
  const [importText, setImportText] = useState('');
  const [showImportExport, setShowImportExport] = useState(false);

  // Update functions for each setting category
  const updateGameSettings = useGameStore(state => state.updateGameSettings);
  const updateAudioSettings = useGameStore(state => state.updateAudioSettings);
  const updateNotificationSettings = useGameStore(state => state.updateNotificationSettings);
  const updateVisualSettings = useGameStore(state => state.updateVisualSettings);
  const updateWorldSettings = useGameStore(state => state.updateWorldSettings);
  const updateAnimationSettings = useGameStore(state => state.updateAnimationSettings);

  // Calculate if notification type is enabled
  const isNotificationEnabled = (types: NotificationType[], type: NotificationType) => {
    return types.includes(type);
  };

  // Toggle notification type
  const toggleNotificationType = (currentTypes: NotificationType[], type: NotificationType) => {
    return currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
  };

  // Movement style options
  const movementStyleOptions: DropdownOption[] = [
    { value: MovementStyle.GRID, label: 'Grid Movement' },
    { value: MovementStyle.FREE, label: 'Free Movement' },
    { value: MovementStyle.HYBRID, label: 'Hybrid Movement' },
  ];

  // Theme options
  const themeOptions: DropdownOption[] = [
    { value: Theme.DARK, label: '🌙 Dark Theme', icon: '🌙' },
    { value: Theme.LIGHT, label: '☀️ Light Theme', icon: '☀️' },
    { value: Theme.AUTO, label: '🤖 Auto (System)', icon: '🤖' },
  ];

  // Language options
  const languageOptions: DropdownOption[] = [
    { value: 'en', label: '🇺🇸 English', icon: '🇺🇸' },
    { value: 'es', label: '🇪🇸 Español', icon: '🇪🇸' },
    { value: 'fr', label: '🇫🇷 Français', icon: '🇫🇷' },
    { value: 'de', label: '🇩🇪 Deutsch', icon: '🇩🇪' },
    { value: 'jp', label: '🇯🇵 日本語', icon: '🇯🇵' },
  ];

  // Rough.js fill style options
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

  const handleExport = () => {
    const settingsData = exportSettings();
    navigator.clipboard.writeText(settingsData);
    alert('Settings exported to clipboard!');
  };

  const handleImport = () => {
    if (importText.trim()) {
      const success = importSettings(importText);
      if (success) {
        alert('Settings imported successfully!');
        setImportText('');
        setShowImportExport(false);
      } else {
        alert('Failed to import settings. Please check the format.');
      }
    }
  };

  const handleResetAll = () => {
    if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
      resetAllSettings();
      alert('All settings reset to defaults!');
    }
  };

  return (
    <div className="settings-panel">
      <div className="settings-header">
        <h2>⚙️ Game Settings</h2>
        <div className="settings-actions">
          <button
            className="btn-secondary"
            onClick={() => setShowImportExport(!showImportExport)}
          >
            {showImportExport ? 'Hide' : 'Import/Export'}
          </button>
          <button className="btn-danger" onClick={handleResetAll}>
            Reset All
          </button>
        </div>
      </div>

      {/* Import/Export Section */}
      {showImportExport && (
        <div className="import-export-section">
          <div className="control-group">
            <button className="btn-primary" onClick={handleExport}>
              📤 Export Settings
            </button>
          </div>

          <div className="control-group">
            <label>Import Settings</label>
            <textarea
              className="settings-textarea"
              placeholder="Paste your settings JSON here..."
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              rows={4}
            />
            <button className="btn-primary" onClick={handleImport}>
              📥 Import Settings
            </button>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="settings-tabs">
        <button
          className={`tab-button ${activeTab === 'gameplay' ? 'active' : ''}`}
          onClick={() => setActiveTab('gameplay')}
        >
          🎮 Gameplay
        </button>
        <button
          className={`tab-button ${activeTab === 'audio_sound' ? 'active' : ''}`}
          onClick={() => setActiveTab('audio_sound')}
        >
          🎵 Audio & Sound
        </button>
        <button
          className={`tab-button ${activeTab === 'display' ? 'active' : ''}`}
          onClick={() => setActiveTab('display')}
        >
          👁️ Display & Visual
        </button>
        <button
          className={`tab-button ${activeTab === 'advanced' ? 'active' : ''}`}
          onClick={() => setActiveTab('advanced')}
        >
          ⚙️ Advanced
        </button>
      </div>

      {/* Tab Content */}
      <div className="settings-content">
        {activeTab === 'gameplay' && (
          <div className="settings-tab-content">
            <h3>🎮 General Game Settings</h3>

            <SettingGroup title="Gameplay" icon="🎯">
              <SettingCheckbox
                label="Enable Auto-Save"
                checked={unifiedSettings.game.autoSaveEnabled}
                onChange={(checked) => updateGameSettings({ autoSaveEnabled: checked })}
                description="Automatically save your progress periodically"
              />

              <SettingCheckbox
                label="Show Tutorials"
                checked={unifiedSettings.game.tutorialEnabled}
                onChange={(checked) => updateGameSettings({ tutorialEnabled: checked })}
                description="Display helpful hints and tutorials"
              />

              <SettingCheckbox
                label="Show Mini-map"
                checked={unifiedSettings.game.minimapEnabled}
                onChange={(checked) => updateGameSettings({ minimapEnabled: checked })}
                description="Display a small world overview"
              />
            </SettingGroup>

            <SettingGroup title="Display" icon="👁️">
              <SettingCheckbox
                label="Show NPC Names"
                checked={unifiedSettings.game.showNPCNames}
                onChange={(checked) => updateGameSettings({ showNPCNames: checked })}
                description="Display names above NPCs"
              />

              <SettingCheckbox
                label="Show Item Names"
                checked={unifiedSettings.game.showItemNames}
                onChange={(checked) => updateGameSettings({ showItemNames: checked })}
                description="Display names above items on ground"
              />

              <SettingDropdown
                label="Movement Style"
                value={unifiedSettings.game.movementStyle}
                options={movementStyleOptions}
                onChange={(value) => updateGameSettings({ movementStyle: value as MovementStyle })}
                description="Choose how players move across the world"
              />
            </SettingGroup>

            <SettingGroup title="Combat" icon="⚔️">
              <SettingCheckbox
                label="Show Damage Numbers"
                checked={unifiedSettings.game.showDamageNumbers}
                onChange={(checked) => updateGameSettings({ showDamageNumbers: checked })}
                description="Display damage amounts in combat"
              />

              <SettingCheckbox
                label="Enable Auto-Combat"
                checked={unifiedSettings.game.autoCombatEnabled}
                onChange={(checked) => updateGameSettings({ autoCombatEnabled: checked })}
                description="Automatically engage if attacked"
              />
            </SettingGroup>
          </div>
        )}

        {activeTab === 'audio_sound' && (
          <div className="settings-tab-content">
            <h3>🎵 Audio & Sound</h3>

            <SettingGroup title="Volume Controls" icon="🔊">
              <SettingSlider
                label="Master Volume"
                value={unifiedSettings.audio.audioMasterVolume}
                min={0}
                max={100}
                step={5}
                onChange={(value) => updateAudioSettings({ audioMasterVolume: value })}
                unit="%"
                showReset
                resetValue={80}
                description="Overall audio level"
              />

              <SettingSlider
                label="SFX Volume"
                value={unifiedSettings.audio.sfxVolume}
                min={0}
                max={100}
                step={5}
                onChange={(value) => updateAudioSettings({ sfxVolume: value })}
                unit="%"
                showReset
                resetValue={70}
                description="Sound effects volume"
              />

              <SettingSlider
                label="Music Volume"
                value={unifiedSettings.audio.musicVolume}
                min={0}
                max={100}
                step={5}
                onChange={(value) => updateAudioSettings({ musicVolume: value })}
                unit="%"
                showReset
                resetValue={60}
                description="Background music volume"
              />
            </SettingGroup>

            <SettingGroup title="Audio Toggles" icon="🔈">
              <SettingCheckbox
                label="Enable Sound Effects"
                checked={unifiedSettings.audio.soundEnabled}
                onChange={(checked) => updateAudioSettings({ soundEnabled: checked })}
                description="Play sound effects"
              />

              <SettingCheckbox
                label="Enable Background Music"
                checked={unifiedSettings.audio.musicEnabled}
                onChange={(checked) => updateAudioSettings({ musicEnabled: checked })}
                description="Play background music"
              />
            </SettingGroup>

            <SettingGroup title="Notifications" icon="🔔">
              <SettingCheckbox
                label="Desktop Notifications"
                checked={unifiedSettings.notifications.desktopNotifications}
                onChange={(checked) => updateNotificationSettings({ desktopNotifications: checked })}
                description="Allow browser system notifications"
              />

              <SettingCheckbox
                label="Sound Notifications"
                checked={unifiedSettings.notifications.soundNotifications}
                onChange={(checked) => updateNotificationSettings({ soundNotifications: checked })}
                description="Play sounds for important game events"
              />

              <SettingCheckbox
                label="Battle Notifications"
                checked={unifiedSettings.notifications.battleNotifications}
                onChange={(checked) => updateNotificationSettings({ battleNotifications: checked })}
                description="Notify when combat starts or ends"
              />

              <SettingCheckbox
                label="System Notifications"
                checked={unifiedSettings.notifications.systemNotifications}
                onChange={(checked) => updateNotificationSettings({ systemNotifications: checked })}
                description="World events, system announcements, etc."
              />
            </SettingGroup>
          </div>
        )}

        {activeTab === 'display' && (
          <div className="settings-tab-content">
            <h3>�️ Display & Visual</h3>

            <SettingGroup title="Theme & Appearance" icon="🎨">
              <SettingDropdown
                label="Theme"
                value={unifiedSettings.visual.theme}
                options={themeOptions}
                onChange={(value) => updateVisualSettings({ theme: value as Theme })}
                description="Choose your preferred color scheme"
              />

              <SettingSlider
                label="Font Size"
                value={unifiedSettings.visual.fontSize}
                min={75}
                max={150}
                step={5}
                onChange={(value) => updateVisualSettings({ fontSize: value })}
                unit="%"
                showReset
                resetValue={100}
                description="Scale text throughout the interface"
              />

              <SettingDropdown
                label="Language"
                value={unifiedSettings.visual.language}
                options={languageOptions}
                onChange={(value) => updateVisualSettings({ language: value })}
                description="Select your preferred language"
              />
            </SettingGroup>

            <SettingGroup title="Accessibility & Motion" icon="♿">
              <SettingCheckbox
                label="High Contrast"
                checked={unifiedSettings.visual.highContrast}
                onChange={(checked) => updateVisualSettings({ highContrast: checked })}
                description="Better visibility for accessibility"
              />

              <SettingCheckbox
                label="Reduce Motion"
                checked={unifiedSettings.visual.reduceMotion}
                onChange={(checked) => updateVisualSettings({ reduceMotion: checked })}
                description="Minimize animations and transitions"
              />

              <SettingSlider
                label="Animation Speed"
                value={unifiedSettings.animations.animationSpeed}
                min={0.1}
                max={3.0}
                step={0.1}
                onChange={(value) => updateAnimationSettings({ animationSpeed: value })}
                unit="x"
                showReset
                resetValue={1.0}
                description="Speed multiplier for all animations"
              />

              <SettingSlider
                label="Particle Count"
                value={unifiedSettings.animations.particleCount}
                min={0}
                max={20}
                step={1}
                onChange={(value) => updateAnimationSettings({ particleCount: value })}
                showReset
                resetValue={5}
                description="Number of particles in effects"
              />
            </SettingGroup>

            <SettingGroup title="Display Elements" icon="📺">
              <SettingCheckbox
                label="Show Grid"
                checked={unifiedSettings.visual.showGrid}
                onChange={(checked) => updateVisualSettings({ showGrid: checked })}
                description="Display coordinate grid on world"
              />

              <SettingCheckbox
                label="Show Particles"
                checked={unifiedSettings.visual.showParticles}
                onChange={(checked) => updateVisualSettings({ showParticles: checked })}
                description="Enable particle effects"
              />

              <SettingCheckbox
                label="Show Health Bars"
                checked={unifiedSettings.visual.showHealthBars}
                onChange={(checked) => updateVisualSettings({ showHealthBars: checked })}
                description="Display health bars above entities"
              />
            </SettingGroup>
          </div>
        )}

        {activeTab === 'advanced' && (
          <div className="settings-tab-content">
            <h3>⚙️ Advanced Settings</h3>

            <SettingGroup title="World Generation" icon="🌍">
              <SettingSlider
                label="World Width"
                value={unifiedSettings.world.worldWidth}
                min={20}
                max={100}
                step={5}
                onChange={(value) => updateWorldSettings({ worldWidth: value })}
                unit=" tiles"
                showReset
                resetValue={40}
                description="Width of the game world"
              />

              <SettingSlider
                label="World Height"
                value={unifiedSettings.world.worldHeight}
                min={15}
                max={75}
                step={3}
                onChange={(value) => updateWorldSettings({ worldHeight: value })}
                unit=" tiles"
                showReset
                resetValue={30}
                description="Height of the game world"
              />
            </SettingGroup>

            <SettingGroup title="Environment Animation" icon="🌿">
              <SettingSlider
                label="Grass Wave Speed"
                value={unifiedSettings.world.grassWaveSpeed}
                min={0}
                max={1}
                step={0.1}
                onChange={(value) => updateWorldSettings({ grassWaveSpeed: value })}
                showReset
                resetValue={0.1}
                description="Speed of grass waves animation"
              />

              <SettingSlider
                label="Tree Sway Speed"
                value={unifiedSettings.world.treeSwaySpeed}
                min={0}
                max={1}
                step={0.1}
                onChange={(value) => updateWorldSettings({ treeSwaySpeed: value })}
                showReset
                resetValue={0.03}
                description="Speed of tree swaying animation"
              />

              <SettingSlider
                label="Flower Spawn Rate"
                value={unifiedSettings.world.flowerSpawnRate}
                min={0}
                max={1}
                step={0.1}
                onChange={(value) => updateWorldSettings({ flowerSpawnRate: value })}
                showReset
                resetValue={0.01}
                description="Rate at which flowers spawn"
              />

              <SettingSlider
                label="Wind Speed"
                value={unifiedSettings.world.windSpeed}
                min={0}
                max={1}
                step={0.1}
                onChange={(value) => updateWorldSettings({ windSpeed: value })}
                showReset
                resetValue={0.02}
                description="Global wind speed for animations"
              />
            </SettingGroup>

            <SettingGroup title="Drawing Style (Advanced)" icon="🎨">
              <SettingSlider
                label="Roughness"
                value={unifiedSettings.animations.roughness}
                min={0}
                max={5}
                step={0.1}
                onChange={(value) => updateAnimationSettings({ roughness: value })}
                showReset
                resetValue={1.5}
                description="Roughness of hand-drawn style"
              />

              <SettingSlider
                label="Bowing"
                value={unifiedSettings.animations.bowing}
                min={0}
                max={5}
                step={0.1}
                onChange={(value) => updateAnimationSettings({ bowing: value })}
                showReset
                resetValue={1.2}
                description="Curvature of drawn lines"
              />

              <SettingSlider
                label="Fill Weight"
                value={unifiedSettings.animations.fillWeight}
                min={0}
                max={5}
                step={0.1}
                onChange={(value) => updateAnimationSettings({ fillWeight: value })}
                showReset
                resetValue={1.5}
                description="Thickness of shape fills"
              />

              <SettingSlider
                label="Hachure Angle"
                value={unifiedSettings.animations.hachureAngle}
                min={0}
                max={180}
                step={15}
                onChange={(value) => updateAnimationSettings({ hachureAngle: value })}
                unit="°"
                showReset
                resetValue={45}
                description="Angle of cross-hatching patterns"
              />

              <SettingSlider
                label="Hachure Gap"
                value={unifiedSettings.animations.hachureGap}
                min={1}
                max={20}
                step={1}
                onChange={(value) => updateAnimationSettings({ hachureGap: value })}
                showReset
                resetValue={4}
                description="Spacing between hatched lines"
              />

              <SettingDropdown
                label="Fill Style"
                value={unifiedSettings.animations.fillStyle}
                options={fillStyleOptions}
                onChange={(value) => updateAnimationSettings({ fillStyle: value })}
                description="Style of the fill for shapes"
              />

              <SettingSlider
                label="Random Seed"
                value={unifiedSettings.animations.seed}
                min={1}
                max={10000}
                step={1}
                onChange={(value) => updateAnimationSettings({ seed: value })}
                showReset
                resetValue={1}
                description="Seed for rough.js randomness (changes appearance)"
              />
            </SettingGroup>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPanel;
