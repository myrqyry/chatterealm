import React, { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { PlayerClass } from 'shared';
import {
  CategoryNavigation,
  OverviewPanel,
  // Player specific overview panel
  PlayerSummaryPanel,
  GameplaySettings,
  AudioSettings,
  VisualSettings,
  WorldSettings,
  ActionsPanel,
  PlayerStatusPanel
} from '../sidebar';
import { MaterialCard, MaterialChip, MaterialPaper } from './index';

const RightSidebar: React.FC = () => {
  const {
  currentPlayer,
  joinGame,
  handleRegenerateWorld,
    startCataclysm,
    movePlayer,
    pickupItem,
    gameMessage,
    gameWorld,
    unifiedSettings,
    updateGameSettings,
    updateAudioSettings,
    updateNotificationSettings,
    updateVisualSettings,
    updateWorldSettings,
    updateAnimationSettings,
  } = useGameStore();

  const [activeCategory, setActiveCategory] = useState<string>('overview');

  const categories = [
    { id: 'overview', label: 'Overview', icon: '🧭' },
    { id: 'player', label: 'Player', icon: '🧑' },
    { id: 'gameplay', label: 'Gameplay', icon: '🎮' },
    { id: 'audio', label: 'Audio', icon: '🎵' },
    { id: 'visual', label: 'Visual', icon: '👁️' },
    { id: 'world', label: 'World', icon: '🌍' },
    { id: 'actions', label: 'Actions', icon: '⚔️' },
  ];

  const handleJoin = () => {
    joinGame({
      id: `player_${Date.now()}`,
      displayName: 'Player' + Math.floor(Math.random() * 1000),
      class: PlayerClass.KNIGHT,
      avatar: '🙂'
    });
  };

  const handleRegenerate = () => {
    handleRegenerateWorld();
  };

  const handleCataclysm = () => {
    startCataclysm();
  };

  const handleMove = (direction: 'up' | 'down' | 'left' | 'right') => {
    movePlayer(direction);
  };

  const handlePickup = () => {
    pickupItem('nearest');
  };

  const renderCategoryContent = () => {
    switch (activeCategory) {
      case 'overview':
        return (
          <OverviewPanel
            gameWorld={gameWorld}
            currentPlayer={currentPlayer}
            gameMessage={gameMessage}
          />
        );

      case 'player':
        return (
          <PlayerSummaryPanel
            player={currentPlayer}
          />
        );

      case 'gameplay':
        return (
          <GameplaySettings
            unifiedSettings={unifiedSettings}
            updateGameSettings={updateGameSettings}
          />
        );

      case 'audio':
        return (
          <AudioSettings
            unifiedSettings={unifiedSettings}
            updateAudioSettings={updateAudioSettings}
          />
        );

      case 'visual':
        return (
          <VisualSettings
            unifiedSettings={unifiedSettings}
            updateVisualSettings={updateVisualSettings}
            updateAnimationSettings={updateAnimationSettings}
          />
        );

      case 'world':
        return (
          <WorldSettings
            unifiedSettings={unifiedSettings}
            updateWorldSettings={updateWorldSettings}
          />
        );

      case 'actions':
        return (
          <ActionsPanel
            currentPlayer={currentPlayer}
            onJoin={handleJoin}
            onMove={handleMove}
            onPickup={handlePickup}
            onRegenerate={handleRegenerate}
            onCataclysm={handleCataclysm}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-[320px] h-screen flex flex-col overflow-hidden shadow-[ -4px_0_20px_rgba(0,0,0,0.15) ] backdrop-blur-[20px] bg-[linear-gradient(145deg,var(--color-background-paper)_0%,rgba(31,29,46,0.95)_100%)] border-l border-[var(--color-divider)]">
      {/* Header */}
      <div className="p-5 border-b border-[var(--color-outline)] bg-[linear-gradient(135deg,rgba(196,167,231,0.05)_0%,rgba(156,207,216,0.05)_100%)]">
        <h1 className="font-serif text-xl font-extrabold text-text-primary m-0 uppercase tracking-widest text-center header-gradient">chatterealm</h1>
      </div>

      {/* Category Icons Row */}
  <div className="px-5 py-3 border-b flex justify-between items-center gap-1 border-[var(--color-outline)]">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`flex-1 rounded-lg px-2 py-2 flex flex-col items-center gap-1 min-h-[50px] transition-all duration-200 ${activeCategory === category.id ? 'bg-[rgba(196,167,231,0.2)] border border-[rgba(196,167,231,0.4)]' : 'bg-transparent border border-transparent hover:bg-[rgba(196,167,231,0.1)]'}`}
          >
            <span className="text-lg block mb-0.5">{category.icon}</span>
            <span className={`text-[0.7rem] ${activeCategory === category.id ? 'text-primary font-semibold' : 'text-text-secondary font-normal'}`}>{category.label}</span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto scrollbar-thin">
        {renderCategoryContent()}
      </div>

      {/* Player Status - Always visible at bottom */}
      {currentPlayer && (
        <div className="p-4 border-t border-[var(--color-outline)] bg-[var(--color-surface-variant)]/80">
          <PlayerStatusPanel currentPlayer={currentPlayer} />
        </div>
      )}
    </div>
  );
};

export default RightSidebar;