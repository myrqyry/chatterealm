import React, { useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import { PlayerClass } from 'shared';
import {
  CategoryNavigation,
  OverviewPanel,
  GameplaySettings,
  AudioSettings,
  VisualSettings,
  WorldSettings,
  ActionsPanel,
  PlayerStatusPanel
} from './sidebar';
import { MaterialCard, MaterialChip, MaterialPaper } from './index';
import { COLORS } from '../constants/colors';

const RightSidebar: React.FC = () => {
  const {
    currentPlayer,
    joinGame,
    regenerateWorld,
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
    regenerateWorld();
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
    <div style={{
      width: '320px',
      height: '100vh',
      background: 'linear-gradient(145deg, var(--color-background-paper) 0%, rgba(31, 29, 46, 0.95) 100%)',
      borderLeft: '1px solid var(--color-divider)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.15)',
      backdropFilter: 'blur(20px)'
    }}>
      {/* Header */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid rgba(196, 167, 231, 0.2)',
        background: 'linear-gradient(135deg, rgba(196, 167, 231, 0.05) 0%, rgba(156, 207, 216, 0.05) 100%)'
      }}>
        <h1 style={{
          fontFamily: 'Times New Roman, Times, serif',
          fontSize: '1.4rem',
          fontWeight: '700',
          color: 'var(--color-text-primary)',
          margin: '0',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          textAlign: 'center',
          textShadow: '0 0 15px rgba(196, 167, 231, 0.3)',
          background: 'linear-gradient(135deg, var(--color-text-primary) 0%, rgba(196, 167, 231, 0.7) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          chatterealm
        </h1>
      </div>

      {/* Category Icons Row */}
      <div style={{
        padding: '12px 20px',
        borderBottom: '1px solid rgba(196, 167, 231, 0.2)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '4px'
      }}>
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            style={{
              flex: 1,
              background: activeCategory === category.id ? 'rgba(196, 167, 231, 0.2)' : 'transparent',
              border: activeCategory === category.id ? '1px solid rgba(196, 167, 231, 0.4)' : '1px solid transparent',
              borderRadius: '8px',
              padding: '8px 4px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              transition: 'all 0.2s ease',
              minHeight: '50px'
            }}
            onMouseEnter={(e) => {
              if (activeCategory !== category.id) {
                e.currentTarget.style.background = 'rgba(196, 167, 231, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (activeCategory !== category.id) {
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            <span style={{
              fontSize: '1.2em',
              display: 'block',
              marginBottom: '2px'
            }}>
              {category.icon}
            </span>
            <span style={{
              fontSize: '0.7em',
              color: activeCategory === category.id ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              fontWeight: activeCategory === category.id ? '600' : '400',
              textAlign: 'center',
              lineHeight: '1'
            }}>
              {category.label}
            </span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        scrollbarWidth: 'thin',
        scrollbarColor: 'var(--color-primary) transparent'
      }}>
        {renderCategoryContent()}
      </div>

      {/* Player Status - Always visible at bottom */}
      {currentPlayer && (
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid rgba(196, 167, 231, 0.2)',
          background: 'rgba(25, 23, 36, 0.8)'
        }}>
          <PlayerStatusPanel currentPlayer={currentPlayer} />
        </div>
      )}
    </div>
  );
};

export default RightSidebar;