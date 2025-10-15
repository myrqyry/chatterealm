import React from 'react';
import GameCanvas from '../GameCanvas';
import { MaterialChip, MaterialPaper } from '../index'; // Removed MaterialAppBar
import { useGameStore } from '../../stores/gameStore';
import { TYPOGRAPHY, SPACING, COMMON_STYLES } from '../../utils/designSystem'; // Import design system tokens

const SpectateLayout: React.FC = () => {
  const { gameWorld } = useGameStore();

  return (
    <>
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
            maxWidth: '100%', // Adjusted for BaseLayout
            maxHeight: '100%', // Adjusted for BaseLayout
            aspectRatio: '16/9',
            overflow: 'hidden'
          }}>
            <GameCanvas />
          </div>

          {/* Game Legend */}
          <MaterialPaper
            sx={{
              position: 'absolute',
              bottom: SPACING.md,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: SPACING.xs,
              p: SPACING.xs,
              zIndex: 1000,
              ...COMMON_STYLES.glass,
            }}
          >
            <MaterialChip
              label="Knight"
              size="small"
              sx={{
                backgroundColor: 'var(--color-legend-knight)',
                color: 'white',
                fontSize: TYPOGRAPHY.fontSize.xs,
                height: '20px'
              }}
            />
            <MaterialChip
              label="Rogue"
              size="small"
              sx={{
                backgroundColor: 'var(--color-legend-rogue)',
                color: 'white',
                fontSize: TYPOGRAPHY.fontSize.xs,
                height: '20px'
              }}
            />
            <MaterialChip
              label="Mage"
              size="small"
              sx={{
                backgroundColor: 'var(--color-legend-mage)',
                color: 'white',
                fontSize: TYPOGRAPHY.fontSize.xs,
                height: '20px'
              }}
            />
            <MaterialChip
              label="NPC"
              size="small"
              sx={{
                backgroundColor: 'var(--color-legend-npc)',
                color: 'white',
                fontSize: TYPOGRAPHY.fontSize.xs,
                height: '20px'
              }}
            />
            <MaterialChip
              label="Item"
              size="small"
              sx={{
                backgroundColor: 'var(--color-legend-item)',
                color: 'white',
                fontSize: TYPOGRAPHY.fontSize.xs,
                height: '20px'
              }}
            />
          </MaterialPaper>

          {/* Spectator Overlay */}
          <MaterialPaper
            sx={{
              position: 'absolute',
              top: SPACING.md,
              left: SPACING.md,
              p: SPACING.md,
              zIndex: 1000,
              ...COMMON_STYLES.glass,
              maxWidth: '300px'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: SPACING.sm }}>
              <h3 style={{
                margin: 0,
                color: 'var(--color-text-primary)',
                fontSize: TYPOGRAPHY.fontSize.md,
                fontWeight: TYPOGRAPHY.fontWeight.semibold
              }}>
                Live Game Status
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: SPACING.xs }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: TYPOGRAPHY.fontSize.sm }}>
                    World Size:
                  </span>
                  <span style={{ color: 'var(--color-text-primary)', fontSize: TYPOGRAPHY.fontSize.sm }}>
                    {gameWorld?.grid?.[0]?.length || 0} × {gameWorld?.grid?.length || 0}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: TYPOGRAPHY.fontSize.sm }}>
                    Active Players:
                  </span>
                  <span style={{ color: 'var(--color-text-primary)', fontSize: TYPOGRAPHY.fontSize.sm }}>
                    {gameWorld?.players?.filter(p => p.isAlive)?.length || 0}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: TYPOGRAPHY.fontSize.sm }}>
                    World Age:
                  </span>
                  <span style={{ color: 'var(--color-text-primary)', fontSize: TYPOGRAPHY.fontSize.sm }}>
                    {gameWorld?.worldAge || 0}s
                  </span>
                </div>
              </div>
            </div>
          </MaterialPaper>
        </div>

  {/* Sidebar is rendered by BaseLayout */}
      </div>
    </>
  );
};

export default SpectateLayout;