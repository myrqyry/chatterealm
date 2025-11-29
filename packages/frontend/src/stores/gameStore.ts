import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Import types from shared package
import type { GameWorld, Player, UnifiedSettings } from 'shared';
import { MovementStyle, Theme, NotificationType } from 'shared';

// Import notification types
import type { NotificationData } from '../types/notification';

// Import WebSocket client
import { webSocketClient } from '../services/webSocketClient';
import { createMockGameWorld } from '../services/worldGeneration/WorldGenerator';
import { EntityManager, Time, MessageDispatcher } from '../ai';

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

  // Notifications state
  notifications: NotificationData[];

  // Performance and caching
  cache: Map<string, any>;
  performanceMetrics: {
    renderTime: number;
    updateFrequency: number;
    memoryUsage: number;
  };

  // Unified settings state
  unifiedSettings: UnifiedSettings;

  // AI System State
  entityManager: EntityManager;
  time: Time;
  messageDispatcher: MessageDispatcher;

  // Actions
  updateAI: () => void;
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

  // Sidebar UI state
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Notification actions
  addNotification: (notification: Omit<NotificationData, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;

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
  handleRegenerateWorld: () => void;
  handleCreateCharacter: (characterData: any) => Promise<void>;
  movePlayer: (direction: 'up' | 'down' | 'left' | 'right') => void;
  moveTo: (target: { x: number; y: number }) => void;
  attackPlayer: (targetId: string) => void;
  pickupItem: (itemId: string) => void;
  useItem: (itemId: string) => void;
  startCataclysm: () => void;
  clearMessage: () => void;
  handleJoinGame: (characterData?: { displayName: string; class: any; avatar: string }) => void;
  handleStartCataclysm: () => void;
  handlePickUpItem: () => void;

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
    renderScale: 1.0,  // Full resolution for crisp rendering
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
    roughness: 0.8,  // Reduced for cleaner lines
    bowing: 0.5,     // Reduced for straighter lines
    fillWeight: 1.5, // Balanced fill weight
    hachureAngle: 45,
    hachureGap: 3,   // Tighter gap for smoother fills
    fillStyle: 'solid', // Solid fills for cleaner look
    seed: 1, // Default seed for rough.js randomness
    strokeWidth: 4.0, // Increased for thicker lines
    simplification: 0.8,
    dashOffset: 0,
    dashGap: 0,
    zigzagOffset: 0,
    curveFitting: 0.95,
    curveTightness: 0,
    curveStepCount: 9,
    fillShapeRoughnessGain: 0.4,  // Reduced for smoother fills
    disableMultiStroke: false,
    disableMultiStrokeFill: false,
    preserveVertices: false,
  },
});

