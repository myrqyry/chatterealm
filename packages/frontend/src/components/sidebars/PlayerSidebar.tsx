import React, { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { PlayerClass } from 'shared';
import { MaterialButton, MaterialCard, MaterialChip } from '../index';
import EnhancedPlayerStatus from '../EnhancedPlayerStatus';
import {
  PlayArrow as PlayIcon,
  Settings as SettingsIcon,
  VolumeUp as VolumeIcon,
  Visibility as VisibilityIcon,
  SportsEsports as GameIcon,
  Person as PlayerIcon,
  Keyboard as ControlsIcon,
  Tune as QuickSettingsIcon
} from '@mui/icons-material';

interface PlayerSidebarProps {
  className?: string;
}

const PlayerSidebar: React.FC<PlayerSidebarProps> = ({ className }) => {
  const {
    currentPlayer,
    joinGame,
    regenerateWorld,
    startCataclysm,
    movePlayer,
    pickupItem,
    gameMessage,
    unifiedSettings,
    updateAudioSettings,
    updateVisualSettings,
    updateAnimationSettings,
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<'play' | 'settings'>('play');

  const handleJoin = () => {
    joinGame({
      id: `player_${Date.now()}`,
      displayName: 'Player' + Math.floor(Math.random() * 1000),
      class: PlayerClass.KNIGHT,
      avatar: '🙂'
    });
  };

  const handleMove = (direction: 'up' | 'down' | 'left' | 'right') => {
    movePlayer(direction);
  };

  const handlePickup = () => {
    pickupItem('nearest');
  };

  const handleRegenerate = () => {
    regenerateWorld();
  };

  const handleCataclysm = () => {
    startCataclysm();
  };

  const toggleSound = () => {
    updateAudioSettings({
      audioMasterVolume: unifiedSettings.audio.audioMasterVolume > 0 ? 0 : 0.7
    });
  };

  const toggleGrid = () => {
    updateAnimationSettings({
      showGrid: !unifiedSettings.animations.showGrid
    });
  };

  const toggleParticles = () => {
    updateAnimationSettings({
      showParticles: !unifiedSettings.animations.showParticles
    });
  };

  return (
    <div className={`${className} h-full flex flex-col bg-[var(--color-background-paper)] border-l border-[var(--color-divider)]`}>
      {/* Header with Tab Switcher */}
      <div className="p-4 border-b border-[var(--color-outline)] bg-[var(--color-surface-variant)]">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-[var(--color-text-primary)] m-0">🎮 Game Panel</h2>
          <div className="flex gap-1">
            <MaterialButton
              size="small"
              variant={activeTab === 'play' ? 'contained' : 'outlined'}
              onClick={() => setActiveTab('play')}
              startIcon={<PlayIcon />}
              sx={{ minHeight: '32px', px: 2 }}
            >
              Play
            </MaterialButton>
            <MaterialButton
              size="small"
              variant={activeTab === 'settings' ? 'contained' : 'outlined'}
              onClick={() => setActiveTab('settings')}
              startIcon={<SettingsIcon />}
              sx={{ minHeight: '32px', px: 2 }}
            >
              Settings
            </MaterialButton>
          </div>
        </div>

        {/* Game Message */}
        {gameMessage && (
          <MaterialCard sx={{ p: 2, backgroundColor: 'var(--color-primary-container)', border: '1px solid var(--color-primary)' }}>
            <p className="text-sm text-[var(--color-on-primary-container)] m-0">{gameMessage}</p>
          </MaterialCard>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'play' ? (
          <div className="h-full flex flex-col">
            {/* TOP HALF: Player Stats */}
            <div className="flex-1 p-4 border-b border-[var(--color-outline)]">
              <div className="flex items-center gap-2 mb-3">
                <PlayerIcon sx={{ fontSize: 20 }} />
                <h3 className="text-md font-semibold text-[var(--color-text-primary)] m-0">Player Status</h3>
              </div>

              {currentPlayer ? (
                <EnhancedPlayerStatus player={currentPlayer} />
              ) : (
                <div className="text-center py-8">
                  <p className="text-[var(--color-text-secondary)] mb-4">Not in game</p>
                  <MaterialButton
                    onClick={handleJoin}
                    startIcon={<PlayIcon />}
                    sx={{ minWidth: '120px' }}
                  >
                    Join Game
                  </MaterialButton>
                </div>
              )}
            </div>

            {/* BOTTOM HALF: Controls & Options */}
            <div className="flex-1 p-4">
              <div className="flex items-center gap-2 mb-3">
                <ControlsIcon sx={{ fontSize: 20 }} />
                <h3 className="text-md font-semibold text-[var(--color-text-primary)] m-0">Controls</h3>
              </div>

              {currentPlayer && (
                <>
                  {/* Movement Controls */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-[var(--color-text-primary)] mb-2">Movement</h4>
                    <div className="grid grid-cols-3 gap-1 max-w-[120px] mx-auto">
                      <div />
                      <MaterialButton
                        size="small"
                        onClick={() => handleMove('up')}
                        sx={{ minWidth: '32px', minHeight: '32px', p: 0 }}
                      >
                        ↑
                      </MaterialButton>
                      <div />

                      <MaterialButton
                        size="small"
                        onClick={() => handleMove('left')}
                        sx={{ minWidth: '32px', minHeight: '32px', p: 0 }}
                      >
                        ←
                      </MaterialButton>

                      <MaterialButton
                        size="small"
                        onClick={() => handleMove('down')}
                        sx={{ minWidth: '32px', minHeight: '32px', p: 0 }}
                      >
                        ↓
                      </MaterialButton>

                      <MaterialButton
                        size="small"
                        onClick={() => handleMove('right')}
                        sx={{ minWidth: '32px', minHeight: '32px', p: 0 }}
                      >
                        →
                      </MaterialButton>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-[var(--color-text-primary)] mb-2">Actions</h4>
                    <div className="flex flex-col gap-2">
                      <MaterialButton
                        size="small"
                        onClick={handlePickup}
                        startIcon={<span>🎒</span>}
                        sx={{ justifyContent: 'flex-start' }}
                      >
                        Pick Up Item
                      </MaterialButton>

                      <MaterialButton
                        size="small"
                        onClick={handleRegenerate}
                        startIcon={<span>🌍</span>}
                        sx={{ justifyContent: 'flex-start' }}
                      >
                        Regen World
                      </MaterialButton>

                      <MaterialButton
                        size="small"
                        color="error"
                        onClick={handleCataclysm}
                        startIcon={<span>⚡</span>}
                        sx={{ justifyContent: 'flex-start' }}
                      >
                        Cataclysm
                      </MaterialButton>
                    </div>
                  </div>

                  {/* Quick Settings */}
                  <div>
                    <h4 className="text-sm font-medium text-[var(--color-text-primary)] mb-2">Quick Settings</h4>
                    <div className="flex flex-wrap gap-2">
                      <MaterialChip
                        label={unifiedSettings.audio.audioMasterVolume > 0 ? "🔊 Sound On" : "🔇 Sound Off"}
                        onClick={toggleSound}
                        size="small"
                        sx={{ cursor: 'pointer' }}
                      />
                      <MaterialChip
                        label={unifiedSettings.animations.showGrid ? "📐 Grid On" : "📐 Grid Off"}
                        onClick={toggleGrid}
                        size="small"
                        sx={{ cursor: 'pointer' }}
                      />
                      <MaterialChip
                        label={unifiedSettings.animations.showParticles ? "✨ Particles On" : "✨ Particles Off"}
                        onClick={toggleParticles}
                        size="small"
                        sx={{ cursor: 'pointer' }}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          /* SETTINGS TAB */
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <QuickSettingsIcon sx={{ fontSize: 20 }} />
              <h3 className="text-md font-semibold text-[var(--color-text-primary)] m-0">Quick Settings</h3>
            </div>

            {/* Audio Settings */}
            <MaterialCard sx={{ mb: 3, p: 3 }}>
              <div className="flex items-center gap-2 mb-3">
                <VolumeIcon sx={{ fontSize: 18 }} />
                <h4 className="text-sm font-medium text-[var(--color-text-primary)] m-0">Audio</h4>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-[var(--color-text-secondary)] mb-1">Master Volume</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={unifiedSettings.audio.audioMasterVolume}
                    onChange={(e) => updateAudioSettings({ audioMasterVolume: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[var(--color-text-secondary)] mb-1">SFX Volume</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={unifiedSettings.audio.sfxVolume}
                    onChange={(e) => updateAudioSettings({ sfxVolume: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>
            </MaterialCard>

            {/* Visual Settings */}
            <MaterialCard sx={{ mb: 3, p: 3 }}>
              <div className="flex items-center gap-2 mb-3">
                <VisibilityIcon sx={{ fontSize: 18 }} />
                <h4 className="text-sm font-medium text-[var(--color-text-primary)] m-0">Visual</h4>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--color-text-primary)]">Show Grid</span>
                  <input
                    type="checkbox"
                    checked={unifiedSettings.animations.showGrid}
                    onChange={(e) => updateAnimationSettings({ showGrid: e.target.checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--color-text-primary)]">Show Particles</span>
                  <input
                    type="checkbox"
                    checked={unifiedSettings.animations.showParticles}
                    onChange={(e) => updateAnimationSettings({ showParticles: e.target.checked })}
                  />
                </div>
                <div>
                  <label className="block text-xs text-[var(--color-text-secondary)] mb-1">Render Scale ({Math.round(unifiedSettings.visual.renderScale * 100)}%)</label>
                  <input
                    type="range"
                    min="0.25"
                    max="1.0"
                    step="0.05"
                    value={unifiedSettings.visual.renderScale}
                    onChange={(e) => updateVisualSettings({ renderScale: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-[var(--color-text-secondary)] mt-1">
                    <span>25%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            </MaterialCard>

            {/* Gameplay Settings */}
            <MaterialCard sx={{ p: 3 }}>
              <div className="flex items-center gap-2 mb-3">
                <GameIcon sx={{ fontSize: 18 }} />
                <h4 className="text-sm font-medium text-[var(--color-text-primary)] m-0">Gameplay</h4>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--color-text-primary)]">Auto-save</span>
                  <input
                    type="checkbox"
                    checked={unifiedSettings.game.autoSaveEnabled}
                    onChange={(e) => useGameStore.getState().updateGameSettings({ autoSaveEnabled: e.target.checked })}
                  />
                </div>
              </div>
            </MaterialCard>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerSidebar;