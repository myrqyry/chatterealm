import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MaterialButton, MaterialChip } from './index';

interface ModeNavigationProps {
  compact?: boolean;
}

const modes: Array<{ path: string; label: string; description?: string }> = [
  { path: '/play', label: 'Play', description: 'Join the realm and play' },
  { path: '/spectate', label: 'Spectate', description: 'Watch ongoing games' },
  { path: '/dev', label: 'Dev', description: 'Developer tools & testing' }
];

const ModeNavigation: React.FC<ModeNavigationProps> = ({ compact = false }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const currentMode = modes.find((mode) => mode.path === location.pathname);

  if (compact) {
    return (
      <div className="flex gap-1 items-center">
        {modes.map((mode) => (
          <MaterialButton
            key={mode.path}
            variant={location.pathname === mode.path ? 'contained' : 'outlined'}
            size="small"
            onClick={() => navigate(mode.path)}
            sx={{
              minWidth: 'auto',
              px: 1,
              py: 0.5,
              fontSize: '0.75rem',
              textTransform: 'none',
              backgroundColor: location.pathname === mode.path ? 'rgba(76, 175, 80, 0.2)' : 'transparent',
              borderColor: 'rgba(196, 167, 231, 0.3)',
              color: 'var(--color-text-primary)',
              '&:hover': {
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                borderColor: 'rgba(196, 167, 231, 0.5)'
              }
            }}
          >
            {mode.label}
          </MaterialButton>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-4 bg-[var(--color-surface-variant)]/90 rounded-md border border-[var(--color-outline)] min-w-[200px]">
      <h3 className="m-0 text-[var(--color-text-primary)] text-base font-semibold">Interface Mode</h3>

      {currentMode && (
        <MaterialChip
          label={currentMode.description}
          size="small"
          sx={{
            backgroundColor: 'rgba(76, 175, 80, 0.2)',
            color: 'var(--color-text-primary)',
            fontSize: '0.75rem'
          }}
        />
      )}

      <div className="flex flex-col gap-1">
        {modes.map((mode) => (
          <MaterialButton
            key={mode.path}
            variant={location.pathname === mode.path ? 'contained' : 'outlined'}
            fullWidth
            onClick={() => navigate(mode.path)}
            sx={{
              justifyContent: 'flex-start',
              textTransform: 'none',
              backgroundColor: location.pathname === mode.path ? 'rgba(76, 175, 80, 0.2)' : 'transparent',
              borderColor: 'rgba(196, 167, 231, 0.3)',
              color: 'var(--color-text-primary)',
              '&:hover': {
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                borderColor: 'rgba(196, 167, 231, 0.5)'
              }
            }}
          >
            {mode.label}
          </MaterialButton>
        ))}
      </div>
    </div>
  );
};

export default ModeNavigation;