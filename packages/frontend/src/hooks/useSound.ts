import { useCallback, useEffect } from 'react';
import { soundService, initializeSounds } from '../services/soundService';
import { useGameStore } from '../stores/gameStore';

/**
 * Custom hook for managing game sound effects
 */
export const useSound = () => {
  const soundEnabled = useGameStore(state => state.unifiedSettings?.audio?.soundEnabled ?? true);
  const audioMasterVolume = useGameStore(state => state.unifiedSettings?.audio?.audioMasterVolume ?? 80);
  const sfxVolume = useGameStore(state => state.unifiedSettings?.audio?.sfxVolume ?? 70);
  const musicVolume = useGameStore(state => state.unifiedSettings?.audio?.musicVolume ?? 60);

  // Update sound service settings when they change
  useEffect(() => {
    soundService.updateSettings();
  }, [soundEnabled, audioMasterVolume, sfxVolume, musicVolume]);

  // Initialize sounds (user interaction required)
  const initSounds = useCallback(() => {
    initializeSounds();
  }, []);

  // Sound trigger functions
  const playClick = useCallback(() => {
    if (soundEnabled) soundService.playClick();
  }, [soundEnabled]);

  const playMove = useCallback(() => {
    if (soundEnabled) soundService.playMove();
  }, [soundEnabled]);

  const playPickup = useCallback(() => {
    if (soundEnabled) soundService.playPickup();
  }, [soundEnabled]);

  const playSuccess = useCallback(() => {
    if (soundEnabled) soundService.playSuccess();
  }, [soundEnabled]);

  const playError = useCallback(() => {
    if (soundEnabled) soundService.playError();
  }, [soundEnabled]);

  const playNotification = useCallback(() => {
    if (soundEnabled) soundService.playNotification();
  }, [soundEnabled]);

  const playAttack = useCallback(() => {
    if (soundEnabled) soundService.playAttack();
  }, [soundEnabled]);

  const playHeal = useCallback(() => {
    if (soundEnabled) soundService.playHeal();
  }, [soundEnabled]);

  const playLevelUp = useCallback(() => {
    if (soundEnabled) soundService.playLevelUp();
  }, [soundEnabled]);

  const playDamage = useCallback(() => {
    if (soundEnabled) soundService.playDamage();
  }, [soundEnabled]);

  const playNavigation = useCallback(() => {
    if (soundEnabled) soundService.playNavigation();
  }, [soundEnabled]);

  const playAmbient = useCallback(() => {
    if (soundEnabled) soundService.playAmbient();
  }, [soundEnabled]);

  return {
    // Settings
    soundEnabled,
    audioMasterVolume,
    sfxVolume,
    musicVolume,

    // Actions
    initSounds,
    playClick,
    playMove,
    playPickup,
    playSuccess,
    playError,
    playNotification,
    playAttack,
    playHeal,
    playLevelUp,
    playDamage,
    playNavigation,
    playAmbient,
  };
};

export default useSound;
