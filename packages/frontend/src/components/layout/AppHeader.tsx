import React from 'react';
import { MaterialChip } from '../index';
import { useGameStore } from '../../stores/gameStore';
import { MODE_STYLES, SPACING, TYPOGRAPHY, COMMON_STYLES, Z_INDEX } from '../../utils/designSystem';

interface AppHeaderProps {
  mode: 'play' | 'spectate' | 'dev';
  children?: React.ReactNode;
}

const AppHeader: React.FC<AppHeaderProps> = ({ mode, children }) => {
  const { gameWorld } = useGameStore();
  const modeConfig = MODE_STYLES[mode];

  return (
    <header
      className="flex items-center justify-between px-4 py-2 border-b backdrop-blur-sm"
      style={{
        background: 'rgba(25, 23, 36, 0.9)',
        borderColor: 'rgba(196, 167, 231, 0.2)',
        height: 'var(--header-height)',
        zIndex: Z_INDEX.sticky,
      }}
    >
      {/* Left Section - Logo and Mode Info */}
      <div className="flex items-center gap-3">
        <h1
          className="m-0 font-extrabold text-2xl"
          style={{
            ...COMMON_STYLES.titleGradient,
            textShadow: '0 0 10px rgba(196, 167, 231, 0.5)',
          }}
        >
          ChatteRealm
        </h1>

        <span
          className="text-lg font-medium"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {modeConfig.headerIcon} {mode.charAt(0).toUpperCase() + mode.slice(1)} Mode
        </span>

        <MaterialChip
          label={`Phase: ${gameWorld?.phase || 'Unknown'}`}
          size="small"
          sx={{
            backgroundColor: 'rgba(76, 175, 80, 0.2)',
            color: 'var(--color-text-primary)',
            fontSize: TYPOGRAPHY.fontSize.xs,
          }}
        />
      </div>

      {/* Center Section - Custom Content */}
      {children && (
        <div className="flex items-center">
          {children}
        </div>
      )}

      {/* Right Section - Game Stats and Navigation */}
      <div className="flex items-center gap-2">
        <MaterialChip
          label={`${gameWorld?.players?.length || 0} Players`}
          size="small"
          sx={{
            backgroundColor: 'rgba(33, 150, 243, 0.2)',
            color: 'var(--color-text-primary)',
            fontSize: TYPOGRAPHY.fontSize.xs,
          }}
        />

        <MaterialChip
          label={`${gameWorld?.npcs?.length || 0} NPCs`}
          size="small"
          sx={{
            backgroundColor: 'rgba(156, 39, 176, 0.2)',
            color: 'var(--color-text-primary)',
            fontSize: TYPOGRAPHY.fontSize.xs,
          }}
        />

        {/* Mode-specific additional chips */}
        {mode === 'spectate' && (
          <MaterialChip
            label={`${gameWorld?.items?.length || 0} Items`}
            size="small"
            sx={{
              backgroundColor: 'rgba(255, 152, 0, 0.2)',
              color: 'var(--color-text-primary)',
              fontSize: TYPOGRAPHY.fontSize.xs,
            }}
          />
        )}

        {mode === 'dev' && (
          <>
            <MaterialChip
              label={`${gameWorld?.items?.length || 0} Items`}
              size="small"
              sx={{
                backgroundColor: 'rgba(255, 152, 0, 0.2)',
                color: 'var(--color-text-primary)',
                fontSize: TYPOGRAPHY.fontSize.xs,
              }}
            />
            <MaterialChip
              label="DEV"
              size="small"
              sx={{
                backgroundColor: 'rgba(244, 67, 54, 0.2)',
                color: 'var(--color-text-primary)',
                fontWeight: TYPOGRAPHY.fontWeight.bold,
                fontSize: TYPOGRAPHY.fontSize.xs,
              }}
            />
          </>
        )}
      </div>
    </header>
  );
};

export default AppHeader;