import './App.css';
import ResponsiveLayout from './components/ResponsiveLayout';
import { useGameWorld } from './hooks/useGameWorld';
import GameLayout from './components/GameLayout';

function App() {
  const {
    handleRegenerateWorld,
    handleMove,
    handleJoinGame,
    handleStartCataclysm,
    handlePickUpItem,
  } = useGameWorld();

  return (
    <ResponsiveLayout>
      <GameLayout
        handleRegenerateWorld={handleRegenerateWorld}
        handleMove={handleMove}
        handleJoinGame={handleJoinGame}
        handleStartCataclysm={handleStartCataclysm}
        handlePickUpItem={handlePickUpItem}
      />
    </ResponsiveLayout>
  );
}

export default App;
