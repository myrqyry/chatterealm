// @ts-ignore - Tone.js will be loaded via CDN script tag in index.html
declare const Tone: any;

import { useGameStore } from '../stores/gameStore';

/**
 * Simple and pleasant sound service using Tone.js for game audio
 */
export class SoundService {
  private static instance: SoundService;

  // Audio state
  private isInitialized = false;
  private enabled = true;
  private masterVolume = 0.4; // Pleasant default volume
  private sfxVolume = 0.5;
  private musicVolume = 0.3;

  // Sound generators with pleasant profiles
  private clickSynth: any;
  private moveSynth: any;
  private successSynth: any;
  private errorSynth: any;
  private pickupSynth: any;
  private notificationSynth: any;
  private ambientSynth: any;

  // Audio context
  private masterMeter: any;

  constructor() {
    this.initializeSynths();
  }

  private initializeSynths(): void {
    if (typeof Tone === 'undefined') {
      console.warn('⚠️ Tone.js not loaded - sounds will be disabled');
      return;
    }

    // Initialize synths with pleasant, musical settings
    this.clickSynth = new Tone.Synth({
      oscillator: { type: 'triangle' },
      envelope: {
        attack: 0.01,
        decay: 0.1,
        sustain: 0.2,
        release: 0.3
      }
    });

    this.moveSynth = new Tone.MonoSynth({
      oscillator: { type: 'sine' },
      filter: { Q: 2, frequency: 300 },
      envelope: {
        attack: 0.02,
        decay: 0.3,
        sustain: 0.1,
        release: 0.4
      },
      filterEnvelope: {
        attack: 0.02,
        decay: 0.3,
        sustain: 0.2,
        release: 0.3,
        baseFrequency: 200,
        octaves: 3
      }
    });

    this.successSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sawtooth' },
      envelope: {
        attack: 0.02,
        decay: 0.2,
        sustain: 0.3,
        release: 0.8
      }
    });

    this.errorSynth = new Tone.AMSynth({
      harmonicity: 2,
      oscillator: { type: 'sawtooth' },
      envelope: {
        attack: 0.01,
        decay: 0.2,
        sustain: 0.2,
        release: 0.3
      },
      modulation: { type: 'square' },
      modulationEnvelope: {
        attack: 0.5,
        decay: 0.01,
        sustain: 0.1,
        release: 0.3
      }
    });

    this.pickupSynth = new Tone.FMSynth({
      harmonicity: 1.5,
      modulationIndex: 2,
      envelope: {
        attack: 0.01,
        decay: 0.2,
        sustain: 0.2,
        release: 0.4
      },
      modulationEnvelope: {
        attack: 0.01,
        decay: 0.2,
        sustain: 0.1,
        release: 0.4
      }
    });

    this.notificationSynth = new Tone.Synth({
      oscillator: { type: 'triangle' },
      envelope: {
        attack: 0.05,
        decay: 0.2,
        sustain: 0.4,
        release: 0.8
      }
    });

    this.ambientSynth = new Tone.PluckSynth({
      attackNoise: 1,
      dampening: 4000,
      resonance: 0.7
    });

    // Volume meter for monitoring
    this.masterMeter = new Tone.Meter();

    // Connect all synths to master output via meter
    this.connectToMaster();
  }

  private connectToMaster(): void {
    if (typeof Tone === 'undefined') return;

    const masterGain = new Tone.Gain(this.masterVolume);
    const compressor = new Tone.Compressor({
      ratio: 3,
      threshold: -24,
      release: 0.25,
      attack: 0.003,
      knee: 30
    });

    // Connect all synths to master chain
    [this.clickSynth, this.moveSynth, this.successSynth, this.errorSynth,
     this.pickupSynth, this.notificationSynth, this.ambientSynth].forEach(synth => {
      if (synth) synth.connect(masterGain);
    });

    // Connect to destination with compression
    masterGain.connect(compressor);
    compressor.connect(this.masterMeter);
    this.masterMeter.connect(Tone.Destination);
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      if (typeof Tone !== 'undefined') {
        await Tone.start();
        this.isInitialized = true;
        console.log('🎵 SoundService initialized');
      } else {
        console.warn('⚠️ Tone.js not loaded - sounds disabled');
        this.enabled = false;
      }
    } catch (error) {
      console.error('❌ Failed to initialize sound:', error);
      this.enabled = false;
    }
  }

  /**
   * Update volume settings from game store
   */
  updateSettings(): void {
    const settings = useGameStore.getState().unifiedSettings?.audio;
    if (!settings) return;

    this.masterVolume = (settings.audioMasterVolume ?? 80) / 100;
    this.sfxVolume = (settings.sfxVolume ?? 70) / 100;
    this.musicVolume = (settings.musicVolume ?? 60) / 100;
    this.enabled = (settings.soundEnabled ?? true);
  }

  // 🎵 SIMPLE BUT PLEASANT SOUND EFFECTS

  /**
   * Pleasant button/menu click sound
   */
  playClick(): void {
    if (!this.enabled || !this.isInitialized) return;

    // Gentle ascending triangle wave
    this.clickSynth.triggerAttackRelease('C4', '16n');

    // Create a pleasant modulation after
    setTimeout(() => {
      this.clickSynth.triggerAttackRelease('E4', '32n');
    }, 60);
  }

  /**
   * Smooth player movement sound
   */
  playMove(): void {
    if (!this.enabled || !this.isInitialized) return;

    // Gentle sine wave glide
    this.moveSynth.triggerAttackRelease('A3', '8n');
  }

  /**
   * Pleasant item pickup sound
   */
  playPickup(): void {
    if (!this.enabled || !this.isInitialized) return;

    // Bright FM synthesis "bling"
    this.pickupSynth.triggerAttackRelease('C5', '16n');

    // Add harmonic
    setTimeout(() => {
      this.pickupSynth.triggerAttackRelease('G5', '16n');
    }, 40);
  }

  /**
   * Successful action completion
   */
  playSuccess(): void {
    if (!this.enabled || !this.isInitialized) return;

    // Pleasant chord progression
    const notes = ['C4', 'E4', 'G4'];

    this.successSynth.triggerAttackRelease(notes, '8n');

    // Add a secondary chord
    setTimeout(() => {
      const highNotes = ['G5', 'B5', 'D6'];
      this.successSynth.triggerAttackRelease(highNotes, '4n');
    }, 150);
  }

  /**
   * Level up or achievement sound
   */
  playLevelUp(): void {
    if (!this.enabled || !this.isInitialized) return;

    // Majestic rising sequence
    const sequence = ['G3', 'C4', 'E4', 'G4', 'C5'];

    sequence.forEach((note, index) => {
      setTimeout(() => {
        this.successSynth.triggerAttackRelease(note, '16n');
      }, index * 80);
    });
  }

  /**
   * Player attack action
   */
  playAttack(): void {
    if (!this.enabled || !this.isInitialized) return;

    // Aggressive but pleasant attack sound
    this.errorSynth.triggerAttackRelease('D3', '8n');
  }

  /**
   * Player damage taken
   */
  playDamage(): void {
    if (!this.enabled || !this.isInitialized) return;

    // Tense but pleasant hurt sound
    this.errorSynth.triggerAttackRelease('F2', '8n');
  }

  /**
   * Error or invalid action
   */
  playError(): void {
    if (!this.enabled || !this.isInitialized) return;

    // Gentle error sound - not harsh
    this.errorSynth.triggerAttackRelease('D2', '4n');
  }

  /**
   * Menu navigation
   */
  playNavigation(): void {
    if (!this.enabled || !this.isInitialized) return;

    // Smooth navigation blip
    this.notificationSynth.triggerAttackRelease('A4', '32n');
  }

  /**
   * Ambient background melody (if enabled)
   */
  playAmbient(): void {
    if (!this.enabled || !this.isInitialized || this.musicVolume < 0.1) return;

    // Gentle ambient pluck
    const notes = ['C4', 'F4', 'A4', 'D5'];

    setInterval(() => {
      if (!this.enabled) return;
      const randomNote = notes[Math.floor(Math.random() * notes.length)];
      this.ambientSynth.triggerAttack(randomNote, '+0', this.musicVolume);
    }, 4000); // Every 4 seconds
  }

  /**
   * New notification
   */
  playNotification(): void {
    if (!this.enabled || !this.isInitialized) return;

    // Pleasant notification ping
    this.notificationSynth.triggerAttackRelease('E5', '8n');
  }

  /**
   * Healing or positive effect
   */
  playHeal(): void {
    if (!this.enabled || !this.isInitialized) return;

    // Soothing healing sound
    const notes = ['C4', 'F4', 'A4'];
    this.pickupSynth.triggerAttackRelease(notes, '4n');
  }

  /**
   * Get current audio levels for debugging
   */
  getLevels(): { master: number; enabled: boolean } {
    return {
      master: this.masterMeter.getValue() as number,
      enabled: this.enabled
    };
  }

  // Singleton pattern
  public static getInstance(): SoundService {
    if (!SoundService.instance) {
      SoundService.instance = new SoundService();
    }
    return SoundService.instance;
  }

  // Cleanup
  dispose(): void {
    // Dispose of all synths
    this.clickSynth.dispose();
    this.moveSynth.dispose();
    this.successSynth.dispose();
    this.errorSynth.dispose();
    this.pickupSynth.dispose();
    this.notificationSynth.dispose();
    this.ambientSynth.dispose();
    this.masterMeter.dispose();
  }
}

// Export singleton instance
export const soundService = SoundService.getInstance();

// Convenience functions for easy access
export const initializeSounds = () => soundService.initialize();
export const playClick = () => soundService.playClick();
export const playMove = () => soundService.playMove();
export const playPickup = () => soundService.playPickup();
export const playSuccess = () => soundService.playSuccess();
export const playLevelUp = () => soundService.playLevelUp();
export const playAttack = () => soundService.playAttack();
export const playDamage = () => soundService.playDamage();
export const playError = () => soundService.playError();
export const playNavigation = () => soundService.playNavigation();
export const playAmbient = () => soundService.playAmbient();
export const playNotification = () => soundService.playNotification();
export const playHeal = () => soundService.playHeal();
