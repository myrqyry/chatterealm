import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Import types from shared package
import { GameWorld, Player } from '../../../shared/src/types/game';

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

  // Animation and visual settings
  animationSettings: {
    // Rough.js settings
    roughness: number;
    bowing: number;
    fillWeight: number;
    hachureAngle: number;
    hachureGap: number;

    // Animation settings
    animationSpeed: number;
    breathingRate: number;
    particleCount: number;
    windSpeed: number;

    // Visual settings
    showGrid: boolean;
    showParticles: boolean;
    showHealthBars: boolean;
    backgroundColor: string;

    // Terrain settings
    grassWaveSpeed: number;
    treeSwaySpeed: number;
    flowerSpawnRate: number;

    // Game settings
    worldWidth: number;
    worldHeight: number;
  };

  // Actions
  setGameWorld: (world: GameWorld) => void;
  setCurrentPlayer: (player: Player | null) => void;
  setSelectedPlayerId: (playerId: string | null) => void;
  setSelectedTab: (tab: string) => void;
  setGameMessage: (message: string) => void;
  setShowDevPanel: (show: boolean) => void;
  updateAnimationSettings: (settings: Partial<GameState['animationSettings']>) => void;

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

export const useGameStore = create<GameState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        gameWorld: null,
        currentPlayer: null,
        selectedPlayerId: null,
        selectedTab: 'status',
        gameMessage: '',
        showDevPanel: false,

        animationSettings: {
          // Rough.js settings
          roughness: 1.5,
          bowing: 1.2,
          fillWeight: 1.5,
          hachureAngle: 45,
          hachureGap: 4,

          // Animation settings
          animationSpeed: 1.0,
          breathingRate: 0.05,
          particleCount: 5,
          windSpeed: 0.02,

          // Visual settings
          showGrid: true,
          showParticles: true,
          showHealthBars: true,
          backgroundColor: '#191724',

          // Terrain settings
          grassWaveSpeed: 0.1,
          treeSwaySpeed: 0.03,
          flowerSpawnRate: 0.01,

          // Game settings
          worldWidth: 40,
          worldHeight: 30
        },

        // Actions
        setGameWorld: (world) => set({ gameWorld: world }),
        setCurrentPlayer: (player) => set({ currentPlayer: player }),
        setSelectedPlayerId: (playerId) => set({ selectedPlayerId: playerId }),
        setSelectedTab: (tab) => set({ selectedTab: tab }),
        setGameMessage: (message) => set({ gameMessage: message }),
        setShowDevPanel: (show) => set({ showDevPanel: show }),

        updateAnimationSettings: (settings) => set((state) => ({
          animationSettings: { ...state.animationSettings, ...settings }
        })),

        // Game actions
        joinGame: (playerData) => {
          // Send join game command to server via WebSocket
          webSocketClient.joinGame(playerData);
        },

        regenerateWorld: () => {
          // This will be implemented to generate a new world
          // For now, we'll trigger a message
          set({
            gameMessage: '🌍 New world generated! Explore the fresh terrain!'
          });

          // Clear message after 5 seconds
          setTimeout(() => {
            set({ gameMessage: '' });
          }, 5000);
        },

        movePlayer: (direction) => {
          // Send move command to server via WebSocket
          webSocketClient.movePlayer(direction);
        },

        attackPlayer: (targetId) => {
          // Send attack command to server via WebSocket
          webSocketClient.attackPlayer(targetId);
        },

        pickupItem: (itemId) => {
          // Send pickup command to server via WebSocket
          webSocketClient.pickupItem(itemId);
        },

        useItem: (itemId) => {
          // Send use item command to server via WebSocket
          webSocketClient.useItem(itemId);
        },

        startCataclysm: () => {
          // Send start cataclysm command to server via WebSocket
          webSocketClient.startCataclysm();
        },

        clearMessage: () => set({ gameMessage: '' })
      }),
      {
        name: 'game-store',
        partialize: (state) => ({
          animationSettings: state.animationSettings,
          selectedTab: state.selectedTab,
          showDevPanel: state.showDevPanel
        })
      }
    ),
    {
      name: 'game-store'
    }
  )
);
