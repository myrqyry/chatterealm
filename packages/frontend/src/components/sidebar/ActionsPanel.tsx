import React from 'react';
import { Player, PlayerClass } from 'shared';

interface ActionsPanelProps {
  currentPlayer: Player | null;
  onJoin: () => void;
  onMove: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onPickup: () => void;
  onRegenerate: () => void;
  onCataclysm: () => void;
}

const ActionsPanel: React.FC<ActionsPanelProps> = ({
  currentPlayer,
  onJoin,
  onMove,
  onPickup,
  onRegenerate,
  onCataclysm
}) => {
  return (
    <div style={{ padding: '16px 0' }}>
      {/* Quick Actions */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{
          color: 'var(--color-text-primary)',
          fontSize: '0.9em',
          fontWeight: '600',
          margin: '0 0 12px 0'
        }}>
          Quick Actions
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {!currentPlayer && (
            <button
              onClick={onJoin}
              style={{
                background: 'var(--color-primary)',
                color: 'var(--color-on-primary)',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: '0.85em',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              🔌 Join Game
            </button>
          )}

          {currentPlayer && (
            <>
              {/* Movement Controls */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', marginBottom: '8px' }}>
                <div></div>
                <button
                  onClick={() => onMove('up')}
                  style={{
                    background: 'var(--color-surface-variant)',
                    color: 'var(--color-text-primary)',
                    border: '1px solid var(--color-outline)',
                    borderRadius: '4px',
                    width: '32px',
                    height: '32px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-primary-container)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'var(--color-surface-variant)'}
                >
                  ↑
                </button>
                <div></div>

                <button
                  onClick={() => onMove('left')}
                  style={{
                    background: 'var(--color-surface-variant)',
                    color: 'var(--color-text-primary)',
                    border: '1px solid var(--color-outline)',
                    borderRadius: '4px',
                    width: '32px',
                    height: '32px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-primary-container)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'var(--color-surface-variant)'}
                >
                  ←
                </button>

                <button
                  onClick={() => onMove('down')}
                  style={{
                    background: 'var(--color-surface-variant)',
                    color: 'var(--color-text-primary)',
                    border: '1px solid var(--color-outline)',
                    borderRadius: '4px',
                    width: '32px',
                    height: '32px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-primary-container)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'var(--color-surface-variant)'}
                >
                  ↓
                </button>

                <button
                  onClick={() => onMove('right')}
                  style={{
                    background: 'var(--color-surface-variant)',
                    color: 'var(--color-text-primary)',
                    border: '1px solid var(--color-outline)',
                    borderRadius: '4px',
                    width: '32px',
                    height: '32px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-primary-container)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'var(--color-surface-variant)'}
                >
                  →
                </button>
              </div>

              <button
                onClick={onPickup}
                style={{
                  background: 'var(--color-secondary)',
                  color: 'var(--color-on-secondary)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  fontSize: '0.85em',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                🎒 Pick Up
              </button>
            </>
          )}

          <button
            onClick={onRegenerate}
            style={{
              background: 'var(--color-tertiary)',
              color: 'var(--color-on-tertiary)',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: '0.85em',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            🌍 Regen World
          </button>

          <button
            onClick={onCataclysm}
            style={{
              background: 'var(--color-error)',
              color: 'var(--color-on-error)',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: '0.85em',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            ⚡ Cataclysm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionsPanel;