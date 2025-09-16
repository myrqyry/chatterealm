import React from 'react';
import { useGameStore } from '../../stores/gameStore';
import { MaterialCard } from '../index';

/**
 * OverviewModal - World status and player information
 */
const OverviewModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { gameWorld, currentPlayer, gameMessage } = useGameStore();

  return (
    <div className="p-6 h-full overflow-auto font-mono bg-gradient-to-br from-background-primary/95 to-surface/90">
      {/* Modal Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-primary/30">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <span className="text-2xl">🧭</span>
          </div>
          <div>
            <h1 className="m-0 text-text-primary text-2xl font-bold text-shadow">
              Overview
            </h1>
            <p className="mt-1 mb-0 text-text-secondary text-sm font-normal">
              World status and player information
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
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <span className="text-lg">🗺️</span>
            </div>
            <h3 className="m-0 text-text-primary text-lg font-semibold">
              World Snapshot
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="text-xs text-text-secondary mb-1 uppercase tracking-wider font-medium">
                Phase
              </div>
              <div className="text-lg text-text-primary font-semibold">
                {gameWorld?.phase || 'N/A'}
              </div>
            </div>
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="text-xs text-text-secondary mb-1 uppercase tracking-wider font-medium">
                Players
              </div>
              <div className="text-lg text-text-primary font-semibold">
                {gameWorld ? gameWorld.players.length : 0}
              </div>
            </div>
            <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
              <div className="text-xs text-text-secondary mb-1 uppercase tracking-wider font-medium">
                NPCs
              </div>
              <div className="text-lg text-text-primary font-semibold">
                {gameWorld ? gameWorld.npcs.length : 0}
              </div>
            </div>
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <div className="text-xs text-text-secondary mb-1 uppercase tracking-wider font-medium">
                Items
              </div>
              <div className="text-lg text-text-primary font-semibold">
                {gameWorld ? gameWorld.items.length : 0}
              </div>
            </div>
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg col-span-full">
              <div className="text-xs text-text-secondary mb-1 uppercase tracking-wider font-medium">
                World Age
              </div>
              <div className="text-lg text-text-primary font-semibold">
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
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                <span className="text-lg">🧑</span>
              </div>
              <h3 className="m-0 text-text-primary text-lg font-semibold">
                Current Player
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="text-xs text-text-secondary mb-1 uppercase tracking-wider font-medium">
                  Name
                </div>
                <div className="text-base text-text-primary font-semibold">
                  {currentPlayer.name}
                </div>
              </div>
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="text-xs text-text-secondary mb-1 uppercase tracking-wider font-medium">
                  Health
                </div>
                <div className="text-base text-text-primary font-semibold">
                  {currentPlayer.health}
                </div>
              </div>
              <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                <div className="text-xs text-text-secondary mb-1 uppercase tracking-wider font-medium">
                  Level
                </div>
                <div className="text-base text-text-primary font-semibold">
                  {currentPlayer.level}
                </div>
              </div>
              <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg col-span-full">
                <div className="text-xs text-text-secondary mb-1 uppercase tracking-wider font-medium">
                  Position
                </div>
                <div className="text-base text-text-primary font-semibold font-mono">
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
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(245, 158, 11, 0.15)',
                borderColor: 'rgba(245, 158, 11, 0.4)'
              }
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                <span className="text-lg">💬</span>
              </div>
              <div className="flex-1">
                <div className="text-xs text-text-secondary mb-1 uppercase tracking-wider font-medium">
                  Game Message
                </div>
                <div className="text-text-primary text-sm leading-relaxed">
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
