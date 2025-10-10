import { useEffect } from 'react';
import { useGameStore } from '../stores/gameStore';
import { webSocketClient } from '../services/webSocketClient';
import { createMockGameWorld } from '../services/worldGeneration/WorldGenerator';
import type { GameWorld, Player, UnifiedSettings } from 'shared';

interface GameWorldHook {
  gameWorld: GameWorld | null;
  currentPlayer: Player | null;
  selectedTab: string;
  gameMessage: string;
  unifiedSettings: UnifiedSettings;
  setGameWorld: (world: GameWorld) => void;
  setCurrentPlayer: (player: Player | null) => void;
  setSelectedTab: (tab: string) => void;
  setGameMessage: (message: string) => void;
  updateUnifiedSettings: (settings: Partial<UnifiedSettings>) => void;
  movePlayer: (direction: 'up' | 'down' | 'left' | 'right') => void;
  handleRegenerateWorld: () => void;
  handleMove: (direction: 'up' | 'down' | 'left' | 'right') => void;
  handleJoinGame: (characterData?: { displayName: string; class: any; avatar: string }) => void;
  handleCreateCharacter: (characterData: any) => Promise<void>;
  handleStartCataclysm: () => void;
  handlePickUpItem: () => void;
}

export const useGameWorld = (): GameWorldHook => {
  const {
    gameWorld,
    currentPlayer,
    selectedTab,
    gameMessage,
    unifiedSettings,
    setGameWorld,
    setCurrentPlayer,
    setSelectedTab,
    setGameMessage: setGameMessageInStore, // Renamed to avoid conflict
    updateUnifiedSettings,
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

  const handleJoinGame = (characterData?: { displayName: string; class: any; avatar: string }) => {
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
  };

  const handleCreateCharacter = async (characterData: any) => {
    try {
      const newPlayer = await webSocketClient.createNewCharacter(characterData);
      setCurrentPlayer(newPlayer);
      setGameMessageInStore(`Character ${newPlayer.name} created! Welcome!`);
    } catch (error: any) {
      console.error("Failed to create character:", error);
      setGameMessageInStore(`Error creating character: ${error.message || 'Unknown error'}`);
      // Re-throw the error so the UI can also react to it
      throw error;
    }
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
    unifiedSettings,
    setGameWorld,
    setCurrentPlayer,
    setSelectedTab,
    setGameMessage: setGameMessageInStore,
    updateUnifiedSettings,
    movePlayer,
    handleRegenerateWorld,
    handleMove,
    handleJoinGame,
    handleCreateCharacter,
    handleStartCataclysm,
    handlePickUpItem,
  };
};