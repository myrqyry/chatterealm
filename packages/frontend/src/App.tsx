import './App.css';
import ResponsiveLayout from './components/ResponsiveLayout';
import { useGameWorld } from './hooks/useGameWorld';
import GameLayout from './components/GameLayout';
import styled from '@emotion/styled';

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

  return (
    <StyledAppContainer className="app-container">
      <ResponsiveLayout>
        <GameLayout
          handleRegenerateWorld={handleRegenerateWorld}
          handleMove={handleMove}
          handleJoinGame={handleJoinGame}
          handleStartCataclysm={handleStartCataclysm}
          handlePickUpItem={handlePickUpItem}
        />
      </ResponsiveLayout>
    </StyledAppContainer>
  );
}

export default App;
