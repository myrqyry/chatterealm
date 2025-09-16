import React from 'react';
import { useGameStore } from '../../stores/gameStore';
import { SettingSlider, SettingCheckbox, MaterialMultiSelect } from '../shared/settings';
import { MaterialCard } from '../index';

const AudioModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { unifiedSettings, updateAudioSettings, updateNotificationSettings } = useGameStore();

  const notificationTypeOptions = [
    { value: 'desktop', label: 'Desktop' },
    { value: 'sound', label: 'Sound' },
    { value: 'ingame', label: 'In-Game' },
  ];

  return (
    <div className="p-6 h-full overflow-auto font-mono bg-gradient-to-br from-background-primary/95 to-surface/90">
      {/* Modal Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-primary/30">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <span className="text-2xl">🎵</span>
          </div>
          <div>
            <h1 className="m-0 text-text-primary text-2xl font-bold text-shadow">
              Audio
            </h1>
            <p className="mt-1 mb-0 text-text-secondary text-sm font-normal">
              Sound and music controls
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
            border: '1px solid rgba(255, 152, 0, 0.2)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(255, 152, 0, 0.1)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(255, 152, 0, 0.15)',
              borderColor: 'rgba(255, 152, 0, 0.3)'
            }
          }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
              <span className="text-lg">🔊</span>
            </div>
            <h3 className="m-0 text-text-primary text-lg font-semibold">
              Volume Controls
            </h3>
          </div>
          <div className="flex flex-col gap-4">
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
          </div>
        </MaterialCard>

        <MaterialCard
          sx={{
            backgroundColor: 'rgba(25, 23, 36, 0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 152, 0, 0.2)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(255, 152, 0, 0.1)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(255, 152, 0, 0.15)',
              borderColor: 'rgba(255, 152, 0, 0.3)'
            }
          }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
              <span className="text-lg">🔈</span>
            </div>
            <h3 className="m-0 text-text-primary text-lg font-semibold">
              Audio Toggles
            </h3>
          </div>
          <div className="flex flex-col gap-4">
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
          </div>
        </MaterialCard>

        <MaterialCard
          sx={{
            backgroundColor: 'rgba(25, 23, 36, 0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 152, 0, 0.2)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(255, 152, 0, 0.1)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(255, 152, 0, 0.15)',
              borderColor: 'rgba(255, 152, 0, 0.3)'
            }
          }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
              <span className="text-lg">🔔</span>
            </div>
            <h3 className="m-0 text-text-primary text-lg font-semibold">
              Notifications
            </h3>
          </div>
          <div className="flex flex-col gap-4">
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
          </div>
        </MaterialCard>
      </div>
    </div>
  );
};

export default AudioModal;