export const useGameStore = create<GameState>()(
  devtools(
    persist(
      (set, get) => {
        const entityManager = new EntityManager();
        const time = Time.getInstance();
        const messageDispatcher = MessageDispatcher.getInstance();
        messageDispatcher.setEntityManager(entityManager);
        webSocketClient.setEntityManager(entityManager);


        return {
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

        // Notifications state
        notifications: [],

        // Performance and caching
        cache: new Map(),
        performanceMetrics: {
          renderTime: 0,
          updateFrequency: 0,
          memoryUsage: 0,
        },

        // Unified settings state with defaults
        unifiedSettings: createDefaultUnifiedSettings(),
        // UI state: whether sidebar is collapsed (for responsive layouts)
        sidebarCollapsed: false,

        // AI System State
        entityManager,
        time,
        messageDispatcher,

        // AI Actions
        updateAI: () => {
          const { time, entityManager, messageDispatcher } = get();
          time.update();
          const delta = time.getDelta();
          entityManager.updateEntities(delta);
          messageDispatcher.dispatchDelayedMessages();
        },

        // Game actions
        joinGame: (playerData) => {
          webSocketClient.joinGame(playerData);
        },

        handleRegenerateWorld: () => {
          const newWorld = createMockGameWorld();
          set({
            gameWorld: newWorld,
            currentPlayer: newWorld.players[0],
            gameMessage: '🌍 New world generated! Explore the fresh terrain!',
          });
          setTimeout(() => set({ gameMessage: '' }), 5000);
        },

        handleCreateCharacter: async (characterData) => {
          try {
            const newPlayer = await webSocketClient.createNewCharacter(characterData);
            set({
              currentPlayer: newPlayer,
              gameMessage: `Character ${newPlayer.name} created! Welcome!`,
            });
          } catch (error) {
            set({
              error: `Error creating character: ${error.message || 'Unknown error'}`,
            });
            // Re-throw the error so the UI can also react to it
            throw error;
          }
        },

        handleJoinGame: (characterData) => {
          const playerData = characterData ? {
            id: 'player_' + Date.now(),
            displayName: characterData.displayName,
            class: characterData.class,
            avatar: characterData.avatar
          } : {
            id: 'player_' + Date.now(),
            displayName: 'TestPlayer',
            class: 'knight' as any,
            avatar: '🤠'
          };
          webSocketClient.joinGame(playerData);
        },

        handleStartCataclysm: () => {
          set({ gameMessage: 'Cataclysm started!' });
        },

        handlePickUpItem: () => {
          set({ gameMessage: 'Looking for items...' });
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
        setSidebarCollapsed: (collapsed: boolean) => set({ sidebarCollapsed: collapsed }),
        // Notification actions
        addNotification: (notification) => set((state) => ({
          notifications: [...state.notifications, {
            ...notification,
            id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          }]
        })),

        removeNotification: (id) => set((state) => ({
          notifications: state.notifications.filter(n => n.id !== id)
        })),

        clearNotifications: () => set({ notifications: [] }),

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

        // Unified settings updates
        updateGameSettings: (settings) => get().updateUnifiedSettings({ game: { ...get().unifiedSettings.game, ...settings } }),
        updateAudioSettings: (settings) => get().updateUnifiedSettings({ audio: { ...get().unifiedSettings.audio, ...settings } }),
        updateNotificationSettings: (settings) => get().updateUnifiedSettings({ notifications: { ...get().unifiedSettings.notifications, ...settings } }),
        updateVisualSettings: (settings) => get().updateUnifiedSettings({ visual: { ...get().unifiedSettings.visual, ...settings } }),
        updateWorldSettings: (settings) => get().updateUnifiedSettings({ world: { ...get().unifiedSettings.world, ...settings } }),
        updateAnimationSettings: (settings) => get().updateUnifiedSettings({ animations: { ...get().unifiedSettings.animations, ...settings } }),

        // Simplified main update method
        updateUnifiedSettings: (settings) => set((state) => ({
          unifiedSettings: { ...state.unifiedSettings, ...settings }
        })),

        // Settings resets
        resetGameSettings: () => get().updateUnifiedSettings({ game: createDefaultUnifiedSettings().game }),
        resetAudioSettings: () => get().updateUnifiedSettings({ audio: createDefaultUnifiedSettings().audio }),
        resetNotificationSettings: () => get().updateUnifiedSettings({ notifications: createDefaultUnifiedSettings().notifications }),
        resetVisualSettings: () => get().updateUnifiedSettings({ visual: createDefaultUnifiedSettings().visual }),
        resetWorldSettings: () => get().updateUnifiedSettings({ world: createDefaultUnifiedSettings().world }),
        resetAnimationSettings: () => get().updateUnifiedSettings({ animations: createDefaultUnifiedSettings().animations }),

        resetAllSettings: () => set({ unifiedSettings: createDefaultUnifiedSettings() }),

        exportSettings: () => {
          const state = get();
          return JSON.stringify({
            version: '2.0',
            settings: state.unifiedSettings,
            exportedAt: Date.now()
          }, null, 2);
        },

        importSettings: (settingsJson: string) => {
          try {
            const data = JSON.parse(settingsJson);

            if (!data || typeof data !== 'object') {
              throw new Error('Invalid settings format');
            }

            // Only accept v2.0 format (legacy migration removed for simplicity)
            if (data.version !== '2.0') {
              console.error('Unsupported settings version. Please export settings again.');
              return false;
            }

            // Validate settings structure
            if (!data.settings || typeof data.settings !== 'object') {
              throw new Error('Missing settings object');
            }

            // Merge with defaults to ensure all fields exist
            set({
              unifiedSettings: {
                ...createDefaultUnifiedSettings(),
                ...data.settings
              }
            });

            return true;
          } catch (error) {
            console.error('Failed to import settings:', error);
            return false;
          }
        },
      }
    },
      {
        name: 'game-store-v2',
        partialize: (state) => ({
          unifiedSettings: state.unifiedSettings,
          selectedTab: state.selectedTab,
          showDevPanel: state.showDevPanel,
          // Persist the sidebar collapsed state so user preference survives reloads
          sidebarCollapsed: state.sidebarCollapsed,
        }),
        // Migration logic for upgrading from old format and to ensure defaults
        onRehydrateStorage: () => (state) => {
          if (state) {
            // Ensure sidebarCollapsed exists in persisted snapshot
            if (typeof (state as any).sidebarCollapsed === 'undefined') {
              (state as any).sidebarCollapsed = false;
            }

            // If no unifiedSettings, create from defaults (old storage will be migrated via import logic)
            if (!state.unifiedSettings) {
              state.unifiedSettings = createDefaultUnifiedSettings();
            }
          }
        }
      }
    ),
    {
      name: 'game-store-v2'
    }
  )
);
