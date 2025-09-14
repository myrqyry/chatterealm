import ResponsiveLayout from './components/ResponsiveLayout';
import { useGameWorld } from './hooks/useGameWorld';
import { useTheme } from './hooks/useTheme';
import GameLayout from './components/GameLayout';
import PlayLayout from './components/layouts/PlayLayout';
import SpectateLayout from './components/layouts/SpectateLayout';
import DevLayout from './components/layouts/DevLayout';
import { AnimationDemo } from './components';
import { DrawingEffectsDemo } from './components/DrawingEffectsDemo';
import { CataclysmDemo } from './components/CataclysmDemo';
import { SVGAssetDemo } from './components';
import { useState } from 'react';
import { initializeSounds } from './services/soundService';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  const {
    handleRegenerateWorld,
    handleMove,
    handleJoinGame,
    handleStartCataclysm,
    handlePickUpItem,
  } = useGameWorld();

  // Apply theme globally
  useTheme();

  const [soundEnabled, setSoundEnabled] = useState(false);
  async function handleEnableSound() {
    try {
      await initializeSounds();
      setSoundEnabled(true);
      console.log('🎵 Sound initialized');
    } catch (err) {
      console.error('Failed to initialize sound', err);
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
          {/* Default route redirects to /play */}
          <Route path="/" element={<Navigate to="/play" replace />} />

          {/* Play mode - Player interface with settings */}
          <Route
            path="/play"
            element={
              <ResponsiveLayout>
                <PlayLayout />
              </ResponsiveLayout>
            }
          />

          {/* Spectate mode - Full game monitoring */}
          <Route
            path="/spectate"
            element={
              <ResponsiveLayout>
                <SpectateLayout />
              </ResponsiveLayout>
            }
          />

          {/* Developer mode - Complete configuration access */}
          <Route
            path="/dev"
            element={
              <ResponsiveLayout>
                <DevLayout />
              </ResponsiveLayout>
            }
          />

          {/* Animation demo - GSAP and Rough animation showcase */}
          <Route
            path="/animations"
            element={
              <ResponsiveLayout>
                <AnimationDemo />
              </ResponsiveLayout>
            }
          />

          {/* Drawing effects demo - Canvas and SVG drawing animations */}
          <Route
            path="/drawing-effects"
            element={
              <ResponsiveLayout>
                <DrawingEffectsDemo />
              </ResponsiveLayout>
            }
          />

          {/* Cataclysm effects demo - Roughness modulation and regeneration */}
          <Route
            path="/cataclysm-demo"
            element={
              <ResponsiveLayout>
                <CataclysmDemo />
              </ResponsiveLayout>
            }
          />

          {/* SVG Asset Converter - svg2roughjs integration */}
          <Route
            path="/svg-assets"
            element={
              <ResponsiveLayout>
                <SVGAssetDemo />
              </ResponsiveLayout>
            }
          />

          {/* Legacy route for backward compatibility */}
          <Route
            path="/game"
            element={
              <ResponsiveLayout>
                <GameLayout
                  handleRegenerateWorld={handleRegenerateWorld}
                  handleMove={handleMove}
                  handleJoinGame={handleJoinGame}
                  handleStartCataclysm={handleStartCataclysm}
                  handlePickUpItem={handlePickUpItem}
                />
              </ResponsiveLayout>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
