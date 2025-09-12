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
        borderBottom: '2px solid rgba(255, 152, 0, 0.3)'
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
            background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)'
          }}>
            <span style={{ fontSize: '1.5rem' }}>🎵</span>
          </div>
          <div>
            <h1 style={{
              margin: 0,
              color: 'var(--color-text-primary)',
              fontSize: '1.8rem',
              fontWeight: 700,
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
            }}>
              Audio
            </h1>
            <p style={{
              margin: '4px 0 0 0',
              color: 'var(--color-text-secondary)',
              fontSize: '0.9rem',
              fontWeight: 400
            }}>
              Sound and music controls
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
              background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '1.1rem' }}>🔊</span>
            </div>
            <h3 style={{
              margin: 0,
              color: 'var(--color-text-primary)',
              fontSize: '1.2rem',
              fontWeight: 600
            }}>
              Volume Controls
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
              background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '1.1rem' }}>🔈</span>
            </div>
            <h3 style={{
              margin: 0,
              color: 'var(--color-text-primary)',
              fontSize: '1.2rem',
              fontWeight: 600
            }}>
              Audio Toggles
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
              background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '1.1rem' }}>🔔</span>
            </div>
            <h3 style={{
              margin: 0,
              color: 'var(--color-text-primary)',
              fontSize: '1.2rem',
              fontWeight: 600
            }}>
              Notifications
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
