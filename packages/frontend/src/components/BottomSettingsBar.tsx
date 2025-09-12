import React, { useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import { PlayerClass } from 'shared';

const BottomSettingsBar: React.FC = () => {
  const {
    currentPlayer,
    joinGame,
    regenerateWorld,
    startCataclysm,
    movePlayer,
    gameMessage
  } = useGameStore();

  const [showSettings, setShowSettings] = useState(false);

  const handleJoin = () => {
    joinGame({
      id: `player_${Date.now()}`,
      displayName: 'Player' + Math.floor(Math.random() * 1000),
      class: PlayerClass.KNIGHT,
      avatar: '🙂'
    });
  };

  const handleRegenerate = () => {
    regenerateWorld();
  };

  const handleCataclysm = () => {
    startCataclysm();
  };

  const handleMove = (direction: 'up' | 'down' | 'left' | 'right') => {
    movePlayer(direction);
  };

  return (
    <>
      {/* Bottom Settings Bar */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'rgba(25, 23, 36, 0.95)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(196, 167, 231, 0.2)',
        padding: '8px 16px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '12px',
        zIndex: 1000
      }}>
        {/* Join Game */}
        <button
          onClick={handleJoin}
          style={{
            background: 'var(--color-primary)',
            color: 'var(--color-on-primary)',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          🔌 Join
        </button>

        {/* Movement Controls */}
        {currentPlayer && (
          <>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={() => handleMove('up')}
                style={{
                  background: 'var(--color-surface-variant)',
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-outline)',
                  borderRadius: '6px',
                  width: '36px',
                  height: '36px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-primary-container)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'var(--color-surface-variant)'}
              >
                ↑
              </button>
            </div>

            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={() => handleMove('left')}
                style={{
                  background: 'var(--color-surface-variant)',
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-outline)',
                  borderRadius: '6px',
                  width: '36px',
                  height: '36px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-primary-container)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'var(--color-surface-variant)'}
              >
                ←
              </button>

              <button
                onClick={() => handleMove('down')}
                style={{
                  background: 'var(--color-surface-variant)',
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-outline)',
                  borderRadius: '6px',
                  width: '36px',
                  height: '36px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-primary-container)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'var(--color-surface-variant)'}
              >
                ↓
              </button>

              <button
                onClick={() => handleMove('right')}
                style={{
                  background: 'var(--color-surface-variant)',
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-outline)',
                  borderRadius: '6px',
                  width: '36px',
                  height: '36px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-primary-container)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'var(--color-surface-variant)'}
              >
                →
              </button>
            </div>
          </>
        )}

        {/* World Controls */}
        <button
          onClick={handleRegenerate}
          style={{
            background: 'var(--color-secondary)',
            color: 'var(--color-on-secondary)',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          🌍 Regen
        </button>

        <button
          onClick={handleCataclysm}
          style={{
            background: 'var(--color-error)',
            color: 'var(--color-on-error)',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          ⚡ Cataclysm
        </button>

        {/* Settings Toggle */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          style={{
            background: 'var(--color-surface-variant)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-outline)',
            borderRadius: '8px',
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-primary-container)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'var(--color-surface-variant)'}
        >
          ⚙️ Settings
        </button>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{
            background: 'var(--color-surface)',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
            border: '1px solid var(--color-outline)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <h3 style={{ margin: 0, color: 'var(--color-text-primary)' }}>Quick Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  fontSize: '20px',
                  padding: '4px'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', color: 'var(--color-text-primary)' }}>
                  Show Grid
                </label>
                <input type="checkbox" defaultChecked />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', color: 'var(--color-text-primary)' }}>
                  Show Particles
                </label>
                <input type="checkbox" defaultChecked />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', color: 'var(--color-text-primary)' }}>
                  Animation Speed
                </label>
                <input type="range" min="0.1" max="3" step="0.1" defaultValue="1" />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', color: 'var(--color-text-primary)' }}>
                  Volume
                </label>
                <input type="range" min="0" max="100" defaultValue="80" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Game Message */}
      {gameMessage && (
        <div style={{
          position: 'fixed',
          bottom: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--color-primary-container)',
          color: 'var(--color-on-primary-container)',
          padding: '8px 16px',
          borderRadius: '8px',
          fontSize: '14px',
          zIndex: 1500,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        }}>
          {gameMessage}
        </div>
      )}
    </>
  );
};

export default BottomSettingsBar;