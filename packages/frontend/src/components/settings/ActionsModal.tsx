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
    handleRegenerateWorld
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
  const handleRegenerate = () => handleRegenerateWorld();

  return (
    <div className="p-6 h-full overflow-auto font-mono bg-gradient-to-br from-background-primary/95 to-surface/90">
      {/* Modal Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-primary/30">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/30">
            <span className="text-2xl">⚔️</span>
          </div>
          <div>
            <h1 className="m-0 text-text-primary text-2xl font-bold text-shadow">
              Actions
            </h1>
            <p className="mt-1 mb-0 text-text-secondary text-sm font-normal">
              Player controls and world events
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/10 border-none text-text-primary cursor-pointer flex items-center justify-center text-lg transition-all duration-200 hover:bg-white/20 hover:scale-105"
        >
          ✕
        </button>
      </div>

      <div className="flex flex-col gap-6">
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
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
              <span className="text-lg">🕹️</span>
            </div>
            <h3 className="m-0 text-text-primary text-lg font-semibold">
              Player Actions
            </h3>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-3">
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
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
              <span className="text-lg">🌩️</span>
            </div>
            <h3 className="m-0 text-text-primary text-lg font-semibold">
              World Events
            </h3>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
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
            <div className="mt-5 p-4 bg-surface/60 rounded-xl border border-red-500/20">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
                  <span className="text-sm">📊</span>
                </div>
                <h4 className="m-0 text-text-primary text-base font-semibold">
                  World Properties
                </h4>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div style={{ color: 'var(--color-text-secondary)' }}>
                  <strong>Cataclysm:</strong> {gameWorld.cataclysmCircle.isActive ? 'Active' : 'Inactive'}
                </div>
                {gameWorld.cataclysmCircle.isActive && (
                  <div style={{ color: 'var(--color-text-secondary)' }}>
                    <strong>Radius:</strong> {gameWorld.cataclysmCircle.radius.toFixed(1)}
                  </div>
                )}
                <div className="text-text-secondary col-span-full">
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
