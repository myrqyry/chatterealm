import './App.css';
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
import styled from '@emotion/styled';
import { useState } from 'react';
import { initializeSounds } from './services/soundService';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

const StyledAppContainer = styled.div`
  display: flex;
  gap: 0;
  min-height: 100vh;
  padding: 0;
  background: var(--color-background-primary);
  font-family: 'Inter', 'Roboto', sans-serif;
  color: var(--color-text-primary);
  box-sizing: border-box;
  width: 100%;
  max-width: none;
  overflow: hidden;
`;

const StyledEnableButton = styled.button`
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 9999;
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
`;

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
      <StyledAppContainer className="app-container">
        <StyledEnableButton onClick={handleEnableSound} disabled={soundEnabled}>
          {soundEnabled ? 'Sound enabled' : 'Enable sound'}
        </StyledEnableButton>
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
      </StyledAppContainer>
    </Router>
  );
}

export default App;
