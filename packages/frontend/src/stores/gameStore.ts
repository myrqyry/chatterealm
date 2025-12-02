import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

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
  // Core game state - these will be managed by TanStack Query in Phase 4
  gameWorld: GameWorld | null;
  currentPlayer: Player | null;
  selectedPlayerId: string | null;

  // AI System State
  entityManager: EntityManager;
  time: Time;
  messageDispatcher: MessageDispatcher;

  // Actions
  updateAI: () => void;
  setGameWorld: (world: GameWorld) => void;
  setCurrentPlayer: (player: Player | null) => void;
  setSelectedPlayerId: (playerId: string | null) => void;

  // Game actions (these will be moved to TanStack Query in Phase 4)
  joinGame: (playerData: Partial<Player>) => void;
  handleRegenerateWorld: () => void;
  handleCreateCharacter: (characterData: any) => Promise<void>;
  movePlayer: (direction: 'up' | 'down' | 'left' | 'right') => void;
  moveTo: (target: { x: number; y: number }) => void;
  attackPlayer: (targetId: string) => void;
  pickupItem: (itemId: string) => void;
  useItem: (itemId: string) => void;
  startCataclysm: () => void;
  handleJoinGame: (characterData?: { displayName: string; class: any; avatar: string }) => void;
  handleStartCataclysm: () => void;
  handlePickUpItem: () => void;

  // Utility functions
  getPlayerById: (id: string) => Player | undefined;
  getNearbyPlayers: (radius?: number) => Player[];
  getGameStats: () => { totalPlayers: number; activePlayers: number; worldAge: number };
}

export const useGameStore = create<GameState>()(
  devtools(
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
          });
        },

        handleCreateCharacter: async (characterData) => {
          try {
            const newPlayer = await webSocketClient.createNewCharacter(characterData);
            set({
              currentPlayer: newPlayer,
            });
          } catch (error) {
            console.error('Failed to create character:', error);
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
          // Cataclysm logic will be handled by TanStack Query
        },

        handlePickUpItem: () => {
          // Item pickup logic will be handled by TanStack Query
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

        // State setters
        setGameWorld: (world) => set({ gameWorld: world }),
        setCurrentPlayer: (player) => set({ currentPlayer: player }),
        setSelectedPlayerId: (playerId) => set({ selectedPlayerId: playerId }),

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
      }
    },
    {
      name: 'game-store'
    }
  )
);