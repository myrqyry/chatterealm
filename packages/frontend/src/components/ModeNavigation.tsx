import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MaterialButton, MaterialChip } from './index';

interface ModeNavigationProps {
  compact?: boolean;
}

const ModeNavigation: React.FC<ModeNavigationProps> = ({ compact = false }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const modes = [
    { path: '/play', label: '🎮 Play', description: 'Player Interface' },
    { path: '/spectate', label: '👁️ Spectate', description: 'Watch Game' },
    { path: '/dev', label: '🛠️ Dev', description: 'Developer Tools' }
  ];

  const currentMode = modes.find(mode => mode.path === location.pathname);

  if (compact) {
    return (
      <div style={{
        display: 'flex',
        gap: '4px',
        alignItems: 'center'
      }}>
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
              backgroundColor: location.pathname === mode.path ?
                'rgba(76, 175, 80, 0.2)' :
                'transparent',
              borderColor: 'rgba(196, 167, 231, 0.3)',
              color: 'var(--color-text-primary)',
              '&:hover': {
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                borderColor: 'rgba(196, 167, 231, 0.5)',
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
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      padding: '16px',
      background: 'rgba(25, 23, 36, 0.9)',
      borderRadius: '8px',
      border: '1px solid rgba(196, 167, 231, 0.2)',
      minWidth: '200px'
    }}>
      <h3 style={{
        margin: 0,
        color: 'var(--color-text-primary)',
        fontSize: '1em',
        fontWeight: '600'
      }}>
        Interface Mode
      </h3>

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

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
        {modes.map((mode) => (
          <MaterialButton
            key={mode.path}
            variant={location.pathname === mode.path ? 'contained' : 'outlined'}
            fullWidth
            onClick={() => navigate(mode.path)}
            sx={{
              justifyContent: 'flex-start',
              textTransform: 'none',
              backgroundColor: location.pathname === mode.path ?
                'rgba(76, 175, 80, 0.2)' :
                'transparent',
              borderColor: 'rgba(196, 167, 231, 0.3)',
              color: 'var(--color-text-primary)',
              '&:hover': {
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                borderColor: 'rgba(196, 167, 231, 0.5)',
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