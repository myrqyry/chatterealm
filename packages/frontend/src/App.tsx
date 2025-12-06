import { useGameStore } from './stores/gameStore';
import { useTheme } from './hooks/useTheme';
import { useState, useEffect } from 'react';
import { initializeSounds } from './services/soundService';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GameNotificationService } from './services/notification/GameNotificationService';
import NotificationContainer from './components/notifications/NotificationContainer';

// Import new layout components
import BaseLayout from './components/layout/BaseLayout';
import AppHeader from './components/layout/AppHeader';
import ModeNavigation from './components/layout/ModeNavigation';

// Import content components for routes
import { AnimationDemo } from './components';
import { DrawingEffectsDemo } from './components/DrawingEffectsDemo';
import { CataclysmDemo } from './components/CataclysmDemo';
import { SVGAssetDemo } from './components';
import EmojiSvgSmokeTest from './components/dev/EmojiSvgSmokeTest';
import { CharacterCreator } from './components/character/CharacterCreator';
import PlayerProfileWrapper from './components/player/PlayerProfile/PlayerProfileWrapper';

// Import mode-specific layouts
import PlayLayout from './components/layouts/PlayLayout';
import SpectateLayout from './components/layouts/SpectateLayout';
import DevLayout from './components/layouts/DevLayout';
import GameLayout from './components/layout/GameLayout'; // Still needed for legacy route

function App() {
  const {
    handleRegenerateWorld,
    handleJoinGame,
    handleStartCataclysm,
    handlePickUpItem,
    movePlayer,
    gameWorld,
    player,
    notifications,
    removeNotification,
  } = useGameStore();

  const [notificationService] = useState(() => new GameNotificationService());

  useEffect(() => {
    if (gameWorld && player) {
      notificationService.processGameStateUpdate(gameWorld, player);
    }
  }, [gameWorld, player, notificationService]);

  // Apply theme globally
  useTheme();

  const { updateAI } = useGameStore();

  useEffect(() => {
    let animationFrameId: number;

    const gameLoop = () => {
      updateAI();
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [updateAI]);

  const [soundEnabled, setSoundEnabled] = useState(false);
  async function handleEnableSound() {
    try {
      const hasAudioSupport = typeof window.AudioContext !== 'undefined' ||
                            typeof (window as any).webkitAudioContext !== 'undefined';

      if (!hasAudioSupport) {
        console.warn('Audio not supported');
        setSoundEnabled(false);
        // Show user notification
        return;
      }

      await initializeSounds();
      setSoundEnabled(true);
      console.log('🎵 Sound initialized successfully');

    } catch (err) {
      console.error('Sound initialization failed:', err);
      setSoundEnabled(false);

      // Show user-friendly error message
      // You could use a toast notification here
      alert('Sound could not be enabled. Please check your browser permissions.');
    }
  }

  return (
    <Router>
      <div className="flex gap-0 min-h-screen p-0 bg-background font-inter text-text-primary box-border w-full max-w-none overflow-hidden app-container">
        <NotificationContainer
          notifications={notifications}
          onDismiss={removeNotification}
        />
        <button 
          onClick={handleEnableSound} 
          disabled={soundEnabled}
          className="fixed top-4 right-4 z-50 bg-primary text-on-primary border-none px-3 py-2 rounded-md cursor-pointer font-semibold shadow-md disabled:opacity-60 disabled:cursor-default"
        >
          {soundEnabled ? 'Sound enabled' : 'Enable sound'}
        </button>
        <Routes>
          {/* Default route redirects to character creation for new users */}
          <Route path="/" element={<Navigate to="/create-character" replace />} />

          {/* Add character creation route */}
          <Route
            path="/create-character"
            element={
              <BaseLayout mode="play" headerContent={<ModeNavigation compact />}>
                <CharacterCreator />
              </BaseLayout>
            }
          />

          {/* Player Profile */}
          <Route
            path="/profile/:playerId"
            element={
              <BaseLayout mode="play" headerContent={<ModeNavigation compact />}>
                <PlayerProfileWrapper />
              </BaseLayout>
            }
          />

          {/* Play mode */}
          <Route
            path="/play"
            element={
              <BaseLayout mode="play" headerContent={<ModeNavigation compact />}>
                <PlayLayout />
              </BaseLayout>
            }
          />

          {/* Spectate mode */}
          <Route
            path="/spectate"
            element={
              <BaseLayout mode="spectate" headerContent={<ModeNavigation compact />}>
                <SpectateLayout />
              </BaseLayout>
            }
          />

          {/* Developer mode */}
          <Route
            path="/dev"
            element={
              <BaseLayout mode="dev" headerContent={<ModeNavigation compact />}>
                <DevLayout />
              </BaseLayout>
            }
          />

          {/* Dev-only emoji smoke test (quick validate svg fetching + conversion) */}
          <Route
            path="/dev/emoji-test"
            element={
              <BaseLayout mode="dev" headerContent={<ModeNavigation compact />}>
                <EmojiSvgSmokeTest />
              </BaseLayout>
            }
          />

          {/* Animation demo - GSAP and Rough animation showcase */}
          <Route
            path="/animations"
            element={
              <BaseLayout mode="dev" headerContent={<ModeNavigation compact />}>
                <AnimationDemo />
              </BaseLayout>
            }
          />

          {/* Drawing effects demo - Canvas and SVG drawing animations */}
          <Route
            path="/drawing-effects"
            element={
              <BaseLayout mode="dev" headerContent={<ModeNavigation compact />}>
                <DrawingEffectsDemo />
              </BaseLayout>
            }
          />

          {/* Cataclysm effects demo - Roughness modulation and regeneration */}
          <Route
            path="/cataclysm-demo"
            element={
              <BaseLayout mode="dev" headerContent={<ModeNavigation compact />}>
                <CataclysmDemo />
              </BaseLayout>
            }
          />

          {/* SVG Asset Converter - svg2roughjs integration */}
          <Route
            path="/svg-assets"
            element={
              <BaseLayout mode="dev" headerContent={<ModeNavigation compact />}>
                <SVGAssetDemo />
              </BaseLayout>
            }
          />

          {/* Legacy route for backward compatibility */}
          <Route
            path="/game"
            element={
              <BaseLayout mode="play" headerContent={<ModeNavigation compact />}>
                <GameLayout
                  handleRegenerateWorld={handleRegenerateWorld}
                  handleMove={movePlayer}
                  handleJoinGame={handleJoinGame}
                  handleStartCataclysm={handleStartCataclysm}
                  handlePickUpItem={handlePickUpItem}
                />
              </BaseLayout>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;