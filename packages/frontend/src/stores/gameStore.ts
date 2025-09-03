import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Import types from shared package
import { GameWorld, Player, UnifiedSettings, MovementStyle, Theme, NotificationType } from '../../../shared/src/types/game';

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

  // Unified settings state
  unifiedSettings: UnifiedSettings;

  // Legacy properties for backward compatibility
  settings: any; // Keep for migration
  animationSettings: any; // Keep for migration

  // Actions
  setGameWorld: (world: GameWorld) => void;
  setCurrentPlayer: (player: Player | null) => void;
  setSelectedPlayerId: (playerId: string | null) => void;
  setSelectedTab: (tab: string) => void;
  setGameMessage: (message: string) => void;
  setShowDevPanel: (show: boolean) => void;
  updateGameSettings: (settings: any) => void;
  updateAudioSettings: (settings: any) => void;
  updateNotificationSettings: (settings: any) => void;
  updateVisualSettings: (settings: any) => void;
  updateWorldSettings: (settings: any) => void;
  updateAnimationSettings: (settings: any) => void;
  updateUnifiedSettings: (settings: Partial<UnifiedSettings>) => void;

  // Legacy methods for backward compatibility
  updateSettings: (settings: any) => void;
  resetSettings: () => void;
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
  attackPlayer: (targetId: string) => void;
  pickupItem: (itemId: string) => void;
  useItem: (itemId: string) => void;
  startCataclysm: () => void;
  clearMessage: () => void;
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
  },

  world: {
    // World Dimensions
    worldWidth: 40,
    worldHeight: 30,

    // Terrain Animation
    grassWaveSpeed: 0.1,
    treeSwaySpeed: 0.03,
    flowerSpawnRate: 0.01,
    windSpeed: 0.02,
  },

  animations: {
    // Animation Controls
    animationSpeed: 1.0,
    breathingRate: 0.05,
    particleCount: 5,

    // Rough.js Settings
    roughness: 1.5,
    bowing: 1.2,
    fillWeight: 1.5,
    hachureAngle: 45,
    hachureGap: 4,
    fillStyle: 'hachure', // Default fill style
    seed: 1, // Default seed for rough.js randomness
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

        // Unified settings state with defaults
        unifiedSettings: createDefaultUnifiedSettings(),

        // Legacy properties for backward compatibility
        settings: createDefaultUnifiedSettings(),
        animationSettings: createDefaultUnifiedSettings().animations,

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

        // Legacy methods for backward compatibility
        updateSettings: (settings) => set((state) => ({
          settings: { ...state.settings, ...settings },
          unifiedSettings: {
            ...state.unifiedSettings,
            game: { ...state.unifiedSettings.game, ...settings?.game },
            audio: { ...state.unifiedSettings.audio, ...settings?.audio },
            notifications: { ...state.unifiedSettings.notifications, ...settings?.notifications },
            visual: { ...state.unifiedSettings.visual, ...settings?.visual },
          }
        })),

        resetSettings: () => set({
          settings: createDefaultUnifiedSettings(),
          unifiedSettings: createDefaultUnifiedSettings()
        }),

        // State setters
        setGameWorld: (world) => set({ gameWorld: world }),
        setCurrentPlayer: (player) => set({ currentPlayer: player }),
        setSelectedPlayerId: (playerId) => set({ selectedPlayerId: playerId }),
        setSelectedTab: (tab) => set({ selectedTab: tab }),
        setGameMessage: (message) => set({ gameMessage: message }),
        setShowDevPanel: (show) => set({ showDevPanel: show }),

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
          },
          animationSettings: createDefaultUnifiedSettings().animations
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
                    showGrid: legacyAnimationSettings.showGrid ?? true,
                    showParticles: legacyAnimationSettings.showParticles ?? true,
                    showHealthBars: legacyAnimationSettings.showHealthBars ?? true,
                    backgroundColor: legacyAnimationSettings.backgroundColor ?? '#191724',
                  },
                  world: {
                    worldWidth: legacyAnimationSettings.worldWidth ?? 40,
                    worldHeight: legacyAnimationSettings.worldHeight ?? 30,
                    grassWaveSpeed: legacyAnimationSettings.grassWaveSpeed ?? 0.1,
                    treeSwaySpeed: legacyAnimationSettings.treeSwaySpeed ?? 0.03,
                    flowerSpawnRate: legacyAnimationSettings.flowerSpawnRate ?? 0.01,
                    windSpeed: legacyAnimationSettings.windSpeed ?? 0.02,
                  },
  animations: {
    animationSpeed: 1.0,
    breathingRate: 0.05,
    particleCount: 5,
    roughness: 1.5,
    bowing: 1.2,
    fillWeight: 1.5,
    hachureAngle: 45,
    hachureGap: 4,
    showParticles: true,
    showGrid: true,
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
