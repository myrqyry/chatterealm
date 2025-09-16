import React from 'react';
import GameCanvas from './GameCanvas';
import NotificationSystem from './NotificationSystem';
import UnifiedSettingsMenuModal from './UnifiedSettingsMenuModal';
import { MaterialAppBar, MaterialCard, MaterialChip, MaterialPaper } from './index';
import { useGameStore } from '../stores/gameStore';
import { COLORS } from '../utils/tokens';

interface GameLayoutProps {
  handleRegenerateWorld: () => void;
  handleMove: (direction: 'up' | 'down' | 'left' | 'right') => void;
  handleJoinGame: () => void;
  handleStartCataclysm: () => void;
  handlePickUpItem: () => void;
}

const GameLayout: React.FC<GameLayoutProps> = ({
  handleRegenerateWorld,
  handleMove,
  handleJoinGame,
  handleStartCataclysm,
  handlePickUpItem,
}) => {
  const { gameWorld, currentPlayer, gameMessage } = useGameStore();

  return (
    <div className="flex flex-col h-screen w-screen m-0 p-0 overflow-hidden box-border bg-[var(--color-background-primary)] font-inter">
      <NotificationSystem />

      {/* Main Content Area - Two Column Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Game Canvas - Left Side, Scales to Fit */}
        <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-[var(--color-surface)]">
          <div className="w-full h-full max-w-[calc(100vw-320px)] max-h-screen overflow-hidden">
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

        {/* Right Sidebar - Comprehensive Settings Modal Interface */}
        <UnifiedSettingsMenuModal />
      </div>
    </div>
  );
};

export default GameLayout;
