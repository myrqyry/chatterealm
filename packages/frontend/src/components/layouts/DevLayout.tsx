import React from 'react';
import GameCanvas from '../GameCanvas';
import DevSidebar from '../sidebars/DevSidebar';
import ModeNavigation from '../ModeNavigation';
import { MaterialAppBar, MaterialCard, MaterialChip, MaterialPaper } from '../index';
import { useGameStore } from '../../stores/gameStore';
import { COLORS } from '../../utils/tokens';

interface DevLayoutProps {
  children?: React.ReactNode;
}

const DevLayout: React.FC<DevLayoutProps> = ({ children }) => {
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
            🛠️ Developer Mode
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
          <MaterialChip
            label={`${gameWorld?.items?.length || 0} Items`}
            size="small"
            sx={{
              backgroundColor: 'rgba(255, 152, 0, 0.2)',
              color: 'var(--color-text-primary)'
            }}
          />
          <MaterialChip
            label="DEV"
            size="small"
            sx={{
              backgroundColor: 'rgba(244, 67, 54, 0.2)',
              color: 'var(--color-text-primary)',
              fontWeight: 'bold'
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
            maxWidth: 'calc(100vw - 500px)',
            maxHeight: '100vh',
            aspectRatio: '16/9',
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

          {/* Developer Overlay */}
          <MaterialPaper
            sx={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              p: 2,
              zIndex: 1000,
              backgroundColor: 'rgba(25, 23, 36, 0.95)',
              backdropFilter: 'blur(10px)',
              maxWidth: '350px'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h3 style={{
                margin: 0,
                color: 'var(--color-text-primary)',
                fontSize: '1em',
                fontWeight: '600'
              }}>
                Developer Status
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.8em' }}>
                    World Size:
                  </span>
                  <span style={{ color: 'var(--color-text-primary)', fontSize: '0.8em' }}>
                    {gameWorld?.grid?.[0]?.length || 0} × {gameWorld?.grid?.length || 0}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.8em' }}>
                    World Age:
                  </span>
                  <span style={{ color: 'var(--color-text-primary)', fontSize: '0.8em' }}>
                    {gameWorld?.worldAge || 0}s
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.8em' }}>
                    Cataclysm:
                  </span>
                  <span style={{
                    color: gameWorld?.cataclysmCircle?.isActive ? '#ff4444' : '#44ff44',
                    fontSize: '0.8em'
                  }}>
                    {gameWorld?.cataclysmCircle?.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.8em' }}>
                    Memory Usage:
                  </span>
                  <span style={{ color: 'var(--color-text-primary)', fontSize: '0.8em' }}>
                    {(performance as any).memory?.usedJSHeapSize ?
                      `${Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024)}MB` :
                      'N/A'
                    }
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.8em' }}>
                    FPS:
                  </span>
                  <span style={{ color: 'var(--color-text-primary)', fontSize: '0.8em' }}>
                    {Math.round(1000 / (performance.now() / 1000))} fps
                  </span>
                </div>
              </div>
            </div>
          </MaterialPaper>
          {/* Dev route content (if any) */}
          {children && (
            <div style={{ position: 'absolute', top: 120, left: 24, right: 24, bottom: 24, overflow: 'auto', zIndex: 1100 }}>
              {children}
            </div>
          )}
        </div>

        {/* Developer Sidebar */}
        <DevSidebar />
      </div>
    </div>
  );
};

export default DevLayout;