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
    <div className="py-4">
      <div className="mb-4">
        <label className="block mb-2 text-[var(--color-text-primary)] text-sm font-medium">
          Master Volume: {unifiedSettings.audio.audioMasterVolume}%
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={unifiedSettings.audio.audioMasterVolume}
          onChange={(e) => updateAudioSettings({ audioMasterVolume: parseInt(e.target.value) })}
          className="w-full"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-2 text-[var(--color-text-primary)] text-sm font-medium">
          SFX Volume: {unifiedSettings.audio.sfxVolume}%
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={unifiedSettings.audio.sfxVolume}
          onChange={(e) => updateAudioSettings({ sfxVolume: parseInt(e.target.value) })}
          className="w-full"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-2 text-[var(--color-text-primary)] text-sm font-medium">
          Music Volume: {unifiedSettings.audio.musicVolume}%
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={unifiedSettings.audio.musicVolume}
          onChange={(e) => updateAudioSettings({ musicVolume: parseInt(e.target.value) })}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default AudioSettings;