import React from 'react';
import { useGameStore } from '../../stores/gameStore';
import { PlayerClass } from 'shared';
import { MaterialButton, MaterialCard } from '../index';

const ActionsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const {
    gameWorld,
    joinGame,
    movePlayer,
    pickupItem,
    startCataclysm,
    regenerateWorld
  } = useGameStore();

  const handleJoin = () => joinGame({
    id: `player_${Date.now()}`,
    displayName: 'Player' + Math.floor(Math.random() * 1000),
    class: PlayerClass.KNIGHT,
    avatar: '🙂'
  });
  const handleMove = (dir: 'up' | 'down' | 'left' | 'right') => movePlayer(dir);
  const handlePickup = () => pickupItem('nearest');
  const handleCataclysm = () => startCataclysm();
  const handleRegenerate = () => regenerateWorld();

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
        borderBottom: '2px solid rgba(244, 67, 54, 0.3)'
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
            background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)'
          }}>
            <span style={{ fontSize: '1.5rem' }}>⚔️</span>
          </div>
          <div>
            <h1 style={{
              margin: 0,
              color: 'var(--color-text-primary)',
              fontSize: '1.8rem',
              fontWeight: 700,
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
            }}>
              Actions
            </h1>
            <p style={{
              margin: '4px 0 0 0',
              color: 'var(--color-text-secondary)',
              fontSize: '0.9rem',
              fontWeight: 400
            }}>
              Player controls and world events
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
        <MaterialCard
          sx={{
            backgroundColor: 'rgba(25, 23, 36, 0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(244, 67, 54, 0.2)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(244, 67, 54, 0.1)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(244, 67, 54, 0.15)',
              borderColor: 'rgba(244, 67, 54, 0.3)'
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
              background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '1.1rem' }}>🕹️</span>
            </div>
            <h3 style={{
              margin: 0,
              color: 'var(--color-text-primary)',
              fontSize: '1.2rem',
              fontWeight: 600
            }}>
              Player Actions
            </h3>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '12px'
          }}>
            <MaterialButton
              onClick={handleJoin}
              sx={{
                height: '48px',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                border: '1px solid rgba(76, 175, 80, 0.2)',
                '&:hover': {
                  backgroundColor: 'rgba(76, 175, 80, 0.2)',
                  transform: 'translateY(-1px)'
                }
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ fontSize: '1.1rem' }}>🔌</span>
                <span>Join Game</span>
              </div>
            </MaterialButton>
            <MaterialButton
              onClick={() => handleMove('up')}
              sx={{
                height: '48px',
                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                border: '1px solid rgba(33, 150, 243, 0.2)',
                '&:hover': {
                  backgroundColor: 'rgba(33, 150, 243, 0.2)',
                  transform: 'translateY(-1px)'
                }
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ fontSize: '1.1rem' }}>↑</span>
                <span>Up</span>
              </div>
            </MaterialButton>
            <MaterialButton
              onClick={() => handleMove('down')}
              sx={{
                height: '48px',
                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                border: '1px solid rgba(33, 150, 243, 0.2)',
                '&:hover': {
                  backgroundColor: 'rgba(33, 150, 243, 0.2)',
                  transform: 'translateY(-1px)'
                }
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ fontSize: '1.1rem' }}>↓</span>
                <span>Down</span>
              </div>
            </MaterialButton>
            <MaterialButton
              onClick={() => handleMove('left')}
              sx={{
                height: '48px',
                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                border: '1px solid rgba(33, 150, 243, 0.2)',
                '&:hover': {
                  backgroundColor: 'rgba(33, 150, 243, 0.2)',
                  transform: 'translateY(-1px)'
                }
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ fontSize: '1.1rem' }}>←</span>
                <span>Left</span>
              </div>
            </MaterialButton>
            <MaterialButton
              onClick={() => handleMove('right')}
              sx={{
                height: '48px',
                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                border: '1px solid rgba(33, 150, 243, 0.2)',
                '&:hover': {
                  backgroundColor: 'rgba(33, 150, 243, 0.2)',
                  transform: 'translateY(-1px)'
                }
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ fontSize: '1.1rem' }}>→</span>
                <span>Right</span>
              </div>
            </MaterialButton>
            <MaterialButton
              onClick={handlePickup}
              sx={{
                height: '48px',
                backgroundColor: 'rgba(255, 152, 0, 0.1)',
                border: '1px solid rgba(255, 152, 0, 0.2)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 152, 0, 0.2)',
                  transform: 'translateY(-1px)'
                }
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ fontSize: '1.1rem' }}>🎒</span>
                <span>Pick Up</span>
              </div>
            </MaterialButton>
          </div>
        </MaterialCard>

        <MaterialCard
          sx={{
            backgroundColor: 'rgba(25, 23, 36, 0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(244, 67, 54, 0.2)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(244, 67, 54, 0.1)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(244, 67, 54, 0.15)',
              borderColor: 'rgba(244, 67, 54, 0.3)'
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
              background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '1.1rem' }}>🌩️</span>
            </div>
            <h3 style={{
              margin: 0,
              color: 'var(--color-text-primary)',
              fontSize: '1.2rem',
              fontWeight: 600
            }}>
              World Events
            </h3>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '12px'
          }}>
            <MaterialButton
              onClick={handleRegenerate}
              sx={{
                height: '48px',
                backgroundColor: 'rgba(0, 188, 212, 0.1)',
                border: '1px solid rgba(0, 188, 212, 0.2)',
                '&:hover': {
                  backgroundColor: 'rgba(0, 188, 212, 0.2)',
                  transform: 'translateY(-1px)'
                }
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ fontSize: '1.1rem' }}>🌍</span>
                <span>Regenerate</span>
              </div>
            </MaterialButton>
            <MaterialButton
              onClick={handleCataclysm}
              sx={{
                height: '48px',
                backgroundColor: 'rgba(244, 67, 54, 0.1)',
                border: '1px solid rgba(244, 67, 54, 0.2)',
                '&:hover': {
                  backgroundColor: 'rgba(244, 67, 54, 0.2)',
                  transform: 'translateY(-1px)'
                }
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ fontSize: '1.1rem' }}>⚡</span>
                <span>Cataclysm</span>
              </div>
            </MaterialButton>
          </div>

          {gameWorld && (
            <div style={{
              marginTop: '20px',
              padding: '16px',
              background: 'rgba(25, 23, 36, 0.6)',
              borderRadius: '12px',
              border: '1px solid rgba(244, 67, 54, 0.2)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '12px'
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '6px',
                  background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ fontSize: '0.9rem' }}>📊</span>
                </div>
                <h4 style={{
                  margin: 0,
                  color: 'var(--color-text-primary)',
                  fontSize: '1rem',
                  fontWeight: 600
                }}>
                  World Properties
                </h4>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                fontSize: '0.85rem'
              }}>
                <div style={{ color: 'var(--color-text-secondary)' }}>
                  <strong>Cataclysm:</strong> {gameWorld.cataclysmCircle.isActive ? 'Active' : 'Inactive'}
                </div>
                {gameWorld.cataclysmCircle.isActive && (
                  <div style={{ color: 'var(--color-text-secondary)' }}>
                    <strong>Radius:</strong> {gameWorld.cataclysmCircle.radius.toFixed(1)}
                  </div>
                )}
                <div style={{
                  color: 'var(--color-text-secondary)',
                  gridColumn: gameWorld.cataclysmCircle.isActive ? '1 / -1' : '2 / -1'
                }}>
                  <strong>Last Reset:</strong> {new Date(gameWorld.lastResetTime).toLocaleTimeString()}
                </div>
              </div>
            </div>
          )}
        </MaterialCard>
      </div>
    </div>
  );
};

export default ActionsModal;
