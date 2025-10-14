import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MaterialButton from '../ui/MaterialButton';
import MaterialChip from '../ui/MaterialChip';
import MaterialPaper from '../ui/MaterialPaper';
import MaterialIcon from '../ui/MaterialIcon';
import { TYPOGRAPHY, SPACING, BORDER_RADIUS, COMMON_STYLES, ANIMATION } from '../utils/designSystem';

interface ModeNavigationProps {
  compact?: boolean;
  variant?: 'compact' | 'expanded' | 'dropdown';
  position?: 'header' | 'sidebar' | 'floating';
}

interface ModeConfig {
  path: string;
  label: string;
  icon: string;
  description: string;
  color: string;
  features: string[];
}

const modes: Array<ModeConfig> = [
  {
    path: '/play',
    label: 'Play',
    icon: '🎮',
    description: 'Join the realm and play',
    color: 'rgba(76, 175, 80, 0.2)',
    features: ['Character creation', 'Real-time gameplay', 'Player interaction', 'Live world state']
  },
  {
    path: '/spectate',
    label: 'Spectate',
    icon: '👁️',
    description: 'Watch ongoing games',
    color: 'rgba(33, 150, 243, 0.2)',
    features: ['Live game monitoring', 'Player statistics', 'World overview', 'Real-time updates']
  },
  {
    path: '/dev',
    label: 'Dev',
    icon: '🛠️',
    description: 'Developer tools & testing',
    color: 'rgba(244, 67, 54, 0.2)',
    features: ['Debug tools', 'Performance metrics', 'World generation', 'Testing utilities']
  }
];

