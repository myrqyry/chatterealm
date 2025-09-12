import React from 'react';
import GameCanvas from '../GameCanvas';
import PlayerSidebar from '../sidebars/PlayerSidebar';
import ModeNavigation from '../ModeNavigation';
import { MaterialAppBar, MaterialCard, MaterialChip, MaterialPaper } from '../index';
import { useGameStore } from '../../stores/gameStore';
import { COLORS } from '../../constants/colors';

const PlayLayout: React.FC = () => {
  const { gameWorld } = useGameStore();

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
      color: 'var(--color-text-primary)',
      overflow: 'hidden',
      boxSizing: 'border-box'
    }}>
      {/* Header */}
      <div style={{
        padding: '8px 16px',
        background: 'rgba(25, 23, 36, 0.9)',
        borderBottom: '1px solid rgba(196, 167, 231, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h1 style={{
            margin: 0,
            color: 'var(--color-text-primary)',
            fontSize: '1.8em',
            fontWeight: '700',
            textShadow: '0 0 10px rgba(196, 167, 231, 0.5)'
          }}>
            ChatteRealm
          </h1>
          <span style={{
            color: 'var(--color-text-secondary)',
            fontSize: '1.2em',
            fontWeight: '500'
          }}>
            🎮 Play Mode
          </span>
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
          <ModeNavigation compact />
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{
        display: 'flex',
        flex: 1,
        overflow: 'hidden'
      }}>
        {/* Game Canvas */}
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
            maxWidth: 'calc(100vw - 320px)',
            maxHeight: '100vh',
            overflow: 'hidden'
          }}>
            <GameCanvas />
          </div>

          {/* Game Legend */}
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

        {/* Player Sidebar */}
        <PlayerSidebar />
      </div>
    </div>
  );
};

export default PlayLayout;