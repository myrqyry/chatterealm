import './App.css';
import ResponsiveLayout from './components/ResponsiveLayout';
import { useGameWorld } from './hooks/useGameWorld';
import GameLayout from './components/GameLayout';
import styled from '@emotion/styled';

const StyledAppContainer = styled.div`
  display: flex;
  gap: 20px;
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #191724 0%, #1f1d2e 100%);
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  color: #e0def4;
  box-sizing: border-box;
  width: 100%;
  max-width: none;
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
    <StyledAppContainer>
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
