import React, { useState, useEffect, useRef } from 'react';
import GameCanvas from '../GameCanvas';
import CharacterBuilder from '../CharacterBuilder';
import { MaterialButton, MaterialCard } from '../index';
import { useGameStore } from '../../stores/gameStore';

const PlayLayout: React.FC = () => {
  const { gameWorld, handleJoinGame } = useGameStore();
  const [isCharacterBuilderOpen, setIsCharacterBuilderOpen] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState<{
    displayName: string;
    class: any;
    avatar: string;
  } | null>(null);

  const lastPlayerIdRef = useRef<string | null>(null);

  // Ensure we notify server to remove the player when switching away from Play mode
  useEffect(() => {
    // When currentPlayer becomes set, store an id placeholder if available
    if (currentPlayer && (currentPlayer as any).id) {
      lastPlayerIdRef.current = (currentPlayer as any).id;
    }

    return () => {
      // On unmount or when currentPlayer/PlayLayout is removed, request server to remove last player
      try {
        // Use runtime import to avoid circular imports at module initialization
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { webSocketClient } = require('../../services/webSocketClient');
        if (lastPlayerIdRef.current) {
          webSocketClient.leaveGame(lastPlayerIdRef.current);
        }
      } catch (err) {
        // ignore
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
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { webSocketClient } = require('../../services/webSocketClient');
      const pid = (currentPlayer as any)?.id;
      if (pid) webSocketClient.leaveGame(pid);
    } catch (err) {
      // ignore
    }
    setCurrentPlayer(null);
    setIsCharacterBuilderOpen(true);
  };

  // Handle closing character builder
  const handleCloseCharacterBuilder = () => {
    setIsCharacterBuilderOpen(false);
  };

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
                  fontSize: TYPOGRAPHY.fontSize.lg,
                  padding: `${SPACING.md} ${SPACING.lg}`,
                  borderRadius: BORDER_RADIUS.md,
                  '&:hover': {
                    backgroundColor: 'primary.dark', // Using theme color
                    transform: 'scale(1.05)'
                  },
                  transition: `all ${ANIMATION.duration.standard} ${ANIMATION.easing.easeInOut}`
                }}
              >
                🎮 Create Your Character
              </MaterialButton>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mt-8">
                <MaterialCard sx={{ background: COMMON_STYLES.glass.background, border: COMMON_STYLES.glass.border, borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg, textAlign: 'center' }}>
                  <h3 className="text-text-primary mb-2 text-xl">🏰 Dynamic World</h3>
                  <p className="text-text-secondary text-sm">Explore procedurally generated terrain with biomes, rivers, and cataclysmic events</p>
                </MaterialCard>

                <MaterialCard
                  sx={{
                    background: COMMON_STYLES.glass.background,
                    border: COMMON_STYLES.glass.border,
                    borderRadius: BORDER_RADIUS.lg,
                    padding: SPACING.lg,
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
                    background: COMMON_STYLES.glass.background,
                    border: COMMON_STYLES.glass.border,
                    borderRadius: BORDER_RADIUS.lg,
                    padding: SPACING.lg,
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