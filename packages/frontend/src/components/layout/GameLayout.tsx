import React, { useState } from 'react';
import GameCanvas from '../GameCanvas/GameCanvas';
import NotificationSystem from '../notifications/NotificationSystem';
import PlayerSidebar from '../sidebars/PlayerSidebar';
import { MaterialCard } from '../ui/MaterialCard';
import { MaterialChip } from '../ui/MaterialChip';
import { MaterialPaper } from '../ui/MaterialPaper';
import { useGameStore } from '../../stores/gameStore';
import { COLORS } from '../utils/tokens';
import { PlayerClass } from 'shared';

interface GameLayoutProps {
  handleRegenerateWorld: () => void;
  movePlayer: (direction: 'up' | 'down' | 'left' | 'right') => void;
  handleJoinGame: () => void;
  handleStartCataclysm: () => void;
  handlePickUpItem: () => void;
}

const GameLayout: React.FC<GameLayoutProps> = ({
  handleRegenerateWorld,
  movePlayer,
  handleJoinGame,
  handleStartCataclysm,
  handlePickUpItem,
}) => {
  const { gameWorld, currentPlayer, gameMessage } = useGameStore();

  const handleJoin = () => {
    handleJoinGame();
  };

  return (
    <div className="flex flex-col h-screen w-screen m-0 p-0 overflow-hidden box-border bg-[var(--color-background-primary)] font-inter">
      <NotificationSystem />

      {/* Header */}
      <div className="p-4 border-b border-[var(--color-outline)] bg-[var(--color-surface-variant)]">
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-xl font-extrabold text-text-primary m-0 uppercase tracking-widest text-center header-gradient">chatterealm</h1>
          <div className="flex items-center gap-4">
            <MaterialChip
              label={`Phase: ${gameWorld?.phase || 'Unknown'}`}
              size="small"
              sx={{ backgroundColor: 'rgba(76, 175, 80, 0.2)' }}
            />
            <MaterialChip
              label={`${gameWorld?.players?.length || 0} Players`}
              size="small"
              sx={{ backgroundColor: 'rgba(33, 150, 243, 0.2)' }}
            />
            <MaterialChip
              label={`${gameWorld?.npcs?.length || 0} NPCs`}
              size="small"
              sx={{ backgroundColor: 'rgba(156, 39, 176, 0.2)' }}
            />
          </div>
        </div>

        {/* Game Message */}
        {gameMessage && (
          <MaterialCard sx={{ mt: 2, p: 2, backgroundColor: 'var(--color-primary-container)', border: '1px solid var(--color-primary)' }}>
            <p className="text-sm text-[var(--color-on-primary-container)] m-0">{gameMessage}</p>
          </MaterialCard>
        )}
      </div>

      {/* Main Content Area - Two Column Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Game Canvas - Left Side, Scales to Fit */}
        <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-[var(--color-surface)]">
          <div className="w-full h-full max-w-[calc(100vw-320px)] overflow-hidden">
            <GameCanvas />
          </div>

          {/* Material UI Legend - Positioned over game canvas */}
          <MaterialPaper
            sx={{
              position: 'absolute',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: 1,
              p: 1,
              zIndex: 1000,
              backgroundColor: 'rgba(25, 23, 36, 0.95)',
              backdropFilter: 'blur(10px)',
            }}
            className="rounded-md"
          >
            <MaterialChip label="Knight" size="small" sx={{ backgroundColor: 'var(--color-legend-knight)', color: 'white', fontSize: '0.7rem', height: '20px' }} />
            <MaterialChip label="Rogue" size="small" sx={{ backgroundColor: 'var(--color-legend-rogue)', color: 'white', fontSize: '0.7rem', height: '20px' }} />
            <MaterialChip label="Mage" size="small" sx={{ backgroundColor: 'var(--color-legend-mage)', color: 'white', fontSize: '0.7rem', height: '20px' }} />
            <MaterialChip label="NPC" size="small" sx={{ backgroundColor: 'var(--color-legend-npc)', color: 'white', fontSize: '0.7rem', height: '20px' }} />
            <MaterialChip label="Item" size="small" sx={{ backgroundColor: 'var(--color-legend-item)', color: 'white', fontSize: '0.7rem', height: '20px' }} />
          </MaterialPaper>
        </div>

        {/* Right Sidebar - Player Controls and Settings */}
        <PlayerSidebar />
      </div>
    </div>
  );
};

export default GameLayout;
