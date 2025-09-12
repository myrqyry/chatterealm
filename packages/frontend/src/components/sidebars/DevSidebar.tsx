import React, { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { MaterialCard, MaterialButton, MaterialChip } from '../index';
import { COLORS } from '../../constants/colors';

interface DevSidebarProps {
  className?: string;
}

const DevSidebar: React.FC<DevSidebarProps> = ({ className }) => {
  const {
    unifiedSettings,
    updateGameSettings,
    updateAudioSettings,
    updateNotificationSettings,
    updateVisualSettings,
    updateWorldSettings,
    updateAnimationSettings,
    gameWorld,
    exportSettings,
    importSettings,
    resetAllSettings
  } = useGameStore();

  const [activeSection, setActiveSection] = useState<string>('overview');
  const [importText, setImportText] = useState('');
  const [showImportExport, setShowImportExport] = useState(false);

  const sections = [
    { id: 'overview', label: '📊 Overview', icon: '📊' },
    { id: 'game', label: '🎮 Game', icon: '🎮' },
    { id: 'audio', label: '🎵 Audio', icon: '🎵' },
    { id: 'visual', label: '👁️ Visual', icon: '👁️' },
    { id: 'world', label: '🌍 World', icon: '🌍' },
    { id: 'animations', label: '🎞️ Animations', icon: '🎞️' },
    { id: 'notifications', label: '🔔 Notifications', icon: '🔔' },
    { id: 'debug', label: '🔧 Debug', icon: '🔧' }
  ];

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
    if (confirm('Reset ALL settings to defaults? This cannot be undone!')) {
      resetAllSettings();
      alert('All settings reset to defaults.');
    }
  };

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div style={{ padding: '16px 0' }}>
            <MaterialCard sx={{ mb: 2, p: 2 }}>
              <h3 style={{ margin: '0 0 12px 0', color: 'var(--color-text-primary)' }}>
                ⚙️ Developer Configuration Panel
              </h3>
              <p style={{ margin: '0 0 16px 0', color: 'var(--color-text-secondary)', fontSize: '0.9em' }}>
                Complete control over all game systems, settings, and configurations.
                Use with caution - changes affect gameplay experience.
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <MaterialButton
                  size="small"
                  onClick={() => setShowImportExport(!showImportExport)}
                  sx={{ fontSize: '0.8rem' }}
                >
                  {showImportExport ? 'Hide' : 'Import/Export'}
                </MaterialButton>
                <MaterialButton
                  size="small"
                  color="error"
                  onClick={handleResetAll}
                  sx={{ fontSize: '0.8rem' }}
                >
                  Reset All
                </MaterialButton>
              </div>
            </MaterialCard>

            {showImportExport && (
              <MaterialCard sx={{ mb: 2, p: 2 }}>
                <h4 style={{ margin: '0 0 12px 0', color: 'var(--color-text-primary)' }}>
                  📤 Export Settings
                </h4>
                <MaterialButton onClick={handleExport} sx={{ mb: 2 }}>
                  Copy to Clipboard
                </MaterialButton>

                <h4 style={{ margin: '16px 0 12px 0', color: 'var(--color-text-primary)' }}>
                  📥 Import Settings
                </h4>
                <textarea
                  style={{
                    width: '100%',
                    minHeight: '120px',
                    padding: '8px',
                    backgroundColor: 'var(--color-background-paper)',
                    border: '1px solid var(--color-divider)',
                    borderRadius: '4px',
                    color: 'var(--color-text-primary)',
                    fontFamily: 'JetBrains Mono',
                    fontSize: '0.8rem',
                    resize: 'vertical',
                    marginBottom: '8px'
                  }}
                  placeholder="Paste JSON settings here..."
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                />
                <MaterialButton onClick={handleImport}>
                  Import Settings
                </MaterialButton>
              </MaterialCard>
            )}

            <MaterialCard sx={{ p: 2 }}>
              <h4 style={{ margin: '0 0 12px 0', color: 'var(--color-text-primary)' }}>
                📈 System Status
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.85em' }}>
                <div><strong>World Phase:</strong> {gameWorld?.phase || 'Unknown'}</div>
                <div><strong>World Age:</strong> {gameWorld?.worldAge || 0}</div>
                <div><strong>Active Players:</strong> {gameWorld?.players?.length || 0}</div>
                <div><strong>Active NPCs:</strong> {gameWorld?.npcs?.length || 0}</div>
                <div><strong>Items:</strong> {gameWorld?.items?.length || 0}</div>
                <div><strong>Cataclysm:</strong> {gameWorld?.cataclysmCircle?.isActive ? 'Active' : 'Inactive'}</div>
              </div>
            </MaterialCard>
          </div>
        );

      case 'game':
        return (
          <div style={{ padding: '16px 0' }}>
            <MaterialCard sx={{ mb: 2, p: 2 }}>
              <h4 style={{ margin: '0 0 12px 0', color: 'var(--color-text-primary)' }}>
                🎯 Core Gameplay
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={unifiedSettings.game.autoSaveEnabled}
                    onChange={(e) => updateGameSettings({ autoSaveEnabled: e.target.checked })}
                  />
                  <span>Auto-Save Enabled</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={unifiedSettings.game.tutorialEnabled}
                    onChange={(e) => updateGameSettings({ tutorialEnabled: e.target.checked })}
                  />
                  <span>Tutorial Enabled</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={unifiedSettings.game.minimapEnabled}
                    onChange={(e) => updateGameSettings({ minimapEnabled: e.target.checked })}
                  />
                  <span>Mini-map Enabled</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={unifiedSettings.game.showNPCNames}
                    onChange={(e) => updateGameSettings({ showNPCNames: e.target.checked })}
                  />
                  <span>Show NPC Names</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={unifiedSettings.game.showItemNames}
                    onChange={(e) => updateGameSettings({ showItemNames: e.target.checked })}
                  />
                  <span>Show Item Names</span>
                </label>
              </div>
            </MaterialCard>

            <MaterialCard sx={{ mb: 2, p: 2 }}>
              <h4 style={{ margin: '0 0 12px 0', color: 'var(--color-text-primary)' }}>
                ⚔️ Combat Settings
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={unifiedSettings.game.showDamageNumbers}
                    onChange={(e) => updateGameSettings({ showDamageNumbers: e.target.checked })}
                  />
                  <span>Show Damage Numbers</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={unifiedSettings.game.autoCombatEnabled}
                    onChange={(e) => updateGameSettings({ autoCombatEnabled: e.target.checked })}
                  />
                  <span>Auto-Combat Enabled</span>
                </label>
              </div>
            </MaterialCard>
          </div>
        );

      case 'audio':
        return (
          <div style={{ padding: '16px 0' }}>
            <MaterialCard sx={{ mb: 2, p: 2 }}>
              <h4 style={{ margin: '0 0 12px 0', color: 'var(--color-text-primary)' }}>
                🔊 Volume Controls
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label>Master Volume: {unifiedSettings.audio.audioMasterVolume}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={unifiedSettings.audio.audioMasterVolume}
                    onChange={(e) => updateAudioSettings({ audioMasterVolume: parseInt(e.target.value) })}
                    style={{ width: '100%', marginTop: '4px' }}
                  />
                </div>
                <div>
                  <label>SFX Volume: {unifiedSettings.audio.sfxVolume}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={unifiedSettings.audio.sfxVolume}
                    onChange={(e) => updateAudioSettings({ sfxVolume: parseInt(e.target.value) })}
                    style={{ width: '100%', marginTop: '4px' }}
                  />
                </div>
                <div>
                  <label>Music Volume: {unifiedSettings.audio.musicVolume}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={unifiedSettings.audio.musicVolume}
                    onChange={(e) => updateAudioSettings({ musicVolume: parseInt(e.target.value) })}
                    style={{ width: '100%', marginTop: '4px' }}
                  />
                </div>
              </div>
            </MaterialCard>

            <MaterialCard sx={{ p: 2 }}>
              <h4 style={{ margin: '0 0 12px 0', color: 'var(--color-text-primary)' }}>
                🔈 Audio Toggles
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={unifiedSettings.audio.soundEnabled}
                    onChange={(e) => updateAudioSettings({ soundEnabled: e.target.checked })}
                  />
                  <span>Sound Effects Enabled</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={unifiedSettings.audio.musicEnabled}
                    onChange={(e) => updateAudioSettings({ musicEnabled: e.target.checked })}
                  />
                  <span>Music Enabled</span>
                </label>
              </div>
            </MaterialCard>
          </div>
        );

      case 'visual':
        return (
          <div style={{ padding: '16px 0' }}>
            <MaterialCard sx={{ mb: 2, p: 2 }}>
              <h4 style={{ margin: '0 0 12px 0', color: 'var(--color-text-primary)' }}>
                🎨 Theme & UI
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label>Theme</label>
                  <select
                    value={unifiedSettings.visual.theme}
                    onChange={(e) => updateVisualSettings({ theme: e.target.value as any })}
                    style={{ width: '100%', marginTop: '4px', padding: '4px' }}
                  >
                    <option value="dark">🌙 Dark</option>
                    <option value="light">☀️ Light</option>
                    <option value="night">🌃 Night</option>
                    <option value="auto">🤖 Auto</option>
                  </select>
                </div>
                <div>
                  <label>Language</label>
                  <select
                    value={unifiedSettings.visual.language}
                    onChange={(e) => updateVisualSettings({ language: e.target.value })}
                    style={{ width: '100%', marginTop: '4px', padding: '4px' }}
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                    <option value="jp">日本語</option>
                  </select>
                </div>
                <div>
                  <label>Font Size: {unifiedSettings.visual.fontSize}%</label>
                  <input
                    type="range"
                    min="75"
                    max="150"
                    value={unifiedSettings.visual.fontSize}
                    onChange={(e) => updateVisualSettings({ fontSize: parseInt(e.target.value) })}
                    style={{ width: '100%', marginTop: '4px' }}
                  />
                </div>
              </div>
            </MaterialCard>

            <MaterialCard sx={{ p: 2 }}>
              <h4 style={{ margin: '0 0 12px 0', color: 'var(--color-text-primary)' }}>
                ♿ Accessibility & Display
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={unifiedSettings.visual.highContrast}
                    onChange={(e) => updateVisualSettings({ highContrast: e.target.checked })}
                  />
                  <span>High Contrast</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={unifiedSettings.visual.reduceMotion}
                    onChange={(e) => updateVisualSettings({ reduceMotion: e.target.checked })}
                  />
                  <span>Reduce Motion</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={unifiedSettings.visual.showGrid}
                    onChange={(e) => updateVisualSettings({ showGrid: e.target.checked })}
                  />
                  <span>Show Grid</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={unifiedSettings.visual.showParticles}
                    onChange={(e) => updateVisualSettings({ showParticles: e.target.checked })}
                  />
                  <span>Show Particles</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={unifiedSettings.visual.showHealthBars}
                    onChange={(e) => updateVisualSettings({ showHealthBars: e.target.checked })}
                  />
                  <span>Show Health Bars</span>
                </label>
              </div>
            </MaterialCard>
          </div>
        );

      case 'world':
        return (
          <div style={{ padding: '16px 0' }}>
            <MaterialCard sx={{ mb: 2, p: 2 }}>
              <h4 style={{ margin: '0 0 12px 0', color: 'var(--color-text-primary)' }}>
                📐 World Dimensions
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label>World Width: {unifiedSettings.world.worldWidth} tiles</label>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    step="5"
                    value={unifiedSettings.world.worldWidth}
                    onChange={(e) => updateWorldSettings({ worldWidth: parseInt(e.target.value) })}
                    style={{ width: '100%', marginTop: '4px' }}
                  />
                </div>
                <div>
                  <label>World Height: {unifiedSettings.world.worldHeight} tiles</label>
                  <input
                    type="range"
                    min="15"
                    max="75"
                    step="3"
                    value={unifiedSettings.world.worldHeight}
                    onChange={(e) => updateWorldSettings({ worldHeight: parseInt(e.target.value) })}
                    style={{ width: '100%', marginTop: '4px' }}
                  />
                </div>
              </div>
            </MaterialCard>

            <MaterialCard sx={{ p: 2 }}>
              <h4 style={{ margin: '0 0 12px 0', color: 'var(--color-text-primary)' }}>
                🌿 Environment Animation
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label>Grass Wave Speed: {unifiedSettings.world.grassWaveSpeed}</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={unifiedSettings.world.grassWaveSpeed}
                    onChange={(e) => updateWorldSettings({ grassWaveSpeed: parseFloat(e.target.value) })}
                    style={{ width: '100%', marginTop: '4px' }}
                  />
                </div>
                <div>
                  <label>Tree Sway Speed: {unifiedSettings.world.treeSwaySpeed}</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={unifiedSettings.world.treeSwaySpeed}
                    onChange={(e) => updateWorldSettings({ treeSwaySpeed: parseFloat(e.target.value) })}
                    style={{ width: '100%', marginTop: '4px' }}
                  />
                </div>
                <div>
                  <label>Flower Spawn Rate: {unifiedSettings.world.flowerSpawnRate}</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={unifiedSettings.world.flowerSpawnRate}
                    onChange={(e) => updateWorldSettings({ flowerSpawnRate: parseFloat(e.target.value) })}
                    style={{ width: '100%', marginTop: '4px' }}
                  />
                </div>
                <div>
                  <label>Wind Speed: {unifiedSettings.world.windSpeed}</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={unifiedSettings.world.windSpeed}
                    onChange={(e) => updateWorldSettings({ windSpeed: parseFloat(e.target.value) })}
                    style={{ width: '100%', marginTop: '4px' }}
                  />
                </div>
              </div>
            </MaterialCard>
          </div>
        );

      case 'animations':
        return (
          <div style={{ padding: '16px 0' }}>
            <MaterialCard sx={{ mb: 2, p: 2 }}>
              <h4 style={{ margin: '0 0 12px 0', color: 'var(--color-text-primary)' }}>
                🎞️ Animation Controls
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label>Animation Speed: {unifiedSettings.animations.animationSpeed}x</label>
                  <input
                    type="range"
                    min="0.1"
                    max="3"
                    step="0.1"
                    value={unifiedSettings.animations.animationSpeed}
                    onChange={(e) => updateAnimationSettings({ animationSpeed: parseFloat(e.target.value) })}
                    style={{ width: '100%', marginTop: '4px' }}
                  />
                </div>
                <div>
                  <label>Particle Count: {unifiedSettings.animations.particleCount}</label>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={unifiedSettings.animations.particleCount}
                    onChange={(e) => updateAnimationSettings({ particleCount: parseInt(e.target.value) })}
                    style={{ width: '100%', marginTop: '4px' }}
                  />
                </div>
                <div>
                  <label>Breathing Rate: {unifiedSettings.animations.breathingRate}</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={unifiedSettings.animations.breathingRate}
                    onChange={(e) => updateAnimationSettings({ breathingRate: parseFloat(e.target.value) })}
                    style={{ width: '100%', marginTop: '4px' }}
                  />
                </div>
              </div>
            </MaterialCard>

            <MaterialCard sx={{ mb: 2, p: 2 }}>
              <h4 style={{ margin: '0 0 12px 0', color: 'var(--color-text-primary)' }}>
                🎨 Rough.js Drawing Style
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label>Roughness: {unifiedSettings.animations.roughness}</label>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.1"
                    value={unifiedSettings.animations.roughness}
                    onChange={(e) => updateAnimationSettings({ roughness: parseFloat(e.target.value) })}
                    style={{ width: '100%', marginTop: '4px' }}
                  />
                </div>
                <div>
                  <label>Bowing: {unifiedSettings.animations.bowing}</label>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.1"
                    value={unifiedSettings.animations.bowing}
                    onChange={(e) => updateAnimationSettings({ bowing: parseFloat(e.target.value) })}
                    style={{ width: '100%', marginTop: '4px' }}
                  />
                </div>
                <div>
                  <label>Fill Weight: {unifiedSettings.animations.fillWeight}</label>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.1"
                    value={unifiedSettings.animations.fillWeight}
                    onChange={(e) => updateAnimationSettings({ fillWeight: parseFloat(e.target.value) })}
                    style={{ width: '100%', marginTop: '4px' }}
                  />
                </div>
                <div>
                  <label>Hachure Angle: {unifiedSettings.animations.hachureAngle}°</label>
                  <input
                    type="range"
                    min="0"
                    max="180"
                    step="15"
                    value={unifiedSettings.animations.hachureAngle}
                    onChange={(e) => updateAnimationSettings({ hachureAngle: parseInt(e.target.value) })}
                    style={{ width: '100%', marginTop: '4px' }}
                  />
                </div>
                <div>
                  <label>Hachure Gap: {unifiedSettings.animations.hachureGap}</label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={unifiedSettings.animations.hachureGap}
                    onChange={(e) => updateAnimationSettings({ hachureGap: parseInt(e.target.value) })}
                    style={{ width: '100%', marginTop: '4px' }}
                  />
                </div>
                <div>
                  <label>Fill Style</label>
                  <select
                    value={unifiedSettings.animations.fillStyle || 'hachure'}
                    onChange={(e) => updateAnimationSettings({ fillStyle: e.target.value })}
                    style={{ width: '100%', marginTop: '4px', padding: '4px' }}
                  >
                    <option value="hachure">Hachure</option>
                    <option value="solid">Solid</option>
                    <option value="zigzag">Zigzag</option>
                    <option value="cross-hatch">Cross-Hatch</option>
                    <option value="dots">Dots</option>
                    <option value="sunburst">Sunburst</option>
                    <option value="dashed">Dashed</option>
                    <option value="scrawl">Scrawl</option>
                  </select>
                </div>
                <div>
                  <label>Random Seed: {unifiedSettings.animations.seed || 1}</label>
                  <input
                    type="range"
                    min="1"
                    max="10000"
                    value={unifiedSettings.animations.seed || 1}
                    onChange={(e) => updateAnimationSettings({ seed: parseInt(e.target.value) })}
                    style={{ width: '100%', marginTop: '4px' }}
                  />
                </div>
              </div>
            </MaterialCard>
          </div>
        );

      case 'notifications':
        return (
          <div style={{ padding: '16px 0' }}>
            <MaterialCard sx={{ mb: 2, p: 2 }}>
              <h4 style={{ margin: '0 0 12px 0', color: 'var(--color-text-primary)' }}>
                🔔 General Notifications
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={unifiedSettings.notifications.desktopNotifications}
                    onChange={(e) => updateNotificationSettings({ desktopNotifications: e.target.checked })}
                  />
                  <span>Desktop Notifications</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={unifiedSettings.notifications.soundNotifications}
                    onChange={(e) => updateNotificationSettings({ soundNotifications: e.target.checked })}
                  />
                  <span>Sound Notifications</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={unifiedSettings.notifications.battleNotifications}
                    onChange={(e) => updateNotificationSettings({ battleNotifications: e.target.checked })}
                  />
                  <span>Battle Notifications</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={unifiedSettings.notifications.systemNotifications}
                    onChange={(e) => updateNotificationSettings({ systemNotifications: e.target.checked })}
                  />
                  <span>System Notifications</span>
                </label>
              </div>
            </MaterialCard>

            <MaterialCard sx={{ p: 2 }}>
              <h4 style={{ margin: '0 0 12px 0', color: 'var(--color-text-primary)' }}>
                🎯 Event-Specific Notifications
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label>Player Join Notifications</label>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    {['desktop', 'sound', 'ingame'].map(type => (
                      <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input
                          type="checkbox"
                          checked={unifiedSettings.notifications.playerJoinNotifications.includes(type as any)}
                          onChange={(e) => {
                            const current = unifiedSettings.notifications.playerJoinNotifications;
                            const updated = e.target.checked
                              ? [...current, type as any]
                              : current.filter(t => t !== type);
                            updateNotificationSettings({ playerJoinNotifications: updated });
                          }}
                        />
                        <span style={{ textTransform: 'capitalize' }}>{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label>Item Drop Notifications</label>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    {['desktop', 'sound', 'ingame'].map(type => (
                      <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input
                          type="checkbox"
                          checked={unifiedSettings.notifications.itemDropNotifications.includes(type as any)}
                          onChange={(e) => {
                            const current = unifiedSettings.notifications.itemDropNotifications;
                            const updated = e.target.checked
                              ? [...current, type as any]
                              : current.filter(t => t !== type);
                            updateNotificationSettings({ itemDropNotifications: updated });
                          }}
                        />
                        <span style={{ textTransform: 'capitalize' }}>{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label>Level Up Notifications</label>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    {['desktop', 'sound', 'ingame'].map(type => (
                      <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input
                          type="checkbox"
                          checked={unifiedSettings.notifications.levelUpNotifications.includes(type as any)}
                          onChange={(e) => {
                            const current = unifiedSettings.notifications.levelUpNotifications;
                            const updated = e.target.checked
                              ? [...current, type as any]
                              : current.filter(t => t !== type);
                            updateNotificationSettings({ levelUpNotifications: updated });
                          }}
                        />
                        <span style={{ textTransform: 'capitalize' }}>{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label>Cataclysm Notifications</label>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    {['desktop', 'sound', 'ingame'].map(type => (
                      <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input
                          type="checkbox"
                          checked={unifiedSettings.notifications.cataclysmNotifications.includes(type as any)}
                          onChange={(e) => {
                            const current = unifiedSettings.notifications.cataclysmNotifications;
                            const updated = e.target.checked
                              ? [...current, type as any]
                              : current.filter(t => t !== type);
                            updateNotificationSettings({ cataclysmNotifications: updated });
                          }}
                        />
                        <span style={{ textTransform: 'capitalize' }}>{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </MaterialCard>
          </div>
        );

      case 'debug':
        return (
          <div style={{ padding: '16px 0' }}>
            <MaterialCard sx={{ mb: 2, p: 2 }}>
              <h4 style={{ margin: '0 0 12px 0', color: 'var(--color-text-primary)' }}>
                🔧 Debug Tools
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <MaterialButton
                  onClick={() => console.log('Current Game State:', gameWorld)}
                  sx={{ justifyContent: 'flex-start' }}
                >
                  📊 Log Game State to Console
                </MaterialButton>
                <MaterialButton
                  onClick={() => console.log('Current Settings:', unifiedSettings)}
                  sx={{ justifyContent: 'flex-start' }}
                >
                  ⚙️ Log Settings to Console
                </MaterialButton>
                <MaterialButton
                  onClick={() => {
                    const data = exportSettings();
                    console.log('Exported Settings:', JSON.parse(data));
                  }}
                  sx={{ justifyContent: 'flex-start' }}
                >
                  📤 Log Exported Settings
                </MaterialButton>
              </div>
            </MaterialCard>

            <MaterialCard sx={{ p: 2 }}>
              <h4 style={{ margin: '0 0 12px 0', color: 'var(--color-text-primary)' }}>
                📈 Performance Metrics
              </h4>
              <div style={{ fontSize: '0.85em', color: 'var(--color-text-secondary)' }}>
                <div>World Size: {gameWorld?.grid?.[0]?.length || 0} x {gameWorld?.grid?.length || 0}</div>
                <div>Active Entities: {(gameWorld?.players?.length || 0) + (gameWorld?.npcs?.length || 0) + (gameWorld?.items?.length || 0)}</div>
                <div>Memory Usage: Check browser dev tools</div>
                <div>Render FPS: Check browser performance tab</div>
              </div>
            </MaterialCard>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={className} style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Inter, Roboto, sans-serif',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid rgba(196, 167, 231, 0.2)',
        background: 'rgba(25, 23, 36, 0.8)'
      }}>
        <h2 style={{
          color: 'var(--color-text-primary)',
          fontSize: '1.2em',
          fontWeight: '600',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          🔧 Developer Mode
        </h2>
        <p style={{
          color: 'var(--color-text-secondary)',
          fontSize: '0.9em',
          margin: '4px 0 0 0'
        }}>
          Complete configuration control
        </p>
      </div>

      {/* Section Navigation */}
      <div style={{
        padding: '12px 20px',
        borderBottom: '1px solid rgba(196, 167, 231, 0.1)',
        display: 'flex',
        gap: '4px',
        overflowX: 'auto'
      }}>
        {sections.map(section => (
          <MaterialButton
            key={section.id}
            size="small"
            onClick={() => setActiveSection(section.id)}
            sx={{
              minWidth: 'auto',
              px: 1.5,
              py: 0.5,
              fontSize: '0.75rem',
              backgroundColor: activeSection === section.id ? 'rgba(196, 167, 231, 0.2)' : 'transparent',
              color: activeSection === section.id ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              border: activeSection === section.id ? '1px solid rgba(196, 167, 231, 0.3)' : '1px solid transparent',
              '&:hover': {
                backgroundColor: 'rgba(196, 167, 231, 0.1)'
              }
            }}
          >
            {section.icon} {section.label.split(' ')[0]}
          </MaterialButton>
        ))}
      </div>

      {/* Content Area */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '0 20px'
      }}>
        {renderSectionContent()}
      </div>
    </div>
  );
};

export default DevSidebar;