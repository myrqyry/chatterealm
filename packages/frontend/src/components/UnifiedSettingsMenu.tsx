import React, { useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import {
  SettingSlider,
  SettingCheckbox,
  SettingDropdown,
  SettingGroup,
  MaterialMultiSelect,
} from './shared/settings';
import { DropdownOption } from './shared/settings/SettingDropdown';
import { MovementStyle, Theme, PlayerClass } from 'shared';

/**
 * UnifiedSettingsMenu
 * A consolidated menu that merges: Gameplay Settings, Audio, Visual/Display, World/Advanced,
 * Actions (movement / join / cataclysm / pickup / regenerate), and World Info/Dev diagnostics.
 *
 * This replaces the separate tabs previously spread across: GameControls, WorldControls,
 * AnimationControls, and SettingsPanel. It keeps the same underlying store update functions
 * (so all state continuity is preserved) while providing a single coherent navigation model.
 *
 * Structure:
 *  - High-level primary tabs: Overview, Gameplay, Audio, Visual, World & Advanced, Actions & Debug
 *  - Each tab internally groups related settings via SettingGroup for clarity
 */
const UnifiedSettingsMenu: React.FC = () => {
  const {
    unifiedSettings,
    updateGameSettings,
    updateAudioSettings,
    updateNotificationSettings,
    updateVisualSettings,
    updateWorldSettings,
    updateAnimationSettings,
    gameWorld,
    currentPlayer,
    joinGame,
    movePlayer,
    startCataclysm,
    pickupItem,
    regenerateWorld,
    gameMessage,
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [importText, setImportText] = useState('');
  const [showImportExport, setShowImportExport] = useState(false);

  const exportSettings = useGameStore(s => s.exportSettings);
  const importSettings = useGameStore(s => s.importSettings);
  const resetAllSettings = useGameStore(s => s.resetAllSettings);

  // Dropdown option definitions
  const movementStyleOptions: DropdownOption[] = [
    { value: MovementStyle.GRID, label: 'Grid Movement' },
    { value: MovementStyle.FREE, label: 'Free Movement' },
    { value: MovementStyle.HYBRID, label: 'Hybrid Movement' },
  ];

  const themeOptions: DropdownOption[] = [
    { value: Theme.DARK, label: '🌙 Dark Theme', icon: '🌙' },
    { value: Theme.LIGHT, label: '☀️ Light Theme', icon: '☀️' },
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

  // Import / Export handlers (reuse logic from SettingsPanel)
  const handleExport = () => {
    const data = exportSettings();
    navigator.clipboard.writeText(data);
    alert('Settings exported to clipboard!');
  };

  const handleImport = () => {
    if (importText.trim()) {
      const success = importSettings(importText.trim());
      if (success) {
        alert('Settings imported successfully!');
        setImportText('');
        setShowImportExport(false);
      } else {
        alert('Import failed. Check JSON format.');
      }
    }
  };

  const handleResetAll = () => {
    if (confirm('Reset ALL settings to defaults?')) {
      resetAllSettings();
      alert('All settings reset.');
    }
  };

  // Action handlers mapped to store actions
  const handleJoin = () => joinGame({
    id: `player_${Date.now()}`,
    displayName: 'Player' + Math.floor(Math.random() * 1000),
    class: PlayerClass.KNIGHT,
    avatar: '🙂'
  });
  const handleMove = (dir: 'up' | 'down' | 'left' | 'right') => movePlayer(dir);
  const handlePickup = () => pickupItem('nearest'); // Assuming backend interprets 'nearest'
  const handleCataclysm = () => startCataclysm();
  const handleRegenerate = () => regenerateWorld();

  const notificationTypeOptions = [
    { value: 'desktop', label: 'Desktop' },
    { value: 'sound', label: 'Sound' },
    { value: 'ingame', label: 'In-Game' },
  ];

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Inter, Roboto, sans-serif'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px',
        paddingBottom: '6px',
        borderBottom: '1px solid var(--color-outline)'
      }}>
        <h3 style={{
          color: 'var(--color-text-primary)',
          fontSize: '1em',
          fontWeight: '600',
          margin: 0
        }}>
          ⚙️ Settings
        </h3>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            style={{
              padding: '3px 6px',
              background: 'var(--color-secondary-container)',
              color: 'var(--color-on-secondary-container)',
              border: '1px solid var(--color-outline)',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.7em',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            onClick={() => setShowImportExport(v => !v)}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-secondary)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--color-secondary-container)'}
          >
            {showImportExport ? 'Hide' : 'I/E'}
          </button>
          <button
            style={{
              padding: '3px 6px',
              background: 'var(--color-error-container)',
              color: 'var(--color-on-error-container)',
              border: '1px solid var(--color-error)',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.7em',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            onClick={handleResetAll}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-error)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--color-error-container)'}
          >
            Reset
          </button>
        </div>
      </div>

      {showImportExport && (
        <div className="import-export-panel">
          <div className="control-group">
            <button className="btn-primary" onClick={handleExport}>📤 Export Settings</button>
          </div>
          <div className="control-group">
            <label>Import Settings JSON</label>
            <textarea
              className="settings-textarea"
              rows={4}
              placeholder="Paste exported JSON here..."
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
            />
            <button className="btn-primary" onClick={handleImport}>📥 Import</button>
          </div>
        </div>
      )}

      <div style={{
        display: 'flex',
        gap: '6px',
        marginBottom: '16px',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        {[
          { id: 'overview', label: '🧭 Overview' },
          { id: 'gameplay', label: '🎮 Gameplay' },
          { id: 'audio', label: '🎵 Audio' },
          { id: 'visual', label: '👁️ Visual' },
          { id: 'world', label: '🌍 World & Advanced' },
          { id: 'actions', label: '⚔️ Actions & Debug' },
        ].map(t => (
          <button
            key={t.id}
            style={{
              padding: '8px 16px',
              background: activeTab === t.id ? 'var(--color-primary)' : 'var(--color-surface-variant)',
              color: activeTab === t.id ? 'var(--color-on-primary)' : 'var(--color-text-secondary)',
              border: activeTab === t.id ? '1px solid var(--color-primary)' : '1px solid var(--color-outline)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.8em',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              minWidth: '120px',
              textAlign: 'center',
              fontFamily: 'inherit'
            }}
            onClick={() => setActiveTab(t.id)}
            onMouseEnter={(e) => {
              if (activeTab !== t.id) {
                e.currentTarget.style.background = 'var(--color-primary-container)';
                e.currentTarget.style.color = 'var(--color-on-primary-container)';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== t.id) {
                e.currentTarget.style.background = 'var(--color-surface-variant)';
                e.currentTarget.style.color = 'var(--color-text-secondary)';
              }
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
        padding: '8px 0'
      }}>
        {activeTab === 'overview' && (
          <div style={{ padding: '0 8px' }}>
            <div style={{
              background: 'var(--color-surface-variant)',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '12px',
              border: '1px solid var(--color-outline-variant)'
            }}>
              <h4 style={{
                color: 'var(--color-text-primary)',
                fontSize: '0.9em',
                fontWeight: '600',
                margin: '0 0 8px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                🗺️ World Snapshot
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                fontSize: '0.8em'
              }}>
                <div style={{ color: 'var(--color-text-secondary)' }}>
                  <strong>Phase:</strong> {gameWorld?.phase || 'N/A'}
                </div>
                <div style={{ color: 'var(--color-text-secondary)' }}>
                  <strong>Players:</strong> {gameWorld ? gameWorld.players.length : 0}
                </div>
                <div style={{ color: 'var(--color-text-secondary)' }}>
                  <strong>NPCs:</strong> {gameWorld ? gameWorld.npcs.length : 0}
                </div>
                <div style={{ color: 'var(--color-text-secondary)' }}>
                  <strong>Items:</strong> {gameWorld ? gameWorld.items.length : 0}
                </div>
                <div style={{
                  color: 'var(--color-text-secondary)',
                  gridColumn: '1 / -1'
                }}>
                  <strong>World Age:</strong> {gameWorld?.worldAge || 0} cycles
                </div>
              </div>
            </div>
            {currentPlayer && (
              <div style={{
                background: 'var(--color-surface-variant)',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '12px',
                border: '1px solid var(--color-outline-variant)'
              }}>
                <h4 style={{
                  color: 'var(--color-text-primary)',
                  fontSize: '0.9em',
                  fontWeight: '600',
                  margin: '0 0 8px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  🧑 Current Player
                </h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                  fontSize: '0.8em'
                }}>
                  <div style={{ color: 'var(--color-text-secondary)' }}>
                    <strong>Name:</strong> {currentPlayer.name}
                  </div>
                  <div style={{ color: 'var(--color-text-secondary)' }}>
                    <strong>Health:</strong> {currentPlayer.health}
                  </div>
                  <div style={{ color: 'var(--color-text-secondary)' }}>
                    <strong>Level:</strong> {currentPlayer.level}
                  </div>
                  <div style={{ color: 'var(--color-text-secondary)' }}>
                    <strong>Pos:</strong> {currentPlayer.position.x},{currentPlayer.position.y}
                  </div>
                </div>
              </div>
            )}
            {gameMessage && (
              <div style={{
                background: 'var(--color-warning-container)',
                color: 'var(--color-on-warning-container)',
                borderRadius: '8px',
                padding: '12px',
                border: '1px solid var(--color-warning)',
                fontSize: '0.85em'
              }}>
                {gameMessage}
              </div>
            )}
          </div>
        )}

        {activeTab === 'gameplay' && (
          <div className="tab-panel">
            <SettingGroup title="Gameplay" icon="🎯">
              <SettingCheckbox
                label="Enable Auto-Save"
                checked={unifiedSettings.game.autoSaveEnabled}
                onChange={(c) => updateGameSettings({ autoSaveEnabled: c })}
                description="Automatically save progress periodically"
              />
              <SettingCheckbox
                label="Show Tutorials"
                checked={unifiedSettings.game.tutorialEnabled}
                onChange={(c) => updateGameSettings({ tutorialEnabled: c })}
                description="Display tutorial hints"
              />
              <SettingCheckbox
                label="Show Mini-map"
                checked={unifiedSettings.game.minimapEnabled}
                onChange={(c) => updateGameSettings({ minimapEnabled: c })}
                description="Toggle mini-map display"
              />
              <SettingDropdown
                label="Movement Style"
                value={unifiedSettings.game.movementStyle}
                options={movementStyleOptions}
                onChange={(v) => updateGameSettings({ movementStyle: v as MovementStyle })}
                description="How the player traverses the world"
              />
            </SettingGroup>
            <SettingGroup title="Combat" icon="⚔️">
              <SettingCheckbox
                label="Show Damage Numbers"
                checked={unifiedSettings.game.showDamageNumbers}
                onChange={(c) => updateGameSettings({ showDamageNumbers: c })}
                description="Visual floating damage indicators"
              />
              <SettingCheckbox
                label="Enable Auto-Combat"
                checked={unifiedSettings.game.autoCombatEnabled}
                onChange={(c) => updateGameSettings({ autoCombatEnabled: c })}
                description="Auto retaliate when attacked"
              />
            </SettingGroup>
          </div>
        )}

        {activeTab === 'audio' && (
          <div className="tab-panel">
            <SettingGroup title="Volume" icon="🔊">
              <SettingSlider
                label="Master Volume"
                value={unifiedSettings.audio.audioMasterVolume}
                min={0} max={100} step={5}
                onChange={(v) => updateAudioSettings({ audioMasterVolume: v })}
                unit="%" showReset resetValue={80}
                description="Global mix level"
              />
              <SettingSlider
                label="SFX Volume"
                value={unifiedSettings.audio.sfxVolume}
                min={0} max={100} step={5}
                onChange={(v) => updateAudioSettings({ sfxVolume: v })}
                unit="%" showReset resetValue={70}
                description="Sound effects loudness"
              />
              <SettingSlider
                label="Music Volume"
                value={unifiedSettings.audio.musicVolume}
                min={0} max={100} step={5}
                onChange={(v) => updateAudioSettings({ musicVolume: v })}
                unit="%" showReset resetValue={60}
                description="Background soundtrack volume"
              />
            </SettingGroup>
            <SettingGroup title="Audio Toggles" icon="🔈">
              <SettingCheckbox
                label="Enable SFX"
                checked={unifiedSettings.audio.soundEnabled}
                onChange={(c) => updateAudioSettings({ soundEnabled: c })}
                description="Play sound effects"
              />
              <SettingCheckbox
                label="Enable Music"
                checked={unifiedSettings.audio.musicEnabled}
                onChange={(c) => updateAudioSettings({ musicEnabled: c })}
                description="Play background music"
              />
            </SettingGroup>
            <SettingGroup title="Notifications" icon="🔔">
              <SettingCheckbox
                label="Desktop Notifications"
                checked={unifiedSettings.notifications.desktopNotifications}
                onChange={(c) => updateNotificationSettings({ desktopNotifications: c })}
                description="Show desktop notifications"
              />
              <SettingCheckbox
                label="Sound Notifications"
                checked={unifiedSettings.notifications.soundNotifications}
                onChange={(c) => updateNotificationSettings({ soundNotifications: c })}
                description="Play sound on notifications"
              />
              <SettingCheckbox
                label="Battle Notifications"
                checked={unifiedSettings.notifications.battleNotifications}
                onChange={(c) => updateNotificationSettings({ battleNotifications: c })}
                description="Notify on battle events"
              />
              <SettingCheckbox
                label="System Notifications"
                checked={unifiedSettings.notifications.systemNotifications}
                onChange={(c) => updateNotificationSettings({ systemNotifications: c })}
                description="General system notifications"
              />
              {/* Multi-select event notification types */}
              <MaterialMultiSelect
                label="Player Join Notifications"
                value={unifiedSettings.notifications.playerJoinNotifications}
                options={notificationTypeOptions}
                onChange={(vals) => updateNotificationSettings({ playerJoinNotifications: vals as any })}
                description="Notification channels when players join"
              />
              <MaterialMultiSelect
                label="Item Drop Notifications"
                value={unifiedSettings.notifications.itemDropNotifications}
                options={notificationTypeOptions}
                onChange={(vals) => updateNotificationSettings({ itemDropNotifications: vals as any })}
                description="Notification channels for item drops"
              />
              <MaterialMultiSelect
                label="Level Up Notifications"
                value={unifiedSettings.notifications.levelUpNotifications}
                options={notificationTypeOptions}
                onChange={(vals) => updateNotificationSettings({ levelUpNotifications: vals as any })}
                description="Notification channels on level up"
              />
              <MaterialMultiSelect
                label="Cataclysm Notifications"
                value={unifiedSettings.notifications.cataclysmNotifications}
                options={notificationTypeOptions}
                onChange={(vals) => updateNotificationSettings({ cataclysmNotifications: vals as any })}
                description="Notification channels when cataclysm starts"
              />
            </SettingGroup>
          </div>
        )}

        {activeTab === 'visual' && (
          <div className="tab-panel">
            <SettingGroup title="Theme & UI" icon="🎨">
              <SettingDropdown
                label="Theme"
                value={unifiedSettings.visual.theme}
                options={themeOptions}
                onChange={(v) => updateVisualSettings({ theme: v as Theme })}
                description="Color scheme preference"
              />
              <SettingSlider
                label="Font Size"
                value={unifiedSettings.visual.fontSize}
                min={75} max={150} step={5}
                onChange={(v) => updateVisualSettings({ fontSize: v })}
                unit="%" showReset resetValue={100}
                description="Global UI text scaling"
              />
              <SettingDropdown
                label="Language"
                value={unifiedSettings.visual.language}
                options={languageOptions}
                onChange={(v) => updateVisualSettings({ language: String(v) })}
                description="Interface language"
              />
            </SettingGroup>
            <SettingGroup title="Accessibility" icon="♿">
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
            </SettingGroup>
            <SettingGroup title="Animation" icon="🎞️">
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
            </SettingGroup>
          </div>
        )}

        {activeTab === 'world' && (
          <div className="tab-panel">
            <SettingGroup title="World Dimensions" icon="📐">
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
            </SettingGroup>
            <SettingGroup title="Environment Animation" icon="🌿">
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
            </SettingGroup>
          </div>
        )}

        {activeTab === 'actions' && (
          <div className="tab-panel">
            <SettingGroup title="Player Actions" icon="🕹️">
              <div className="action-row">
                <button className="action-btn" onClick={handleJoin}>🔌 Join Game</button>
                <button className="action-btn" onClick={() => handleMove('up')}>↑</button>
                <button className="action-btn" onClick={() => handleMove('down')}>↓</button>
                <button className="action-btn" onClick={() => handleMove('left')}>←</button>
                <button className="action-btn" onClick={() => handleMove('right')}>→</button>
                <button className="action-btn" onClick={handlePickup}>🎒 Pick Up</button>
              </div>
            </SettingGroup>
            <SettingGroup title="World / Events" icon="🌩️">
              <div className="action-row">
                <button className="action-btn" onClick={handleRegenerate}>🌍 Regenerate World</button>
                <button className="action-btn" onClick={handleCataclysm}>⚡ Start Cataclysm</button>
              </div>
              {gameWorld && (
                <ul className="world-properties-list compact">
                  <li>Cataclysm Active: {gameWorld.cataclysmCircle.isActive ? 'Yes' : 'No'}</li>
                  {gameWorld.cataclysmCircle.isActive && (
                    <li>Radius: {gameWorld.cataclysmCircle.radius.toFixed(1)}</li>
                  )}
                  <li>Last Reset: {new Date(gameWorld.lastResetTime).toLocaleTimeString()}</li>
                </ul>
              )}
            </SettingGroup>
            <SettingGroup title="Developer (Animation Style)" icon="🔧" description="Advanced rough.js drawing style controls.">
              <SettingSlider
                label="Roughness"
                value={unifiedSettings.animations.roughness}
                min={0} max={5} step={0.1}
                onChange={(v) => updateAnimationSettings({ roughness: v })}
                showReset resetValue={1.5}
              />
              <SettingSlider
                label="Bowing"
                value={unifiedSettings.animations.bowing}
                min={0} max={5} step={0.1}
                onChange={(v) => updateAnimationSettings({ bowing: v })}
                showReset resetValue={1.2}
              />
              <SettingDropdown
                label="Fill Style"
                value={unifiedSettings.animations.fillStyle || 'hachure'}
                options={fillStyleOptions}
                onChange={(v) => updateAnimationSettings({ fillStyle: String(v) })}
              />
            </SettingGroup>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnifiedSettingsMenu;
