import React from 'react';
import GameCanvas from './GameCanvas';
import NotificationSystem from './NotificationSystem';
import EnhancedPlayerStatus from './EnhancedPlayerStatus';
// Deprecated panels replaced by UnifiedSettingsMenu
// import SettingsPanel from './SettingsPanel';
// import GameControls from './controls/GameControls';
// import WorldControls from './controls/WorldControls';
// import AnimationControls from './controls/AnimationControls';
import UnifiedSettingsMenuModal from './UnifiedSettingsMenuModal';
import { MaterialAppBar, MaterialCard, MaterialChip, MaterialPaper } from './index';
import { useGameStore } from '../stores/gameStore';
import { COLORS } from '../constants/colors';

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
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      width: '100vw',
      padding: '0',
      margin: '0',
      background: 'var(--color-background-primary)',
      fontFamily: 'Inter, Roboto, sans-serif',
      overflow: 'hidden',
      boxSizing: 'border-box'
    }}>
      <NotificationSystem />

      {/* Main Content Area - Two Column Layout */}
      <div style={{
        display: 'flex',
        flex: 1,
        overflow: 'hidden'
      }}>
        {/* Game Canvas - Left Side, Scales to Fit */}
        <div style={{
          flex: 1,
          background: 'var(--color-surface)',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}>
          <div style={{
            width: '100%',
            height: '100%',
            maxWidth: 'calc(100vw - 320px)', // Leave space for sidebar
            maxHeight: '100vh', // Full viewport height now
            aspectRatio: '16/9', // Maintain aspect ratio
            overflow: 'hidden'
          }}>
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
          >
            <MaterialChip
              label="Knight"
              size="small"
              sx={{
                backgroundColor: 'var(--color-legend-knight)',
                color: 'white',
                fontSize: '0.7rem',
                height: '20px'
              }}
            />
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
        </div>

        {/* Fixed Sidebar - Right Side - Material Design 3 Expressive */}
        {currentPlayer && (
          <div style={{
            width: '320px',
            background: 'linear-gradient(145deg, var(--color-background-paper) 0%, rgba(31, 29, 46, 0.95) 100%)',
            borderLeft: '1px solid var(--color-divider)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.15)',
            backdropFilter: 'blur(20px)'
          }}>
            <div style={{
              padding: '24px 20px',
              flex: 1,
              overflow: 'auto',
              scrollbarWidth: 'thin',
              scrollbarColor: 'var(--color-primary) transparent'
            }}>
              {/* Game Title Header - Expressive Design */}
              <div style={{
                textAlign: 'center',
                padding: '20px 0 32px 0',
                marginBottom: '24px',
                position: 'relative'
              }}>
                {/* Decorative background */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '120px',
                  height: '60px',
                  background: 'linear-gradient(135deg, rgba(196, 167, 231, 0.1) 0%, rgba(156, 207, 216, 0.1) 100%)',
                  borderRadius: '30px',
                  filter: 'blur(15px)',
                  zIndex: 0
                }}></div>

                {/* Title with glow effect */}
                <h1 style={{
                  fontFamily: 'JetBrains Mono',
                  fontSize: '1.8rem',
                  fontWeight: '800',
                  color: 'var(--color-text-primary)',
                  margin: '0',
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  position: 'relative',
                  zIndex: 1,
                  textShadow: '0 0 20px rgba(196, 167, 231, 0.3)',
                  background: 'linear-gradient(135deg, var(--color-text-primary) 0%, rgba(196, 167, 231, 0.8) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  chatterealm
                </h1>

                {/* Subtle underline */}
                <div style={{
                  width: '60px',
                  height: '3px',
                  background: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
                  borderRadius: '2px',
                  margin: '12px auto 0',
                  boxShadow: '0 2px 8px rgba(196, 167, 231, 0.3)'
                }}></div>
              </div>

              {/* Player Status Card - Expressive */}
              <MaterialCard
                title="Player Status"
                sx={{
                  mb: 3,
                  backgroundColor: 'rgba(25, 23, 36, 0.8)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(196, 167, 231, 0.2)',
                  borderRadius: '16px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(196, 167, 231, 0.1)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(196, 167, 231, 0.15)',
                    borderColor: 'rgba(196, 167, 231, 0.3)'
                  }
                }}
              >
                <EnhancedPlayerStatus player={currentPlayer} />
              </MaterialCard>

              {/* Settings Card - Expressive */}
              <MaterialCard
                title="Settings"
                sx={{
                  backgroundColor: 'rgba(25, 23, 36, 0.8)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(156, 207, 216, 0.2)',
                  borderRadius: '16px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(156, 207, 216, 0.1)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(156, 207, 216, 0.15)',
                    borderColor: 'rgba(156, 207, 216, 0.3)'
                  }
                }}
              >
                <UnifiedSettingsMenuModal />
              </MaterialCard>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameLayout;
