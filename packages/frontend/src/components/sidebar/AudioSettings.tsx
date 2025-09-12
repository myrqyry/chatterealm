import React from 'react';

interface UnifiedSettings {
  audio: {
    audioMasterVolume: number;
    sfxVolume: number;
    musicVolume: number;
  };
}

interface AudioSettingsProps {
  unifiedSettings: UnifiedSettings;
  updateAudioSettings: (settings: Partial<UnifiedSettings['audio']>) => void;
}

const AudioSettings: React.FC<AudioSettingsProps> = ({
  unifiedSettings,
  updateAudioSettings
}) => {
  return (
    <div style={{ padding: '16px 0' }}>
      <div style={{ marginBottom: '16px' }}>
        <label style={{
          display: 'block',
          marginBottom: '8px',
          color: 'var(--color-text-primary)',
          fontSize: '0.9em',
          fontWeight: '500'
        }}>
          Master Volume: {unifiedSettings.audio.audioMasterVolume}%
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={unifiedSettings.audio.audioMasterVolume}
          onChange={(e) => updateAudioSettings({ audioMasterVolume: parseInt(e.target.value) })}
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{
          display: 'block',
          marginBottom: '8px',
          color: 'var(--color-text-primary)',
          fontSize: '0.9em',
          fontWeight: '500'
        }}>
          SFX Volume: {unifiedSettings.audio.sfxVolume}%
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={unifiedSettings.audio.sfxVolume}
          onChange={(e) => updateAudioSettings({ sfxVolume: parseInt(e.target.value) })}
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{
          display: 'block',
          marginBottom: '8px',
          color: 'var(--color-text-primary)',
          fontSize: '0.9em',
          fontWeight: '500'
        }}>
          Music Volume: {unifiedSettings.audio.musicVolume}%
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={unifiedSettings.audio.musicVolume}
          onChange={(e) => updateAudioSettings({ musicVolume: parseInt(e.target.value) })}
          style={{ width: '100%' }}
        />
      </div>
    </div>
  );
};

export default AudioSettings;