import React from 'react';
import { useGameStore } from '../../stores/gameStore';
import { MaterialCard } from '../index';

/**
 * OverviewModal - World status and player information
 */
const OverviewModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { gameWorld, currentPlayer, gameMessage } = useGameStore();

  return (
    <div style={{
      padding: '24px',
      height: '100%',
      overflow: 'auto',
      fontFamily: 'JetBrains Mono',
      background: 'linear-gradient(145deg, rgba(25, 23, 36, 0.95) 0%, rgba(31, 29, 46, 0.9) 100%)'
    }}>
      {/* Modal Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '32px',
        paddingBottom: '16px',
        borderBottom: '2px solid rgba(196, 167, 231, 0.3)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)'
          }}>
            <span style={{ fontSize: '1.5rem' }}>🧭</span>
          </div>
          <div>
            <h1 style={{
              margin: 0,
              color: 'var(--color-text-primary)',
              fontSize: '1.8rem',
              fontWeight: 700,
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
            }}>
              Overview
            </h1>
            <p style={{
              margin: '4px 0 0 0',
              color: 'var(--color-text-secondary)',
              fontSize: '0.9rem',
              fontWeight: 400
            }}>
              World status and player information
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            minWidth: '40px',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            color: 'var(--color-text-primary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          ✕
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* World Snapshot */}
        <MaterialCard
          sx={{
            backgroundColor: 'rgba(25, 23, 36, 0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(33, 150, 243, 0.2)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(33, 150, 243, 0.1)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(33, 150, 243, 0.15)',
              borderColor: 'rgba(33, 150, 243, 0.3)'
            }
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '20px'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '1.1rem' }}>🗺️</span>
            </div>
            <h3 style={{
              margin: 0,
              color: 'var(--color-text-primary)',
              fontSize: '1.2rem',
              fontWeight: 600
            }}>
              World Snapshot
            </h3>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '16px'
          }}>
            <div style={{
              padding: '12px',
              background: 'rgba(33, 150, 243, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(33, 150, 243, 0.2)'
            }}>
              <div style={{
                fontSize: '0.8rem',
                color: 'var(--color-text-secondary)',
                marginBottom: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontWeight: 500
              }}>
                Phase
              </div>
              <div style={{
                fontSize: '1.1rem',
                color: 'var(--color-text-primary)',
                fontWeight: 600
              }}>
                {gameWorld?.phase || 'N/A'}
              </div>
            </div>
            <div style={{
              padding: '12px',
              background: 'rgba(76, 175, 80, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(76, 175, 80, 0.2)'
            }}>
              <div style={{
                fontSize: '0.8rem',
                color: 'var(--color-text-secondary)',
                marginBottom: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontWeight: 500
              }}>
                Players
              </div>
              <div style={{
                fontSize: '1.1rem',
                color: 'var(--color-text-primary)',
                fontWeight: 600
              }}>
                {gameWorld ? gameWorld.players.length : 0}
              </div>
            </div>
            <div style={{
              padding: '12px',
              background: 'rgba(255, 152, 0, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(255, 152, 0, 0.2)'
            }}>
              <div style={{
                fontSize: '0.8rem',
                color: 'var(--color-text-secondary)',
                marginBottom: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontWeight: 500
              }}>
                NPCs
              </div>
              <div style={{
                fontSize: '1.1rem',
                color: 'var(--color-text-primary)',
                fontWeight: 600
              }}>
                {gameWorld ? gameWorld.npcs.length : 0}
              </div>
            </div>
            <div style={{
              padding: '12px',
              background: 'rgba(156, 39, 176, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(156, 39, 176, 0.2)'
            }}>
              <div style={{
                fontSize: '0.8rem',
                color: 'var(--color-text-secondary)',
                marginBottom: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontWeight: 500
              }}>
                Items
              </div>
              <div style={{
                fontSize: '1.1rem',
                color: 'var(--color-text-primary)',
                fontWeight: 600
              }}>
                {gameWorld ? gameWorld.items.length : 0}
              </div>
            </div>
            <div style={{
              padding: '12px',
              background: 'rgba(0, 188, 212, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(0, 188, 212, 0.2)',
              gridColumn: '1 / -1'
            }}>
              <div style={{
                fontSize: '0.8rem',
                color: 'var(--color-text-secondary)',
                marginBottom: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontWeight: 500
              }}>
                World Age
              </div>
              <div style={{
                fontSize: '1.1rem',
                color: 'var(--color-text-primary)',
                fontWeight: 600
              }}>
                {gameWorld?.worldAge || 0} cycles
              </div>
            </div>
          </div>
        </MaterialCard>

        {/* Current Player */}
        {currentPlayer && (
          <MaterialCard
            sx={{
              backgroundColor: 'rgba(25, 23, 36, 0.8)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(76, 175, 80, 0.2)',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(76, 175, 80, 0.1)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(76, 175, 80, 0.15)',
                borderColor: 'rgba(76, 175, 80, 0.3)'
              }
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '20px'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '1.1rem' }}>🧑</span>
              </div>
              <h3 style={{
                margin: 0,
                color: 'var(--color-text-primary)',
                fontSize: '1.2rem',
                fontWeight: 600
              }}>
                Current Player
              </h3>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: '12px'
            }}>
              <div style={{
                padding: '12px',
                background: 'rgba(76, 175, 80, 0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(76, 175, 80, 0.2)'
              }}>
                <div style={{
                  fontSize: '0.8rem',
                  color: 'var(--color-text-secondary)',
                  marginBottom: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontWeight: 500
                }}>
                  Name
                </div>
                <div style={{
                  fontSize: '1rem',
                  color: 'var(--color-text-primary)',
                  fontWeight: 600
                }}>
                  {currentPlayer.name}
                </div>
              </div>
              <div style={{
                padding: '12px',
                background: 'rgba(244, 67, 54, 0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(244, 67, 54, 0.2)'
              }}>
                <div style={{
                  fontSize: '0.8rem',
                  color: 'var(--color-text-secondary)',
                  marginBottom: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontWeight: 500
                }}>
                  Health
                </div>
                <div style={{
                  fontSize: '1rem',
                  color: 'var(--color-text-primary)',
                  fontWeight: 600
                }}>
                  {currentPlayer.health}
                </div>
              </div>
              <div style={{
                padding: '12px',
                background: 'rgba(255, 152, 0, 0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 152, 0, 0.2)'
              }}>
                <div style={{
                  fontSize: '0.8rem',
                  color: 'var(--color-text-secondary)',
                  marginBottom: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontWeight: 500
                }}>
                  Level
                </div>
                <div style={{
                  fontSize: '1rem',
                  color: 'var(--color-text-primary)',
                  fontWeight: 600
                }}>
                  {currentPlayer.level}
                </div>
              </div>
              <div style={{
                padding: '12px',
                background: 'rgba(156, 39, 176, 0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(156, 39, 176, 0.2)',
                gridColumn: '1 / -1'
              }}>
                <div style={{
                  fontSize: '0.8rem',
                  color: 'var(--color-text-secondary)',
                  marginBottom: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontWeight: 500
                }}>
                  Position
                </div>
                <div style={{
                  fontSize: '1rem',
                  color: 'var(--color-text-primary)',
                  fontWeight: 600,
                  fontFamily: 'JetBrains Mono'
                }}>
                  {currentPlayer.position.x}, {currentPlayer.position.y}
                </div>
              </div>
            </div>
          </MaterialCard>
        )}

        {/* Game Message */}
        {gameMessage && (
          <MaterialCard
            sx={{
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(245, 158, 11, 0.1)',
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '1.1rem' }}>💬</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '0.8rem',
                  color: 'var(--color-text-secondary)',
                  marginBottom: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontWeight: 500
                }}>
                  Game Message
                </div>
                <div style={{
                  color: 'var(--color-text-primary)',
                  fontSize: '0.95rem',
                  lineHeight: 1.4
                }}>
                  {gameMessage}
                </div>
              </div>
            </div>
          </MaterialCard>
        )}
      </div>
    </div>
  );
};

export default OverviewModal;
