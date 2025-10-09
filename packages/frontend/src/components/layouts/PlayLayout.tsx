import React, { useState, useEffect, useRef } from 'react';
import GameCanvas from '../GameCanvas';
import PlayerSidebar from '../sidebars/PlayerSidebar';
import CharacterBuilder from '../CharacterBuilder';
import { MaterialButton, MaterialCard, MaterialChip } from '../index'; // Removed MaterialAppBar, MaterialPaper
import { useGameStore } from '../../stores/gameStore';
import { useGameWorld } from '../../hooks/useGameWorld';
import { TYPOGRAPHY, SPACING, BORDER_RADIUS, COMMON_STYLES, ANIMATION } from '../../utils/designSystem'; // Import design system tokens

const PlayLayout: React.FC = () => {
  const { gameWorld } = useGameStore();
  const { handleJoinGame } = useGameWorld();
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
        <div className="flex-1 overflow-hidden flex items-center justify-center relative" style={{ background: 'var(--color-surface)' }}>
          {!currentPlayer ? (
            // Character Creation Screen
            <div className="flex flex-col items-center justify-center gap-8 p-8 text-center">
              <div>
                <h1 className="text-text-primary font-bold" style={{ fontSize: TYPOGRAPHY.fontSize['3xl'], marginBottom: SPACING.md, textShadow: COMMON_STYLES.textShadow.neon }}>
                  ⚔️ Welcome to ChatteRealm ⚔️
                </h1>
                <p style={{
                  fontSize: TYPOGRAPHY.fontSize.lg,
                  color: 'var(--color-text-secondary)',
                  marginBottom: SPACING.lg,
                  maxWidth: '600px'
                }}>
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

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: SPACING.lg,
                maxWidth: '800px',
                marginTop: SPACING.lg
              }}>
                <MaterialCard sx={{ background: COMMON_STYLES.glass.background, border: COMMON_STYLES.glass.border, borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg, textAlign: 'center' }}>
                  <h3 className="text-text-primary mb-2" style={{ fontSize: TYPOGRAPHY.fontSize.xl }}>🏰 Dynamic World</h3>
                  <p className="text-text-secondary" style={{ fontSize: TYPOGRAPHY.fontSize.sm }}>Explore procedurally generated terrain with biomes, rivers, and cataclysmic events</p>
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
                  <h3 style={{ color: 'var(--color-text-primary)', marginBottom: SPACING.sm, fontSize: TYPOGRAPHY.fontSize.xl }}>
                    ⚔️ Class System
                  </h3>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: TYPOGRAPHY.fontSize.sm }}>
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
                  <h3 style={{ color: 'var(--color-text-primary)', marginBottom: SPACING.sm, fontSize: TYPOGRAPHY.fontSize.xl }}>
                    🎨 Rich Animations
                  </h3>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: TYPOGRAPHY.fontSize.sm }}>
                    Experience smooth GSAP animations and hand-drawn effects throughout your journey
                  </p>
                </MaterialCard>
              </div>
            </div>
          ) : (
            // Game Canvas
            <div style={{
              width: '100%',
              height: '100%',
              maxWidth: '100%', // Changed from calc(100vw - 320px) to allow BaseLayout to manage overall width
              maxHeight: '100%', // Changed from 100vh
              overflow: 'hidden'
            }}>
              <GameCanvas />
            </div>
          )}
        </div>

        {/* Player Sidebar - Only show when player exists */}
        {currentPlayer && <PlayerSidebar />}
      </div>

      {/* Character Builder Modal */}
      <CharacterBuilder
        isOpen={isCharacterBuilderOpen}
        onClose={handleCloseCharacterBuilder}
        onJoinGame={handleCharacterJoin}
        currentPlayer={currentPlayer}
      />
    </>
  );
};

export default PlayLayout;