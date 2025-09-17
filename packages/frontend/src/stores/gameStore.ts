import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Import types from shared package
import type { GameWorld, Player, UnifiedSettings } from 'shared';
import { MovementStyle, Theme, NotificationType } from 'shared';

// Import WebSocket client
import { webSocketClient } from '../services/webSocketClient';

interface GameState {
  // Core game state
  gameWorld: GameWorld | null;
  currentPlayer: Player | null;
  selectedPlayerId: string | null;

  // UI state
  selectedTab: string;
  gameMessage: string;
  showDevPanel: boolean;
  isLoading: boolean;
  error: string | null;
  lastUpdate: number;

  // Performance and caching
  cache: Map<string, any>;
  performanceMetrics: {
    renderTime: number;
    updateFrequency: number;
    memoryUsage: number;
  };

  // Unified settings state
  unifiedSettings: UnifiedSettings;

  // Actions
  setGameWorld: (world: GameWorld) => void;
  setCurrentPlayer: (player: Player | null) => void;
  setSelectedPlayerId: (playerId: string | null) => void;
  setSelectedTab: (tab: string) => void;
  setGameMessage: (message: string) => void;
  setShowDevPanel: (show: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateGameSettings: (settings: Partial<UnifiedSettings['game']>) => void;
  updateAudioSettings: (settings: Partial<UnifiedSettings['audio']>) => void;
  updateNotificationSettings: (settings: Partial<UnifiedSettings['notifications']>) => void;
  updateVisualSettings: (settings: Partial<UnifiedSettings['visual']>) => void;
  updateWorldSettings: (settings: Partial<UnifiedSettings['world']>) => void;
  updateAnimationSettings: (settings: Partial<UnifiedSettings['animations']>) => void;
  updateUnifiedSettings: (settings: Partial<UnifiedSettings>) => void;

  // Settings resets
  resetGameSettings: () => void;
  resetAudioSettings: () => void;
  resetNotificationSettings: () => void;
  resetVisualSettings: () => void;
  resetWorldSettings: () => void;
  resetAnimationSettings: () => void;
  resetAllSettings: () => void;
  exportSettings: () => string;
  importSettings: (settingsJson: string) => boolean;

  // Game actions
  joinGame: (playerData: Partial<Player>) => void;
  regenerateWorld: () => void;
  movePlayer: (direction: 'up' | 'down' | 'left' | 'right') => void;
  moveTo: (target: { x: number; y: number }) => void;
  attackPlayer: (targetId: string) => void;
  pickupItem: (itemId: string) => void;
  useItem: (itemId: string) => void;
  startCataclysm: () => void;
  clearMessage: () => void;

  // Utility functions
  getPlayerById: (id: string) => Player | undefined;
  getNearbyPlayers: (radius?: number) => Player[];
  getGameStats: () => { totalPlayers: number; activePlayers: number; worldAge: number };
  validateSettings: (settings: Partial<UnifiedSettings>) => boolean;
  getSetting: <K extends keyof UnifiedSettings>(category: K) => UnifiedSettings[K];
  updatePerformanceMetrics: (metrics: Partial<GameState['performanceMetrics']>) => void;
  clearCache: () => void;
}

// Default unified settings with all the default values
const createDefaultUnifiedSettings = (): UnifiedSettings => ({
  game: {
    // General Game Settings
    autoSaveEnabled: true,
    tutorialEnabled: true,
    minimapEnabled: true,
    showNPCNames: true,
    showItemNames: true,
    movementStyle: MovementStyle.GRID,

    // Combat Settings
    showDamageNumbers: true,
    autoCombatEnabled: false,
  },

  audio: {
    // Volume Controls
    audioMasterVolume: 80,
    sfxVolume: 70,
    musicVolume: 60,

    // Toggle Controls
    soundEnabled: true,
    musicEnabled: true,
  },

  notifications: {
    // General Notifications
    desktopNotifications: true,
    soundNotifications: true,
    battleNotifications: true,
    systemNotifications: true,

    // Event-specific Notification Types
    playerJoinNotifications: [NotificationType.DESKTOP, NotificationType.SOUND, NotificationType.INGAME],
    itemDropNotifications: [NotificationType.SOUND, NotificationType.INGAME],
    levelUpNotifications: [NotificationType.DESKTOP, NotificationType.SOUND, NotificationType.INGAME],
    cataclysmNotifications: [NotificationType.DESKTOP, NotificationType.INGAME],
  },

  visual: {
    // Theme & Appearance
    theme: Theme.DARK,
    language: 'en',
    fontSize: 100,

    // Accessibility
    highContrast: false,
    reduceMotion: false,

    // Visual Display
    showGrid: true,
    showParticles: true,
    showHealthBars: true,
    backgroundColor: '#191724',

    // Performance Settings
    renderScale: 0.75,
  },

  world: {
    // World Dimensions
    worldWidth: 40,
    worldHeight: 30,

    // Terrain Animation
    grassWaveSpeed: 0.1,
    treeSwaySpeed: 0.025,
    flowerSpawnRate: 0.01,
    windSpeed: 0.02,

    // World Rendering
    nightMode: false,
  },

  animations: {
    // Animation Controls
    animationSpeed: 1.0,
    breathingRate: 0.05,
    particleCount: 5,

    // Visual Display (duplicated in visual for backward compatibility)
    showParticles: true,
    showGrid: true,

    // Terrain Animation (duplicated with world for backward compatibility)
    grassWaveSpeed: 0.1,
    treeSwaySpeed: 0.025,
    flowerSpawnRate: 0.01,
    windSpeed: 0.02,

    // Rough.js Settings
    roughness: 1.5,
    bowing: 1.2,
    fillWeight: 2.0, // Increased for thicker fills
    hachureAngle: 45,
    hachureGap: 4,
    fillStyle: 'hachure', // Default fill style
    seed: 1, // Default seed for rough.js randomness
    strokeWidth: 4.0, // Increased for thicker lines
    simplification: 0.8,
    dashOffset: 0,
    dashGap: 0,
    zigzagOffset: 0,
    curveFitting: 0.95,
    curveTightness: 0,
    curveStepCount: 9,
    fillShapeRoughnessGain: 0.8,
    disableMultiStroke: false,
    disableMultiStrokeFill: false,
    preserveVertices: false,
  },
});

export const useGameStore = create<GameState>()(
  devtools(
    persist(
      (set, get) => ({
        // Core game state
        gameWorld: null,
        currentPlayer: null,
        selectedPlayerId: null,
        selectedTab: 'status',
        gameMessage: '',
        showDevPanel: false,
        isLoading: false,
        error: null,
        lastUpdate: Date.now(),

        // Performance and caching
        cache: new Map(),
        performanceMetrics: {
          renderTime: 0,
          updateFrequency: 0,
          memoryUsage: 0,
        },

        // Unified settings state with defaults
        unifiedSettings: createDefaultUnifiedSettings(),

        // Game actions
        joinGame: (playerData) => {
          webSocketClient.joinGame(playerData);
        },

        regenerateWorld: () => {
          set({
            gameMessage: '🌍 New world generated! Explore the fresh terrain!'
          });
          setTimeout(() => set({ gameMessage: '' }), 5000);
        },

        movePlayer: (direction) => {
          webSocketClient.movePlayer(direction);
        },

        moveTo: (target) => {
          webSocketClient.moveTo(target);
        },

        attackPlayer: (targetId) => {
          webSocketClient.attackPlayer(targetId);
        },

        pickupItem: (itemId) => {
          webSocketClient.pickupItem(itemId);
        },

        useItem: (itemId) => {
          webSocketClient.useItem(itemId);
        },

        startCataclysm: () => {
          webSocketClient.startCataclysm();
        },

        clearMessage: () => set({ gameMessage: '' }),

        // State setters
        setGameWorld: (world) => set({ gameWorld: world }),
        setCurrentPlayer: (player) => set({ currentPlayer: player }),
        setSelectedPlayerId: (playerId) => set({ selectedPlayerId: playerId }),
        setSelectedTab: (tab) => set({ selectedTab: tab }),
        setGameMessage: (message) => set({ gameMessage: message }),
        setShowDevPanel: (show) => set({ showDevPanel: show }),
        setLoading: (loading) => set({ isLoading: loading }),
        setError: (error) => set({ error, lastUpdate: Date.now() }),

        // Utility functions
        getPlayerById: (id) => {
          const state = get();
          return state.gameWorld?.players.find(player => player.id === id);
        },

        getNearbyPlayers: (radius = 5) => {
          const state = get();
          if (!state.currentPlayer || !state.gameWorld) return [];

          const { x, y } = state.currentPlayer.position;
          return state.gameWorld.players.filter(player => {
            if (player.id === state.currentPlayer?.id) return false;
            const distance = Math.sqrt(
              Math.pow(player.position.x - x, 2) + Math.pow(player.position.y - y, 2)
            );
            return distance <= radius;
          });
        },

        getGameStats: () => {
          const state = get();
          const totalPlayers = state.gameWorld?.players.length || 0;
          const activePlayers = state.gameWorld?.players.filter(p => p.connected).length || 0;
          const worldAge = state.gameWorld?.worldAge || 0;
          return { totalPlayers, activePlayers, worldAge };
        },

        validateSettings: (settings) => {
          // Basic validation for settings
          if (!settings || typeof settings !== 'object') return false;

          // Validate volume ranges
          if (settings.audio) {
            const { audioMasterVolume, sfxVolume, musicVolume } = settings.audio;
            if (audioMasterVolume < 0 || audioMasterVolume > 100) return false;
            if (sfxVolume < 0 || sfxVolume > 100) return false;
            if (musicVolume < 0 || musicVolume > 100) return false;
          }

          // Validate font size
          if (settings.visual && (settings.visual.fontSize < 50 || settings.visual.fontSize > 200)) {
            return false;
          }

          return true;
        },

        getSetting: (category) => {
          const state = get();
          return state.unifiedSettings[category];
        },

        updatePerformanceMetrics: (metrics) => set((state) => ({
          performanceMetrics: { ...state.performanceMetrics, ...metrics },
          lastUpdate: Date.now()
        })),

        clearCache: () => set({ cache: new Map() }),

        // Settings updates
        updateGameSettings: (settings) => set((state) => ({
          unifiedSettings: {
            ...state.unifiedSettings,
            game: { ...state.unifiedSettings.game, ...settings }
          }
        })),

        updateAudioSettings: (settings) => set((state) => ({
          unifiedSettings: {
            ...state.unifiedSettings,
            audio: { ...state.unifiedSettings.audio, ...settings }
          }
        })),

        updateNotificationSettings: (settings) => set((state) => ({
          unifiedSettings: {
            ...state.unifiedSettings,
            notifications: { ...state.unifiedSettings.notifications, ...settings }
          }
        })),

        updateVisualSettings: (settings) => set((state) => ({
          unifiedSettings: {
            ...state.unifiedSettings,
            visual: { ...state.unifiedSettings.visual, ...settings }
          }
        })),

        updateWorldSettings: (settings) => set((state) => ({
          unifiedSettings: {
            ...state.unifiedSettings,
            world: { ...state.unifiedSettings.world, ...settings }
          }
        })),

        updateAnimationSettings: (settings) => set((state) => ({
          unifiedSettings: {
            ...state.unifiedSettings,
            animations: { ...state.unifiedSettings.animations, ...settings }
          }
        })),

        // Legacy update methods - kept for backward compatibility but deprecated
        updateSettings: (settings) => set((state) => ({
          unifiedSettings: {
            ...state.unifiedSettings,
            game: { ...state.unifiedSettings.game, ...settings }
          }
        })),

        updateUnifiedSettings: (settings) => set((state) => ({
          unifiedSettings: { ...state.unifiedSettings, ...settings }
        })),

        // Settings resets
        resetGameSettings: () => set((state) => ({
          unifiedSettings: {
            ...state.unifiedSettings,
            game: createDefaultUnifiedSettings().game
          }
        })),

        resetAudioSettings: () => set((state) => ({
          unifiedSettings: {
            ...state.unifiedSettings,
            audio: createDefaultUnifiedSettings().audio
          }
        })),

        resetNotificationSettings: () => set((state) => ({
          unifiedSettings: {
            ...state.unifiedSettings,
            notifications: createDefaultUnifiedSettings().notifications
          }
        })),

        resetVisualSettings: () => set((state) => ({
          unifiedSettings: {
            ...state.unifiedSettings,
            visual: createDefaultUnifiedSettings().visual
          }
        })),

        resetWorldSettings: () => set((state) => ({
          unifiedSettings: {
            ...state.unifiedSettings,
            world: createDefaultUnifiedSettings().world
          }
        })),

        resetAnimationSettings: () => set((state) => ({
          unifiedSettings: {
            ...state.unifiedSettings,
            animations: createDefaultUnifiedSettings().animations
          }
        })),

        resetAllSettings: () => set({
          unifiedSettings: createDefaultUnifiedSettings()
        }),

        exportSettings: () => {
          const state = get();
          return JSON.stringify({
            settings: state.unifiedSettings,
            version: '2.0',
            exportedAt: Date.now()
          }, null, 2);
        },

        importSettings: (settingsJson: string) => {
          try {
            const importedData = JSON.parse(settingsJson);
            if (importedData && typeof importedData === 'object') {
              // Handle legacy format (version 1.0) for backward compatibility
              if (!importedData.version || importedData.version === '1.0') {
                const legacySettings = importedData.settings || importedData;
                const legacyAnimationSettings = importedData.animationSettings || {};

                // Migrate legacy settings to unified format
                const migratedSettings: UnifiedSettings = {
                  game: {
                    autoSaveEnabled: legacySettings.autoSaveEnabled ?? true,
                    tutorialEnabled: legacySettings.tutorialEnabled ?? true,
                    minimapEnabled: legacySettings.minimapEnabled ?? true,
                    showNPCNames: legacySettings.showNPCNames ?? true,
                    showItemNames: legacySettings.showItemNames ?? true,
                    movementStyle: legacySettings.movementStyle ?? MovementStyle.GRID,
                    showDamageNumbers: legacySettings.showDamageNumbers ?? true,
                    autoCombatEnabled: legacySettings.autoCombatEnabled ?? false,
                  },
                  audio: {
                    audioMasterVolume: legacySettings.audioMasterVolume ?? 80,
                    sfxVolume: legacySettings.sfxVolume ?? 70,
                    musicVolume: legacySettings.musicVolume ?? 60,
                    soundEnabled: legacySettings.soundEnabled ?? true,
                    musicEnabled: legacySettings.musicEnabled ?? true,
                  },
                  notifications: {
                    desktopNotifications: legacySettings.desktopNotifications ?? true,
                    soundNotifications: legacySettings.soundNotifications ?? true,
                    battleNotifications: legacySettings.battleNotifications ?? true,
                    systemNotifications: legacySettings.systemNotifications ?? true,
                    playerJoinNotifications: legacySettings.playerJoinNotifications ?? [NotificationType.DESKTOP, NotificationType.SOUND, NotificationType.INGAME],
                    itemDropNotifications: legacySettings.itemDropNotifications ?? [NotificationType.SOUND, NotificationType.INGAME],
                    levelUpNotifications: legacySettings.levelUpNotifications ?? [NotificationType.DESKTOP, NotificationType.SOUND, NotificationType.INGAME],
                    cataclysmNotifications: legacySettings.cataclysmNotifications ?? [NotificationType.DESKTOP, NotificationType.INGAME],
                  },
                  visual: {
                    theme: (legacySettings.theme ?? 'dark') as Theme,
                    language: legacySettings.language ?? 'en',
                    fontSize: legacySettings.fontSize ?? 100,
                    highContrast: legacySettings.highContrast ?? false,
                    reduceMotion: legacySettings.reduceMotion ?? false,
                    // Visual overlay/display flags were previously mixed into animationSettings
                    showGrid: legacySettings.showGrid ?? legacyAnimationSettings.showGrid ?? true,
                    showParticles: legacySettings.showParticles ?? legacyAnimationSettings.showParticles ?? true,
                    showHealthBars: legacySettings.showHealthBars ?? legacyAnimationSettings.showHealthBars ?? true,
                    backgroundColor: legacySettings.backgroundColor ?? legacyAnimationSettings.backgroundColor ?? '#191724',
                    renderScale: 0.75, // Default render scale for performance
                  },
                  world: {
                    worldWidth: legacyAnimationSettings.worldWidth ?? 40,
                    worldHeight: legacyAnimationSettings.worldHeight ?? 30,
                    grassWaveSpeed: legacyAnimationSettings.grassWaveSpeed ?? 0.1,
                    treeSwaySpeed: legacyAnimationSettings.treeSwaySpeed ?? 0.025,
                    flowerSpawnRate: legacyAnimationSettings.flowerSpawnRate ?? 0.01,
                    windSpeed: legacyAnimationSettings.windSpeed ?? 0.02,
                    nightMode: false, // Default to day mode for legacy settings
                  },
                  animations: {
                    animationSpeed: legacyAnimationSettings.animationSpeed ?? 1.0,
                    breathingRate: legacyAnimationSettings.breathingRate ?? 0.05,
                    particleCount: legacyAnimationSettings.particleCount ?? legacyAnimationSettings.particles ?? 5,
                    showParticles: legacyAnimationSettings.showParticles ?? legacySettings.showParticles ?? true,
                    showGrid: legacyAnimationSettings.showGrid ?? legacySettings.showGrid ?? true,
                    grassWaveSpeed: legacyAnimationSettings.grassWaveSpeed ?? legacySettings.grassWaveSpeed ?? 0.1,
                    treeSwaySpeed: legacyAnimationSettings.treeSwaySpeed ?? legacySettings.treeSwaySpeed ?? 0.025,
                    flowerSpawnRate: legacyAnimationSettings.flowerSpawnRate ?? legacySettings.flowerSpawnRate ?? 0.01,
                    windSpeed: legacyAnimationSettings.windSpeed ?? legacySettings.windSpeed ?? 0.02,
                    roughness: legacyAnimationSettings.roughness ?? 1.5,
                    bowing: legacyAnimationSettings.bowing ?? 1.2,
                    fillWeight: legacyAnimationSettings.fillWeight ?? 1.5,
                    hachureAngle: legacyAnimationSettings.hachureAngle ?? 45,
                    hachureGap: legacyAnimationSettings.hachureGap ?? 4,
                    fillStyle: legacyAnimationSettings.fillStyle ?? 'hachure',
                    seed: legacyAnimationSettings.seed ?? 1,
                    strokeWidth: 3.0,
                    simplification: 0.8,
                    dashOffset: 0,
                    dashGap: 0,
                    zigzagOffset: 0,
                    curveFitting: 0.95,
                    curveTightness: 0,
                    curveStepCount: 9,
                    fillShapeRoughnessGain: 0.8,
                    disableMultiStroke: false,
                    disableMultiStrokeFill: false,
                    preserveVertices: false,
                  },
                };
                set({ unifiedSettings: migratedSettings });
              } else {
                // Handle new unified format
                if (importedData.settings && typeof importedData.settings === 'object') {
                  set({ unifiedSettings: { ...get().unifiedSettings, ...importedData.settings } });
                }
              }
              return true;
            }
          } catch (error) {
            console.error('Failed to import settings:', error);
          }
          return false;
        },
      }),
      {
        name: 'game-store-v2',
        partialize: (state) => ({
          unifiedSettings: state.unifiedSettings,
          selectedTab: state.selectedTab,
          showDevPanel: state.showDevPanel
        }),
        // Migration logic for upgrading from old format
        onRehydrateStorage: () => (state) => {
          if (state && !state.unifiedSettings) {
            // If no unifiedSettings, create from defaults (old storage will be migrated via import logic)
            state.unifiedSettings = createDefaultUnifiedSettings();
          }
        }
      }
    ),
    {
      name: 'game-store-v2'
    }
  )
);
