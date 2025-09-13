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
  private clickSynth: any = null;
  private moveSynth: any = null;
  private successSynth: any = null;
  private errorSynth: any = null;
  private pickupSynth: any = null;
  private notificationSynth: any = null;
  private ambientSynth: any = null;

  // Audio context
  private masterMeter: any = null;

  // Ambient interval id so we can clear it on dispose
  private ambientIntervalId: number | null = null;

  constructor() {
    // Do NOT initialize Tone nodes here (must be created after user gesture / Tone.start()).
    // Constructor intentionally lightweight to avoid creating AudioNodes before user gesture.
  }

  /**
   * Create synths and connect them to master. Idempotent.
   */
  private initializeSynths(): void {
    if (typeof Tone === 'undefined') {
      console.warn('⚠️ Tone.js not loaded - sounds will be disabled');
      return;
    }

    // If synths already created, don't recreate
    if (this.clickSynth) return;

    try {
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
    } catch (err) {
      console.error('❌ Error initializing synths:', err);
      // If synth creation fails, ensure we don't leave partially-initialized nodes
      try {
        this.dispose();
      } catch (e) {
        // swallow
      }
    }
  }

  private connectToMaster(): void {
    if (typeof Tone === 'undefined') return;

    try {
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
        if (synth && typeof synth.connect === 'function') {
          try { synth.connect(masterGain); } catch (e) { /* ignore */ }
        }
      });

      // Connect to destination with compression
      try { masterGain.connect(compressor); } catch (e) { /* ignore */ }
      try { compressor.connect(this.masterMeter); } catch (e) { /* ignore */ }
      // Some Tone builds allow Meter.connect(Destination) or meter.toDestination()
      try {
        if (this.masterMeter && typeof this.masterMeter.connect === 'function') {
          this.masterMeter.connect(Tone.Destination);
        } else if (typeof (Tone.Destination as any)?.volume !== 'undefined') {
          // fallback no-op
        }
      } catch (e) {
        // ignore
      }
    } catch (err) {
      console.error('❌ Error connecting to master:', err);
    }
  }

  /**
   * Initialize audio system — must be called from a user gesture (button click).
   * This calls Tone.start() and then creates synths and connections.
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      if (typeof Tone !== 'undefined') {
        await Tone.start();
        // Only after Tone.start resolves do we create AudioNodes
        this.initializeSynths();
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

    // If master gain exists in chain, try to set volume - best effort only
    try {
      // Tone APIs vary; this is a soft attempt so we don't crash if chain missing
      // (We intentionally don't store masterGain on the instance to avoid complex lifecycle coupling)
    } catch (e) {
      // ignore
    }
  }

  // 🎵 SIMPLE BUT PLEASANT SOUND EFFECTS

  /**
   * Pleasant button/menu click sound
   */
  playClick(): void {
    if (!this.enabled || !this.isInitialized) return;

    if (!this.clickSynth || typeof this.clickSynth.triggerAttackRelease !== 'function') return;

    // Gentle ascending triangle wave
    this.clickSynth.triggerAttackRelease('C4', '16n');

    // Create a pleasant modulation after
    setTimeout(() => {
      try { this.clickSynth.triggerAttackRelease('E4', '32n'); } catch (e) { /* ignore */ }
    }, 60);
  }

  /**
   * Smooth player movement sound
   */
  playMove(): void {
    if (!this.enabled || !this.isInitialized) return;
    if (!this.moveSynth || typeof this.moveSynth.triggerAttackRelease !== 'function') return;

    // Gentle sine wave glide
    this.moveSynth.triggerAttackRelease('A3', '8n');
  }

  /**
   * Pleasant item pickup sound
   */
  playPickup(): void {
    if (!this.enabled || !this.isInitialized) return;
    if (!this.pickupSynth || typeof this.pickupSynth.triggerAttackRelease !== 'function') return;

    // Bright FM synthesis "bling"
    this.pickupSynth.triggerAttackRelease('C5', '16n');

    // Add harmonic
    setTimeout(() => {
      try { this.pickupSynth.triggerAttackRelease('G5', '16n'); } catch (e) { /* ignore */ }
    }, 40);
  }

  /**
   * Successful action completion
   */
  playSuccess(): void {
    if (!this.enabled || !this.isInitialized) return;
    if (!this.successSynth || typeof this.successSynth.triggerAttackRelease !== 'function') return;

    // Pleasant chord progression
    const notes = ['C4', 'E4', 'G4'];

    this.successSynth.triggerAttackRelease(notes, '8n');

    // Add a secondary chord
    setTimeout(() => {
      try {
        const highNotes = ['G5', 'B5', 'D6'];
        this.successSynth.triggerAttackRelease(highNotes, '4n');
      } catch (e) { /* ignore */ }
    }, 150);
  }

  /**
   * Level up or achievement sound
   */
  playLevelUp(): void {
    if (!this.enabled || !this.isInitialized) return;
    if (!this.successSynth || typeof this.successSynth.triggerAttackRelease !== 'function') return;

    // Majestic rising sequence
    const sequence = ['G3', 'C4', 'E4', 'G4', 'C5'];

    sequence.forEach((note, index) => {
      setTimeout(() => {
        try { this.successSynth.triggerAttackRelease(note, '16n'); } catch (e) { /* ignore */ }
      }, index * 80);
    });
  }

  /**
   * Player attack action
   */
  playAttack(): void {
    if (!this.enabled || !this.isInitialized) return;
    if (!this.errorSynth || typeof this.errorSynth.triggerAttackRelease !== 'function') return;

    // Aggressive but pleasant attack sound
    this.errorSynth.triggerAttackRelease('D3', '8n');
  }

  /**
   * Player damage taken
   */
  playDamage(): void {
    if (!this.enabled || !this.isInitialized) return;
    if (!this.errorSynth || typeof this.errorSynth.triggerAttackRelease !== 'function') return;

    // Tense but pleasant hurt sound
    this.errorSynth.triggerAttackRelease('F2', '8n');
  }

  /**
   * Error or invalid action
   */
  playError(): void {
    if (!this.enabled || !this.isInitialized) return;
    if (!this.errorSynth || typeof this.errorSynth.triggerAttackRelease !== 'function') return;

    // Gentle error sound - not harsh
    this.errorSynth.triggerAttackRelease('D2', '4n');
  }

  /**
   * Menu navigation
   */
  playNavigation(): void {
    if (!this.enabled || !this.isInitialized) return;
    if (!this.notificationSynth || typeof this.notificationSynth.triggerAttackRelease !== 'function') return;

    // Smooth navigation blip
    this.notificationSynth.triggerAttackRelease('A4', '32n');
  }

  /**
   * Ambient background melody (if enabled)
   *
   * Creates a single interval that is tracked and cleared on dispose.
   */
  playAmbient(): void {
    if (!this.enabled || !this.isInitialized || this.musicVolume < 0.1) return;
    if (!this.ambientSynth || typeof this.ambientSynth.triggerAttack !== 'function') return;

    // If an ambient interval already exists, don't create another
    if (this.ambientIntervalId !== null) return;

    // Gentle ambient pluck
    const notes = ['C4', 'F4', 'A4', 'D5'];

    this.ambientIntervalId = window.setInterval(() => {
      if (!this.enabled) return;
      const randomNote = notes[Math.floor(Math.random() * notes.length)];
      try {
        this.ambientSynth.triggerAttack(randomNote, '+0', this.musicVolume);
      } catch (e) {
        // ignore
      }
    }, 4000); // Every 4 seconds
  }

  /**
   * New notification
   */
  playNotification(): void {
    if (!this.enabled || !this.isInitialized) return;
    if (!this.notificationSynth || typeof this.notificationSynth.triggerAttackRelease !== 'function') return;

    // Pleasant notification ping
    this.notificationSynth.triggerAttackRelease('E5', '8n');
  }

  /**
   * Healing or positive effect
   */
  playHeal(): void {
    if (!this.enabled || !this.isInitialized) return;
    if (!this.pickupSynth || typeof this.pickupSynth.triggerAttackRelease !== 'function') return;

    // Soothing healing sound
    const notes = ['C4', 'F4', 'A4'];
    this.pickupSynth.triggerAttackRelease(notes, '4n');
  }

  /**
   * Get current audio levels for debugging
   */
  getLevels(): { master: number; enabled: boolean } {
    try {
      const masterValue = this.masterMeter && typeof this.masterMeter.getValue === 'function'
        ? (this.masterMeter.getValue() as number)
        : 0;
      return {
        master: masterValue,
        enabled: this.enabled
      };
    } catch (e) {
      return { master: 0, enabled: this.enabled };
    }
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
    // Clear ambient interval
    if (this.ambientIntervalId !== null) {
      try { clearInterval(this.ambientIntervalId); } catch (e) { /* ignore */ }
      this.ambientIntervalId = null;
    }

    // Dispose of all synths and meter defensively
    try {
      if (this.clickSynth && typeof this.clickSynth.dispose === 'function') {
        try { this.clickSynth.dispose(); } catch (e) { /* ignore */ }
      }
      if (this.moveSynth && typeof this.moveSynth.dispose === 'function') {
        try { this.moveSynth.dispose(); } catch (e) { /* ignore */ }
      }
      if (this.successSynth && typeof this.successSynth.dispose === 'function') {
        try { this.successSynth.dispose(); } catch (e) { /* ignore */ }
      }
      if (this.errorSynth && typeof this.errorSynth.dispose === 'function') {
        try { this.errorSynth.dispose(); } catch (e) { /* ignore */ }
      }
      if (this.pickupSynth && typeof this.pickupSynth.dispose === 'function') {
        try { this.pickupSynth.dispose(); } catch (e) { /* ignore */ }
      }
      if (this.notificationSynth && typeof this.notificationSynth.dispose === 'function') {
        try { this.notificationSynth.dispose(); } catch (e) { /* ignore */ }
      }
      if (this.ambientSynth && typeof this.ambientSynth.dispose === 'function') {
        try { this.ambientSynth.dispose(); } catch (e) { /* ignore */ }
      }
      if (this.masterMeter && typeof this.masterMeter.dispose === 'function') {
        try { this.masterMeter.dispose(); } catch (e) { /* ignore */ }
      }
    } finally {
      // Null out references
      this.clickSynth = null;
      this.moveSynth = null;
      this.successSynth = null;
      this.errorSynth = null;
      this.pickupSynth = null;
      this.notificationSynth = null;
      this.ambientSynth = null;
      this.masterMeter = null;
      this.isInitialized = false;
    }
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
