import { useEffect } from 'react';
import { useGameStore } from '../stores/gameStore';
import { webSocketClient } from '../services/webSocketClient';
import { createMockGameWorld } from '../services/worldGeneration/WorldGenerator';
import { GameWorld, Player } from '../../../shared/src/types/game';

interface GameWorldHook {
  gameWorld: GameWorld | null;
  currentPlayer: Player | null;
  selectedTab: string;
  gameMessage: string;
  animationSettings: {
    roughness: number;
    bowing: number;
    fillWeight: number;
    hachureAngle: number;
    hachureGap: number;
    animationSpeed: number;
    breathingRate: number;
    particleCount: number;
    windSpeed: number;
    showGrid: boolean;
    showParticles: boolean;
    showHealthBars: boolean;
    backgroundColor: string;
    grassWaveSpeed: number;
    treeSwaySpeed: number;
    flowerSpawnRate: number;
    worldWidth: number;
    worldHeight: number;
  };
  setGameWorld: (world: GameWorld) => void;
  setCurrentPlayer: (player: Player | null) => void;
  setSelectedTab: (tab: string) => void;
  setGameMessage: (message: string) => void;
  updateAnimationSettings: (settings: Partial<GameWorldHook['animationSettings']>) => void;
  movePlayer: (direction: 'up' | 'down' | 'left' | 'right') => void;
  handleRegenerateWorld: () => void;
  handleMove: (direction: 'up' | 'down' | 'left' | 'right') => void;
  handleJoinGame: () => void;
  handleStartCataclysm: () => void;
  handlePickUpItem: () => void;
}

export const useGameWorld = (): GameWorldHook => {
  const {
    gameWorld,
    currentPlayer,
    selectedTab,
    gameMessage,
    animationSettings,
    setGameWorld,
    setCurrentPlayer,
    setSelectedTab,
    setGameMessage: setGameMessageInStore, // Renamed to avoid conflict
    updateAnimationSettings,
    movePlayer
  } = useGameStore();

  useEffect(() => {
    // Remove automatic join logic - WebSocketClient now handles this automatically
    // The WebSocketClient will automatically join the game when connected
  }, [gameWorld, currentPlayer]);

  const handleRegenerateWorld = () => {
    const newWorld = createMockGameWorld();
    setGameWorld(newWorld);
    setCurrentPlayer(newWorld.players[0]);
    setGameMessageInStore('🌍 New world generated! Explore the fresh terrain!');

    setTimeout(() => setGameMessageInStore(''), 5000);
  };

  const handleMove = (direction: 'up' | 'down' | 'left' | 'right') => {
    movePlayer(direction);
  };

  const handleJoinGame = () => {
    const playerData = {
      id: 'player_' + Date.now(),
      displayName: 'TestPlayer',
      class: 'knight' as any,
      avatar: '🤠'
    };
    webSocketClient.joinGame(playerData);
  };

  const handleStartCataclysm = () => {
    setGameMessageInStore('Cataclysm started!');
  };

  const handlePickUpItem = () => {
    setGameMessageInStore('Looking for items...');
  };

  return {
    gameWorld,
    currentPlayer,
    selectedTab,
    gameMessage,
    animationSettings,
    setGameWorld,
    setCurrentPlayer,
    setSelectedTab,
    setGameMessage: setGameMessageInStore,
    updateAnimationSettings,
    movePlayer,
    handleRegenerateWorld,
    handleMove,
    handleJoinGame,
    handleStartCataclysm,
    handlePickUpItem,
  };
};