const ModeNavigation: React.FC<ModeNavigationProps> = ({
  compact = false,
  variant = 'compact',
  position = 'header'
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const currentMode = modes.find((mode) => mode.path === location.pathname);

  const handleModeSwitch = (path: string) => {
    navigate(path);
    setIsDropdownOpen(false);
  };

  const getButtonStyles = (mode: ModeConfig, isCurrent: boolean) => ({
    minWidth: 'auto',
    px: position === 'header' ? SPACING.sm : SPACING.md,
    py: position === 'header' ? SPACING.xs : SPACING.sm,
    fontSize: position === 'header' ? TYPOGRAPHY.fontSize.xs : TYPOGRAPHY.fontSize.sm,
    textTransform: 'none',
    backgroundColor: isCurrent ? mode.color : 'transparent',
    borderColor: 'rgba(196, 167, 231, 0.3)',
    color: 'var(--color-text-primary)',
    '&:hover': {
      backgroundColor: isCurrent ? mode.color : 'rgba(196, 167, 231, 0.1)',
      borderColor: 'rgba(196, 167, 231, 0.5)',
      transform: 'translateY(-1px)',
    },
    transition: `all ${ANIMATION.fast} ease`,
  });

  // Compact header navigation
  if (variant === 'compact' || compact) {
    return (
      <div className="flex gap-1 items-center">
        {modes.map((mode) => (
          <MaterialButton
            key={mode.path}
            variant={location.pathname === mode.path ? 'contained' : 'outlined'}
            size="small"
            onClick={() => handleModeSwitch(mode.path)}
            sx={getButtonStyles(mode, location.pathname === mode.path)}
          >
            <span style={{ marginRight: SPACING.xs }}>{mode.icon}</span>
            {mode.label}
          </MaterialButton>
        ))}
      </div>
    );
  }

  // Expanded sidebar navigation
  if (variant === 'expanded') {
    return (
      <MaterialPaper
        sx={{
          p: SPACING.md,
          ...COMMON_STYLES.glass,
          borderRadius: BORDER_RADIUS.lg,
          minWidth: '240px',
        }}
      >
        <div style={{ marginBottom: SPACING.md }}>
          <h3 style={{
            margin: 0,
            color: 'var(--color-text-primary)',
            fontSize: TYPOGRAPHY.fontSize.lg,
            fontWeight: TYPOGRAPHY.fontWeight.semibold,
            display: 'flex',
            alignItems: 'center',
            gap: SPACING.sm
          }}>
            <MaterialIcon>dashboard</MaterialIcon>
            Interface Mode
          </h3>

          {currentMode && (
            <MaterialChip
              label={currentMode.description}
              size="small"
              sx={{
                backgroundColor: currentMode.color,
                color: 'var(--color-text-primary)',
                fontSize: TYPOGRAPHY.fontSize.xs,
                mt: SPACING.xs,
              }}
            />
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: SPACING.sm }}>
          {modes.map((mode) => (
            <MaterialButton
              key={mode.path}
              variant={location.pathname === mode.path ? 'contained' : 'outlined'}
              fullWidth
              onClick={() => handleModeSwitch(mode.path)}
              sx={{
                ...getButtonStyles(mode, location.pathname === mode.path),
                justifyContent: 'flex-start',
                py: SPACING.md,
                '&:hover': {
                  ...getButtonStyles(mode, location.pathname === mode.path)['&:hover'],
                  transform: 'translateX(4px)',
                },
              }}
            >
              <span style={{ marginRight: SPACING.sm, fontSize: TYPOGRAPHY.fontSize.lg }}>
                {mode.icon}
              </span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: TYPOGRAPHY.fontWeight.medium }}>
                  {mode.label}
                </div>
                <div style={{
                  fontSize: TYPOGRAPHY.fontSize.xs,
                  color: 'var(--color-text-secondary)',
                  marginTop: '2px'
                }}>
                  {mode.description}
                </div>
              </div>
            </MaterialButton>
          ))}
        </div>

        {/* Mode features */}
        {currentMode && (
          <div style={{ marginTop: SPACING.lg }}>
            <h4 style={{
              margin: 0,
              color: 'var(--color-text-primary)',
              fontSize: TYPOGRAPHY.fontSize.sm,
              fontWeight: TYPOGRAPHY.fontWeight.medium,
              marginBottom: SPACING.sm
            }}>
              {currentMode.label} Features
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: SPACING.xs }}>
              {currentMode.features.map((feature, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: SPACING.sm,
                    fontSize: TYPOGRAPHY.fontSize.xs,
                    color: 'var(--color-text-secondary)'
                  }}
                >
                  <MaterialIcon sx={{ fontSize: TYPOGRAPHY.fontSize.sm, color: 'var(--color-text-primary)' }}>
                    check_circle
                  </MaterialIcon>
                  {feature}
                </div>
              ))}
            </div>
          </div>
        )}
      </MaterialPaper>
    );
  }

  // Dropdown navigation (for mobile/floating)
  return (
    <div style={{ position: 'relative' }}>
      <MaterialButton
        variant="outlined"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        sx={{
          borderColor: 'rgba(196, 167, 231, 0.3)',
          color: 'var(--color-text-primary)',
          '&:hover': {
            borderColor: 'rgba(196, 167, 231, 0.5)',
            backgroundColor: 'rgba(196, 167, 231, 0.1)',
          },
        }}
      >
        {currentMode ? (
          <>
            <span style={{ marginRight: SPACING.sm }}>{currentMode.icon}</span>
            {currentMode.label}
          </>
        ) : (
          'Select Mode'
        )}
        <MaterialIcon sx={{ ml: SPACING.xs }}>
          {isDropdownOpen ? 'expand_less' : 'expand_more'}
        </MaterialIcon>
      </MaterialButton>

      {isDropdownOpen && (
        <MaterialPaper
          sx={{
            position: 'absolute',
            top: '100%',
            right: 0,
            mt: SPACING.xs,
            p: SPACING.xs,
            minWidth: '200px',
            ...COMMON_STYLES.glass,
            borderRadius: BORDER_RADIUS.lg,
            zIndex: 1000,
          }}
        >
          {modes.map((mode) => (
            <MaterialButton
              key={mode.path}
              variant={location.pathname === mode.path ? 'contained' : 'text'}
              fullWidth
              onClick={() => handleModeSwitch(mode.path)}
              sx={{
                justifyContent: 'flex-start',
                textTransform: 'none',
                py: SPACING.sm,
                backgroundColor: location.pathname === mode.path ? mode.color : 'transparent',
                color: 'var(--color-text-primary)',
                '&:hover': {
                  backgroundColor: 'rgba(196, 167, 231, 0.1)',
                },
              }}
            >
              <span style={{ marginRight: SPACING.sm }}>{mode.icon}</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: TYPOGRAPHY.fontWeight.medium }}>
                  {mode.label}
                </div>
                <div style={{
                  fontSize: TYPOGRAPHY.fontSize.xs,
                  color: 'var(--color-text-secondary)'
                }}>
                  {mode.description}
                </div>
              </div>
            </MaterialButton>
          ))}
        </MaterialPaper>
      )}
    </div>
  );
};

export default ModeNavigation;