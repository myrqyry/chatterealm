import React, { useState, useEffect, useRef } from 'react';
import GameCanvas from '../GameCanvas';
import PlayerSidebar from '../sidebars/PlayerSidebar';
import ModeNavigation from '../ModeNavigation';
import CharacterBuilder from '../CharacterBuilder';
import { MaterialAppBar, MaterialCard, MaterialChip, MaterialPaper, MaterialButton } from '../index';
import { useGameStore } from '../../stores/gameStore';
import { useGameWorld } from '../../hooks/useGameWorld';
import { COLORS } from '../../utils/tokens';

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
    <div className="flex flex-col h-screen w-screen p-0 m-0 overflow-hidden box-border" style={{ background: 'var(--color-background-primary)', color: 'var(--color-text-primary)', fontFamily: 'Inter, Roboto, sans-serif' }}>
      {/* Header */}
      <div className="p-2 px-4 bg-[rgba(25,23,36,0.9)] border-b flex items-center justify-between" style={{ borderColor: 'rgba(196, 167, 231, 0.2)' }}>
        <div className="flex items-center gap-3">
          <h1 className="m-0 text-text-primary text-2xl font-extrabold" style={{ textShadow: '0 0 10px rgba(196, 167, 231, 0.5)' }}>ChatteRealm</h1>
          <span className="text-text-secondary text-lg font-medium">🎮 Play Mode</span>
          <MaterialChip
            label={`Phase: ${gameWorld?.phase || 'Unknown'}`}
            size="small"
            sx={{
              backgroundColor: 'rgba(76, 175, 80, 0.2)',
              color: 'var(--color-text-primary)'
            }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MaterialChip
            label={`${gameWorld?.players?.length || 0} Players`}
            size="small"
            sx={{
              backgroundColor: 'rgba(33, 150, 243, 0.2)',
              color: 'var(--color-text-primary)'
            }}
          />
          <MaterialChip
            label={`${gameWorld?.npcs?.length || 0} NPCs`}
            size="small"
            sx={{
              backgroundColor: 'rgba(156, 39, 176, 0.2)',
              color: 'var(--color-text-primary)'
            }}
          />
          <MaterialButton
            onClick={() => window.open('/svg-assets', '_blank')}
            variant="outlined"
            size="small"
            sx={{
              borderColor: 'rgba(196, 167, 231, 0.5)',
              color: 'var(--color-text-primary)',
              fontSize: '0.7rem',
              '&:hover': {
                borderColor: 'rgba(196, 167, 231, 0.8)',
                backgroundColor: 'rgba(196, 167, 231, 0.1)'
              }
            }}
          >
            🎨 Assets
          </MaterialButton>
          <ModeNavigation compact />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Game Canvas or Character Builder */}
        <div className="flex-1 overflow-hidden flex items-center justify-center relative" style={{ background: 'var(--color-surface)' }}>
          {!currentPlayer ? (
            // Character Creation Screen
            <div className="flex flex-col items-center justify-center gap-8 p-8 text-center">
              <div>
                <h1 className="text-text-primary font-bold" style={{ fontSize: '3rem', marginBottom: '1rem', textShadow: '0 0 20px rgba(196, 167, 231, 0.5)' }}>
                  ⚔️ Welcome to ChatteRealm ⚔️
                </h1>
                <p style={{
                  fontSize: '1.2rem',
                  color: 'var(--color-text-secondary)',
                  marginBottom: '2rem',
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
                  backgroundColor: 'rgba(196, 167, 231, 0.8)',
                  color: 'white',
                  fontSize: '1.2rem',
                  padding: '1rem 2rem',
                  borderRadius: '12px',
                  '&:hover': {
                    backgroundColor: 'rgba(196, 167, 231, 1)',
                    transform: 'scale(1.05)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                🎮 Create Your Character
              </MaterialButton>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                maxWidth: '800px',
                marginTop: '2rem'
              }}>
                <MaterialCard sx={{ background: 'rgba(49, 46, 56, 0.8)', border: '1px solid rgba(196, 167, 231, 0.2)', borderRadius: '12px', padding: '1.5rem', textAlign: 'center' }}>
                  <h3 className="text-text-primary mb-2">🏰 Dynamic World</h3>
                  <p className="text-text-secondary text-sm">Explore procedurally generated terrain with biomes, rivers, and cataclysmic events</p>
                </MaterialCard>

                <MaterialCard
                  sx={{
                    background: 'rgba(49, 46, 56, 0.8)',
                    border: '1px solid rgba(196, 167, 231, 0.2)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    textAlign: 'center'
                  }}
                >
                  <h3 style={{ color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>
                    ⚔️ Class System
                  </h3>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                    Choose from Knight, Rogue, or Mage with unique abilities and playstyles
                  </p>
                </MaterialCard>

                <MaterialCard
                  sx={{
                    background: 'rgba(49, 46, 56, 0.8)',
                    border: '1px solid rgba(196, 167, 231, 0.2)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    textAlign: 'center'
                  }}
                >
                  <h3 style={{ color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>
                    🎨 Rich Animations
                  </h3>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                    Experience smooth GSAP animations and hand-drawn effects throughout your journey
                  </p>
                </MaterialCard>
              </div>
            </div>
          ) : (
            // Game Canvas
            <>
              <div style={{
                width: '100%',
                height: '100%',
                maxWidth: 'calc(100vw - 320px)',
                maxHeight: '100vh',
                overflow: 'hidden'
              }}>
                <GameCanvas />
              </div>

              {/* Game Legend */}
              <MaterialPaper sx={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 1, p: 1, zIndex: 1000, backgroundColor: 'rgba(25, 23, 36, 0.95)', backdropFilter: 'blur(10px)' }}>
                <MaterialChip label="Knight" size="small" sx={{ backgroundColor: 'var(--color-legend-knight)', color: 'white', fontSize: '0.7rem', height: '20px' }} />
                <MaterialChip
                  label="Rogue"
                  size="small"
                  sx={{
                    backgroundColor: 'var(--color-legend-rogue)',
                    color: 'white',
                    fontSize: '0.7rem',
                    height: '20px'
                  }}
                />
                <MaterialChip
                  label="Mage"
                  size="small"
                  sx={{
                    backgroundColor: 'var(--color-legend-mage)',
                    color: 'white',
                    fontSize: '0.7rem',
                    height: '20px'
                  }}
                />
                <MaterialChip
                  label="NPC"
                  size="small"
                  sx={{
                    backgroundColor: 'var(--color-legend-npc)',
                    color: 'white',
                    fontSize: '0.7rem',
                    height: '20px'
                  }}
                />
                <MaterialChip
                  label="Item"
                  size="small"
                  sx={{
                    backgroundColor: 'var(--color-legend-item)',
                    color: 'white',
                    fontSize: '0.7rem',
                    height: '20px'
                  }}
                />
              </MaterialPaper>
            </>
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
    </div>
  );
};

export default PlayLayout;