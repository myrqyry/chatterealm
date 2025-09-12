import './App.css';
import ResponsiveLayout from './components/ResponsiveLayout';
import { useGameWorld } from './hooks/useGameWorld';
import { useTheme } from './hooks/useTheme';
import GameLayout from './components/GameLayout';
import PlayLayout from './components/layouts/PlayLayout';
import SpectateLayout from './components/layouts/SpectateLayout';
import DevLayout from './components/layouts/DevLayout';
import styled from '@emotion/styled';
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

  return (
    <Router>
      <StyledAppContainer className="app-container">
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
