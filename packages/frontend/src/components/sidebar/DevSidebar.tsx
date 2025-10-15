import React, { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { MaterialButton, MaterialChip, MaterialCard } from '../index';
import Panel from '../shared/Panel';
import { COLORS } from '../../utils/tokens';

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
          <div className="py-4">
            <Panel title={<>⚙️ Developer Configuration Panel</>}>
              <p className="m-0 mb-4 text-text-secondary text-sm">
                Complete control over all game systems, settings, and configurations.
                Use with caution - changes affect gameplay experience.
              </p>
              <div className="flex gap-2 flex-wrap">
                <MaterialButton size="small" onClick={() => setShowImportExport(!showImportExport)} sx={{ fontSize: '0.8rem' }}>{showImportExport ? 'Hide' : 'Import/Export'}</MaterialButton>
                <MaterialButton size="small" color="error" onClick={handleResetAll} sx={{ fontSize: '0.8rem' }}>Reset All</MaterialButton>
              </div>
            </Panel>

            {showImportExport && (
              <Panel title={<>📤 Export Settings</>}>
                <MaterialButton onClick={handleExport} sx={{ mb: 2, p: 1 }}>Copy to Clipboard</MaterialButton>

                <h4 className="mt-4 mb-3 text-[var(--color-text-primary)]">📥 Import Settings</h4>
                <textarea className="w-full min-h-[120px] p-2 bg-background-paper border border-divider rounded text-text-primary font-mono text-sm resize-y mb-2" placeholder="Paste JSON settings here..." value={importText} onChange={(e) => setImportText(e.target.value)} />
                <MaterialButton onClick={handleImport}>Import Settings</MaterialButton>
              </Panel>
            )}

            <Panel title={<>📈 System Status</>}>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><strong>World Phase:</strong> {gameWorld?.phase || 'Unknown'}</div>
                <div><strong>World Age:</strong> {gameWorld?.worldAge || 0}</div>
                <div><strong>Active Players:</strong> {gameWorld?.players?.length || 0}</div>
                <div><strong>Active NPCs:</strong> {gameWorld?.npcs?.length || 0}</div>
                <div><strong>Items:</strong> {gameWorld?.items?.length || 0}</div>
                <div><strong>Cataclysm:</strong> {gameWorld?.cataclysmCircle?.isActive ? 'Active' : 'Inactive'}</div>
              </div>
            </Panel>
          </div>
        );

      case 'game':
        return (
          <div className="py-4">
                <MaterialCard sx={{ mb: 2, p: 2, backgroundColor: 'var(--color-surface-variant)' }}>
                  <h4 className="m-0 mb-3 text-[var(--color-text-primary)]">🎯 Core Gameplay</h4>
                  <div className="flex flex-col gap-3">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={unifiedSettings.game.autoSaveEnabled} onChange={(e) => updateGameSettings({ autoSaveEnabled: e.target.checked })} />
                  <span>Auto-Save Enabled</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={unifiedSettings.game.tutorialEnabled} onChange={(e) => updateGameSettings({ tutorialEnabled: e.target.checked })} />
                  <span>Tutorial Enabled</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={unifiedSettings.game.minimapEnabled} onChange={(e) => updateGameSettings({ minimapEnabled: e.target.checked })} />
                  <span>Mini-map Enabled</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={unifiedSettings.game.showNPCNames} onChange={(e) => updateGameSettings({ showNPCNames: e.target.checked })} />
                  <span>Show NPC Names</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={unifiedSettings.game.showItemNames} onChange={(e) => updateGameSettings({ showItemNames: e.target.checked })} />
                  <span>Show Item Names</span>
                </label>
              </div>
            </MaterialCard>

            <MaterialCard sx={{ mb: 2, p: 2, backgroundColor: 'var(--color-surface-variant)' }}>
              <h4 className="m-0 mb-3 text-[var(--color-text-primary)]">⚔️ Combat Settings</h4>
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={unifiedSettings.game.showDamageNumbers} onChange={(e) => updateGameSettings({ showDamageNumbers: e.target.checked })} />
                  <span>Show Damage Numbers</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={unifiedSettings.game.autoCombatEnabled} onChange={(e) => updateGameSettings({ autoCombatEnabled: e.target.checked })} />
                  <span>Auto-Combat Enabled</span>
                </label>
              </div>
            </MaterialCard>
          </div>
        );

      case 'audio':
        return (
          <div className="py-4">
            <MaterialCard sx={{ mb: 2, p: 2 }}>
              <h4 className="m-0 mb-3 text-[var(--color-text-primary)]">🔊 Volume Controls</h4>
              <div className="flex flex-col gap-4">
                <div>
                  <label>Master Volume: {unifiedSettings.audio.audioMasterVolume}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={unifiedSettings.audio.audioMasterVolume}
                    onChange={(e) => updateAudioSettings({ audioMasterVolume: parseInt(e.target.value) })}
                    className="w-full mt-1"
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
                    className="w-full mt-1"
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
                    className="w-full mt-1"
                  />
                </div>
              </div>
            </MaterialCard>

            <MaterialCard sx={{ p: 2 }}>
              <h4 className="m-0 mb-3 text-[var(--color-text-primary)]">🔈 Audio Toggles</h4>
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={unifiedSettings.audio.soundEnabled}
                    onChange={(e) => updateAudioSettings({ soundEnabled: e.target.checked })}
                  />
                  <span>Sound Effects Enabled</span>
                </label>
                <label className="flex items-center gap-2">
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
          <div className="py-4">
            <MaterialCard sx={{ mb: 2, p: 2 }}>
              <h4 className="m-0 mb-3 text-[var(--color-text-primary)]">🎨 Theme & UI</h4>
              <div className="flex flex-col gap-3">
                <div>
                  <label>Theme</label>
                  <select
                    value={unifiedSettings.visual.theme}
                    onChange={(e) => updateVisualSettings({ theme: e.target.value as any })}
                    className="w-full mt-1 p-1"
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
                    className="w-full mt-1 p-1"
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
                    className="w-full mt-1"
                  />
                </div>
              </div>
            </MaterialCard>

            <MaterialCard sx={{ p: 2 }}>
              <h4 className="m-0 mb-3 text-[var(--color-text-primary)]">♿ Accessibility & Display</h4>
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={unifiedSettings.visual.highContrast}
                    onChange={(e) => updateVisualSettings({ highContrast: e.target.checked })}
                  />
                  <span>High Contrast</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={unifiedSettings.visual.reduceMotion}
                    onChange={(e) => updateVisualSettings({ reduceMotion: e.target.checked })}
                  />
                  <span>Reduce Motion</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={unifiedSettings.visual.showGrid}
                    onChange={(e) => updateVisualSettings({ showGrid: e.target.checked })}
                  />
                  <span>Show Grid</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={unifiedSettings.visual.showParticles}
                    onChange={(e) => updateVisualSettings({ showParticles: e.target.checked })}
                  />
                  <span>Show Particles</span>
                </label>
                <label className="flex items-center gap-2">
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
          <div className="py-4">
            <MaterialCard sx={{ mb: 2, p: 2 }}>
              <h4 className="m-0 mb-3 text-[var(--color-text-primary)]">📐 World Dimensions</h4>
              <div className="flex flex-col gap-4">
                <div>
                  <label>World Width: {unifiedSettings.world.worldWidth} tiles</label>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    step="5"
                    value={unifiedSettings.world.worldWidth}
                    onChange={(e) => updateWorldSettings({ worldWidth: parseInt(e.target.value) })}
                    className="w-full mt-1"
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
                    className="w-full mt-1"
                  />
                </div>
              </div>
            </MaterialCard>

            <MaterialCard sx={{ p: 2 }}>
              <h4 className="m-0 mb-3 text-[var(--color-text-primary)]">🌿 Environment Animation</h4>
              <div className="flex flex-col gap-4">
                <div>
                  <label>Grass Wave Speed: {unifiedSettings.world.grassWaveSpeed}</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={unifiedSettings.world.grassWaveSpeed}
                    onChange={(e) => updateWorldSettings({ grassWaveSpeed: parseFloat(e.target.value) })}
                    className="w-full mt-1"
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
                    className="w-full mt-1"
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
                    className="w-full mt-1"
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
                    className="w-full mt-1"
                  />
                </div>
              </div>
            </MaterialCard>
          </div>
        );

      case 'animations':
        return (
          <div className="py-4">
            {/* animations content omitted for brevity */}
            <div className="text-sm text-text-secondary">Animations settings and controls</div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={[className || '', 'h-full flex flex-col overflow-auto font-inter'].join(' ').trim()}>
      <div className="p-4 border-b border-[rgba(196,167,231,0.2)] bg-[rgba(25,23,36,0.8)]">
        <h2 className="text-text-primary text-lg font-semibold m-0">Dev Panel</h2>
      </div>
      <div className="p-4">
        <div className="flex gap-2 mb-3">
          {sections.map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id)} className={`px-2 py-1 rounded ${activeSection === s.id ? 'bg-[rgba(196,167,231,0.12)]' : 'bg-transparent'}`}>{s.label}</button>
          ))}
        </div>
        {renderSectionContent()}
      </div>
    </div>
  );
};

export default DevSidebar;
