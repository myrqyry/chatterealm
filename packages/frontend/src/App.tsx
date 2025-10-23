import { useGameStore } from './stores/gameStore';
import { useTheme } from './hooks/useTheme';
import { useState } from 'react';
import { initializeSounds } from './services/soundService';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

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
  } = useGameStore();

  // Apply theme globally
  useTheme();

  const [soundEnabled, setSoundEnabled] = useState(false);
  async function handleEnableSound() {
    try {
      // Check if audio context is supported
      const hasAudioContext = typeof window.AudioContext !== 'undefined';
      const hasWebkitAudioContext = typeof (window as any).webkitAudioContext !== 'undefined';
      
      if (!hasAudioContext && !hasWebkitAudioContext) {
        console.warn('Audio context not supported, skipping sound');
        setSoundEnabled(true); // Still mark as "enabled" so UI works
        return;
      }

      await initializeSounds();
      setSoundEnabled(true);
      console.log('🎵 Sound initialized');
    } catch (err) {
      console.error('Failed to initialize sound', err);
      // Still mark as enabled so the button disappears and app continues
      setSoundEnabled(true);
    }
  }

  return (
    <Router>
      <div className="flex gap-0 min-h-screen p-0 bg-background font-inter text-text-primary box-border w-full max-w-none overflow-hidden app-container">
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
                <DevLayout> {/* DevLayout can accept children for nested dev tools */}
                  <EmojiSvgSmokeTest />
                </DevLayout>
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