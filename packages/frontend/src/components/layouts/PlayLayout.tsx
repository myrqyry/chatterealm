import React, { useState, useEffect, useRef } from 'react';
import GameCanvas from '../GameCanvas';
import CharacterBuilder from '../CharacterBuilder';
import { MaterialButton, MaterialCard } from '../index';
import { useGameStore } from '../../stores/gameStore';
import { webSocketClient } from '../../services/webSocketClient';

// Define layout constants
const LAYOUT_CONSTANTS = {
  typography: {
    fontSize: {
      lg: '1.125rem'
    }
  },
  spacing: {
    md: '1rem',
    lg: '1.5rem'
  },
  borderRadius: {
    md: '8px',
    lg: '12px'
  },
  commonStyles: {
    glass: {
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    }
  },
  animation: {
    duration: {
      standard: '0.3s'
    },
    easing: {
      easeInOut: 'ease-in-out'
    }
  }
};

const PlayLayout: React.FC = () => {
  const { gameWorld, handleJoinGame } = useGameStore();
  const [isCharacterBuilderOpen, setIsCharacterBuilderOpen] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState<{
    displayName: string;
    class: any;
    avatar: string;
  } | null>(null);
  const [isConnecting, setIsConnecting] = useState(true);

  const lastPlayerIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Check WebSocket connection
    const checkConnection = async () => {
      try {
        await webSocketClient.connect();
        setIsConnecting(false);
      } catch (err) {
        console.error('Connection failed:', err);
      }
    };
    checkConnection();
  }, []);

  // Ensure we notify server to remove the player when switching away from Play mode
  useEffect(() => {
    // When currentPlayer becomes set, store an id placeholder if available
    if (currentPlayer && (currentPlayer as any).id) {
      lastPlayerIdRef.current = (currentPlayer as any).id;
    }

    return () => {
      // On unmount or when currentPlayer/PlayLayout is removed, request server to remove last player
      if (lastPlayerIdRef.current && webSocketClient) {
        webSocketClient.leaveGame(lastPlayerIdRef.current);
      }
    };
  }, [currentPlayer]);

  // Handle character creation/join
  const handleCharacterJoin = (characterData: {
    displayName: string;
    class: any;
    avatar: string;
  }) => {
    setCurrentPlayer(characterData);
    setIsCharacterBuilderOpen(false);
    // Call the game join handler
    handleJoinGame(characterData);
  };

  // Handle opening character builder
  const handleOpenCharacterBuilder = () => {
    // If a player is currently present, request the server to remove them before creating a new one
    const pid = (currentPlayer as any)?.id;
    if (pid && webSocketClient) {
      webSocketClient.leaveGame(pid);
    }
    setCurrentPlayer(null);
    setIsCharacterBuilderOpen(true);
  };

  // Handle closing character builder
  const handleCloseCharacterBuilder = () => {
    setIsCharacterBuilderOpen(false);
  };

  if (isConnecting) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">⚔️</div>
          <p className="text-text-secondary">Connecting to ChatteRealm...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Game Canvas or Character Builder */}
        <div className="flex-1 overflow-hidden flex items-center justify-center relative bg-surface">
          {isCharacterBuilderOpen ? (
            <CharacterBuilder
              isOpen={isCharacterBuilderOpen}
              onClose={handleCloseCharacterBuilder}
              onJoinGame={handleCharacterJoin}
              currentPlayer={currentPlayer}
            />
          ) : !currentPlayer ? (
            // Character Creation Screen
            <div className="flex flex-col items-center justify-center gap-8 p-8 text-center">
              <div>
                <h1 className="text-4xl font-bold mb-4 text-text-primary [text-shadow:0_0_10px_var(--color-primary)]">
                  ⚔️ Welcome to ChatteRealm ⚔️
                </h1>
                <p className="text-lg text-text-secondary mb-8 max-w-xl">
                  Embark on an epic adventure in a procedurally generated world.
                  Choose your class, customize your character, and join the realm!
                </p>
              </div>

              <MaterialButton
                onClick={handleOpenCharacterBuilder}
                variant="contained"
                sx={{
                  backgroundColor: 'primary.main', // Using theme color
                  color: 'primary.contrastText', // Using theme color
                  fontSize: LAYOUT_CONSTANTS.typography.fontSize.lg,
                  padding: `${LAYOUT_CONSTANTS.spacing.md} ${LAYOUT_CONSTANTS.spacing.lg}`,
                  borderRadius: LAYOUT_CONSTANTS.borderRadius.md,
                  '&:hover': {
                    backgroundColor: 'primary.dark', // Using theme color
                    transform: 'scale(1.05)'
                  },
                  transition: `all ${LAYOUT_CONSTANTS.animation.duration.standard} ${LAYOUT_CONSTANTS.animation.easing.easeInOut}`
                }}
              >
                🎮 Create Your Character
              </MaterialButton>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mt-8">
                <MaterialCard sx={{ background: LAYOUT_CONSTANTS.commonStyles.glass.background, border: LAYOUT_CONSTANTS.commonStyles.glass.border, borderRadius: LAYOUT_CONSTANTS.borderRadius.lg, padding: LAYOUT_CONSTANTS.spacing.lg, textAlign: 'center' }}>
                  <h3 className="text-text-primary mb-2 text-xl">🏰 Dynamic World</h3>
                  <p className="text-text-secondary text-sm">Explore procedurally generated terrain with biomes, rivers, and cataclysmic events</p>
                </MaterialCard>

                <MaterialCard
                  sx={{
                    background: LAYOUT_CONSTANTS.commonStyles.glass.background,
                    border: LAYOUT_CONSTANTS.commonStyles.glass.border,
                    borderRadius: LAYOUT_CONSTANTS.borderRadius.lg,
                    padding: LAYOUT_CONSTANTS.spacing.lg,
                    textAlign: 'center'
                  }}
                >
                  <h3 className="text-text-primary mb-2 text-xl">
                    ⚔️ Class System
                  </h3>
                  <p className="text-text-secondary text-sm">
                    Choose from Knight, Rogue, or Mage with unique abilities and playstyles
                  </p>
                </MaterialCard>

                <MaterialCard
                  sx={{
                    background: LAYOUT_CONSTANTS.commonStyles.glass.background,
                    border: LAYOUT_CONSTANTS.commonStyles.glass.border,
                    borderRadius: LAYOUT_CONSTANTS.borderRadius.lg,
                    padding: LAYOUT_CONSTANTS.spacing.lg,
                    textAlign: 'center'
                  }}
                >
                  <h3 className="text-text-primary mb-2 text-xl">
                    🎨 Rich Animations
                  </h3>
                  <p className="text-text-secondary text-sm">
                    Experience smooth GSAP animations and hand-drawn effects throughout your journey
                  </p>
                </MaterialCard>
              </div>
            </div>
          ) : (
            // Game Canvas
            <div className="w-full h-full max-w-full max-h-full overflow-hidden">
              <GameCanvas />
            </div>
          )}
        </div>

  {/* Sidebar is rendered by BaseLayout */}
      </div>
    </>
  );
};

export default PlayLayout;